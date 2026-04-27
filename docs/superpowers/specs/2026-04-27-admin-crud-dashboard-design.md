# Spec: Admin Dashboard CRUD Completion

## Context
The admin dashboard currently has full CRUD only for Products. Orders is a placeholder page, and there are no admin pages for Collections or Clearance management. Homepage Sections only supports product assignment, not section CRUD. The dashboard itself shows hardcoded values for order stats. The backend already has full CRUD routes for products, collections, clearance, and partial routes for orders and homepage sections.

## Approach
Add admin pages for Collections and Clearance, rewrite Orders from placeholder to functional, enhance Homepage Sections with full CRUD, and update Dashboard with real stats. Each page follows the established Products.tsx + ProductForm.tsx pattern: list table with search/filter/paginate/delete confirmation, and a form for create/edit. Backend gaps (orders admin endpoint, homepage sections CRUD) get filled in.

## Architecture

### Frontend Pages

**Dashboard.tsx — Enhanced**
- Replace hardcoded "—" for orders with real counts from `GET /api/orders/stats`
- Show: total products, clearance items, total orders, total revenue
- 5-row "Recent Orders" table at the bottom
- Keep existing quick-link buttons

**Collections.tsx — New**
- Table: name, description, product count, actions (edit/delete)
- Search by name with search bar
- Pagination (reuse pattern from Products.tsx)
- Delete confirmation modal (reuse pattern from Products.tsx)
- "Add Collection" button linking to CollectionForm

**CollectionForm.tsx — New**
- Name input, description textarea, image URL input
- Create and edit modes (same component, different routes)
- Backend: existing `POST /api/collections` and `PUT /api/collections/:id`

**Orders.tsx — Rewrite**
- Table: order ID, customer name, total, status, date, items count
- Filter by status dropdown (All, Pending, Confirmed, Shipped, Delivered, Cancelled)
- Click row to expand order details: items list with product names, quantities, unit prices; shipping address
- Status update dropdown per order
- No delete (orders are managed by status, not deleted)
- Backend addition: `GET /api/orders/admin` for admin list with status filter

**Clearance.tsx — New**
- Table: product name, original price, clearance price, discount %, status badge (active/inactive)
- "Add to Clearance" button → modal with product search and discount % input
- Inline discount edit
- Remove from clearance with confirmation
- Toggle active/inactive per item
- Backend: existing `POST /api/clearance/:id/clearance`, `POST /api/clearance/bulk-clearance`

**HomepageSections.tsx — Enhanced**
- List each section as a card with: title, type badge, product count
- "Add Section" button → modal with title and type inputs
- Edit section title inline
- Delete section with confirmation (reuse pattern)
- Existing product picker modal for each section (already works)
- Backend addition: `POST /api/homepage-sections`, `PUT /api/homepage-sections/:key`, `DELETE /api/homepage-sections/:key`

**Import.tsx — New**
- File upload area with drag-and-drop support for CSV and Excel (.xlsx) files
- "Download Template" button — downloads a blank CSV with the correct column headers
- After upload: preview table showing first 10 parsed rows with validation status
- Column mapping UI — map file columns to expected fields (auto-detected by header name, but adjustable via dropdowns)
- "Start Import" button with progress indicator
- Result summary: inserted count, updated count, skipped count, error list with row numbers
- Backend: existing `POST /api/import` for CSV; add Excel parsing via `xlsx` package, same endpoint extended to handle both formats
- Add `npm install xlsx` dependency for Excel parsing

### API Client (src/lib/api.ts)

New methods:
- `createCollection(data)` — POST /api/collections
- `updateCollection(id, data)` — PUT /api/collections/:id
- `deleteCollection(id)` — DELETE /api/collections/:id
- `fetchOrdersAdmin(params)` — GET /api/orders/admin
- `updateOrderStatus(id, status)` — PUT /api/orders/:id/status
- `fetchClearanceItems()` — GET /api/clearance
- `addToClearance(productId, discount)` — POST /api/clearance/:id/clearance
- `updateClearanceDiscount(id, discount)` — PUT /api/clearance/:id/clearance
- `removeFromClearance(id)` — DELETE /api/clearance/:id
- `createHomepageSection(data)` — POST /api/homepage-sections
- `updateHomepageSection(key, data)` — PUT /api/homepage-sections/:key
- `deleteHomepageSection(key)` — DELETE /api/homepage-sections/:key
- `uploadImportFile(file)` — POST /api/import (multipart form, CSV or Excel)
- `downloadImportTemplate()` — GET /api/import/template (returns CSV file)

### Backend Changes

**server/routes/orders.cjs**
- Add `GET /api/orders/admin` — returns all orders with joined product names, filterable by status, paginated, ordered by created_at DESC

**server/routes/homepage-sections.cjs**
- Add `POST /api/homepage-sections` — create section (title, type_key, product_ids)
- Add `PUT /api/homepage-sections/:key` — update section metadata (title)
- Add `DELETE /api/homepage-sections/:key` — delete section

**server/routes/import.cjs — Enhanced**
- Add Excel (.xlsx) parsing via `xlsx` package — detect file type by mimetype/extension, parse Excel sheets to same row format as CSV
- Add `GET /api/import/template` — returns a downloadable CSV file with expected column headers (product_name, price, brand, gender, category, short_description, long_description, color, size, image_paths)
- Existing CSV parsing logic stays unchanged

### AdminLayout Sidebar Update
Add nav items: Collections, Clearance, Import. Keep: Dashboard, Products, Homepage Sections, Orders.

## Data Flow
Each list page mounts → calls API client method → backend route → PostgreSQL query → JSON response → React state → render table. Forms POST/PUT to same backend routes, then redirect back to list. Deletes show confirmation modal, then DELETE request, then refresh list.

## Error Handling
- API errors display inline error messages on forms
- Network failures show toast-style alert at page top
- Delete failures keep the item in the list with error message
- Follow existing error handling patterns from Products.tsx

## Testing
- Each new page renders without crashing (basic smoke test)
- API client methods return correct shapes
- Backend endpoints return correct JSON for each operation
