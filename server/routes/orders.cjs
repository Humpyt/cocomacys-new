const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');

// GET /api/orders - List orders for a customer
router.get('/', async (req, res) => {
  try {
    const { customer_id, limit = 50 } = req.query;

    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }

    const ordersResult = await pool.query(`
      SELECT o.*,
        json_agg(json_build_object(
          'id', ci.id,
          'product_id', ci.product_id,
          'quantity', ci.quantity,
          'unit_price', ci.unit_price,
          'name', p.name,
          'brand', p.brand,
          'images', p.images
        )) as items
      FROM orders o
      LEFT JOIN cart_items ci ON ci.cart_id = o.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2
    `, [customer_id, parseInt(limit)]);

    res.json({ orders: ordersResult.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(`
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
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(orderResult.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
