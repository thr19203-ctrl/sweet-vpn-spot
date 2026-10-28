import { createFileRoute } from "@tanstack/react-router";

import { Home } from "@/components/home";
import { homeHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => homeHead("ru"),
  component: IndexPage,
});

function IndexPage() {
  return <Home />;
}
