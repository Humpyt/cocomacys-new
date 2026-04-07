-- Create customers table for storefront auth
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
