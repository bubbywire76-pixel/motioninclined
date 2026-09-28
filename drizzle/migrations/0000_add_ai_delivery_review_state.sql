CREATE TABLE public.ai_delivery_review_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  blocked_status integer,
  safe_message text,
  denial_type text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_delivery_review_state TO service_role;
ALTER TABLE public.ai_delivery_review_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages AI delivery review state"
  ON public.ai_delivery_review_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);