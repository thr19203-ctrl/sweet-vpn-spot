import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getPayment } from "@/lib/payments.functions";

const MAX_POLLS = 10;
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export const Route = createFileRoute("/success")({
  validateSearch: (search) =>
    z.object({ session_id: z.string().regex(SESSION_ID).optional().catch(undefined) }).parse(search),
  head: () => ({
    meta: [{ title: "Payment — Success" }, { name: "robots", content: "noindex" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["payment", sessionId],
    enabled: !!sessionId,
    queryFn: () => getPayment({ data: { sessionId: sessionId! } }),
    refetchInterval: (q) =>
      q.state.data?.status === "pending" && q.state.dataUpdateCount < MAX_POLLS ? 2000 : false,
  });

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let body: React.ReactNode;
  if (!sessionId || data?.status === "unknown" || data?.status === "unpaid") {
    body = <p>We could not find a completed payment for this link.</p>;
  } else if (isLoading || data?.status === "pending") {
    body = (
      <p className="flex items-center gap-3" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Confirming your payment…
      </p>
    );
  } else if (data?.status === "paid") {
    body = (
      <>
        <p className="flex items-center gap-2 text-xl font-semibold">
          <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
          Success payment!
        </p>
        <p className="mt-4 text-muted-foreground">Your Discord invite:</p>
        <a
          href={data.inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block break-all rounded-md bg-secondary p-4 font-mono text-sm underline-offset-4 hover:underline"
        >
          {data.inviteUrl}
        </a>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl">
            <a href={data.inviteUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Join Discord
            </a>
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={() => copy(data.inviteUrl)}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Bookmark this page — the link opens your invite again.
        </p>
      </>
    );
  } else {
    body = <p>Something went wrong while confirming your payment. Please refresh this page.</p>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-20">
      <h1 className="text-4xl font-semibold sm:text-5xl">Payment</h1>
      <div className="mt-10 rounded-lg border border-border bg-card p-6">{body}</div>
      <Button asChild variant="secondary" className="mt-8 rounded-xl">
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  );
}
