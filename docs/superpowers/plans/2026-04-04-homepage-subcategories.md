# Homepage Subcategory Implementation Notes

## Status

This work is implemented in the current Cocomacys storefront. The older Medusa-specific plan is obsolete and has been replaced by the Express/PostgreSQL architecture described below.

## Goal

Populate the homepage and collection pages with real catalog data using the current `collections` and `products` tables, while keeping editorial sections mapped to stable collection IDs.

## Current Architecture

- The backend serves products from `server/routes/products.cjs` and collections from `server/routes/collections.cjs`.
- Product records live in PostgreSQL and store their assigned collection in `products.collection_id`.
- Collection records live in the `collections` table and are seeded or maintained through SQL, scripts, or the authenticated collection routes.
- The storefront uses the shared client in `src/lib/api.ts` to fetch typed product and collection records from `/api`.
- Homepage and collection routing use `src/lib/subcategoryMap.ts` and `src/lib/navigation.ts`.

## File Map

### Frontend

- `src/lib/api.ts`
  Shared Express API client plus price/sale helpers.
- `src/lib/subcategoryMap.ts`
  Source of truth for parent and subcategory collection IDs.
- `src/lib/navigation.ts`
  Maps friendly category slugs to collection-driven routes.
- `src/pages/Home.tsx`
  Fetches homepage product sections and applies sale/new-arrival filtering.
- `src/pages/Women.tsx`
  Fetches products by women subcategory.
- `src/pages/Men.tsx`
  Fetches products by men subcategory.

### Backend

- `server/routes/products.cjs`
  Product listing and single-product endpoints used by the storefront.
- `server/routes/collections.cjs`
  Collection listing and CRUD endpoints.
- `server/scripts/seed-collections.cjs`
  Seeds the default women/men collection hierarchy.
- `server/scripts/migrate-from-medusa.cjs`
  Optional legacy import helper for older source data.
- `server/scripts/fix-collection-ids.cjs`
  Repair script for product-to-collection assignments after import.

## Setup Workflow

1. Apply the base schema and migrations.
2. Seed the collection hierarchy with `npm run db:seed:collections`.
3. If you are bringing in legacy catalog data, run:
   - `npm run db:migrate:medusa`
   - `npm run db:fix:collections`
4. Confirm `src/lib/subcategoryMap.ts` matches the live collection IDs in the database.

## Homepage Data Rules

- "Loved by us, picked for you"
  - `New arrivals`: newest products by `created_at DESC`
  - `Deals for you`: products where `original_price > price`
  - `Dressy looks`: women dresses collection
  - `Spring handbags`: women bags collection
- "Trending now"
  - newest products by `created_at DESC`
- "Shop clearance now"
  - products where `original_price > price`
- "Discover more options"
  - newest products that are not on sale

## Verification Checklist

- Homepage sections render products from the Express API instead of hardcoded arrays.
- Women and Men pages react to the `?category=` query string and fetch the matching collection.
- Product cards link to `/product?id=<id>`.
- Clearance filtering uses the live database pricing fields, not Medusa metadata.
- `npm run lint`, `npm test`, and `npm run build` all pass after changes.

## Notes

- The canonical women outerwear slug is `waistcoats`; the storefront still accepts the older `waitcoats` query alias for backward compatibility.
- The clearance admin flow updates `original_price` and `discount` on real product records; the homepage sale logic reads those fields directly.
