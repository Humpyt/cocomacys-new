# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce site ("Cocomacys") with a React + Vite + Tailwind CSS storefront and an Express + PostgreSQL backend. Google OAuth protects both the admin dashboard and customer account features. Admin can manage products, collections, clearance pricing, homepage sections, orders, and CSV imports.

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
npm run dev             # Start Vite dev server (port 3000) — proxies /api, /auth, /uploads to :3001
npm run build           # Build frontend for production (to dist/)
npm run lint            # TypeScript type checking (tsc --noEmit, not ESLint)
npm run preview         # Preview production build locally
npm run clean           # Remove dist/ directory
```

**AI Studio constraint:** `vite.config.ts` disables HMR when `DISABLE_HMR=true`. Do not modify the HMR logic — it prevents flickering during AI Studio agent edits.

### Running the backend

```bash
node server/index.cjs                    # Start Express backend (port 3001)
npx tsx server/scripts/seed-collections.cjs   # Seed default collections
npx tsx server/scripts/import-csv-products.cjs # Import products from ecommerce_products_for_developer/ CSVs
```

### Running tests

```bash
npx vitest run                    # Run frontend tests (Vitest, uses vite.config.ts)
npx vitest                        # Vitest watch mode
node --test server/tests/flows.smoke.test.cjs   # Run backend smoke tests (Node test runner)
```

### Database scripts (one-off utilities in server/scripts/)

```bash
node server/scripts/seed-collections.cjs        # Seed default collections
node server/scripts/migrate-from-medusa.cjs     # Import legacy Medusa product data
node server/scripts/fix-collection-ids.cjs      # Fix collection IDs after migration
node server/scripts/import-csv-products.cjs     # Bulk import products + images from CSVs
node server/scripts/import-women-products.cjs   # Import women's products specifically
node server/scripts/import-men-ties-bowties.cjs # Import men's ties/bowties
```

**Critical:** The Vite dev server proxies `/api`, `/auth`, and `/uploads` to the Express backend on port 3001 automatically — no CORS issues in development.

## Architecture

### Frontend Structure
```
src/
├── App.tsx                  # React Router 7 route definitions (storefront, customer, /admin/*)
├── main.tsx                 # React root
├── index.css                # Tailwind + custom styles
├── context/
│   ├── AuthContext.tsx       # Admin Google OAuth state
│   ├── CustomerAuthContext.tsx # Customer Google OAuth state
│   └── CartContext.tsx       # Cart state and operations
├── lib/
│   ├── api.ts               # API client with typed helpers for all endpoints
│   ├── images.ts            # Image URL helpers
│   ├── medusa.ts            # Medusa API types for legacy product integration
│   ├── navigation.ts        # Nav config (desktop/mobile menus)
│   └── subcategoryMap.ts    # Subcategory mappings + COLLECTION_IDS constants
├── pages/
│   ├── Home.tsx             # Homepage with subcategory sections
│   ├── Women.tsx            # Women's category (fetches ?category=women)
│   ├── Men.tsx              # Men's category (fetches ?category=men)
│   ├── ProductPage.tsx      # Product detail (fetches /api/products/:id)
│   ├── Cart.tsx             # Cart page
│   ├── Checkout.tsx         # Checkout flow
│   ├── Contact.tsx          # Contact page
│   ├── admin/
│   │   ├── Login.tsx        # Google OAuth login
│   │   ├── Dashboard.tsx    # Stats overview
│   │   ├── Products.tsx     # Product CRUD table
│   │   ├── ProductForm.tsx  # Create/edit product form
│   │   ├── Collections.tsx  # Collection management table
│   │   ├── CollectionForm.tsx # Create/edit collection form
│   │   ├── Clearance.tsx    # Clearance pricing management
│   │   ├── Orders.tsx       # Order management
│   │   ├── HomepageSections.tsx # Assign products to homepage sections
│   │   └── Import.tsx       # CSV product import
│   └── customer/
│       ├── Login.tsx        # Customer Google OAuth login
│       ├── Register.tsx     # Customer Google OAuth register
│       ├── Account.tsx      # Customer account overview
│       └── Orders.tsx       # Customer order history
├── test/
│   └── setup.ts            # Vitest setup (jest-dom matchers, cleanup)
└── components/
    ├── CartDrawer.tsx          # Slide-out cart drawer
    ├── CategoryGrid.tsx        # Category grid on homepage
    ├── CategorySection.tsx     # Section wrapper (title + carousel) for homepage subcategories
    ├── CategorySectionSkeleton.tsx # Loading skeleton for CategorySection
    ├── CategoryStrip.tsx       # Horizontal category link strip on homepage
    ├── Footer.tsx              # Site footer
    ├── Header.tsx              # Site header with auth-aware customer menu
    ├── HeroSection.tsx         # Hero banner
    ├── ProductCard.tsx         # Product card
    ├── ProductCarousel.tsx     # Product carousel (supports grid mode)
    ├── PromoBanner.tsx         # Promo banner
    └── admin/
        ├── AdminLayout.tsx     # Sidebar layout for admin pages
        ├── ImageUploader.tsx   # Image upload with preview
        └── RequireAuth.tsx     # Auth guard for protected routes
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
│   ├── 002_create_carts_orders.sql
│   ├── 003_create_customers.sql
│   └── 003_create_homepage_sections.sql
├── routes/
│   ├── auth.cjs             # Google OAuth + session management
│   ├── products.cjs         # Full CRUD at /api/products
│   ├── collections.cjs      # Collections API at /api/collections
│   ├── cart.cjs             # Cart API at /api/carts (exports factory: createCartRouter({ pool }))
│   ├── clearance.cjs        # Clearance API at /api/clearance (exports factory: createClearanceRouter({ pool }))
│   ├── orders.cjs           # Orders API at /api/orders (customer + admin)
│   ├── homepage-sections.cjs # Homepage section CRUD at /api/homepage-sections
│   ├── upload.cjs           # Image upload at /api/upload
│   └── import.cjs           # CSV import at /api/import
├── scripts/                 # One-off utilities
│   ├── seed-collections.cjs
│   ├── fix-collection-ids.cjs
│   ├── migrate-from-medusa.cjs
│   ├── import-csv-products.cjs
│   ├── import-women-products.cjs
│   ├── import-men-ties-bowties.cjs
│   ├── update-csv-collection-ids.cjs
│   ├── check-images.cjs
│   ├── fix-image-paths.cjs
│   ├── fix-missing-images.cjs
│   └── fix-quoted-image-paths.cjs
└── tests/                   # Backend smoke tests
cocomacys.sql                # Base schema (products, admin_users, session)
```

**Key patterns:**
- `cart.cjs` and `clearance.cjs` export **factory functions** (`createCartRouter({ pool })`, `createClearanceRouter({ pool })`) that accept a database pool for testability. All other route files import `pool` directly from `../db.cjs`.
- In `server/index.cjs`, `clearanceRoutes` and `homepageSectionsRoutes` are mounted with `requireAuth` middleware at the router level, making ALL their endpoints admin-only.
- The server serves the Vite-built `dist/` directory as a fallback for production (SPA client-side routing).

### Path Alias
The `@` alias maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`):
```ts
import { api } from '@/src/lib/api';
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Server health check |
| GET | `/api/products` | Public | List products (?category=, ?collection_id=, ?gender=, ?limit=, ?order=) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/collections` | Public | List collections |
| GET | `/api/collections/:handle` | Public | Get collection by handle |
| POST | `/api/collections` | Admin | Create collection |
| PUT | `/api/collections/:id` | Admin | Update collection |
| DELETE | `/api/collections/:id` | Admin | Delete collection |
| GET | `/api/carts/:cartId` | Public | Get cart with items |
| POST | `/api/carts` | Public | Create cart |
| POST | `/api/carts/:cartId/items` | Public | Add item to cart |
| PUT | `/api/carts/:cartId/items/:itemId` | Public | Update cart item quantity |
| DELETE | `/api/carts/:cartId/items/:itemId` | Public | Remove cart item |
| POST | `/api/carts/:cartId/address` | Public | Update shipping address |
| POST | `/api/carts/:cartId/complete` | Public | Create order from cart |
| GET | `/api/clearance` | Admin | List all products with clearance status |
| POST | `/api/clearance/:id/clearance` | Admin | Set product clearance price |
| POST | `/api/clearance/bulk-clearance` | Admin | Bulk update clearance |
| GET | `/api/orders?customer_id=` | Public | List customer orders with items |
| GET | `/api/orders/admin` | Admin | List all orders (?status=, ?limit=, ?offset=) |
| GET | `/api/orders/:id` | Public | Get single order with items |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/homepage-sections` | Admin | List all homepage sections |
| POST | `/api/homepage-sections` | Admin | Create a homepage section |
| PUT | `/api/homepage-sections/:key` | Admin | Update section title |
| PUT | `/api/homepage-sections/:key/assign` | Admin | Assign products to a section |
| DELETE | `/api/homepage-sections/:key` | Admin | Delete a section |
| POST | `/api/upload` | Admin | Upload image, returns path |
| POST | `/api/upload/multiple` | Admin | Upload multiple images |
| POST | `/api/import` | Admin | Bulk CSV product import |
| GET | `/api/import/template` | Admin | Download CSV template |
| GET | `/auth/google` | Public | Start Google OAuth |
| GET | `/auth/google/callback` | Public | OAuth callback |
| GET | `/auth/me` | Public | Get current admin user |
| POST | `/auth/logout` | Public | Log out |

### Database Schema
- **`products`** — id, name, brand, description, details, price, original_price, discount, promo, rating, reviews, images (TEXT[]), colors (JSONB), sizes (JSONB), types (JSONB), features (TEXT[]), category, collection_id, created_at, updated_at
- **`collections`** — id, title, handle, description, image, parent_id, metadata (JSONB), created_at
- **`carts`** — id, customer_id, email, shipping_address (JSONB), shipping_method (JSONB), payment_status, status, created_at, updated_at
- **`cart_items`** — id, cart_id, product_id, variant_id, quantity, unit_price, created_at
- **`orders`** — id, cart_id, customer_id, email, shipping_address (JSONB), billing_address (JSONB), shipping_method (JSONB), subtotal, tax, total, status, payment_status, created_at, updated_at
- **`customers`** — id, google_id, email, name, avatar_url, created_at
- **`homepage_sections`** — id, section_key, title, product_ids (INTEGER[]), created_at, updated_at
- **`admin_users`** — Google OAuth users (google_id, email, name, avatar_url)
- **`session`** — Express session storage via `connect-pg-simple`

**Schema setup order:** `cocomacys.sql` → `server/migrations/001_create_collections.sql` → `server/migrations/002_create_carts_orders.sql` → `server/migrations/003_create_customers.sql` → `server/migrations/003_create_homepage_sections.sql`

## Environment Variables

The `.env` file at the project root is read by both the Vite dev server (`vite.config.ts` uses `loadEnv`) and the Express backend (`dotenv` in `server/db.cjs`). The `.env.example` only lists `GEMINI_API_KEY` and `APP_URL` (AI Studio template), but the backend requires additional variables.

**Required for the backend (`server/db.cjs`, `server/index.cjs`):**
```bash
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
PORT=3001
```

**Optional for AI features (used by `vite.config.ts` define):**
```bash
GEMINI_API_KEY=your_gemini_key
```

## Setup Steps

1. **PostgreSQL:** Create database `cocomacys` and apply schema in order:
   ```bash
   psql -U postgres -d cocomacys -f cocomacys.sql
   psql -U postgres -d cocomacys -f server/migrations/001_create_collections.sql
   psql -U postgres -d cocomacys -f server/migrations/002_create_carts_orders.sql
   psql -U postgres -d cocomacys -f server/migrations/003_create_customers.sql
   psql -U postgres -d cocomacys -f server/migrations/003_create_homepage_sections.sql
   ```
2. **Seed collections:** `node server/scripts/seed-collections.cjs`
3. **Google OAuth:** Create credentials at console.cloud.google.com, add callback URL
4. **Environment:** Copy `.env.example` to `.env`, fill in ALL values (see Environment Variables section above)
5. **Install:** `npm install`
6. **Run:** Start both the backend (`node server/index.cjs`) and frontend (`npm run dev`) in separate terminals

## Medusa Migration

One-off scripts for migrating legacy Medusa-origin product data:
```bash
node server/scripts/migrate-from-medusa.cjs     # Import products from Medusa export
node server/scripts/fix-collection-ids.cjs       # Repair collection IDs after migration
```

## CSV Product Import

To import products and images from the `ecommerce_products_for_developer/` CSVs:
```bash
node server/scripts/import-csv-products.cjs
node server/scripts/import-women-products.cjs
node server/scripts/import-men-ties-bowties.cjs
```
These read `men_products.csv` / `women_products.csv`, copy images to `uploads/`, and insert/update the `products` table.

## Admin Access

Visit `http://localhost:3000/admin/login` → Click "Continue with Google" → Redirects to `/admin/dashboard` after OAuth. The sidebar provides navigation to all admin sections.

