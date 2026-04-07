# CSV Product Import — Design Spec

## Overview

Add a CSV import feature to the admin dashboard that bulk-loads products from the developer-provided CSV files (`women_products.csv`, `men_products.csv`) into the PostgreSQL database. Images are copied from the source directory to `/uploads`.

---

## CSV Format

**File:** `ecommerce_products_for_developer/women_products.csv` and `men_products.csv`

**Columns:** `id`, `product_name`, `brand`, `category`, `gender`, `size`, `color`, `price`, `short_description`, `long_description`, `image_paths`

**Notes:**
- `image_paths` is pipe-separated (`|`)
- `size` is comma-separated (e.g. `31x32, 40x34`)
- Prices stored as UGX whole numbers (e.g. `380000`), displayed as UGX
- `gender` column (`Women`/`Men`) prefixes the category (e.g. `women_bags`)

---

## Column Mapping

| CSV field | Database field | Transform |
|---|---|---|
| `product_name` | `name` | — |
| `brand` | `brand` | — |
| `category` | `category` | Prepend gender: `women_{category}` or `men_{category}` |
| `short_description` | `description` | — |
| `long_description` | `details` | — |
| `price` | `price` | Store as-is (UGX, DECIMAL) |
| `color` | `colors` | `JSONB` array, e.g. `["Black"]` |
| `size` | `sizes` | `JSONB` array from comma-split, e.g. `["31x32","40x34"]` |
| `image_paths` | `images` | `TEXT[]` from pipe-split |
| `gender` | — | Used to prefix category only |
| `rating` | `rating` | Default `0` |
| `reviews` | `reviews` | Default `0` |
| `id` | — | Ignored (DB auto-increments) |
| `discount`, `promo`, `original_price`, `types`, `features` | — | Default empty/`[]` |

---

## Matching Logic

A product is considered the **same** if `name` AND `price` match an existing row.

- **Match found:** Append `color` to existing `colors` array (if not already present), append `size` to existing `sizes` array (if not already present), append new image paths to `images` array (deduplicated).
- **No match:** Insert as a new product row.

---

## Image File Handling

- **Source base:** `D:/WEB PROJECTS/Cocomacys/cocomacys/ecommerce_products_for_developer/product_images/`
- **Dest base:** `D:/WEB PROJECTS/Cocomacys/cocomacys/uploads/`
- **Dest naming:** `{gender}_{product_name_slug}_{timestamp}/{original_filename}` (e.g. `women_bags_aldo_black_123456/image_1.jpeg`)
- Images are copied (not moved) so the source files remain intact.
- If a referenced image file is not found on disk → log a warning, skip that image path, continue processing.
- `image_paths` in the database store the new `/uploads/...` paths.

---

## API

### `POST /api/import`

**Auth:** Admin only (uses `requireAuth` middleware)

**Request:** `Content-Type: multipart/form-data`
- `file`: CSV file

**Response (200):**
```json
{
  "inserted": 45,
  "updated": 12,
  "skipped": 3,
  "errors": []
}
```

**Errors:**
- `400` — No file uploaded or invalid CSV
- `401` — Not authenticated
- `500` — Server error

---

## Frontend

### Import Button
- Location: `/admin/products` page, near the "Add Product" button
- Opens a file picker filtered to `.csv`
- On selection, immediately uploads to `POST /api/import`

### Progress & Results
- Show a progress indicator (spinner) while uploading/importing
- On completion, show a summary toast/modal: `X inserted, Y updated, Z skipped`
- On error, show error message

---

## Backend Implementation

### New file: `server/routes/import.cjs`

Dependencies: `csv-parser` (streaming, npm install)

Flow:
1. Receive multipart file via Multer (temp storage)
2. Stream-parse CSV with `csv-parser`
3. For each row:
   - Validate `product_name` and `price` exist
   - Transform: prefix category with gender, split colors/sizes/images into arrays
   - Check DB for existing product with same `name` + `price`
   - If exists → UPDATE (append arrays, deduplicate)
   - If new → INSERT
   - Copy referenced image files to `/uploads`
4. Return summary JSON

### Multer config in `server/index.cjs`
Add `/api/import` route with Multer for `multipart/form-data` handling.

---

## Files to Create/Modify

| File | Action |
|---|---|
| `server/routes/import.cjs` | Create — CSV import route |
| `server/index.cjs` | Modify — add import route, install multer if needed |
| `src/pages/admin/Products.tsx` | Modify — add Import CSV button and modal |
| `package.json` | Modify — add `csv-parser` dependency |

---

## Dependencies

- `csv-parser` — streaming CSV parsing (already likely installed, verify)
- `multer` — already installed for image uploads

---

## Verification

1. Start backend: `npm run server`
2. Visit `http://localhost:3002/admin/products`
3. Click "Import CSV" button
4. Select `ecommerce_products_for_developer/women_products.csv`
5. Confirm summary shows correct inserted/updated counts
6. Visit storefront — products visible with images
