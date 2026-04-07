# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce site ("Cocomacys") with a React + Vite + Tailwind CSS storefront and an Express + PostgreSQL backend. Includes a Google OAuth-protected admin dashboard for product and clearance price management.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 6** for bundling and dev server (port 3000)
- **React Router 7** for client-side routing
- **Tailwind CSS v4** (via `@tailwindcss/vite`) with Inter + Playfair Display fonts
- **Lucide React** for icons
- **Motion** for animations
- **Vitest** + Testing Library for frontend tests

### Backend
- **Express.js** on port 3001
- **PostgreSQL** via `pg` library
- **Google OAuth** via `passport-google-oauth20`
- **Express Session** with PostgreSQL store (`connect-pg-simple`)
- **Multer** for multipart image uploads

## Commands

```bash
npm install             # Install all dependencies
npm run dev             # Start Vite dev server (port 3000)
npm run server          # Start Express backend (port 3001)
npm run dev:full        # Run both frontend + backend concurrently
npm run build           # Build frontend for production
npm run lint            # TypeScript type checking (tsc --noEmit, not ESLint)
npm test                # Run all tests (client + server)
npm run test:client     # Run Vitest frontend tests
npm run test:server     # Run Node test runner backend tests
npm run db:seed:collections   # Seed default collections
npm run db:migrate:medusa     # Import legacy Medusa product data
npm run db:fix:collections    # Fix collection IDs after migration
npm run db:import:csv         # Import products + images from ecommerce_products_for_developer CSV files
```

**Critical:** The Vite dev server proxies `/api`, `/auth`, and `/uploads` to the Express backend on port 3001 automatically — no CORS issues in development.

## Architecture

### Frontend Structure
```
src/
├── App.tsx                  # React Router 7 route definitions (storefront + /admin/*)
├── main.tsx                 # React root
├── index.css                # Tailwind + custom styles
├── context/
│   └── CartContext.tsx      # Cart state and operations
├── lib/
│   ├── api.ts               # API client helpers
│   ├── images.ts            # Image URL helpers
│   ├── navigation.ts        # Nav config (desktop/mobile menus)
│   └── subcategoryMap.ts    # Subcategory mappings for homepage
├── pages/
│   ├── Home.tsx             # Homepage with subcategory sections
│   ├── Women.tsx            # Women's category (fetches ?category=women)
│   ├── Men.tsx              # Men's category (fetches ?category=men)
│   ├── ProductPage.tsx      # Product detail (fetches /api/products/:id)
│   ├── Cart.tsx             # Cart page
│   ├── Checkout.tsx         # Checkout flow
│   ├── Contact.tsx          # Contact page
│   └── admin/
│       ├── Login.tsx        # Google OAuth login
│       ├── Dashboard.tsx    # Stats overview
│       ├── Products.tsx     # Product CRUD table
│       ├── ProductForm.tsx   # Create/edit product form
│       └── Orders.tsx       # Orders placeholder
└── components/
    ├── CartDrawer.tsx        # Slide-out cart drawer
    ├── CategoryGrid.tsx      # Category grid on homepage
    ├── Footer.tsx            # Site footer
    ├── Header.tsx            # Site header
    ├── HeroSection.tsx       # Hero banner
    ├── ProductCard.tsx       # Product card
    ├── ProductCarousel.tsx   # Product carousel
    ├── PromoBanner.tsx       # Promo banner
    └── admin/
        ├── AdminLayout.tsx   # Sidebar layout for admin pages
        └── RequireAuth.tsx   # Auth guard for protected routes
```