## Image Uploads

Admin can upload images via the product form. Files are stored in `/uploads/` directory (gitignored) and served at `/uploads/:filename`.

## Production Deployment

The site is deployed on a Hostinger VPS (`72.60.83.198`) at **https://cocofashionbrands.com**. The full deployment guide is in `cocowebsiterun.md`.

### Deployment Architecture

```
User → Nginx (port 80/443) → Express (port 4000 via PM2) → PostgreSQL (localhost)
                            ↘ dist/ (static SPA files)
```

- **PM2** manages the Express process (`deploy/hostinger/pm2/ecosystem.config.cjs`)
- **Nginx** reverse-proxies `/api`, `/auth`, `/uploads` to Express and serves `dist/` for all other routes
- **PostgreSQL** runs locally on the VPS (not Supabase/cloud)
- **SSL** via Certbot (Let's Encrypt)

### Key Production Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Server port | 3001 | 4000 |
| Frontend serving | Vite dev server | Express serves `dist/` |
| `NODE_ENV` | (unset) | `production` |
| `cookie.secure` | false | true |
| Frontend URL | `http://localhost:3000` | `https://cocofashionbrands.com` |
| Google callback | `http://localhost:3001/auth/google/callback` | `https://cocofashionbrands.com/auth/google/callback` |
| `.env` location | Project root | `server/.env` on VPS |

### Deploy directory structure
```
deploy/hostinger/
├── README.md              # Quick deploy reference
├── deploy.sh              # Automated deployment script
├── pm2/
│   └── ecosystem.config.cjs  # PM2 process config (fork mode, 400MB memory limit)
└── nginx/
    └── cocofashionbrands.com.conf  # Nginx site config
```

### Quick Deploy (after pushing to main)

```bash
ssh root@72.60.83.198 "bash /var/www/cocofashionbrands.com/current/deploy/hostinger/deploy.sh"
```
