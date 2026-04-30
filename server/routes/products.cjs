const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');

// GET /api/products - list with filtering
router.get('/', async (req, res) => {
  try {
    const { category, collection_id, gender, search, limit = 20, offset = 0, order = 'created_at DESC' } = req.query;
    let query = `SELECT id, name, brand, price, original_price, discount,
      promo, rating, reviews, images, colors, category, collection_id,
      created_at, updated_at
      FROM products WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR brand ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (collection_id) {
      paramCount++;
      query += ` AND collection_id = $${paramCount}`;
      params.push(collection_id);
    }

    if (gender === 'men') {
      query += ` AND (category LIKE 'men\_%' OR category = 'Men')`;
    } else if (gender === 'women') {
      query += ` AND (category LIKE 'women\_%' OR category = 'Women')`;
    }

    // Validate order column to prevent SQL injection
    const validOrders = ['created_at', 'price', 'name'];
    const orderParts = order.split(' ');
    const orderCol = orderParts[0];
    const orderDir = orderParts[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${validOrders.includes(orderCol) ? orderCol : 'created_at'} ${orderDir}`;

    if (parseInt(limit) > 0) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(Math.min(parseInt(limit), 100));
    }

    paramCount++;
    const parsedOffset = Math.max(0, parseInt(offset) || 0);
    query += ` OFFSET $${paramCount}`;
    params.push(parsedOffset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name, brand, description, price, original_price, discount,
      promo, rating, reviews, images, colors, sizes, types,
      features, details, category, collection_id
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Sync category from collection handle
    let resolvedCategory = category;
    if (collection_id) {
      const col = await pool.query('SELECT handle FROM collections WHERE id = $1', [collection_id]);
      if (col.rows.length > 0) {
        resolvedCategory = col.rows[0].handle;
      }
    }

    const result = await pool.query(
      `INSERT INTO products (name, brand, description, price, original_price, discount,
        promo, rating, reviews, images, colors, sizes, types, features, details, category, collection_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [name, brand, description, price, original_price, discount,
       promo, rating || 0, reviews || 0, images || [],
       JSON.stringify(colors || []), JSON.stringify(sizes || []),
       JSON.stringify(types || []), features || [], details, resolvedCategory, collection_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, brand, description, price, original_price, discount,
      promo, rating, reviews, images, colors, sizes, types,
      features, details, category, collection_id
    } = req.body;

    // Sync category from collection handle
    let resolvedCategory = category;
    if (collection_id) {
      const col = await pool.query('SELECT handle FROM collections WHERE id = $1', [collection_id]);
      if (col.rows.length > 0) {
        resolvedCategory = col.rows[0].handle;
      }
    }

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        brand = COALESCE($2, brand),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        original_price = COALESCE($5, original_price),
        discount = COALESCE($6, discount),
        promo = COALESCE($7, promo),
        rating = COALESCE($8, rating),
        reviews = COALESCE($9, reviews),
        images = COALESCE($10, images),
        colors = COALESCE($11, colors),
        sizes = COALESCE($12, sizes),
        types = COALESCE($13, types),
        features = COALESCE($14, features),
        details = COALESCE($15, details),
        category = COALESCE($16, category),
        collection_id = COALESCE($17, collection_id),
        updated_at = NOW()
       WHERE id = $18
       RETURNING *`,
      [name, brand, description, price, original_price, discount,
       promo, rating, reviews, images,
       colors != null ? JSON.stringify(colors) : null,
       sizes != null ? JSON.stringify(sizes) : null,
       types != null ? JSON.stringify(types) : null,
       features, details, resolvedCategory, collection_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
