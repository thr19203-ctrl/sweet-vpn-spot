import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { LANGS } from "@/lib/i18n";
import { SITE_URL, langPath } from "@/lib/seo";

const read = (file: string) => readFileSync(resolve(process.cwd(), "public", file), "utf-8");

describe("sitemap.xml", () => {
  const sitemap = read("sitemap.xml");

  it("lists every language URL with the right site origin", () => {
    for (const lang of Object.keys(LANGS)) {
      expect(sitemap, lang).toContain(`<loc>${SITE_URL}${langPath(lang)}</loc>`);
      expect(sitemap, lang).toContain(`hreflang="${lang}" href="${SITE_URL}${langPath(lang)}"`);
    }
    expect(sitemap).toContain('hreflang="x-default"');
  });

  it("is advertised in robots.txt", () => {
    expect(read("robots.txt")).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
