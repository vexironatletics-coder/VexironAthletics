# VexironAthletics — Developer Guide

Technical documentation for setting up, developing, and extending the VexironAthletics e-commerce platform.

---

## Table of contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment variables](#environment-variables)
5. [Running locally](#running-locally)
6. [Project structure](#project-structure)
7. [API overview](#api-overview)
8. [Frontend architecture](#frontend-architecture)
9. [Theme system](#theme-system)
10. [Search](#search)
11. [Email](#email)
12. [Scripts & tooling](#scripts--tooling)
13. [Common issues](#common-issues)
14. [Production checklist](#production-checklist)

---

## Architecture

```
┌─────────────────┐     HTTPS/JSON      ┌─────────────────┐
│  Next.js 16     │ ◄─────────────────► │  Express 5 API  │
│  (port 3000)    │     JWT + Clerk     │  (port 5000)    │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         │ Clerk OAuth                           │ Mongoose
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│  Clerk Cloud    │                     │  MongoDB Atlas  │
└─────────────────┘                     └─────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    ▼                           ▼                           ▼
             ┌────────────┐            ┌────────────┐            ┌────────────┐
             │ Cloudinary │            │ MeiliSearch│            │  SMTP      │
             │  (images)  │            │ (optional) │            │  (email)   │
             └────────────┘            └────────────┘            └────────────┘
```

| Concern | Implementation |
|---------|----------------|
| Auth | JWT (local email/password) + Clerk sync for OAuth |
| State | Redux Toolkit + RTK Query (frontend) |
| Styling | Tailwind v4 + CSS variables (theme system) |
| File uploads | Multer → Cloudinary |
| PDF | Puppeteer (invoices, order reports) |
| Proxy | Next.js 16 `proxy.ts` (Clerk + route protection) |

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ (20 LTS recommended) |
| npm | 9+ |
| MongoDB | Atlas cluster or local instance |
| Git | Any recent version |

**Optional:**

- [Clerk](https://clerk.com) — Google/Facebook OAuth
- [Cloudinary](https://cloudinary.com) — product images
- [MeiliSearch](https://meilisearch.com) — fast search (falls back to MongoDB)
- SMTP account — password reset & order emails

---

## Installation

### Clone and install dependencies

```bash
git clone <your-repo-url> Ecom
cd Ecom

cd backend && npm install
cd ../frontend && npm install
```

### Backend configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` — minimum required:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://localhost:3000
```

### Frontend configuration

```bash
cd frontend
cp .env.example .env.local
```

Minimum:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Seed the database

```bash
cd backend
npm run seed
```

Creates: admin user, sample products, coupons, promotions, site settings.

**Default admin:**

| Field | Value |
|-------|-------|
| Email | `admin@vexironathletics.com` |
| Password | `Admin@123` |

Override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in backend `.env`.

Reset admin only:

```bash
npm run ensure-admin
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `5000`) |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Signing secret for access tokens |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `JWT_REFRESH_EXPIRES_IN` | No | Default `30d` |
| `CLIENT_URL` | Yes | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `CLERK_SECRET_KEY` | For OAuth | Clerk backend secret |
| `CLOUDINARY_*` | For uploads | Cloud name, API key, secret |
| `MEILI_HOST` | No | MeiliSearch URL (optional) |
| `MEILI_MASTER_KEY` | No | MeiliSearch key |
| `ADMIN_EMAIL` | No | Seed admin email |
| `ADMIN_PASSWORD` | No | Seed admin password |
| `SMTP_*` | No | Email delivery (console fallback if unset) |
| `NODE_ENV` | No | `development` / `production` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base (e.g. `http://localhost:5000/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | For OAuth | Clerk publishable key |
| `CLERK_SECRET_KEY` | For OAuth | Clerk secret (server-side) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | E.164 without `+` (e.g. `923001234567`) |
| `NEXT_PUBLIC_WHATSAPP_MESSAGE` | No | Default WhatsApp prefill text |
| `NEXT_PUBLIC_PHONE_DISPLAY` | No | Display phone in UI |

---

## Running locally

**Terminal 1 — API:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Storefront:**

```bash
cd frontend
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Store + dashboards |
| http://localhost:5000/api/health | DB + API status |

### Verify health

```bash
curl http://localhost:5000/api/health
```

Expected when DB is connected:

```json
{ "status": "ok", "db": "connected", ... }
```

### Lint

```bash
cd frontend && npm run lint
cd backend && npm run lint
```

---

## Project structure

```
Ecom/
├── backend/
│   └── src/
│       ├── app.ts              Express entry
│       ├── config/             DB, Cloudinary, Clerk, Multer
│       ├── controllers/        Route handlers
│       ├── middleware/         auth, adminOnly, requireDb, errors
│       ├── models/             Mongoose schemas
│       ├── routes/             API routers
│       ├── services/           email, search, invoice, loyalty, coupons
│       ├── utils/              helpers, shippingAddress, constants
│       ├── seed.ts             Database seeder
│       └── scripts/            ensureAdmin
│
├── frontend/
│   ├── app/
│   │   ├── (shop)/             Public store routes
│   │   ├── (auth)/             Login, register, reset password
│   │   ├── dashboard/          User + admin dashboards
│   │   ├── layout.tsx          Root layout + metadata
│   │   └── globals.css         Theme CSS variables
│   ├── components/             UI, layout, product, admin, checkout
│   ├── lib/                    themes, validators, constants, seo
│   ├── store/                  Redux + RTK Query slices/APIs
│   └── proxy.ts                Clerk auth proxy (Next.js 16)
│
└── docs/
    ├── USER_GUIDE.md
    └── DEVELOPER_GUIDE.md
```

---

## API overview

Base URL: `http://localhost:5000/api`

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health + DB status |
| GET | `/products` | List/filter products (pagination) |
| GET | `/products/:id` | Product detail + reviews |
| GET | `/settings/public` | Theme + SEO settings |
| GET | `/promotions/active` | Homepage promotions |
| GET | `/search` | Advanced search |
| GET | `/search/autocomplete` | Search suggestions |
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/forgot-password` | Password reset email |
| POST | `/auth/reset-password` | Set new password |
| POST | `/auth/clerk-sync` | OAuth token exchange |

### Authenticated (Bearer JWT)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me` | Profile |
| PUT | `/users/me` | Update profile |
| GET/POST | `/cart` | Server cart |
| POST | `/orders` | Create order (COD) |
| GET | `/orders/my` | User orders (paginated) |
| GET | `/orders/:id` | Order detail |
| GET | `/orders/:id/invoice` | PDF invoice |
| POST | `/coupons/validate` | Validate coupon |
| GET | `/loyalty/profile` | Loyalty tier + points |
| POST | `/products/:id/review` | Submit review |

### Admin only

| Method | Path | Description |
|--------|------|-------------|
| POST/PUT/DELETE | `/products` | Product CRUD |
| GET | `/orders` | All orders |
| PUT | `/orders/:id/status` | Update status |
| GET | `/orders/analytics` | Dashboard stats |
| GET | `/orders/export/pdf` | PDF report |
| GET/PUT | `/settings` | Site settings |
| CRUD | `/coupons`, `/promotions`, `/categories` | Marketing |
| GET | `/analytics/audience` | Visitor analytics |
| GET | `/users` | User list |

### Shipping address payload (orders)

```json
{
  "shippingAddress": {
    "name": "Ali Khan",
    "phones": ["03001234567", "03119876543"],
    "landmark": "Near Centaurus Mall",
    "street": "House 12, Street 4, F-8",
    "city": "Islamabad",
    "state": "ICT",
    "postal": "44000",
    "country": "Pakistan"
  }
}
```

---

## Frontend architecture

### Routing (App Router)

| Group | Routes |
|-------|--------|
| `(shop)` | `/`, `/products`, `/cart`, `/checkout`, `/orders`, `/search`, `/category/[slug]`, info pages |
| `(auth)` | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `dashboard/user` | Profile, orders, wishlist, settings |
| `dashboard/admin` | Products, orders, users, coupons, appearance, audience |

### State management

| Slice / API | Purpose |
|-------------|---------|
| `authSlice` | User + JWT token |
| `cartSlice` | Cart items, totals, guest persistence |
| `wishlistSlice` | Local wishlist IDs |
| `themePreviewSlice` | Admin live theme preview |
| `productApi`, `orderApi`, `settingsApi`, … | RTK Query endpoints |

### Auth flow

1. Login/register → JWT stored in `localStorage`
2. RTK Query `prepareHeaders` attaches `Authorization: Bearer <token>`
3. Clerk OAuth → `/sso-callback` → `/api/auth/clerk-sync` → same JWT flow

---

## Theme system

Settings stored in MongoDB (`SiteSettings`):

| Field | Purpose |
|-------|---------|
| `designId` | Layout: header/footer style, radius |
| `colorSchemeId` | Color palette |
| `primaryColor`, `accentColor`, `secondaryColor` | Optional overrides |
| `siteTagline`, `seoDescription`, `seoKeywords` | SEO |

Implementation:

- `frontend/lib/themes.ts` — presets, CSS var generation, `applyThemeToDocument`
- `data-design`, `data-color-scheme`, `data-header`, `data-footer` on `<html>`
- `SiteThemeProvider` — client-side theme apply + admin preview
- `ThemeStyles` — SSR-injected color scheme CSS

Admin UI: `/dashboard/admin/appearance`

---

## Search

1. **MeiliSearch** (if `MEILI_HOST` set) — primary engine with facets
2. **MongoDB fallback** — regex/text search when MeiliSearch unavailable

Additional:

- Autocomplete endpoint for navbar
- Visual search (image upload → color/category heuristic via Cloudinary)
- Search analytics logged to `SearchLog` collection

Reindex (admin/dev):

```
POST /api/search/reindex   (admin)
```

---

## Email

`backend/src/services/emailService.ts` uses Nodemailer.

| Email | Trigger |
|-------|---------|
| Password reset | `POST /auth/forgot-password` |
| Order confirmation | After successful `POST /orders` |

Without SMTP, links and order summaries are **logged to the console**.

---

## Scripts & tooling

### Backend

| Script | Command |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Production | `npm start` |
| Seed | `npm run seed` |
| Ensure admin | `npm run ensure-admin` |
| Lint | `npm run lint` |

### Frontend

| Script | Command |
|--------|---------|
| Dev | `npm run dev` (uses `--webpack`; Turbopack cache issues avoided) |
| Build | `npm run build` |
| Production | `npm start` |
| Lint | `npm run lint` |

---

## Common issues

### MongoDB Atlas: `ECONNREFUSED` / login fails

- Add your public IP in Atlas → **Network Access**
- Backend logs your IP hint on connection failure
- API starts in degraded mode; auth routes use `requireDb` middleware

### Clerk OAuth redirect errors

- Match `CLIENT_URL`, Clerk allowed origins, and Next.js URLs
- Set `signInUrl` / `signUpUrl` in `app/layout.tsx` ClerkProvider

### Images not uploading

- Verify `CLOUDINARY_*` in backend `.env`
- Check Multer limits in `config/multer.ts`

### Theme not updating after save

- Hard refresh (`Ctrl+Shift+R`)
- Appearance save triggers full page reload

### `Unexpected end of input` / broken JS in dev

- Clear `.next` folder and restart
- Prefer `npm run dev` (webpack) over Turbopack if using Console Ninja extension

### Windows: `querySrv ECONNREFUSED`

- Use standard `mongodb://` URI instead of `mongodb+srv://` (see comment in `.env.example`)

---

## Production checklist

- [ ] Strong `JWT_SECRET` and unique admin password
- [ ] MongoDB Atlas IP whitelist / VPC peering
- [ ] `CLIENT_URL` and CORS set to production domain
- [ ] Clerk production keys + redirect URLs
- [ ] Cloudinary production folder
- [ ] SMTP configured for transactional email
- [ ] `NODE_ENV=production`
- [ ] Frontend: `npm run build` + `npm start` (or Vercel)
- [ ] Backend: `npm run build` + process manager (PM2, Docker, Railway)
- [ ] HTTPS on both frontend and API
- [ ] MeiliSearch hosted instance (optional)
- [ ] Remove or rotate seed admin credentials

---

## Extending the project

| Task | Start here |
|------|------------|
| New API route | `backend/src/routes/` + `controllers/` + register in `app.ts` |
| New shop page | `frontend/app/(shop)/` |
| New admin page | `frontend/app/dashboard/admin/` + sidebar links in `Sidebar.tsx` |
| New RTK Query API | `frontend/store/api/` + register reducer in `store/index.ts` |
| Theme preset | `frontend/lib/themes.ts` → `DESIGN_PRESETS` / `COLOR_SCHEME_PRESETS` |

---

## Related docs

- [User Guide](./USER_GUIDE.md) — end-user and admin usage from the UI
- [README](../README.md) — project overview

---

*VexironAthletics Developer Guide — last updated for the current monorepo layout.*
