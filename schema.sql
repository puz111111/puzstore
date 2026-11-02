CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_halalas INTEGER NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_mime TEXT NOT NULL DEFAULT 'application/octet-stream',
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_email TEXT,
  amount_halalas INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending',
  moyasar_payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT
);
CREATE TABLE IF NOT EXISTS downloads (
  token_hash TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
