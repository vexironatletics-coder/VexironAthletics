# VexironAthletics

**Premium athletic wear e-commerce for Men, Women & Children — built for Pakistan.**

VexironAthletics is a full-stack online clothing store with a modern shopfront, admin dashboard, cash-on-delivery checkout, coupons, loyalty points, WordPress-style themes, and WhatsApp support.

---

## Live URLs (local development)

| Service   | URL                      |
|-----------|--------------------------|
| Storefront | http://localhost:3000   |
| API        | http://localhost:5000   |
| Health     | http://localhost:5000/api/health |

---

## Documentation

| Audience | Guide | Description |
|----------|-------|-------------|
| **Shoppers & store admins** | [User Guide](./docs/USER_GUIDE.md) | How to shop, checkout, track orders, use coupons, and manage the store from the admin panel |
| **Developers & contributors** | [Developer Guide](./docs/DEVELOPER_GUIDE.md) | Setup, architecture, environment variables, API overview, scripts, and deployment notes |

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, RTK Query, Clerk, shadcn/ui |
| **Backend** | Node.js, Express 5, TypeScript, MongoDB, Mongoose, JWT, Cloudinary, MeiliSearch (optional) |
| **Integrations** | Clerk OAuth, Cloudinary images, Nodemailer email, Puppeteer PDF invoices, WhatsApp deep links |

---

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env        # configure MongoDB, JWT, Clerk, Cloudinary
npm install
npm run seed                # sample products, coupons, admin user
npm run dev                 # → http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local  # API URL + Clerk keys
npm install
npm run dev                 # → http://localhost:3000
```

**Default admin (after seed):** `admin@vexironathletics.com` / `Admin@123`

> MongoDB Atlas: add your IP under **Network Access** or the API will run in degraded mode until the database connects.

---

## Project structure

```
Ecom/
├── frontend/          Next.js storefront + dashboards
├── backend/           Express REST API
├── docs/
│   ├── USER_GUIDE.md
│   └── DEVELOPER_GUIDE.md
└── README.md          ← you are here
```

---

## Key features

- Shop by category (Men / Women / Children), filters, search, pagination
- Cart (guest + logged-in sync), multi-step COD checkout
- Shipping address with landmark + multiple mobile numbers
- Coupons, loyalty points, referral codes (backend)
- Order confirmation email, PDF invoices (admin export)
- 5 site designs × 5 color themes (admin Appearance)
- Admin: products, orders, users, coupons, promotions, audience analytics
- Google / Facebook sign-in via Clerk
- Dark / light mode, SEO, sitemap, WhatsApp floating support

---

## Scripts (summary)

| Location | Command | Purpose |
|----------|---------|---------|
| `frontend/` | `npm run dev` | Start dev server (webpack) |
| `frontend/` | `npm run build` | Production build |
| `backend/` | `npm run dev` | API with hot reload |
| `backend/` | `npm run seed` | Seed database |
| `backend/` | `npm run ensure-admin` | Create/reset admin user |

See the [Developer Guide](./docs/DEVELOPER_GUIDE.md) for full details.

---

## License

Private / proprietary — adjust as needed for your deployment.

---

**Need help?** Read the [User Guide](./docs/USER_GUIDE.md) for store usage or the [Developer Guide](./docs/DEVELOPER_GUIDE.md) for technical setup.
