-- Replace order ID format: short sequential branded IDs instead of long random strings
-- Old format: order_fc85cc48b53a888966b5ac667 (DEFAULT 'order_' || substr(md5(random()::text), 0, 26))
-- New format: CFB-001042 (DEFAULT 'CFB-' || lpad(nextval('order_number_seq')::text, 6, '0'))

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

ALTER TABLE orders ALTER COLUMN id SET DEFAULT 'CFB-' || lpad(nextval('order_number_seq')::text, 6, '0');
