const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');

// GET all collections with product counts (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM collections c
      LEFT JOIN products p ON p.collection_id = c.id
      GROUP BY c.id
      ORDER BY c.title
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// GET single collection (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM collections WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// POST create collection (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, handle, parent_id, image, description, metadata } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await pool.query(
      'INSERT INTO collections (title, handle, parent_id, image, description, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, handle || null, parent_id || null, image || null, description || null, metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// PUT update collection (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, handle, parent_id, image, description, metadata } = req.body;
    const result = await pool.query(
      `UPDATE collections SET
        title = COALESCE($1, title),
        handle = COALESCE($2, handle),
        parent_id = $3,
        image = $4,
        description = $5,
        metadata = COALESCE($6, metadata),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, handle, parent_id ?? null, image ?? null, description ?? null, metadata, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// DELETE collection (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM collections WHERE id = $1', [id]);
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

module.exports = router;