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

  // Listen immediately — Hostinger health checks fail if the port is not open quickly.
  server.listen(PORT, () => {
    console.log(`VexironAthletics running on port ${PORT}`);
    console.log(`Storefront: http://localhost:${PORT}`);
    console.log(`API health: http://localhost:${PORT}/api/health`);
  });

  startBackendServices()
    .then((ok) => {
      if (ok) console.log('MongoDB connected — API ready');
      else console.warn('[Startup] MongoDB not connected — DB routes return 503 until connected');
    })
    .catch((err) => {
      console.error('[Startup] Backend services error:', err instanceof Error ? err.message : err);
    });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
