import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Starts a Stripe Checkout Session and sends the visitor to Stripe's hosted payment page.
export function DiscordAccessButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/public/stripe-checkout", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      toast.error(body.error ?? "Payment error");
    } catch {
      toast.error("Payment error");
    }
    setBusy(false);
  };

  return (
    <Button onClick={buy} disabled={busy} className={className}>
      {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
      Buy Discord access
    </Button>
  );
}

export function DiscordAccess() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-20">
      <div className="flex flex-col items-start justify-between gap-5 rounded-lg border border-border bg-card p-7 sm:flex-row sm:items-center">
        <div>
          <div className="text-xl font-semibold">Discord community access</div>
          <p className="mt-2 text-sm text-muted-foreground">
            One-time payment. You get your invite link right after checkout.
          </p>
        </div>
        <DiscordAccessButton className="h-auto shrink-0 rounded-xl px-6 py-3 font-semibold" />
      </div>
    </section>
  );
}
