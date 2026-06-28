/**
 * Production entry for Hostinger / single-host deployment.
 * Serves the Next.js storefront and Express API on one port.
 * Starts listening immediately so Hostinger health checks pass,
 * then loads Next.js in the background.
 */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const path = require('path');
const fs = require('fs');
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
const nextBuildDir = path.join(frontendDir, '.next');
const hasFrontendBuild = fs.existsSync(nextBuildDir);

let createApp;
let startBackendServices;
try {
  ({ createApp } = require('./backend/dist/createApp'));
  ({ startBackendServices } = require('./backend/dist/startServices'));
} catch (err) {
  console.error('[Startup] FATAL: backend/dist missing — run "npm run build --prefix backend"');
  console.error('[Startup]', err?.message || err);
  process.exit(1);
}

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VexironAthletics — Coming Back Soon</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#0A2947;color:#F3E4C9;
         display:flex;align-items:center;justify-content:center;
         min-height:100vh;text-align:center;padding:2rem}
    h1{font-size:2.5rem;font-weight:800;letter-spacing:.08em;margin-bottom:.75rem}
    p{font-size:1.05rem;opacity:.75;max-width:420px;line-height:1.7}
    .dots{margin-top:1.5rem}
    .dot{display:inline-block;width:8px;height:8px;border-radius:50%;
         background:#F3E4C9;margin:0 4px;animation:blink 1.4s infinite both}
    .dot:nth-child(2){animation-delay:.2s}
    .dot:nth-child(3){animation-delay:.4s}
    @keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}
  </style>
</head>
<body>
  <div>
    <h1>VEXIRON ATHLETICS</h1>
    <p>We're deploying an update and will be back in just a few minutes. Thank you for your patience.</p>
    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</body>
</html>`;

async function main() {
  console.log('[Startup] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Startup] MONGODB_URI configured:', Boolean(process.env.MONGODB_URI?.trim()));
  console.log('[Startup] CLIENT_URL:', process.env.CLIENT_URL || '(unset)');
  console.log('[Startup] Frontend build present:', hasFrontendBuild);
  console.log('[Startup] Working directory:', process.cwd());

  const apiApp = createApp({ catchAll: false });
  const server = express();

  // Next.js handler — set after prepare() completes
  let handle = null;
  let nextReady = false;

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
    if (!nextReady || !handle) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(503).send(MAINTENANCE_HTML);
    }
    return handle(req, res);
  });

  // Listen FIRST — Hostinger health checks time out if we wait for next.prepare()
  server.listen(PORT, () => {
    console.log(`[Startup] VexironAthletics listening on port ${PORT}`);
    console.log(`[Startup] API health: http://localhost:${PORT}/api/health`);
  });

  // Load Next.js in background (can take 30–60s on shared hosting)
  if (hasFrontendBuild) {
    const nextApp = next({ dev, dir: frontendDir });
    nextApp
      .prepare()
      .then(() => {
        handle = nextApp.getRequestHandler();
        nextReady = true;
        console.log('[Startup] Next.js ready — storefront is live');
      })
      .catch((err) => {
        console.error('[Startup] Next.js prepare failed — maintenance page stays active');
        console.error('[Startup]', err?.message || err);
      });
  } else {
    console.warn('[Startup] frontend/.next not found — run "npm run build --prefix frontend" on Hostinger');
  }

  startBackendServices()
    .then((ok) => {
      if (ok) console.log('[Startup] MongoDB connected — products and orders ready');
      else console.warn('[Startup] MongoDB not connected — DB routes return 503 until connected');
    })
    .catch((err) => {
      console.error('[Startup] Backend services error:', err?.message || err);
    });
}

main().catch((err) => {
  console.error('[Startup] FATAL startup error:', err?.message || err);
  process.exit(1);
});