### Backend Structure
**Note:** Backend files use `.cjs` extension (CommonJS) for Express route handlers.
```
server/
├── index.cjs                # Express entry (port 3001)
├── db.cjs                   # PostgreSQL connection pool
├── middleware/
│   └── requireAuth.cjs      # Protects admin API routes
├── migrations/              # SQL migrations
│   ├── 001_create_collections.sql
│   └── 002_create_carts_orders.sql
├── routes/
│   ├── auth.cjs             # Google OAuth + session management
│   ├── products.cjs         # Full CRUD at /api/products
│   ├── collections.cjs     # Collections API at /api/collections
│   ├── cart.cjs             # Cart API at /api/carts (singular file name)
│   ├── clearance.cjs        # Clearance API at /api/clearance (Admin)
│   ├── upload.cjs           # Image upload at /api/upload
│   └── import.cjs           # CSV import at /api/import (Admin)
├── scripts/                 # One-off utilities
│   ├── seed-collections.cjs
│   ├── fix-collection-ids.cjs
│   └── migrate-from-medusa.cjs
└── tests/                   # Backend smoke tests
cocomacys.sql                # Base schema (products, admin_users, session)
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Server health check |
| GET | `/api/products` | Public | List products (?category=filter) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/collections` | Public | List collections |
| GET | `/api/collections/:handle` | Public | Get collection by handle |
| GET | `/api/carts/:cartId` | Public | Get cart with items |
| POST | `/api/carts` | Public | Create cart |
| POST | `/api/carts/:cartId/items` | Public | Add item to cart |
| PUT | `/api/carts/:cartId/items/:itemId` | Public | Update cart item quantity |
| DELETE | `/api/carts/:cartId/items/:itemId` | Public | Remove cart item |
| POST | `/api/carts/:cartId/address` | Public | Update shipping address |
| POST | `/api/carts/:cartId/complete` | Public | Create order from cart |
| GET | `/api/clearance` | Public | List all products with clearance status |
| POST | `/api/clearance/:id/clearance` | Admin | Set product clearance price |
| POST | `/api/clearance/bulk-clearance` | Admin | Bulk update clearance |
| POST | `/api/upload` | Admin | Upload image, returns path |
| POST | `/api/import` | Admin | Bulk CSV product import |
| GET | `/auth/google` | Public | Start Google OAuth |
| GET | `/auth/google/callback` | Public | OAuth callback |
| GET | `/auth/me` | Public | Get current admin user |
| POST | `/auth/logout` | Public | Log out |

### Database Schema
- **`products`** — id, name, brand, description, details, price, original_price, discount, promo, rating, reviews, images (TEXT[]), colors (JSONB), sizes (JSONB), types (JSONB), features (TEXT[]), category, created_at, updated_at
- **`collections`** — id, title, handle, description, image, created_at
- **`carts`** — id, customer_id, email, shipping_address (JSONB), shipping_method (JSONB), payment_status, status, created_at, updated_at
- **`cart_items`** — id, cart_id, product_id, variant_id, quantity, unit_price, created_at
- **`orders`** — id, cart_id, customer_id, email, shipping_address (JSONB), billing_address (JSONB), shipping_method (JSONB), subtotal, tax, total, status, payment_status, created_at, updated_at
- **`admin_users`** — Google OAuth users (google_id, email, name, avatar_url)
- **`session`** — Express session storage via `connect-pg-simple`

**Schema setup order:** `cocomacys.sql` → `server/migrations/001_create_collections.sql` → `server/migrations/002_create_carts_orders.sql`

## Environment Variables

```bash
# Backend (.env)
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cocomacys
DB_USER=postgres
DB_PASSWORD=your_password
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
SESSION_SECRET=change-this-in-production
FRONTEND_URL=http://localhost:3000
```

## Setup Steps

1. **PostgreSQL:** Create database `cocomacys` and apply schema in order:
   ```bash
   psql -U postgres -d cocomacys -f cocomacys.sql
   psql -U postgres -d cocomacys -f server/migrations/001_create_collections.sql
   psql -U postgres -d cocomacys -f server/migrations/002_create_carts_orders.sql
   ```
2. **Seed collections:** `npm run db:seed:collections`
3. **Google OAuth:** Create credentials at console.cloud.google.com, add callback URL
4. **Environment:** Copy `.env.example` to `.env`, fill in values
5. **Install:** `npm install`
6. **Run:** `npm run dev:full` (starts both servers)

## Medusa Migration

The codebase includes one-off scripts for migrating legacy Medusa-origin product data:
- `npm run db:migrate:medusa` — imports products from Medusa export
- `npm run db:fix:collections` — repairs collection IDs after import

## CSV Product Import

To import products and images from the `ecommerce_products_for_developer/` CSVs:
```bash
npm run db:import:csv
```
This reads `men_products.csv` and `women_products.csv`, copies images to `uploads/`, and inserts/updates the `products` table.

## Admin Access

Visit `http://localhost:3000/admin/login` → Click "Continue with Google" → Redirects to `/admin/clearance` dashboard after OAuth.

## Image Uploads

Admin can upload images via the product form. Files are stored in `/uploads/` directory (gitignored) and served at `/uploads/:filename`.
