CREATE TABLE public.bank_transfer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_sequence bigint GENERATED ALWAYS AS IDENTITY (START WITH 1048 INCREMENT BY 1),
  order_number text GENERATED ALWAYS AS ('MOTION-' || order_sequence::text) STORED UNIQUE,
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  customer_email text NOT NULL CHECK (char_length(customer_email) <= 254),
  customer_phone text NOT NULL CHECK (char_length(customer_phone) BETWEEN 10 AND 20),
  delivery_address text NOT NULL CHECK (char_length(delivery_address) BETWEEN 8 AND 420),
  items jsonb NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  payment_method text NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method = 'Bank Transfer'),
  payment_status text NOT NULL DEFAULT 'Pending Verification' CHECK (payment_status IN ('Pending Verification', 'Paid', 'Rejected')),
  order_status text NOT NULL DEFAULT 'Awaiting Payment Verification' CHECK (order_status IN ('Awaiting Payment Verification', 'Processing', 'Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bank_transfer_orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.bank_transfer_orders_order_sequence_seq TO service_role;
ALTER TABLE public.bank_transfer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages bank transfer orders"
ON public.bank_transfer_orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE public.product_launch_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_handle text NOT NULL CHECK (char_length(product_handle) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 254),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX product_launch_notifications_unique_email
ON public.product_launch_notifications (product_handle, lower(email));
GRANT ALL ON public.product_launch_notifications TO service_role;
ALTER TABLE public.product_launch_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages product launch notifications"
ON public.product_launch_notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);