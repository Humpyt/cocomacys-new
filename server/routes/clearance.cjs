const express = require('express');
const defaultPool = require('../db.cjs');

function normalizeCompareAtPrice(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed > 1000 ? parsed / 100 : parsed;
}

function isClearanceProduct(product) {
  return product.original_price !== null && Number(product.original_price) > Number(product.price);
}

function formatDiscount(price, compareAtPrice) {
  if (!Number.isFinite(price) || !Number.isFinite(compareAtPrice) || compareAtPrice <= price) {
    return null;
  }

  const percentOff = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return percentOff > 0 ? `${percentOff}% off` : null;
}

function toClearanceResponse(product) {
  return {
    id: product.id,
    title: product.name,
    brand: product.brand,
    price: Number(product.price),
    is_clearance: isClearanceProduct(product),
    compare_at_price: product.original_price === null ? null : Number(product.original_price),
    discount: product.discount,
  };
}

function createClearanceRouter({ pool = defaultPool } = {}) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, brand, price, original_price, discount
        FROM products
        ORDER BY updated_at DESC
        LIMIT 200
      `);

      res.json(result.rows.map(toClearanceResponse));
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  router.post('/:id/clearance', async (req, res) => {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const { is_clearance, compare_at_price } = req.body;
      const compareAtPrice = normalizeCompareAtPrice(compare_at_price);

      if (typeof is_clearance !== 'boolean') {
        return res.status(400).json({ error: 'is_clearance must be a boolean' });
      }

      await client.query('BEGIN');

      const productResult = await client.query(
        'SELECT id, name, brand, price, original_price, discount FROM products WHERE id = $1',
        [id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = productResult.rows[0];
      const currentPrice = Number(product.price);

      if (is_clearance && compareAtPrice === null) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'A valid compare_at_price is required to mark clearance' });
      }

      if (is_clearance && compareAtPrice <= currentPrice) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'compare_at_price must be greater than the current price' });
      }

      const nextOriginalPrice = is_clearance ? compareAtPrice : null;
      const nextDiscount = is_clearance ? formatDiscount(currentPrice, compareAtPrice) : null;

      await client.query(`
        UPDATE products
        SET original_price = $1,
            discount = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [nextOriginalPrice, nextDiscount, id]);

      await client.query('COMMIT');

      res.json(toClearanceResponse({
        ...product,
        original_price: nextOriginalPrice,
        discount: nextDiscount,
      }));
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating clearance:', error);
      res.status(500).json({ error: 'Failed to update clearance' });
    } finally {
      client.release();
    }
  });

  router.post('/bulk-clearance', async (req, res) => {
    const client = await pool.connect();

    try {
      const { product_ids, is_clearance, compare_at_price } = req.body;
      const compareAtPrice = normalizeCompareAtPrice(compare_at_price);

      if (!Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({ error: 'product_ids array is required' });
      }

      if (typeof is_clearance !== 'boolean') {
        return res.status(400).json({ error: 'is_clearance must be a boolean' });
      }

      if (is_clearance && compareAtPrice === null) {
        return res.status(400).json({ error: 'A valid compare_at_price is required to mark clearance' });
      }

      const productIds = [...new Set(product_ids.map(Number).filter(Number.isFinite))];
      if (productIds.length === 0) {
        return res.status(400).json({ error: 'product_ids must contain numeric ids' });
      }

      await client.query('BEGIN');

      const productsResult = await client.query(
        'SELECT id, name, brand, price, original_price, discount FROM products WHERE id = ANY($1::int[])',
        [productIds]
      );

      const updatedProducts = [];
      for (const product of productsResult.rows) {
        const currentPrice = Number(product.price);
        if (is_clearance && compareAtPrice <= currentPrice) {
          continue;
        }

        const nextOriginalPrice = is_clearance ? compareAtPrice : null;
        const nextDiscount = is_clearance ? formatDiscount(currentPrice, compareAtPrice) : null;

        await client.query(`
          UPDATE products
          SET original_price = $1,
              discount = $2,
              updated_at = NOW()
          WHERE id = $3
        `, [nextOriginalPrice, nextDiscount, product.id]);

        updatedProducts.push(toClearanceResponse({
          ...product,
          original_price: nextOriginalPrice,
          discount: nextDiscount,
        }));
      }

      await client.query('COMMIT');

      res.json({ updated: updatedProducts.length, products: updatedProducts });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error bulk updating clearance:', error);
      res.status(500).json({ error: 'Failed to bulk update clearance' });
    } finally {
      client.release();
    }
  });

  return router;
}

const router = createClearanceRouter();

module.exports = router;
module.exports.createClearanceRouter = createClearanceRouter;
module.exports.normalizeCompareAtPrice = normalizeCompareAtPrice;
module.exports.isClearanceProduct = isClearanceProduct;
module.exports.formatDiscount = formatDiscount;
module.exports.toClearanceResponse = toClearanceResponse;
