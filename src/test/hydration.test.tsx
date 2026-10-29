import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Home } from "@/components/home";

const cases: { name: string; props: { lang?: string } }[] = [
  { name: "default", props: {} },
  { name: "de", props: { lang: "de" } },
  { name: "ar", props: { lang: "ar" } },
];

describe("Hydration", () => {
  afterEach(() => vi.restoreAllMocks());

  for (const { name, props } of cases) {
    it(`hydrates the ${name} home page without mismatch warnings`, async () => {
      const errors: string[] = [];
      vi.spyOn(console, "error").mockImplementation((...args) => {
        errors.push(args.map(String).join(" ").slice(0, 300));
      });
      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = renderToString(<Home {...props} />);

      await act(async () => {
        hydrateRoot(container, <Home {...props} />);
      });

      expect(errors).toEqual([]);
    });
  }
});
