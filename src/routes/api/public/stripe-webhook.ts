import { createFileRoute } from "@tanstack/react-router";
import type { StripeSession } from "@/lib/stripe.server";

// Stripe webhook: records the payment and issues the Discord invite on checkout.session.completed.
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("STRIPE_WEBHOOK_SECRET is not configured");
          return new Response("Webhook not configured", { status: 503 });
        }

        // The signature covers the exact bytes Stripe sent, so read the raw body.
        const payload = await request.text();
        const { verifyStripeSignature, fulfilPaidSession } = await import("@/lib/stripe.server");
        if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
          return new Response("Invalid signature", { status: 400 });
        }

        let event: { type?: string; data?: { object?: StripeSession } };
        try {
          event = JSON.parse(payload);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (event.type === "checkout.session.completed" && event.data?.object) {
          try {
            await fulfilPaidSession(event.data.object);
          } catch (error) {
            // A non-2xx makes Stripe retry the delivery.
            console.error("stripe-webhook fulfilment failed", error);
            return new Response("Fulfilment failed", { status: 500 });
          }
        }
        return Response.json({ received: true });
      },
    },
  },
});
