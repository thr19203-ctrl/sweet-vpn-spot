import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Home } from "@/components/home";

describe("Hydration", () => {
  afterEach(() => vi.restoreAllMocks());

  for (const lang of [undefined, "de", "ar"]) {
    it(`hydrates the ${lang ?? "default"} home page without mismatch warnings`, async () => {
      const errors: string[] = [];
      vi.spyOn(console, "error").mockImplementation((...args) => {
        errors.push(args.map(String).join(" ").slice(0, 300));
      });
      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = renderToString(<Home lang={lang} />);

      await act(async () => {
        hydrateRoot(container, <Home lang={lang} />);
      });

      expect(errors).toEqual([]);
    });
  }
});
