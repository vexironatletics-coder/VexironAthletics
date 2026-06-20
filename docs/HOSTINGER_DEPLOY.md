# Hostinger Node.js deployment

Deploy the **repository root** (not `backend/` alone). The root `server.js` runs the **Next.js storefront** and **Express API** on one port.

## hPanel build settings

| Setting | Value |
|---------|--------|
| Repository | `vexironatletics-coder/VexironAthletics` |
| Branch | `main` |
| Root directory | *(leave empty — repo root)* |
| Framework | **Other** |
| Node.js version | **20** or newer |
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file | `server.js` |

## Environment variables (hPanel → Environment)

Set these **before** deploying (build needs the `NEXT_PUBLIC_*` values):

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://honeydew-salmon-303748.hostingersite.com` |
| `NEXT_PUBLIC_API_URL` | `https://honeydew-salmon-303748.hostingersite.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://honeydew-salmon-303748.hostingersite.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` |
| `MONGODB_URI` | **Required** — copy your Atlas connection string from `backend/.env` |
| `JWT_SECRET` | long random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | *(optional)* |
| `CLOUDINARY_API_KEY` | *(optional)* |
| `CLOUDINARY_API_SECRET` | *(optional)* |
| `SMTP_HOST` | *(optional)* |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | *(optional)* |
| `SMTP_PASS` | *(optional)* |
| `SMTP_FROM` | `VexironAthletics <noreply@yourdomain.com>` |

`PORT` is set automatically by Hostinger — do not override it.

## Clerk

In [Clerk Dashboard](https://dashboard.clerk.com), add your production URL:

- **Allowed origins:** `https://honeydew-salmon-303748.hostingersite.com`
- **Redirect URLs:** `https://honeydew-salmon-303748.hostingersite.com/*`

## MongoDB Atlas

Add Hostinger’s server IP (or `0.0.0.0/0` for testing) in Atlas → **Network Access**.

## Verify after deploy

| URL | Expected |
|-----|----------|
| `/` | Storefront home page |
| `/api/health` | `"db":"connected"` and `"mongodbConfigured":true` |

If `/api/products` returns **503**, open `/api/health`:

- `"mongodbConfigured": false` → add `MONGODB_URI` in hPanel Environment variables
- `"mongodbConfigured": true` but `"db":"disconnected"` → MongoDB Atlas → Network Access → allow `0.0.0.0/0`

## Why you saw `Route not found`

Hostinger was running **only the backend API**. The API has no page at `/` — only `/api/*` routes. The unified `server.js` fixes this by serving Next.js for `/` and the API under `/api`.

## Redeploy

After pushing to GitHub, click **Redeploy** in hPanel, or wait for automatic redeploy if enabled.

Reference: [Hostinger Node.js deployment guide](https://www.hostinger.com/tutorials/deploy-node-js-application)
