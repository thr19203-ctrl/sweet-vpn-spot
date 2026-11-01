CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL CHECK (plan IN ('Plus','Pro')),
  yearly boolean NOT NULL DEFAULT false,
  amount_uzs integer NOT NULL CHECK (amount_uzs > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','prepared','paid','cancelled')),
  click_trans_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL CHECK (plan IN ('Plus','Pro')),
  content text NOT NULL,
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.configs TO service_role;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- Marks an order paid and hands it one unused config of its plan, atomically.
CREATE OR REPLACE FUNCTION public.complete_order(_order_id uuid, _click_trans_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _plan text;
BEGIN
  UPDATE public.orders SET status = 'paid', paid_at = now(), click_trans_id = _click_trans_id
  WHERE id = _order_id AND status <> 'paid'
  RETURNING plan INTO _plan;
  IF _plan IS NULL THEN RETURN; END IF;
  UPDATE public.configs SET order_id = _order_id
  WHERE id = (
    SELECT id FROM public.configs
    WHERE plan = _plan AND order_id IS NULL
    ORDER BY created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  );
END;
$$;
REVOKE ALL ON FUNCTION public.complete_order(uuid, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_order(uuid, bigint) TO service_role;