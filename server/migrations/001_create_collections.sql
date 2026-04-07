-- Collections table for product categories
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY DEFAULT 'col_' || substr(md5(random()::text), 0, 24),
  title TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  parent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add collection_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);