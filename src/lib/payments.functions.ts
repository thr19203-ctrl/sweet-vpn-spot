import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PaymentResult =
  | { status: "paid"; inviteUrl: string }
  | { status: "pending" | "unpaid" | "unknown" | "error" };

// Returns the Discord invite for a paid Checkout Session. The payment is re-verified with
// Stripe, so the page works even before the webhook has been delivered.
export const getPayment = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/) }).parse(data),
  )
  .handler(async ({ data }): Promise<PaymentResult> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("stripe_payments")
        .select("invite_url")
        .eq("session_id", data.sessionId)
        .maybeSingle();
      if (row?.invite_url) return { status: "paid", inviteUrl: row.invite_url };

      if (!process.env["STRIPE_SECRET_KEY"]) return { status: "unknown" };
      const { retrieveCheckoutSession, fulfilPaidSession } = await import("@/lib/stripe.server");
      const session = await retrieveCheckoutSession(data.sessionId);
      if (session.payment_status !== "paid") {
        return { status: session.payment_status === "unpaid" ? "pending" : "unpaid" };
      }
      const inviteUrl = await fulfilPaidSession(session);
      return inviteUrl ? { status: "paid", inviteUrl } : { status: "unknown" };
    } catch (error) {
      console.error("getPayment failed", error);
      return { status: "error" };
    }
  });
