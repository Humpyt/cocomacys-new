# Homepage Subcategory Design

## Overview

The homepage and top-level collection pages are driven by the live Express API. Editorial sections do not carry their own product data; they resolve to collection IDs and lightweight pricing filters, then fetch matching products from PostgreSQL-backed endpoints.

## Hierarchy

### Level 1: Parent collections

- Women
- Men

### Level 2: Subcategories

| Women | Men |
|---|---|
| Dresses | Shirts |
| Bags | T-Shirts |
| Blouses | Shoes |
| Shoes | Jeans |
| Tops | |
| Jeans | |
| Waistcoats | |

## Data Model

### Collection record

Collections are stored in the `collections` table and exposed through `/api/collections`.

```json
{
  "id": "col_69af05c60590b95d99e809c",
  "title": "Dresses",
  "handle": "women-dresses",
  "parent_id": null,
  "metadata": {}
}
```

### Product record

Products are stored in the `products` table and exposed through `/api/products`.

```json
{
  "id": 42,
  "name": "Tailored Blazer",
  "price": 89.5,
  "original_price": 119.5,
  "discount": "25% off",
  "collection_id": "col_69af05c60590b95d99e809c"
}
```

## Storefront Mapping

The storefront keeps the current collection IDs in `src/lib/subcategoryMap.ts`, then resolves friendly URLs through `src/lib/navigation.ts`.

| Section | Source |
|---|---|
| Loved by us -> New arrivals | `/api/products?limit=6&order=created_at DESC` |
| Loved by us -> Deals for you | newest products filtered client-side where `original_price > price` |
| Loved by us -> Dressy looks | women dresses collection |
| Loved by us -> Spring handbags | women bags collection |
| Trending now | newest products |
| Shop clearance now | newest sale products |
| Discover more options | newest non-sale products |
| Women page by category | `/api/products?collection_id=<women-subcategory-id>` |
| Men page by category | `/api/products?collection_id=<men-subcategory-id>` |

## Filtering Rules

- New arrivals:
  Sort by `created_at DESC`.
- Clearance:
  Treat a product as on sale when `original_price` is present and greater than `price`.
- Product imagery:
  Use the first entry from `images[]`; fall back to a placeholder when needed.
- Brand display:
  Prefer `brand`, then fall back to `category` when the brand is missing.

## Operational Notes

- `server/scripts/seed-collections.cjs` creates the baseline collection hierarchy.
- `server/scripts/migrate-from-medusa.cjs` is only a legacy import helper; the live storefront no longer depends on Medusa APIs or Medusa response shapes.
- `server/scripts/fix-collection-ids.cjs` can repair collection assignments after imports.
- The clearance admin page updates pricing fields on products, which immediately affects homepage sale filtering because the storefront reads the same columns.

## Testing Surface

- `Home.tsx` should verify shared API usage for section fetches and tab-driven refetches.
- `ProductPage.tsx` should verify shared API product retrieval plus add-to-cart and buy-now flows.
- `Women.tsx` and `Men.tsx` should continue to rely on the same typed API helpers when category routing evolves.
