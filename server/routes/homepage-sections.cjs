const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');

// GET /api/homepage-sections — list all sections with assigned product IDs
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT section_key as key, title, product_ids FROM homepage_sections ORDER BY id'
    );
    const sections = result.rows.map(row => ({
      key: row.key,
      title: row.title,
      productIds: row.product_ids || [],
    }));
    res.json({ sections });
  } catch (err) {
    console.error('Error fetching homepage sections:', err);
    res.status(500).json({ error: 'Failed to fetch homepage sections' });
  }
});

// PUT /api/homepage-sections/:key/assign — assign products to a section
router.put('/:key/assign', requireAuth, async (req, res) => {
  const { key } = req.params;
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    return res.status(400).json({ error: 'productIds must be an array' });
  }

  try {
    const result = await pool.query(
      `UPDATE homepage_sections
       SET product_ids = $1::integer[], updated_at = NOW()
       WHERE section_key = $2
       RETURNING section_key, title, product_ids`,
      [productIds, key]
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

module.exports = router;
