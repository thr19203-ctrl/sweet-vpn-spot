import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/orders.functions";
import { readStoredLang } from "@/lib/i18n";
import { formatUzs } from "@/lib/pricing";

const COPY = {
  ru: {
    title: "Ваш заказ",
    waiting: "Ждём подтверждения оплаты от Click…",
    paid: "Оплата прошла. Ваш конфиг:",
    noStock: "Оплата прошла, но свободные конфиги закончились. Мы выдадим конфиг вручную — напишите в поддержку и укажите номер заказа.",
    cancelled: "Оплата отменена. Вы можете вернуться и попробовать снова.",
    copy: "Скопировать",
    copied: "Скопировано",
    order: "Номер заказа",
    back: "На главную",
    keep: "Сохраните эту страницу — по ссылке конфиг можно открыть снова.",
  },
  en: {
    title: "Your order",
    waiting: "Waiting for Click to confirm the payment…",
    paid: "Payment received. Your config:",
    noStock: "Payment received, but no configs are left in stock. We will issue one manually — contact support with your order number.",
    cancelled: "The payment was cancelled. You can go back and try again.",
    copy: "Copy",
    copied: "Copied",
    order: "Order number",
    back: "Back to home",
    keep: "Bookmark this page — the link opens your config again.",
  },
  uz: {
    title: "Buyurtmangiz",
    waiting: "Click to‘lovni tasdiqlashini kutyapmiz…",
    paid: "To‘lov qabul qilindi. Sizning konfigingiz:",
    noStock: "To‘lov qabul qilindi, lekin bo‘sh konfiglar tugadi. Konfigni qo‘lda beramiz — buyurtma raqami bilan qo‘llab-quvvatlashga yozing.",
    cancelled: "To‘lov bekor qilindi. Qaytib, yana urinib ko‘rishingiz mumkin.",
    copy: "Nusxalash",
    copied: "Nusxalandi",
    order: "Buyurtma raqami",
    back: "Bosh sahifa",
    keep: "Bu sahifani saqlang — havola orqali konfigni qayta ochish mumkin.",
  },
};

const orderQuery = (id: string) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: () => getOrder({ data: { id } }),
    refetchInterval: (q) => (q.state.data && q.state.data.status !== "paid" && q.state.data.status !== "cancelled" ? 3000 : false),
  });

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Cfg — Заказ" },
      { name: "description", content: "Статус оплаты и ваш VPN конфиг Cfg." },
      { property: "og:title", content: "Cfg — Заказ" },
      { property: "og:description", content: "Статус оплаты и ваш VPN конфиг Cfg." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ context, params }) => {
    if (!/^[0-9a-f-]{36}$/i.test(params.orderId)) throw notFound();
    const order = await context.queryClient.ensureQueryData(orderQuery(params.orderId));
    if (!order) throw notFound();
  },
  component: OrderPage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <Link to="/" className="mt-6 inline-block underline">Cfg</Link>
    </main>
  ),
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data: order } = useSuspenseQuery(orderQuery(orderId));
  const [lang, setLang] = useState<keyof typeof COPY>("ru");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const l = readStoredLang();
    if (l === "en" || l === "uz" || l === "ru") setLang(l);
    else if (l) setLang("en");
  }, []);
  const t = COPY[lang];
  if (!order) return null;

  const copy = async () => {
    if (!order.config) return;
    await navigator.clipboard.writeText(order.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-20">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.title}</h1>
      <p className="mt-3 text-muted-foreground">
        {order.plan} · {formatUzs(order.amountUzs)}
      </p>
      <div className="mt-10 rounded-lg border border-border bg-card p-6">
        {order.status === "paid" && order.config && (
          <>
            <p className="font-medium">{t.paid}</p>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-md bg-secondary p-4 text-sm">{order.config}</pre>
            <Button onClick={copy} className="mt-4 rounded-xl">
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? t.copied : t.copy}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">{t.keep}</p>
          </>
        )}
        {order.status === "paid" && !order.config && <p>{t.noStock}</p>}
        {order.status === "cancelled" && <p>{t.cancelled}</p>}
        {(order.status === "pending" || order.status === "prepared") && (
          <p className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t.waiting}
          </p>
        )}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        {t.order}: <span className="font-mono">{order.id}</span>
      </p>
      <Button asChild variant="secondary" className="mt-8 rounded-xl">
        <Link to="/">{t.back}</Link>
      </Button>
    </main>
  );
}
