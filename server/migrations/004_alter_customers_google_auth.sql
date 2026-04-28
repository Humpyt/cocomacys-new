-- Add Google OAuth fields to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
-- Google OAuth customers won't have a password
ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL;
