const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

const { createCartRouter } = require('../routes/cart.cjs');
const { createClearanceRouter } = require('../routes/clearance.cjs');

function createTestApp(router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
}

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    return await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

test('cart completion calculates cents-based totals and stores shipping method JSON', async () => {
  const calls = [];
  const pool = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (sql.includes('SELECT * FROM carts WHERE id = $1')) {
        return {
          rows: [{ id: 'cart_1', email: 'saved@example.com', shipping_address: { city: 'Saved City' } }],
        };
      }

      if (sql.includes('SELECT ci.*, p.name, p.brand, p.price as unit_price')) {
        return {
          rows: [
            { id: 1, product_id: 10, quantity: 2, unit_price: '19.99', name: 'Dress', brand: 'Brand A' },
            { id: 2, product_id: 11, quantity: 1, unit_price: '5.50', name: 'Socks', brand: 'Brand B' },
          ],
        };
      }

      if (sql.includes('INSERT INTO orders')) {
        return {
          rows: [{ id: 'ord_1', subtotal: params[4], tax: params[5], total: params[6] }],
        };
      }

      if (sql.includes('UPDATE carts SET status = $1')) {
        return { rows: [] };
      }

      throw new Error(`Unexpected SQL in cart test: ${sql}`);
    },
  };

  await withServer(createTestApp(createCartRouter({ pool })), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/cart_1/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'checkout@example.com',
        shipping_address: { line1: '123 Main St', city: 'Nairobi' },
        shipping_method: { id: 'express', price: 999 },
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.order.subtotal, 4548);
    assert.equal(data.order.tax, 364);
    assert.equal(data.order.total, 5911);
    assert.equal(data.items.length, 2);
  });

  const orderInsert = calls.find((call) => call.sql.includes('INSERT INTO orders'));
  assert.ok(orderInsert, 'expected order insert query');
  assert.deepEqual(orderInsert.params, [
    'cart_1',
    'checkout@example.com',
    JSON.stringify({ line1: '123 Main St', city: 'Nairobi' }),
    JSON.stringify({ id: 'express', price: 999 }),
    4548,
    364,
    5911,
  ]);
});

test('single clearance update stores compare-at price and computed discount', async () => {
  const calls = [];
  let released = false;

  const client = {
    async query(sql, params = []) {
      calls.push({ sql, params });

      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] };
      }

      if (sql.includes('SELECT id, name, brand, price, original_price, discount FROM products WHERE id = $1')) {
        return {
          rows: [{ id: 10, name: 'Dress', brand: 'Brand A', price: '30', original_price: null, discount: null }],
        };
      }

      if (sql.includes('UPDATE products')) {
        return { rows: [] };
      }

      throw new Error(`Unexpected SQL in single clearance test: ${sql}`);
    },
    release() {
      released = true;
    },
  };

  const pool = {
    async connect() {
      return client;
    },
  };

  await withServer(createTestApp(createClearanceRouter({ pool })), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/10/clearance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_clearance: true,
        compare_at_price: 49.99,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.id, 10);
    assert.equal(data.compare_at_price, 49.99);
    assert.equal(data.discount, '40% off');
    assert.equal(data.is_clearance, true);
  });

  const updateCall = calls.find((call) => call.sql.includes('UPDATE products'));
  assert.ok(updateCall, 'expected product update query');
  assert.deepEqual(updateCall.params, [49.99, '40% off', '10']);
  assert.equal(released, true);
});

test('bulk clearance update skips products whose compare-at price would be invalid', async () => {
  const updateCalls = [];

  const client = {
    async query(sql, params = []) {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] };
      }

      if (sql.includes('SELECT id, name, brand, price, original_price, discount FROM products WHERE id = ANY')) {
        return {
          rows: [
            { id: 10, name: 'Dress', brand: 'Brand A', price: '30', original_price: null, discount: null },
            { id: 11, name: 'Boots', brand: 'Brand B', price: '85', original_price: null, discount: null },
          ],
        };
      }

      if (sql.includes('UPDATE products')) {
        updateCalls.push(params);
        return { rows: [] };
      }

      throw new Error(`Unexpected SQL in bulk clearance test: ${sql}`);
    },
    release() {},
  };

  const pool = {
    async connect() {
      return client;
    },
  };

  await withServer(createTestApp(createClearanceRouter({ pool })), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/bulk-clearance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_ids: [10, 11],
        is_clearance: true,
        compare_at_price: 80,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.updated, 1);
    assert.equal(data.products.length, 1);
    assert.equal(data.products[0].id, 10);
    assert.equal(data.products[0].discount, '63% off');
  });

  assert.deepEqual(updateCalls, [[80, '63% off', 10]]);
});
