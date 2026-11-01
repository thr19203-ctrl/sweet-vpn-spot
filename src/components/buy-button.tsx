import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/orders.functions";
import type { PlanName } from "@/lib/pricing";

export function BuyButton({ plan, yearly, label, className }: { plan: PlanName; yearly: boolean; label: string; className?: string }) {
  const create = useServerFn(createOrder);
  const [busy, setBusy] = useState(false);
  const buy = async () => {
    setBusy(true);
    try {
      const res = await create({ data: { plan, yearly } });
      if ("payUrl" in res && res.payUrl) {
        window.location.href = res.payUrl;
        return;
      }
      toast.error("error" in res ? res.error : "Payment error");
    } catch {
      toast.error("Payment error");
    }
    setBusy(false);
  };
  return (
    <Button variant="secondary" onClick={buy} disabled={busy} className={className}>
      {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
      {label}
    </Button>
  );
}
