-- Add indexes for common product query patterns
-- Most category listing pages hit this path:
--   SELECT ... FROM products WHERE category = $1 ORDER BY created_at DESC

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category, created_at DESC);
