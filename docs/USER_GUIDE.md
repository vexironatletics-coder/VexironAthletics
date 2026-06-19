# VexironAthletics — User Guide

Welcome to **VexironAthletics**, your online destination for premium athletic wear for **Men**, **Women**, and **Children**. This guide explains how to use the website as a **customer** or **store administrator**.

---

## Table of contents

1. [Getting started](#getting-started)
2. [Shopping](#shopping)
3. [Your account](#your-account)
4. [Cart & checkout](#cart--checkout)
5. [Orders](#orders)
6. [Coupons & loyalty](#coupons--loyalty)
7. [Support & policies](#support--policies)
8. [Admin panel](#admin-panel)
9. [Appearance & themes](#appearance--themes)
10. [FAQ](#faq)

---

## Getting started

### Visit the store

Open the website in your browser (local: **http://localhost:3000**).

### Create an account (recommended)

1. Click **Account** (person icon) → **Register**
2. Enter your name, email, and password  
   **Or** sign in with **Google** / **Facebook**
3. After login you can track orders, save your profile, and checkout faster

### Sign in later

- **Login** from the account menu  
- Forgot password? Use **Forgot password** — a reset link is sent to your email (if SMTP is configured)

---

## Shopping

### Browse products

| Section | How to get there |
|---------|------------------|
| **Homepage** | Hero carousel, categories, featured items, discount deals |
| **Men / Women / Children** | Top navigation or **Shop by Category** on the homepage |
| **All products** | **All Products** in the footer or `/products` |
| **Search** | Search bar in the header — type and press Enter |
| **Sale items** | **Sale** link in the navigation |

### Filter & sort

On the **All Products** page you can:

- Filter by **category**, **price**, **size**, **color**, and **rating**
- Sort by **newest**, **price**, or **rating**
- Switch between **grid** and **list** view
- Use **pagination** at the bottom to see more products

### Product page

On each product you can:

- View images, description, and size guide
- Choose **size** and **color**
- Set **quantity**
- **Add to cart** or add to **wishlist** (heart icon)
- **Share** the product link

---

## Your account

After logging in, open **Dashboard** from the account menu.

| Page | What you can do |
|------|-----------------|
| **Overview** | Quick stats |
| **Profile** | Update name and phone |
| **My Orders** | View order history with product images and payment method |
| **Wishlist** | Saved products — move items to cart |
| **Settings** | Change password |

---

## Cart & checkout

### Cart

- Click the **cart icon** to review items
- Change quantities or remove items
- Cart is saved in your browser as a guest; when you log in, it syncs with your account

### Checkout (3 steps)

**Step 1 — Shipping address**

| Field | Required | Notes |
|-------|----------|-------|
| Full name | Yes | |
| Mobile number(s) | Yes (at least 1) | Click **Add number** for up to 5 numbers |
| Famous place / landmark | Yes | e.g. *Near Centaurus Mall, F-10 Markaz* |
| Your place / house address | Yes | House #, street, sector |
| City, state, postal code | Yes | |
| Country | Yes | Default: Pakistan |

**Step 2 — Payment**

- **Cash on Delivery (COD)** — available now
- Online payment options may appear as *Coming Soon*

**Step 3 — Review & place order**

- Review items and shipping details
- Apply a **coupon code** (e.g. `WELCOME10`)
- Redeem **loyalty points** if you have any
- Click **Place Order**

You receive an **order confirmation email** when SMTP is configured.

---

## Orders

### View your orders

- **My Orders** from the account menu, or visit `/orders`
- Each order shows product thumbnails, status, total, and payment method (COD)
- Use **pagination** if you have many orders

### Order statuses

| Status | Meaning |
|--------|---------|
| **Pending** | Order received |
| **Processing** | Being prepared |
| **Shipped** | On the way |
| **Delivered** | Completed |
| **Cancelled** | Cancelled |

---

## Coupons & loyalty

### Coupons

- Enter a code at checkout **Review** step and click **Apply**
- Valid codes reduce your total or add free shipping
- Homepage promotions may display active coupon codes under **Amazing Discounts**

### Loyalty points

- Earn points on delivered orders
- Redeem points at checkout (PKR value)
- Tiers: **Bronze**, **Silver**, **Gold** — higher tiers earn bonus points

---

## Support & policies

### WhatsApp support

- Green **WhatsApp** button (bottom-right) opens chat with support
- Rotating tips and **Call** / **Message** buttons
- Default message can be customized in store settings

### Information pages

| Page | Topic |
|------|-------|
| Contact | Get in touch |
| Shipping | Delivery times and free shipping (orders above ₨5,000) |
| Returns | Return policy |
| FAQ | Common questions |
| About | About VexironAthletics |
| Privacy & Terms | Legal information |

### Dark / light mode

- Toggle the **sun/moon icon** in the header to switch theme

---

## Admin panel

Access: **http://localhost:3000/dashboard/admin**  
Login with an **admin** account (default after seed: `admin@vexironathletics.com` / `Admin@123`).

### Dashboard overview

- Total revenue, orders, products, users
- Recent orders and 7-day sales chart

### Products

- View all products with images
- **Add Product** — name, price, category, sizes, colors, stock, images (uploaded to Cloudinary)
- Search and paginate the list
- Delete (deactivate) products with confirmation

### Orders

- Filter by status
- Update order status (pending → processing → shipped → delivered)
- Export **CSV** or **PDF** report
- Paginated order list

### Coupons

- Create codes: **percentage**, **fixed amount**, or **free shipping**
- Set expiry and usage limits

### Promotions (homepage banner)

- Manage scrolling **Amazing Discounts** messages on the homepage
- Optional coupon code shown on the banner

### Users

- List all customers
- **Suspend** a user or **Make Admin**
- Paginated user list

### Categories

- Manage subcategories under Men / Women / Children

### Audience analytics

- Visitor stats: country, city, device, browser, referrer
- Daily visit charts and recent visits

### Appearance

Two independent settings (like WordPress):

1. **Site design** — header style, footer style, corner radius (Classic, Wave, Boutique, Nature, Premium)
2. **Color theme** — Midnight Athletic, Ocean Breeze, Rose Elite, Forest Pro, Royal Gold

You can also override **primary / accent / secondary** colors and edit **SEO** tagline and meta description.

- Click **Preview** to see changes live
- Click **Save Changes** to apply site-wide

---

## FAQ

**Is online payment available?**  
Currently **Cash on Delivery** is supported. Card and bank options may be added later.

**Do I need an account to order?**  
You must be logged in to complete checkout.

**Is delivery free?**  
Free shipping on orders above **₨5,000** (see Shipping page).

**Can I use multiple phone numbers for delivery?**  
Yes — add up to 5 numbers at checkout so the courier can reach you.

**Why is landmark required?**  
A famous nearby place (mall, market, mosque) helps riders find you faster in Pakistan.

**How do I change the store colors?**  
Admins: **Dashboard → Appearance** → pick a design + color theme → Save.

**Database / login not working for developers?**  
If using MongoDB Atlas, ensure your IP is whitelisted. Check **http://localhost:5000/api/health**.

---

## Contact

- **WhatsApp:** use the floating button on the site  
- **Contact page:** `/contact`  
- **Email:** configured in your deployment’s SMTP settings  

---

*Thank you for choosing VexironAthletics — Elevate Your Style.*
