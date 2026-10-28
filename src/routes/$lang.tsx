import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { Home } from "@/components/home";
import { LANGS } from "@/lib/i18n";
import { DEFAULT_LANG, homeHead } from "@/lib/seo";

// One URL per language (/en, /de, ...) so each version can be indexed with hreflang.
export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/", statusCode: 301 });
    if (!Object.hasOwn(LANGS, params.lang)) throw notFound();
  },
  head: ({ params }) => homeHead(params.lang),
  component: LocalizedHome,
});

function LocalizedHome() {
  const { lang } = Route.useParams();
  return <Home lang={lang} />;
}
