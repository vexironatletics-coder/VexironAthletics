/**
 * Production entry for Hostinger / single-host deployment.
 * Serves the Next.js storefront and Express API on one port.
 */

// Ensure production mode — prevents Next.js from running in slow dev mode
// and stops pino from requiring pino-pretty on the server
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

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

const PORT = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, 'frontend');

// ── Validate required build artifacts exist before starting ──────────────────
const fs = require('fs');
const nextBuildDir = path.join(frontendDir, '.next');
const backendDistDir = path.join(__dirname, 'backend', 'dist', 'createApp.js');

if (!fs.existsSync(nextBuildDir)) {
  console.error('[Startup] FATAL: frontend/.next not found — run "npm run build" first');
  process.exit(1);
}
if (!fs.existsSync(backendDistDir)) {
  console.error('[Startup] FATAL: backend/dist/createApp.js not found — run "npm run build" first');
  process.exit(1);
}

const { createApp } = require('./backend/dist/createApp');
const { startBackendServices } = require('./backend/dist/startServices');

async function main() {
  console.log('[Startup] NODE_ENV:', process.env.NODE_ENV || '(unset)');
  console.log('[Startup] MONGODB_URI configured:', Boolean(process.env.MONGODB_URI?.trim()));
  console.log('[Startup] CLIENT_URL:', process.env.CLIENT_URL || '(unset)');

  const nextApp = next({ dev, dir: frontendDir });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  console.log('[Startup] Next.js prepared successfully');

  const apiApp = createApp({ catchAll: false });
  const server = express();

  const manifestPath = path.join(frontendDir, 'public', 'manifest.json');
  server.get(['/manifest.json', '/manifest.webmanifest'], (_req, res) => {
    res.type('application/manifest+json');
    res.sendFile(manifestPath);
  });

  server.use(apiApp);

  server.all('{*path}', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`[Startup] VexironAthletics running on port ${PORT}`);
    console.log(`[Startup] Storefront: http://localhost:${PORT}`);
    console.log(`[Startup] API health: http://localhost:${PORT}/api/health`);
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
  console.error('[Startup] FATAL startup error:', err?.message || err);
  process.exit(1);
});
