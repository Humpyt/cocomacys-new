-- Cocomacys E-Commerce Database Schema

-- Create database (run this separately as superuser):
-- CREATE DATABASE cocomacys;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount VARCHAR(50),
  promo VARCHAR(255),
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  types JSONB DEFAULT '[]',
  features TEXT[] DEFAULT '{}',
  details TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (Google OAuth)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table for express-session with PostgreSQL
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR(255) NOT NULL,
  sess TEXT NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);
