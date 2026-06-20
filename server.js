/**
 * Production entry for Hostinger / single-host deployment.
 * Serves the Next.js storefront and Express API on one port.
 */
const path = require('path');
const express = require('express');
const next = require('next');

try {
  require(path.join(__dirname, 'backend', 'node_modules', 'dotenv')).config();
  require(path.join(__dirname, 'backend', 'node_modules', 'dotenv')).config({
    path: path.join(__dirname, 'backend', '.env'),
  });
} catch {
  // Hostinger injects env vars via hPanel — dotenv is optional
}

const { createApp } = require('./backend/dist/createApp');
const { startBackendServices } = require('./backend/dist/startServices');

const PORT = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, 'frontend');

async function main() {
  console.log('[Startup] NODE_ENV:', process.env.NODE_ENV || '(unset)');
  console.log('[Startup] MONGODB_URI configured:', Boolean(process.env.MONGODB_URI?.trim()));
  console.log('[Startup] CLIENT_URL:', process.env.CLIENT_URL || '(unset)');

  const nextApp = next({ dev, dir: frontendDir });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const apiApp = createApp({ catchAll: false });
  const server = express();

  server.use(apiApp);

  server.all('{*path}', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`VexironAthletics running on port ${PORT}`);
    console.log(`Storefront: http://localhost:${PORT}`);
    console.log(`API health: http://localhost:${PORT}/api/health`);
  });

  startBackendServices()
    .then((ok) => {
      if (ok) console.log('[Startup] MongoDB connected — products and orders ready');
      else console.warn('[Startup] MongoDB not connected — /api/products returns 503 until connected');
    })
    .catch((err) => {
      console.error('[Startup] Backend services error:', err instanceof Error ? err.message : err);
    });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
