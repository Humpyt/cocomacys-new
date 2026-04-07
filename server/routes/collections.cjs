const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');

// GET all collections (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM collections ORDER BY title');
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
    const { title, handle, parent_id, metadata } = req.body;
    if (!title || !handle) {
      return res.status(400).json({ error: 'Title and handle are required' });
    }
    const result = await pool.query(
      'INSERT INTO collections (title, handle, parent_id, metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, handle, parent_id, metadata || {}]
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
    const { title, handle, parent_id, metadata } = req.body;
    const result = await pool.query(
      `UPDATE collections SET
        title = COALESCE($1, title),
        handle = COALESCE($2, handle),
        parent_id = COALESCE($3, parent_id),
        metadata = COALESCE($4, metadata),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [title, handle, parent_id, metadata, id]
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