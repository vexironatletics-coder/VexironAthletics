/**
 * Production entry for Hostinger / single-host deployment.
 * Serves the Next.js storefront and Express API on one port.
 */
const path = require('path');
const express = require('express');
const next = require('next');

const { createApp } = require('./backend/dist/createApp');
const { startBackendServices } = require('./backend/dist/startServices');

const PORT = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, 'frontend');

const DB_STARTUP_TIMEOUT_MS = 45000;

async function main() {
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

  console.log('Connecting to MongoDB (up to 45s)...');
  const dbStartup = startBackendServices();
  const dbReady = await Promise.race([
    dbStartup,
    new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn('[Startup] MongoDB not ready yet — API will return 503 until connected');
        resolve(false);
      }, DB_STARTUP_TIMEOUT_MS)
    ),
  ]);

  if (dbReady) {
    console.log('MongoDB connected — API ready');
  } else {
    dbStartup
      .then((ok) => {
        if (ok) console.log('[Startup] MongoDB connected (background)');
      })
      .catch(() => undefined);
  }

  server.listen(PORT, () => {
    console.log(`VexironAthletics running on port ${PORT}`);
    console.log(`Storefront: http://localhost:${PORT}`);
    console.log(`API health: http://localhost:${PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
