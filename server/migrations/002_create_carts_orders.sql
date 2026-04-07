-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY DEFAULT 'cart_' || substr(md5(random()::text), 0, 26),
  customer_id TEXT,
  email TEXT,
  shipping_address JSONB,
  shipping_method JSONB,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY DEFAULT 'ci_' || substr(md5(random()::text), 0, 26),
  cart_id TEXT REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT 'order_' || substr(md5(random()::text), 0, 26),
  cart_id TEXT,
  customer_id TEXT,
  email TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  shipping_method JSONB,
  subtotal INTEGER,
  tax INTEGER,
  total INTEGER,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
