# Admin Dashboard CRUD Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin full CRUD over all entities (collections, clearance, orders, homepage sections) plus CSV/Excel import, polished dashboard with real stats.

**Architecture:** Each entity gets a list page (table with search/pagination/delete modal) and optionally a form page, following the established Products.tsx + ProductForm.tsx pattern. The API client (api.ts) bridges frontend pages to Express backend routes. Backend gaps (orders admin list, homepage sections CRUD) get filled with new endpoints.

**Tech Stack:** React 19 + TypeScript, Vite 6, Tailwind CSS v4, React Router 7, Lucide React, Express.js (CommonJS .cjs), PostgreSQL via `pg`, Multer, xlsx (new)

---

### Task 1: Backend — Orders admin endpoint

**Files:**
- Modify: `server/routes/orders.cjs`

- [ ] **Step 1: Add requireAuth import and `GET /api/orders/admin` route**

At the top of the file, add after `const pool = require('../db.cjs');`:

```javascript
const requireAuth = require('../middleware/requireAuth.cjs');
```

Then insert before `module.exports = router;` at line 75:

```javascript
// GET /api/orders/admin — all orders for admin dashboard (auth required)
router.get('/admin', requireAuth, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT o.*,
        json_agg(json_build_object(
          'id', ci.id,
          'product_id', ci.product_id,
          'quantity', ci.quantity,
          'unit_price', ci.unit_price,
          'name', p.name,
          'brand', p.brand,
          'images', p.images
        )) FILTER (WHERE ci.id IS NOT NULL) as items
      FROM orders o
      LEFT JOIN cart_items ci ON ci.cart_id = o.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
    `;

    const params = [];
    if (status) {
      query += ` WHERE o.status = $1`;
      params.push(status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders${status ? ' WHERE status = $1' : ''}`,
      status ? [status] : []
    );

    res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
```

- [ ] **Step 2: Run backend tests**

Run: `npm run test:server`
Expected: All existing tests pass.

---

### Task 2: Backend — Homepage sections CRUD endpoints

**Files:**
- Modify: `server/routes/homepage-sections.cjs`

- [ ] **Step 1: Add create, update, delete routes**

Insert after the existing PUT route and before `module.exports = router;` at line 57:

```javascript
// POST /api/homepage-sections — create a new section (auth required)
router.post('/', requireAuth, async (req, res) => {
  const { key, title, productIds } = req.body;

  if (!key || !title) {
    return res.status(400).json({ error: 'key and title are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO homepage_sections (section_key, title, product_ids)
       VALUES ($1, $2, $3::integer[])
       RETURNING section_key, title, product_ids`,
      [key, title, productIds || []]
    );

    const row = result.rows[0];
    res.status(201).json({
      key: row.section_key,
      title: row.title,
      productIds: row.product_ids || [],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Section '${key}' already exists` });
    }
    console.error('Error creating homepage section:', err);
    res.status(500).json({ error: 'Failed to create homepage section' });
  }
});

// PUT /api/homepage-sections/:key — update section metadata (auth required)
router.put('/:key', requireAuth, async (req, res) => {
  const { key } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE homepage_sections
       SET title = $1, updated_at = NOW()
       WHERE section_key = $2
       RETURNING section_key, title, product_ids`,
      [title, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Section '${key}' not found` });
    }

    const row = result.rows[0];
    res.json({
      key: row.section_key,
      title: row.title,
      productIds: row.product_ids || [],
    });
  } catch (err) {
    console.error('Error updating homepage section:', err);
    res.status(500).json({ error: 'Failed to update homepage section' });
  }
});

// DELETE /api/homepage-sections/:key — delete a section (auth required)
router.delete('/:key', requireAuth, async (req, res) => {
  const { key } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM homepage_sections WHERE section_key = $1 RETURNING section_key',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Section '${key}' not found` });
    }

    res.json({ message: 'Section deleted' });
  } catch (err) {
    console.error('Error deleting homepage section:', err);
    res.status(500).json({ error: 'Failed to delete homepage section' });
  }
});
```

- [ ] **Step 2: Run backend tests**

Run: `npm run test:server`
Expected: All existing tests pass.

---

### Task 3: Backend — Import route enhancements

**Files:**
- Modify: `server/routes/import.cjs`

- [ ] **Step 1: Install xlsx dependency**

Run: `npm install xlsx`

- [ ] **Step 2: Add Excel parsing and template endpoint**

Replace the import route's `csv` import block at the top with both parsers, add template endpoint:

At line 8, add after `const csv = require('csv-parser');`:

```javascript
const XLSX = require('xlsx');
```

At line 43, before the existing `router.post('/', ...)` handler, add the template endpoint:

```javascript
// GET /api/import/template — download empty CSV template
router.get('/template', requireAuth, (req, res) => {
  const headers = 'product_name,price,brand,gender,category,short_description,long_description,color,size,image_paths';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="import_template.csv"');
  res.send(headers + '\n');
});
```

Replace the existing `router.post('/', ...)` handler (lines 43–138) with the Excel-aware version:

```javascript
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const summary = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isExcel = ext === '.xlsx' || ext === '.xls';

  if (isExcel) {
    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      results.push(...jsonData);
    } catch (err) {
      return res.status(400).json({ error: `Failed to parse Excel file: ${err.message}` });
    }
  } else {
    const bufferStr = req.file.buffer.toString('utf-8');
    await new Promise((resolve, reject) => {
      const stream = require('stream');
      const s = new stream.Readable();
      s.push(bufferStr);
      s.push(null);

      s.pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', resolve)
        .on('error', reject);
    });
  }

  // Preview mode — return first 10 parsed rows without importing
  if (req.query.preview === 'true') {
    return res.json({ preview: true, columns: Object.keys(results[0] || {}), rows: results.slice(0, 10), totalRows: results.length });
  }

  for (const row of results) {
    try {
      const name = row.product_name?.trim();
      const price = parseFloat(row.price);
      const brand = row.brand?.trim() || '';
      const gender = row.gender?.trim() || '';
      const category = gender && row.category
        ? `${gender.toLowerCase()}_${row.category.trim().toLowerCase()}`
        : (row.category?.trim() || '');
      const shortDesc = row.short_description?.trim() || '';
      const longDesc = row.long_description?.trim() || '';
      const colors = row.color ? [row.color.trim()] : [];
      const sizes = row.size
        ? row.size.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const imagePathsRaw = row.image_paths?.trim() || '';

      if (!name || isNaN(price)) {
        summary.skipped++;
        summary.errors.push(`Row skipped: missing name or price`);
        continue;
      }

      const existing = await pool.query(
        'SELECT * FROM products WHERE name = $1 AND price = $2',
        [name, price]
      );

      const importedImagePaths = [];
      if (imagePathsRaw) {
        const rawPaths = imagePathsRaw.split('|').filter(Boolean);
        for (const p of rawPaths) {
          const copied = await copyImage(p.trim(), gender, name);
          if (copied) importedImagePaths.push(copied);
        }
      }

      if (existing.rows.length > 0) {
        const prod = existing.rows[0];
        const mergedColors = [...new Set([...(prod.colors || []), ...colors])];
        const mergedSizes = [...new Set([...(prod.sizes || []), ...sizes])];
        const mergedImages = [...new Set([...(prod.images || []), ...importedImagePaths])];

        await pool.query(
          `UPDATE products SET
            colors = $1,
            sizes = $2,
            images = $3,
            updated_at = NOW()
          WHERE id = $4`,
          [JSON.stringify(mergedColors), JSON.stringify(mergedSizes), JSON.stringify(mergedImages), prod.id]
        );
        summary.updated++;
      } else {
        await pool.query(
          `INSERT INTO products
            (name, brand, description, details, price, category, colors, sizes, images, rating, reviews)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            name, brand, shortDesc, longDesc, price, category,
            JSON.stringify(colors), JSON.stringify(sizes), JSON.stringify(importedImagePaths),
            0, 0
          ]
        );
        summary.inserted++;
      }
    } catch (err) {
      summary.errors.push(`Row error: ${err.message}`);
      summary.skipped++;
    }
  }

  res.json(summary);
});
```

- [ ] **Step 3: Run backend tests**

Run: `npm run test:server`
Expected: All existing tests pass.

---

### Task 4: API Client — Add missing methods

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Add new types and API methods**

Add after the `HomepageSection` interface (line 75):

```typescript
export interface AdminOrder {
  id: number;
  cart_id: number;
  customer_id: number;
  email: string;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  shipping_method: Record<string, unknown> | null;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  payment_status: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    name: string;
    brand: string | null;
    images: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface ClearanceItem {
  id: number;
  title: string;
  brand: string | null;
  price: number;
  is_clearance: boolean;
  compare_at_price: number | null;
  discount: string | null;
}

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportPreview {
  preview: true;
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
}
```

**Inside the existing `collections` block** (after the `get` method, around line 269 of api.ts), add `create`, `update`, `delete`:

```typescript
    create: async (data: { title: string; handle?: string; parent_id?: string | null; metadata?: Record<string, unknown> }): Promise<ApiCollectionRecord> => {
      return apiFetch<ApiCollectionRecord>('/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { title?: string; handle?: string; parent_id?: string | null; metadata?: Record<string, unknown> }): Promise<ApiCollectionRecord> => {
      return apiFetch<ApiCollectionRecord>(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<void> => {
      await apiFetch(`/collections/${id}`, { method: 'DELETE' });
    },
```

**After the closing of the `upload` block** (around line 296), add the `orders` and `clearance` top-level blocks:

```typescript
  orders: {
    admin: async (params: { status?: string; limit?: number; offset?: number } = {}): Promise<{ orders: AdminOrder[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      return apiFetch<{ orders: AdminOrder[]; total: number }>(`/orders/admin${query ? `?${query}` : ''}`);
    },

    updateStatus: async (id: number, status: string): Promise<void> => {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  },

  clearance: {
    list: async (): Promise<ClearanceItem[]> => {
      return apiFetch<ClearanceItem[]>('/clearance');
    },

    set: async (productId: number, is_clearance: boolean, compare_at_price?: number): Promise<ClearanceItem> => {
      return apiFetch<ClearanceItem>(`/clearance/${productId}/clearance`, {
        method: 'POST',
        body: JSON.stringify({ is_clearance, compare_at_price }),
      });
    },

    bulkSet: async (product_ids: number[], is_clearance: boolean, compare_at_price?: number): Promise<{ updated: number; products: ClearanceItem[] }> => {
      return apiFetch<{ updated: number; products: ClearanceItem[] }>('/clearance/bulk-clearance', {
        method: 'POST',
        body: JSON.stringify({ product_ids, is_clearance, compare_at_price }),
      });
    },
  },
```

Then after the closing of `homepageSections` block, add:

```typescript
  import: {
    upload: async (file: File, preview = false): Promise<ImportResult | ImportPreview> => {
      const formData = new FormData();
      formData.append('file', file);
      const query = preview ? '?preview=true' : '';
      const res = await fetch(`${API_BASE}/import${query}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      return res.json();
    },

    downloadTemplate: (): void => {
      window.open(`${API_BASE}/import/template`, '_blank');
    },
  },
```

- [ ] **Step 2: Update `homepageSections` block** with CRUD methods:

```typescript
  homepageSections: {
    list: async (): Promise<{ sections: HomepageSection[] }> => {
      return apiFetch<{ sections: HomepageSection[] }>('/homepage-sections');
    },
    assignProducts: async (sectionKey: string, productIds: number[]): Promise<void> => {
      await apiFetch(`/homepage-sections/${sectionKey}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ productIds }),
      });
    },
    create: async (data: { key: string; title: string; productIds?: number[] }): Promise<HomepageSection> => {
      return apiFetch<HomepageSection>('/homepage-sections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (sectionKey: string, data: { title: string }): Promise<HomepageSection> => {
      return apiFetch<HomepageSection>(`/homepage-sections/${sectionKey}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (sectionKey: string): Promise<void> => {
      await apiFetch(`/homepage-sections/${sectionKey}`, { method: 'DELETE' });
    },
  },
```

- [ ] **Step 3: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 5: AdminLayout — Add sidebar nav items

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1: Add new icons and nav items**

Change the import line (line 3) to include new icons:

```typescript
import { LayoutDashboard, Package, Home, ShoppingBag, LogOut, Layers, Tag, Upload } from 'lucide-react';
```

Update the `NAV_ITEMS` array (lines 10-15) to:

```typescript
const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/collections', icon: Layers, label: 'Collections' },
  { to: '/admin/clearance', icon: Tag, label: 'Clearance' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/homepage-sections', icon: Home, label: 'Homepage' },
  { to: '/admin/import', icon: Upload, label: 'Import' },
];
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 6: Dashboard — Real stats

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`

- [ ] **Step 1: Rewrite Dashboard with real stats**

Replace the entire file content:

```typescript
import React, { useEffect, useState } from 'react';
import { Package, Tag, ShoppingBag, DollarSign } from 'lucide-react';
import { api, formatCurrency, type ApiProductRecord, type AdminOrder } from '../../lib/api';

interface Stats {
  totalProducts: number;
  clearanceProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: AdminOrder[];
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    clearanceProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list({ limit: 200 }),
      api.orders.admin({ limit: 5 }),
      api.orders.admin({ limit: 1000 }),
    ])
      .then(([productsData, recentData, allData]) => {
        const clearance = productsData.products.filter(
          p => p.original_price !== null && Number(p.original_price) > Number(p.price)
        ).length;
        const revenue = allData.orders.reduce(
          (sum, o) => sum + parseFloat(o.total || '0'),
          0
        );
        setStats({
          totalProducts: productsData.products.length,
          clearanceProducts: clearance,
          totalOrders: allData.total,
          totalRevenue: revenue,
          recentOrders: recentData.orders.slice(0, 5),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the Cocomacys admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="text-orange-600" size={22} />}
          iconBg="bg-orange-100"
          value={loading ? '—' : stats.totalProducts}
          label="Total Products"
        />
        <StatCard
          icon={<Tag className="text-green-600" size={22} />}
          iconBg="bg-green-100"
          value={loading ? '—' : stats.clearanceProducts}
          label="On Clearance"
        />
        <StatCard
          icon={<ShoppingBag className="text-blue-600" size={22} />}
          iconBg="bg-blue-100"
          value={loading ? '—' : stats.totalOrders}
          label="Total Orders"
        />
        <StatCard
          icon={<DollarSign className="text-emerald-600" size={22} />}
          iconBg="bg-emerald-100"
          value={loading ? '—' : formatCurrency(stats.totalRevenue)}
          label="Total Revenue"
        />
      </div>

      {/* Recent Orders */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            View all
          </a>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-400">Loading...</div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">#{order.id}</td>
                  <td className="px-6 py-3 text-gray-600">{order.email || '—'}</td>
                  <td className="px-6 py-3 font-medium">{formatCurrency(parseFloat(order.total || '0'))}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink href="/admin/products" icon={<Package size={24} />} label="Products" />
          <QuickLink href="/admin/products/new" icon={<Package size={24} />} label="Add Product" />
          <QuickLink href="/admin/collections" icon={<Package size={24} />} label="Collections" />
          <QuickLink href="/admin/orders" icon={<ShoppingBag size={24} />} label="Orders" />
          <QuickLink href="/admin/clearance" icon={<Tag size={24} />} label="Clearance" />
          <QuickLink href="/admin/homepage-sections" icon={<Package size={24} />} label="Homepage" />
          <QuickLink href="/admin/import" icon={<Package size={24} />} label="Import" />
          <QuickLink href="/" icon={<ShoppingBag size={24} />} label="View Store" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, value, label }: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a href={href} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 7: Collections list page

**Files:**
- Create: `src/pages/admin/Collections.tsx`

- [ ] **Step 1: Create Collections.tsx**

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type ApiCollectionRecord } from '../../lib/api';

export function Collections() {
  const [collections, setCollections] = useState<ApiCollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 20;

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const cols = await api.collections.list();
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const filtered = collections.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.title?.toLowerCase().includes(s);
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.collections.delete(deleteId);
      setDeleteId(null);
      await fetchCollections();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} collections</p>
        </div>
        <Link
          to="/admin/collections/new"
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add Collection
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Handle</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    {search ? 'No collections match your search.' : 'No collections yet.'}
                  </td>
                </tr>
              ) : (
                paginated.map(col => (
                  <tr key={col.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{col.title}</td>
                    <td className="px-4 py-3 text-gray-600">{col.handle || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(col.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/collections/${col.id}/edit`}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(col.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Collection?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 8: Collection form page

**Files:**
- Create: `src/pages/admin/CollectionForm.tsx`

- [ ] **Step 1: Create CollectionForm.tsx**

```typescript
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { api, type ApiCollectionRecord } from '../../lib/api';

export function CollectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      api.collections.get(id)
        .then((col: ApiCollectionRecord) => {
          setTitle(col.title || '');
          setHandle(col.handle || '');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      setHandle(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title, isEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !handle.trim()) {
      setError('Title and handle are required.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.collections.update(id, { title: title.trim(), handle: handle.trim() });
      } else {
        await api.collections.create({ title: title.trim(), handle: handle.trim() });
      }
      navigate('/admin/collections');
    } catch (err) {
      setError('Failed to save collection.');
      console.error(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this collection?')) return;
    setDeleting(true);
    try {
      await api.collections.delete(id);
      navigate('/admin/collections');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/collections')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Collection' : 'Add Collection'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="e.g. Summer Collection"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Handle *</label>
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} required
            placeholder="e.g. summer-collection"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
          <p className="mt-1 text-xs text-gray-400">URL-friendly slug. Auto-generated from title.</p>
        </div>

        <div className="flex items-center justify-between pt-4">
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50">
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Collection'}
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={() => navigate('/admin/collections')}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 9: Orders admin page — Rewrite

**Files:**
- Modify: `src/pages/admin/Orders.tsx`

- [ ] **Step 1: Rewrite Orders.tsx**

Replace the entire file content:

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { api, formatCurrency, type AdminOrder } from '../../lib/api';

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const pageSize = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const data = await api.orders.admin({
        status,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setOrders(data.orders);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.orders.updateStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{total} orders total</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">{order.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{order.items?.length || 0} items</td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(parseFloat(order.total || '0'))}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status || 'pending'}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border ${
                            order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                            order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`exp-${order.id}`}>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                              <div className="space-y-2">
                                {(order.items || []).map(item => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    {item.images?.[0] && (
                                      <img src={item.images[0]} alt={item.name}
                                        className="w-10 h-10 rounded object-cover" />
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} x {formatCurrency(parseFloat(item.unit_price || '0'))}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shipping</h4>
                              {order.shipping_address ? (
                                <div className="text-sm text-gray-700 space-y-1">
                                  <p>{(order.shipping_address as Record<string, string>).address}</p>
                                  <p>{(order.shipping_address as Record<string, string>).city}, {(order.shipping_address as Record<string, string>).country}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">No shipping address</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 10: Backend — Order status update endpoint

**Files:**
- Modify: `server/routes/orders.cjs`

Add before `module.exports = router;`:

```javascript
// PUT /api/orders/:id/status — update order status (auth required)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});
```

---

### Task 11: Clearance management page

**Files:**
- Create: `src/pages/admin/Clearance.tsx`

- [ ] **Step 1: Create Clearance.tsx**

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, X, Trash2 } from 'lucide-react';
import { api, formatCurrency, type ClearanceItem, type ApiProductRecord } from '../../lib/api';

export function Clearance() {
  const [items, setItems] = useState<ClearanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<ApiProductRecord[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState('30');
  const [saving, setSaving] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.clearance.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.title?.toLowerCase().includes(s) || item.brand?.toLowerCase().includes(s));
  });

  const openModal = async () => {
    setShowModal(true);
    try {
      const data = await api.products.list({ limit: 200 });
      setProducts(data.products.filter(p => {
        const originalPrice = p.original_price ? Number(p.original_price) : null;
        const price = Number(p.price);
        return !(originalPrice && originalPrice > price);
      }));
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleAddToClearance = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      const product = products.find(p => p.id === selectedProductId);
      const price = Number(product?.price || 0);
      const compareAtPrice = Math.round(price / (1 - Number(discountPercent) / 100));
      await api.clearance.set(selectedProductId, true, compareAtPrice);
      await loadItems();
      setShowModal(false);
      setSelectedProductId(null);
      setDiscountPercent('30');
      setProductSearch('');
    } catch (err) {
      console.error('Failed to add clearance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (productId: number) => {
    setSaving(true);
    try {
      await api.clearance.set(productId, false);
      await loadItems();
      setRemoveId(null);
    } catch (err) {
      console.error('Failed to remove clearance:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    const s = productSearch.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s);
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clearance</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} clearance items</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Add to Clearance
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clearance items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Compare At</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  {search ? 'No clearance items match your search.' : 'No clearance items.'}
                </td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">{item.brand || '—'}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-gray-500 line-through">
                      {item.compare_at_price ? formatCurrency(item.compare_at_price) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {item.discount || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRemoveId(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from clearance"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to Clearance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add to Clearance</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Discount %</label>
              <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
                min="1" max="99" placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search products..."
                value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>

            <div className="flex-1 overflow-y-auto max-h-64 border border-gray-200 rounded-lg">
              {filteredProducts.slice(0, 50).map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(Number(product.id))}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 hover:bg-gray-50 ${
                    selectedProductId === Number(product.id) ? 'bg-orange-50 border-l-2 border-l-orange-600' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.brand} — {formatCurrency(Number(product.price))}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddToClearance} disabled={saving || !selectedProductId}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Adding...' : `Add (${discountPercent}% off)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove confirmation modal */}
      {removeId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove from Clearance?</h3>
            <p className="text-gray-500 text-sm mb-6">This will remove the clearance discount from this product.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRemoveId(null)} disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleRemove(removeId)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 12: Homepage Sections — Enhance with CRUD

**Files:**
- Modify: `src/pages/admin/HomepageSections.tsx`

- [ ] **Step 1: Add create/edit/delete functionality**

Add new state variables after the existing `saving` state (around line 18):

```typescript
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [createKey, setCreateKey] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
```

Add the handler functions after `handleSave` (around line 87):

```typescript
  const handleCreate = async () => {
    if (!createKey.trim() || !createTitle.trim()) return;
    setSaving(true);
    try {
      await api.homepageSections.create({ key: createKey.trim(), title: createTitle.trim() });
      await loadData();
      setShowCreateModal(false);
      setCreateKey('');
      setCreateTitle('');
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (key: string) => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await api.homepageSections.update(key, { title: editTitle.trim() });
      await loadData();
      setEditKey(null);
    } catch (err) {
      console.error('Failed to update section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (key: string) => {
    setSaving(true);
    try {
      await api.homepageSections.delete(key);
      await loadData();
      setDeleteKey(null);
    } catch (err) {
      console.error('Failed to delete section:', err);
    } finally {
      setSaving(false);
    }
  };
```

Update the header section (after the `</div>` closing the mb-8 div) to include the Add button:

```typescript
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
            <p className="text-gray-500 text-sm mt-1">Manage homepage sections and assign products.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
          >
            <Plus size={18} />
            Add Section
          </button>
        </div>
```

(Note: need to add `Plus` to the lucide import at line 2)

Update each section card to include edit/delete buttons. Replace the section card header div (the one with `flex items-start justify-between mb-4`):

```typescript
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {editKey === section.key ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                          autoFocus
                        />
                        <button onClick={() => handleEdit(section.key)}
                          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold">
                          Save
                        </button>
                        <button onClick={() => setEditKey(null)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{section.key}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditKey(section.key); setEditTitle(section.title); }}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteKey(section.key)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => openPicker(section.key, section.productIds)}
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Assign Products ({section.productIds.length})
                    </button>
                  </div>
                </div>
```

Add the Create Section modal and Delete confirmation modal at the end of the return, after the Product Picker modal closing tag. These should be alongside the existing picker modal (after line 248):

```typescript
      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Homepage Section</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Key *</label>
                <input type="text" value={createKey} onChange={e => setCreateKey(e.target.value)}
                  placeholder="e.g. best_sellers"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Title *</label>
                <input type="text" value={createTitle} onChange={e => setCreateTitle(e.target.value)}
                  placeholder="e.g. Best Sellers"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteKey !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Section?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will delete the "{sections.find(s => s.key === deleteKey)?.title}" section permanently.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteKey(null)} disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={() => handleDeleteSection(deleteKey)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
```

Add `Plus` to the lucide import at line 2:

```typescript
import { Check, X, Search, Plus } from 'lucide-react';
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 13: Import page

**Files:**
- Create: `src/pages/admin/Import.tsx`

- [ ] **Step 1: Create Import.tsx**

```typescript
import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react';
import { api } from '../../lib/api';

export function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, string>[]; totalRows: number } | null>(null);
  const [result, setResult] = useState<{ inserted: number; updated: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selected: File) => {
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('Only CSV and Excel (.xlsx, .xls) files are supported.');
      return;
    }
    setFile(selected);
    setError(null);
    setResult(null);

    try {
      const previewData = await api.import.upload(selected, true) as any;
      if (previewData.preview) {
        setPreview({
          columns: previewData.columns,
          rows: previewData.rows,
          totalRows: previewData.totalRows,
        });
      }
    } catch (err) {
      setError('Failed to parse file. Check the format and try again.');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const data = await api.import.upload(file, false) as any;
      setResult(data);
      setPreview(null);
      setFile(null);
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a CSV or Excel file to bulk import products into the catalog.
        </p>
      </div>

      {/* Template download */}
      <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div>
          <p className="text-sm font-medium text-blue-800">Need a template?</p>
          <p className="text-xs text-blue-600 mt-0.5">Download a CSV with the expected column headers.</p>
        </div>
        <button
          onClick={() => api.import.downloadTemplate()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* File upload area */}
      {!preview && !result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-base font-semibold text-gray-700 mb-1">
            {file ? file.name : 'Drop your file here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">CSV, .xlsx, or .xls — up to 50MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {preview && !result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Preview</h2>
              <p className="text-sm text-gray-500">
                {preview.totalRows} rows found. Showing first {preview.rows.length}.
              </p>
            </div>
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {preview.columns.map(col => (
                    <th key={col} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {preview.columns.map(col => (
                      <td key={col} className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                        {row[col] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            <Upload size={18} />
            {importing ? 'Importing...' : `Import ${preview.totalRows} Products`}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Import Complete</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{result.inserted}</p>
              <p className="text-sm text-green-600">Inserted</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{result.updated}</p>
              <p className="text-sm text-blue-600">Updated</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-red-700 mb-2">Errors ({result.errors.length})</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 mb-1">{err}</p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setFile(null); setPreview(null); }}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-semibold text-sm hover:bg-orange-700"
          >
            Import Another File
          </button>
        </div>
      )}

      {/* Column reference */}
      <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Expected Columns</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { col: 'product_name', req: true, desc: 'Product name' },
            { col: 'price', req: true, desc: 'Price in USh (integer)' },
            { col: 'brand', req: false, desc: 'Brand name' },
            { col: 'gender', req: false, desc: 'men or women' },
            { col: 'category', req: false, desc: 'e.g. t-shirts, dresses' },
            { col: 'short_description', req: false, desc: 'Brief description' },
            { col: 'long_description', req: false, desc: 'Detailed description' },
            { col: 'color', req: false, desc: 'Single color name' },
            { col: 'size', req: false, desc: 'Comma-separated: S, M, L' },
            { col: 'image_paths', req: false, desc: 'Pipe-separated image paths' },
          ].map(({ col, req, desc }) => (
            <div key={col} className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{col}</code>
              {req && <span className="text-xs text-red-500 font-semibold">Required</span>}
              <span className="text-xs text-gray-500">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 14: App.tsx — Add new admin routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports and routes**

Add the imports (after existing admin imports on lines 16-24):

```typescript
import { Collections } from './pages/admin/Collections';
import { CollectionForm } from './pages/admin/CollectionForm';
import { Clearance } from './pages/admin/Clearance';
import { Import } from './pages/admin/Import';
```

Add the new routes (after the existing admin routes block, before the closing `</Routes>`):

```typescript
            <Route
              path="/admin/collections"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Collections />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/collections/new"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <CollectionForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/collections/:id/edit"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <CollectionForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/clearance"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Clearance />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/import"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Import />
                  </AdminLayout>
                </RequireAuth>
              }
            />
```

- [ ] **Step 2: TypeScript check**

Run: `npm run lint`
Expected: No new type errors.

---

### Task 15: Final verification

**Files:** all modified/created files

- [ ] **Step 1: Full TypeScript check**

Run: `npm run lint`
Expected: No errors across all files.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All existing tests pass.

- [ ] **Step 3: Build frontend**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 4: Start dev servers and smoke test**

Run: `npm run dev:full`
Then visit in browser:
- `http://localhost:3000/admin` — Dashboard with real stats
- `http://localhost:3000/admin/collections` — Collections list, create, edit, delete
- `http://localhost:3000/admin/clearance` — Clearance list, add, remove
- `http://localhost:3000/admin/orders` — Orders list, filter by status, expand details, update status
- `http://localhost:3000/admin/homepage-sections` — Sections with create, edit, delete, product assignment
- `http://localhost:3000/admin/import` — File upload, preview, download template, import result

---

### Task 16: Install xlsx dependency

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install xlsx**

Run: `npm install xlsx`
Expected: Package added to package.json and node_modules.

---

### Task 17: Clean up legacy static HTML

**Files:**
- Modify: `server/index.cjs`

- [ ] **Step 1: Remove legacy admin static file routes**

Remove these lines (60-68 in server/index.cjs):
```javascript
// Serve admin pages (legacy static HTML — only for specific exact paths)
app.use('/admin/clearance', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/clearance.html'));
});

app.use('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/login.html'));
});
```

These legacy HTML routes are replaced by the React admin pages.

- [ ] **Step 2: Run backend tests**

Run: `npm run test:server`
Expected: All tests pass.
