CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY DEFAULT 'wl_' || substr(md5(random()::text), 0, 26),
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY DEFAULT 'wli_' || substr(md5(random()::text), 0, 26),
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variant_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
