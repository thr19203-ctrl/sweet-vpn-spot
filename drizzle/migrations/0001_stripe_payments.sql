-- One row per paid Stripe Checkout Session; the invite is issued once and re-shown on /success.
CREATE TABLE public.stripe_payments (
  session_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid')),
  amount_total integer,
  currency text,
  email text,
  invite_url text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stripe_payments TO service_role;
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
