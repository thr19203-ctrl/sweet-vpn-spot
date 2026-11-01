import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { chargeUzs } from "@/lib/pricing";

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ plan: z.enum(["Plus", "Pro"]), yearly: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const serviceId = process.env["CLICK_SERVICE_ID"];
    const merchantId = process.env["CLICK_MERCHANT_ID"];
    if (!serviceId || !merchantId) return { error: "Payments are not configured yet" as const };

    const amount = chargeUzs(data.plan, data.yearly);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({ plan: data.plan, yearly: data.yearly, amount_uzs: amount })
      .select("id")
      .single();
    if (error || !order) {
      console.error("createOrder failed", error);
      return { error: "Could not create order" as const };
    }

    const origin = new URL(getRequest().url).origin;
    const url = new URL("https://my.click.uz/services/pay");
    url.searchParams.set("service_id", serviceId);
    url.searchParams.set("merchant_id", merchantId);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("transaction_param", order.id);
    url.searchParams.set("return_url", `${origin}/order/${order.id}`);
    return { orderId: order.id, payUrl: url.toString() };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, plan, status, amount_uzs, configs(content)")
      .eq("id", data.id)
      .maybeSingle();
    if (!order) return null;
    const cfg = Array.isArray(order.configs) ? order.configs[0] : order.configs;
    return {
      id: order.id,
      plan: order.plan,
      status: order.status,
      amountUzs: order.amount_uzs,
      config: order.status === "paid" ? (cfg?.content ?? null) : null,
    };
  });
