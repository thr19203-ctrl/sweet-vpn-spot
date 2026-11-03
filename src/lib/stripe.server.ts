import { createHmac, timingSafeEqual } from "crypto";

const STRIPE_API = "https://api.stripe.com/v1";
const DISCORD_API = "https://discord.com/api/v10";
export const DISCORD_ACCESS_PRODUCT = "discord_access";
// Permanent community link, used only when no Discord bot is configured for per-payment invites.
const FALLBACK_DISCORD_INVITE = "https://discord.gg/uM9yKeTbvm";
const SIGNATURE_TOLERANCE_SECONDS = 300;

export type StripeSession = {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function stripeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv("STRIPE_SECRET_KEY")}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
  });
  if (!res.ok) throw new Error(`Stripe ${path} failed with ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

/** Starts a Checkout Session for the one-time Discord access product. */
export async function createCheckoutSession(origin: string) {
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": requireEnv("STRIPE_PRICE_ID"),
    "line_items[0][quantity]": "1",
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    "metadata[product]": DISCORD_ACCESS_PRODUCT,
  });
  return stripeRequest<{ id: string; url: string | null }>("/checkout/sessions", {
    method: "POST",
    body,
  });
}

export function retrieveCheckoutSession(id: string) {
  return stripeRequest<StripeSession>(`/checkout/sessions/${encodeURIComponent(id)}`);
}

/** Verifies the `Stripe-Signature` header (HMAC-SHA256 over `t.payload`) and its timestamp. */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowMs = Date.now(),
) {
  if (!header) return false;
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t" && value) timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  const t = Number(timestamp);
  if (!Number.isFinite(t) || signatures.length === 0) return false;
  if (Math.abs(nowMs / 1000 - t) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  return signatures.some((sig) => {
    const given = Buffer.from(sig, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** A single-use, 7-day invite when a bot is configured; otherwise the permanent community link. */
export async function createDiscordInvite() {
  const token = process.env["DISCORD_BOT_TOKEN"];
  const channelId = process.env["DISCORD_INVITE_CHANNEL_ID"];
  if (!token || !channelId) return process.env["DISCORD_INVITE_URL"] || FALLBACK_DISCORD_INVITE;

  const res = await fetch(`${DISCORD_API}/channels/${encodeURIComponent(channelId)}/invites`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ max_uses: 1, max_age: 7 * 24 * 3600, unique: true }),
  });
  if (!res.ok) throw new Error(`Discord invite failed with ${res.status}: ${await res.text()}`);
  const { code } = (await res.json()) as { code: string };
  return `https://discord.gg/${code}`;
}

/**
 * Records a paid session and issues its invite exactly once. Safe to call from both the
 * webhook and the /success page: a repeat call returns the invite stored the first time.
 */
export async function fulfilPaidSession(session: StripeSession) {
  if (session.payment_status !== "paid") return null;
  if (session.metadata?.["product"] !== DISCORD_ACCESS_PRODUCT) return null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing, error: readError } = await supabaseAdmin
    .from("stripe_payments")
    .select("invite_url")
    .eq("session_id", session.id)
    .maybeSingle();
  if (readError) throw readError;
  if (existing?.invite_url) return existing.invite_url;

  if (!existing) {
    const { error } = await supabaseAdmin.from("stripe_payments").upsert(
      {
        session_id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email ?? null,
      },
      { onConflict: "session_id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  const invite = await createDiscordInvite();
  // Only the first writer wins, so concurrent calls never replace an invite that was shown.
  const { data: updated, error } = await supabaseAdmin
    .from("stripe_payments")
    .update({ invite_url: invite })
    .eq("session_id", session.id)
    .is("invite_url", null)
    .select("invite_url")
    .maybeSingle();
  if (error) throw error;
  if (updated?.invite_url) return updated.invite_url;

  const { data: stored } = await supabaseAdmin
    .from("stripe_payments")
    .select("invite_url")
    .eq("session_id", session.id)
    .maybeSingle();
  return stored?.invite_url ?? null;
}
