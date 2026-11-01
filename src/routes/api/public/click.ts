import { createFileRoute } from "@tanstack/react-router";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Click Shop API callback: one URL for both Prepare (action=0) and Complete (action=1).
export const Route = createFileRoute("/api/public/click")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { CLICK_ERRORS: E, verifyClickSign, sameAmount } = await import("@/lib/click.server");
        const secret = process.env["CLICK_SECRET_KEY"];
        const serviceId = process.env["CLICK_SERVICE_ID"];

        const form = await request.formData().catch(() => null);
        const f: Record<string, string> = {};
        form?.forEach((v, k) => {
          if (typeof v === "string") f[k] = v.slice(0, 200);
        });

        const reply = (error: number, error_note: string, extra: Record<string, unknown> = {}) =>
          Response.json({
            click_trans_id: f["click_trans_id"] ?? null,
            merchant_trans_id: f["merchant_trans_id"] ?? null,
            error,
            error_note,
            ...extra,
          });

        if (!secret || !serviceId) {
          console.error("Click secrets are not configured");
          return reply(E.badRequest, "Merchant not configured");
        }
        if (!verifyClickSign(f, secret)) return reply(E.signFailed, "SIGN CHECK FAILED");
        if (f["service_id"] !== serviceId) return reply(E.badRequest, "Wrong service");

        const action = f["action"];
        if (action !== "0" && action !== "1") return reply(E.actionNotFound, "Action not found");

        const orderId = f["merchant_trans_id"] ?? "";
        if (!UUID.test(orderId)) return reply(E.orderNotFound, "Order not found");
        const clickTransId = Number(f["click_trans_id"]);
        if (!Number.isSafeInteger(clickTransId)) return reply(E.badRequest, "Bad transaction");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, amount_uzs, status")
          .eq("id", orderId)
          .maybeSingle();
        if (!order) return reply(E.orderNotFound, "Order not found");
        if (!sameAmount(f["amount"], order.amount_uzs)) return reply(E.badAmount, "Incorrect amount");
        if (order.status === "paid") return reply(E.alreadyPaid, "Already paid");
        if (order.status === "cancelled") return reply(E.cancelled, "Transaction cancelled");

        if (action === "0") {
          await supabaseAdmin
            .from("orders")
            .update({ status: "prepared", click_trans_id: clickTransId })
            .eq("id", orderId);
          return reply(E.ok, "Success", { merchant_prepare_id: orderId });
        }

        // Complete
        if (order.status !== "prepared") return reply(E.transactionNotFound, "Transaction not found");
        if (Number(f["error"] ?? "0") < 0) {
          await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
          return reply(E.cancelled, "Transaction cancelled");
        }
        const { error } = await supabaseAdmin.rpc("complete_order", {
          _order_id: orderId,
          _click_trans_id: clickTransId,
        });
        if (error) {
          console.error("complete_order failed", error);
          return reply(E.badRequest, "Internal error");
        }
        return reply(E.ok, "Success", { merchant_confirm_id: orderId });
      },
    },
  },
});
