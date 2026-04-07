# Cleanup: Remove Duplicate Products Without Images

## Context

Two batches of product imports were run:

1. **First import** (IDs 1-172): Products inserted WITHOUT images — these are dead data
2. **Second import** (IDs 173-294): Products inserted WITH correct images from the CSV, covering all 253 image folders in `product_images/Men/` and `product_images/Women/`

The 172 products (IDs 1-172) have no images and are pure duplicates. They need to be deleted so the storefront only shows products with real images.

## Approach

Single SQL operation:

```sql
DELETE FROM products WHERE id <= 172;
```

No code changes. No new files. Verify with:

```sql
SELECT COUNT(*) FROM products;
-- Expected: 122 (was 294, minus 172 deleted)
```

```sql
SELECT COUNT(*) FROM products WHERE images = '{}' OR images IS NULL;
-- Expected: 0
```

## Verification

1. Confirm count: 122 products remain
2. Confirm zero products have empty images
3. Visit http://localhost:3000 — all displayed products should show real images
4. Visit /women and /men — products should load with correct images
