const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const requireAuth = require('../middleware/requireAuth.cjs');
const { sendOrderStatusUpdate } = require('../email.cjs');

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

// GET /api/orders/admin — all orders for admin dashboard (auth required)
// MUST be defined before /:id so Express doesn't match "admin" as an :id param
router.get('/admin', requireAuth, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 50, 100);
    const safeOffset = parseInt(offset) || 0;

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
    params.push(safeLimit, safeOffset);

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

    // Fire and forget: send status update email without blocking the response
    sendOrderStatusUpdate(result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
