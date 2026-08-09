/**
 * Production entry for Hostinger / single-host deployment.
 * Comprehensive crash guards + logging at every step for debugging.
 */

// ── Process-level crash guards ──────────────────────────────────────────────
// These prevent the server from dying silently on any unhandled error.
process.on('uncaughtException', (err, origin) => {
  console.error('[CRASH] Uncaught Exception at:', origin);
  console.error('[CRASH]', err?.stack || err?.message || err);
  // Do NOT exit — Hostinger health checks need the process alive.
  // If the HTTP server is already listening, it will keep serving.
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH] Unhandled Promise Rejection at:', promise);
  console.error('[CRASH] Reason:', reason instanceof Error ? reason.stack : reason);
});

// ── Boot stamp ──────────────────────────────────────────────────────────────
const bootTime = new Date().toISOString();
console.log('');
console.log('[Boot] ========================================================');
console.log('[Boot]  VexironAthletics server booting at', bootTime);
console.log('[Boot] ========================================================');
console.log('[Boot] Node.js version:', process.version);
console.log('[Boot] Platform:', process.platform, process.arch);

// ── NODE_ENV ────────────────────────────────────────────────────────────────
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  console.log('[Boot] NODE_ENV not set — defaulting to production');
}
console.log('[Boot] NODE_ENV:', process.env.NODE_ENV);

// ── Core requires ────────────────────────────────────────────────────────────
console.log('[Boot] Loading core modules...');
const path = require('path');
const fs   = require('fs');
const http = require('http');
const express = require('express');
console.log('[Boot] Core modules loaded');

// ── dotenv ──────────────────────────────────────────────────────────────────
try {
  const dotenvBin = path.join(__dirname, 'backend', 'node_modules', 'dotenv');
  const dotenv = require(dotenvBin);
  dotenv.config();
  dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
  console.log('[Boot] dotenv loaded from backend/node_modules');
} catch {
  console.log('[Boot] dotenv not found — relying on Hostinger hPanel env vars (normal in production)');
}

// ── Environment dump ─────────────────────────────────────────────────────────
console.log('[Boot] Environment variables:');
console.log('[Boot]   PORT             :', process.env.PORT || '(not set)');
console.log('[Boot]   NODE_ENV         :', process.env.NODE_ENV);
console.log('[Boot]   CLIENT_URL       :', process.env.CLIENT_URL || '(not set)');
console.log('[Boot]   MONGODB_URI set  :', Boolean(process.env.MONGODB_URI?.trim()));
console.log('[Boot]   JWT_SECRET set   :', Boolean(process.env.JWT_SECRET?.trim()));
console.log('[Boot]   CLOUDINARY set   :', Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()));

// ── PORT resolution ──────────────────────────────────────────────────────────
// Hostinger sets PORT as a number (e.g. "3000") OR a UNIX socket path.
const rawPort = process.env.PORT;
const PORT = rawPort
  ? (isNaN(Number(rawPort)) ? rawPort : Number(rawPort))
  : 3000;
console.log('[Boot] Resolved PORT:', PORT, '| typeof:', typeof PORT);

// ── Directory checks ──────────────────────────────────────────────────────────
const frontendDir  = path.join(__dirname, 'frontend');
const nextBuildDir = path.join(frontendDir, '.next');
const buildIdPath  = path.join(nextBuildDir, 'BUILD_ID');
const hostEntryPath = path.join(__dirname, 'backend', 'dist', 'hostEntry.js');

console.log('[Boot] Directory checks:');
console.log('[Boot]   __dirname          :', __dirname);
console.log('[Boot]   cwd()             :', process.cwd());
console.log('[Boot]   frontendDir       :', frontendDir);
console.log('[Boot]   .next exists      :', fs.existsSync(nextBuildDir));
console.log('[Boot]   BUILD_ID exists   :', fs.existsSync(buildIdPath));
console.log('[Boot]   hostEntry.js exists:', fs.existsSync(hostEntryPath));

if (fs.existsSync(buildIdPath)) {
  try {
    const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
    console.log('[Boot]   BUILD_ID value    :', buildId);
  } catch (e) {
    console.log('[Boot]   BUILD_ID read err :', e.message);
  }
}

// ── Load backend bundle ──────────────────────────────────────────────────────
console.log('[Boot] Loading backend/dist/hostEntry...');
let createApp, startBackendServices, initSocketServer;
try {
  ({ createApp, startBackendServices, initSocketServer } = require('./backend/dist/hostEntry'));
  console.log('[Boot] ✓ backend/dist/hostEntry loaded');
} catch (err) {
  console.error('[Boot] FATAL: backend/dist/hostEntry.js failed to load');
  console.error('[Boot]', err?.stack || err?.message || err);
  process.exit(1);
}

// ── Next.js require (lazy — only called inside loadNextApp) ──────────────────
// We deliberately do NOT require('next') at the top level here.
// This avoids crashes if the module has issues, and lets us control when it loads.

const dev = process.env.NODE_ENV !== 'production';
console.log('[Boot] dev mode:', dev);

// ── Maintenance page (served while Next.js prepares) ────────────────────────
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
    <p>We're deploying an update and will be back shortly. Thank you for your patience.</p>
    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</body>
