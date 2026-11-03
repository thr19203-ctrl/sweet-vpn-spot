import { createFileRoute } from "@tanstack/react-router";

// Starts a Stripe Checkout Session for the Discord access product and returns its hosted URL.
export const Route = createFileRoute("/api/public/stripe-checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env["STRIPE_SECRET_KEY"] || !process.env["STRIPE_PRICE_ID"]) {
          console.error("Stripe checkout is not configured");
          return Response.json({ error: "Payments are not configured yet" }, { status: 503 });
        }
        try {
          const { createCheckoutSession } = await import("@/lib/stripe.server");
          const session = await createCheckoutSession(new URL(request.url).origin);
          if (!session.url) throw new Error("Stripe returned no checkout URL");
          return Response.json({ url: session.url });
        } catch (error) {
          console.error("stripe-checkout failed", error);
          return Response.json({ error: "Could not start checkout" }, { status: 502 });
        }
      },
    },
  },
});
