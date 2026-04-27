const express = require('express');
const defaultPool = require('../db.cjs');

function calculateOrderAmounts(items, shippingMethod) {
  const subtotal = Math.round(
    items.reduce((sum, item) => sum + (Number(item.unit_price) * item.quantity), 0)
  );
  const shippingAmount = Number(shippingMethod?.price) || 0;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingAmount + tax;

  return { subtotal, shippingAmount, tax, total };
}

function createCartRouter({ pool = defaultPool } = {}) {
  const router = express.Router();

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const cartResult = await pool.query('SELECT * FROM carts WHERE id = $1', [id]);
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const cart = cartResult.rows[0];
      const itemsResult = await pool.query(`
        SELECT ci.*, p.name, p.brand, p.price as unit_price, p.images
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [id]);

      res.json({
        ...cart,
        items: itemsResult.rows,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { customer_id, email } = req.body;

      const result = await pool.query(`
        INSERT INTO carts (customer_id, email, status)
        VALUES ($1, $2, 'active')
        RETURNING *
      `, [customer_id || null, email || null]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).json({ error: 'Failed to create cart' });
    }
  });

  router.post('/:id/items', async (req, res) => {
    try {
      const { id } = req.params;
      const { product_id, variant_id, quantity = 1 } = req.body;

      const cartResult = await pool.query('SELECT * FROM carts WHERE id = $1 AND status = $2', [id, 'active']);
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ error: 'Cart not found or inactive' });
      }

      const productResult = await pool.query('SELECT price FROM products WHERE id = $1', [product_id]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const unitPrice = parseFloat(productResult.rows[0].price);
      const existingItem = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3',
        [id, product_id, variant_id || null]
      );

      if (existingItem.rows.length > 0) {
        const newQuantity = existingItem.rows[0].quantity + quantity;
        await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQuantity, existingItem.rows[0].id]);
      } else {
        await pool.query(`
          INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, product_id, variant_id || null, quantity, unitPrice]);
      }

      await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [id]);

      const updatedCart = await pool.query(`
        SELECT ci.*, p.name, p.brand, p.price as unit_price, p.images
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [id]);

      res.json({
        cart: { ...cartResult.rows[0] },
        items: updatedCart.rows,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  });

  router.put('/:id/items/:itemId', async (req, res) => {
    try {
      const { id, itemId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
      }

      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3', [quantity, itemId, id]);
      await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [id]);

      res.json({ message: 'Cart item updated' });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  });

  router.delete('/:id/items/:itemId', async (req, res) => {
    try {
      const { id, itemId } = req.params;

      await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, id]);
      await pool.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [id]);

      res.json({ message: 'Cart item removed' });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ error: 'Failed to remove cart item' });
    }
  });

  router.post('/:id/address', async (req, res) => {
    try {
      const { id } = req.params;
      const { shipping_address } = req.body;

      await pool.query(
        'UPDATE carts SET shipping_address = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(shipping_address), id]
      );

      res.json({ message: 'Shipping address updated' });
    } catch (error) {
      console.error('Error updating shipping address:', error);
      res.status(500).json({ error: 'Failed to update shipping address' });
    }
  });

  router.post('/:id/complete', async (req, res) => {
    try {
      const { id } = req.params;
      const { email, shipping_address, shipping_method } = req.body;

      const cartResult = await pool.query('SELECT * FROM carts WHERE id = $1', [id]);
      if (cartResult.rows.length === 0) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const cart = cartResult.rows[0];
      const itemsResult = await pool.query(`
        SELECT ci.*, p.name, p.brand, p.price as unit_price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [id]);

      if (itemsResult.rows.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const { subtotal, tax, total } = calculateOrderAmounts(itemsResult.rows, shipping_method);

      const orderResult = await pool.query(`
        INSERT INTO orders (cart_id, customer_id, email, shipping_address, shipping_method, subtotal, tax, total, status, payment_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', 'pending')
        RETURNING *
      `, [
        id,
        req.session.customer ? String(req.session.customer.id) : (cart.customer_id || null),
        email || cart.email,
        JSON.stringify(shipping_address || cart.shipping_address),
        JSON.stringify(shipping_method || null),
        subtotal,
        tax,
        total,
      ]);

      await pool.query('UPDATE carts SET status = $1 WHERE id = $2', ['completed', id]);

      res.status(201).json({
        order: orderResult.rows[0],
        items: itemsResult.rows,
      });
    } catch (error) {
      console.error('Error completing cart:', error);
      res.status(500).json({ error: 'Failed to complete cart' });
    }
  });

  return router;
}

const router = createCartRouter();

module.exports = router;
module.exports.createCartRouter = createCartRouter;
module.exports.calculateOrderAmounts = calculateOrderAmounts;