</html>`;

// ── main() ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[Main] Entering main()...');

  // ── Create Express API app ──────────────────────────────────────────────────
  console.log('[Main] Calling createApp()...');
  let apiApp;
  try {
    apiApp = createApp({ catchAll: false });
    console.log('[Main] ✓ createApp() succeeded');
  } catch (err) {
    console.error('[Main] FATAL: createApp() threw:', err?.stack || err?.message || err);
    process.exit(1);
  }

  // ── HTTP server setup ────────────────────────────────────────────────────────
  const server = express();
  const httpServer = http.createServer(server);
  console.log('[Main] HTTP server instance created');

  // ── Socket.IO ────────────────────────────────────────────────────────────────
  console.log('[Main] Initializing Socket.IO...');
  try {
    initSocketServer(httpServer);
    console.log('[Main] ✓ Socket.IO initialized');
  } catch (err) {
    // Non-fatal: chat feature won't work but storefront is unaffected
    console.error('[Main] Socket.IO init failed (chat disabled, app continues):', err?.message || err);
  }

  // ── Next.js state ────────────────────────────────────────────────────────────
  let handle    = null;
  let nextReady = false;

  // ── Middleware: static Next.js assets ─────────────────────────────────────
  const nextStaticDir = path.join(frontendDir, '.next/static');
  console.log('[Main] Mounting /_next/static from:', nextStaticDir);
  server.use(
    '/_next/static',
    express.static(nextStaticDir, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    })
  );

  // ── Middleware: public assets ─────────────────────────────────────────────
  const publicDir = path.join(frontendDir, 'public');
  console.log('[Main] Mounting /public from:', publicDir);
  server.use(express.static(publicDir, { maxAge: '1d' }));

  // ── Middleware: API routes from Express backend ────────────────────────────
  server.use(apiApp);

  // ── Catch-all: route to Next.js or maintenance page ───────────────────────
  server.all('{*path}', (req, res) => {
    const { method, path: reqPath } = req;

    // Log every non-asset request for debugging
    if (!reqPath.startsWith('/_next') && !reqPath.startsWith('/api/health')) {
      console.log(`[Request] ${method} ${reqPath} | nextReady=${nextReady}`);
    }

    // /api routes not matched above → 404 JSON (no HTML fallback)
    if (reqPath.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found', path: reqPath });
    }

    // /_next/* asset requests — only Next.js can serve these
    if (reqPath.startsWith('/_next')) {
      if (!nextReady || !handle) {
        console.warn(`[Request] /_next asset requested but Next.js not ready — 503: ${reqPath}`);
        return res.status(503).end();
      }
      return handle(req, res);
    }

    // All other requests — serve storefront or maintenance page
    if (!nextReady || !handle) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(MAINTENANCE_HTML);
    }

    return handle(req, res);
  });

  // ── Start listening ───────────────────────────────────────────────────────
  console.log('[Main] Binding HTTP server to PORT:', PORT);
  await new Promise((resolve, reject) => {
    httpServer.once('error', (err) => {
      console.error('[Main] httpServer.listen error:', err.code, err.message);
      reject(err);
    });
    httpServer.listen(PORT, () => {
      const addr = httpServer.address();
      console.log('[Main] ✓ Server listening');
      console.log('[Main]   address():', JSON.stringify(addr));
      console.log('[Main]   PORT env :', process.env.PORT);
      console.log('[Main]   Resolved :', PORT, typeof PORT);
      console.log('[Main]   API health: http://localhost:' + (typeof addr === 'object' ? addr?.port : addr) + '/api/health');
      resolve(undefined);
    });
  });

  // ── Load Next.js in background (polls for BUILD_ID) ───────────────────────
  let nextAttempt = 0;

  async function loadNextApp() {
    nextAttempt++;
    console.log(`[Next.js] Load attempt ${nextAttempt} — checking BUILD_ID at:`, buildIdPath);

    if (!fs.existsSync(buildIdPath)) {
      console.warn(`[Next.js] BUILD_ID not found yet (attempt ${nextAttempt}) — retrying in 5s`);
      setTimeout(loadNextApp, 5000);
      return;
    }

    let buildId = '(unreadable)';
    try { buildId = fs.readFileSync(buildIdPath, 'utf8').trim(); } catch {}
    console.log(`[Next.js] BUILD_ID found: ${buildId} — calling require('next')...`);

    try {
      // Lazy require to isolate any module-load errors
      const nextModule = require('next');
      // Handle both CJS default export and ESM interop
      const nextFn = typeof nextModule === 'function' ? nextModule : nextModule.default;
      if (typeof nextFn !== 'function') {
        throw new Error(`require('next') did not return a function — got: ${typeof nextModule}`);
      }
      console.log('[Next.js] next() function resolved — calling prepare()...');
      const nextApp = nextFn({ dev, dir: frontendDir });
      await nextApp.prepare();
      handle    = nextApp.getRequestHandler();
      nextReady = true;
      console.log('[Next.js] ✓ Next.js ready — storefront is live!');
    } catch (err) {
      console.error('[Next.js] prepare() failed on attempt', nextAttempt);
      console.error('[Next.js]', err?.stack || err?.message || err);
      console.log('[Next.js] Retrying in 10s...');
      setTimeout(loadNextApp, 10000);
    }
  }

  loadNextApp();

  // ── Backend services (MongoDB, seed, search) ──────────────────────────────
  console.log('[Main] Starting backend services (MongoDB connection)...');
  startBackendServices()
    .then((ok) => {
      if (ok) console.log('[Main] ✓ MongoDB connected — DB routes are active');
      else console.warn('[Main] MongoDB NOT connected — check MONGODB_URI and Atlas IP whitelist');
    })
    .catch((err) => {
      console.error('[Main] Backend services error:', err?.message || err);
    });

  console.log('[Main] Setup complete — server is running');
}

// ── Start ──────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error('[Boot] FATAL main() error:', err?.stack || err?.message || err);
  process.exit(1);
});
