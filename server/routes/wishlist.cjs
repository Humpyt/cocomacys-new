const express = require('express');
const defaultPool = require('../db.cjs');

function createWishlistRouter({ pool = defaultPool } = {}) {
  const router = express.Router();

  function getCustomerId(req) {
    if (req.user && req.user._type === 'customer') {
      return String(req.user.id);
    }
    return null;
  }

  // Get current customer's wishlist with items
  router.get('/mine', async (req, res) => {
    try {
      const customerId = getCustomerId(req);
      if (!customerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const wishlistResult = await pool.query(
        'SELECT * FROM wishlists WHERE customer_id = $1',
        [customerId]
      );

      if (wishlistResult.rows.length === 0) {
        return res.json({ wishlist: null, items: [] });
      }

      const wishlist = wishlistResult.rows[0];
      const itemsResult = await pool.query(`
        SELECT wi.*, p.name, p.brand, p.price, p.images
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        WHERE wi.wishlist_id = $1
        ORDER BY wi.created_at DESC
      `, [wishlist.id]);

      res.json({ wishlist, items: itemsResult.rows });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  });

  // Add item to wishlist
  router.post('/mine/items', async (req, res) => {
    try {
      const customerId = getCustomerId(req);
      if (!customerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { product_id, variant_id } = req.body;

      // Verify product exists
      const productResult = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get or create wishlist for this customer
      let wishlistResult = await pool.query(
        'SELECT * FROM wishlists WHERE customer_id = $1',
        [customerId]
      );

      if (wishlistResult.rows.length === 0) {
        wishlistResult = await pool.query(
          'INSERT INTO wishlists (customer_id) VALUES ($1) RETURNING *',
          [customerId]
        );
      }

      const wishlist = wishlistResult.rows[0];

      // Add item (UNIQUE constraint prevents duplicates)
      try {
        await pool.query(`
          INSERT INTO wishlist_items (wishlist_id, product_id, variant_id)
          VALUES ($1, $2, $3)
        `, [wishlist.id, product_id, variant_id || null]);
      } catch (err) {
        // Duplicate — silently succeed
        if (err.code === '23505') {
          return res.json({ message: 'Already in wishlist' });
        }
        throw err;
      }

      await pool.query('UPDATE wishlists SET updated_at = NOW() WHERE id = $1', [wishlist.id]);

      res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  });

  // Remove item from wishlist
  router.delete('/mine/items/:productId', async (req, res) => {
    try {
      const customerId = getCustomerId(req);
      if (!customerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { productId } = req.params;

      const wishlistResult = await pool.query(
        'SELECT * FROM wishlists WHERE customer_id = $1',
        [customerId]
      );

      if (wishlistResult.rows.length === 0) {
        return res.status(404).json({ error: 'Wishlist not found' });
      }

      await pool.query(
        'DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2',
        [wishlistResult.rows[0].id, productId]
      );

      await pool.query('UPDATE wishlists SET updated_at = NOW() WHERE id = $1', [wishlistResult.rows[0].id]);

      res.json({ message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  });

  return router;
}

const router = createWishlistRouter();

module.exports = router;
module.exports.createWishlistRouter = createWishlistRouter;
