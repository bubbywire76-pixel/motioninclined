CREATE TABLE bank_transfer_orders (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'awaiting_transfer',
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_naira NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transfer_reported_at TIMESTAMPTZ
);

CREATE INDEX bank_transfer_orders_status_idx ON bank_transfer_orders (status, created_at DESC);
