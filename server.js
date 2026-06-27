/**
 * Production entry for Hostinger / single-host deployment.
 * Serves the Next.js storefront and Express API on one port.
 * If the frontend build is missing, serves a branded maintenance page
 * so the server stays up and the API still works.
 */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const path = require('path');
const fs   = require('fs');
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

const PORT        = parseInt(process.env.PORT || '3000', 10);
const dev         = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, 'frontend');
const nextBuildDir = path.join(frontendDir, '.next');
const hasFrontendBuild = fs.existsSync(nextBuildDir);

if (!hasFrontendBuild) {
  console.warn('[Startup] frontend/.next not found — maintenance page will be shown until build completes');
}

const { createApp }          = require('./backend/dist/createApp');
const { startBackendServices } = require('./backend/dist/startServices');

// ── Branded maintenance page shown when .next build is missing ────────────────
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

  const apiApp = createApp({ catchAll: false });
  const server = express();

  // ── Prepare Next.js only if build exists ─────────────────────────────────
  let handle = null;
  if (hasFrontendBuild) {
    const nextApp = next({ dev, dir: frontendDir });
    handle = nextApp.getRequestHandler();
    await nextApp.prepare();
    console.log('[Startup] Next.js prepared successfully');
  }

  // ── Manifest ─────────────────────────────────────────────────────────────
  const manifestPath = path.join(frontendDir, 'public', 'manifest.json');
  server.get(['/manifest.json', '/manifest.webmanifest'], (_req, res) => {
    res.type('application/manifest+json');
    res.sendFile(manifestPath);
  });

  // ── API ───────────────────────────────────────────────────────────────────
  server.use(apiApp);

  // ── Storefront / maintenance ──────────────────────────────────────────────
  server.all('{*path}', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    if (!handle) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(503).send(MAINTENANCE_HTML);
    }
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`[Startup] VexironAthletics running on port ${PORT}`);
    console.log(`[Startup] API health: http://localhost:${PORT}/api/health`);
  });

  // ── DB & background services (non-blocking) ───────────────────────────────
  startBackendServices()
    .then((ok) => {
      if (ok) console.log('[Startup] MongoDB connected — products and orders ready');
      else     console.warn('[Startup] MongoDB not connected — DB-dependent routes return 503');
    })
    .catch((err) => {
      console.error('[Startup] Backend services error:', err?.message || err);
    });
}

main().catch((err) => {
  console.error('[Startup] FATAL startup error:', err?.message || err);
  process.exit(1);
});
