import { describe, expect, it } from "vitest";

import { LANGS } from "@/lib/i18n";
import { SITE_URL, homeHead, homeMeta, langPath } from "@/lib/seo";
import { UI_MESSAGES } from "@/lib/ui-messages";

type HeadLink = { rel: string; href: string; hrefLang?: string };

describe("Home page SEO", () => {
  it("keeps the Russian title and description for /", () => {
    expect(homeMeta("ru").title).toBe("Cfg — Рабочие VPN конфиги");
    expect(homeMeta("ru").description).toContain("VLESS");
  });

  it("serves Russian at / and every other language at /<code>", () => {
    expect(langPath("ru")).toBe("/");
    expect(langPath("de")).toBe("/de");
  });

  it("lists every language plus x-default as hreflang alternates", () => {
    const links = homeHead("de").links as HeadLink[];
    const alternates = links.filter((link) => link.rel === "alternate");
    expect(alternates.map((link) => link.hrefLang).sort()).toEqual(
      [...Object.keys(LANGS), "x-default"].sort(),
    );
    expect(alternates.find((link) => link.hrefLang === "x-default")?.href).toBe(`${SITE_URL}/`);
    expect(links.find((link) => link.rel === "canonical")?.href).toBe(`${SITE_URL}/de`);
  });

  it("gives every language its own title and description", () => {
    const titles = Object.keys(LANGS).map((lang) => homeMeta(lang).title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const lang of Object.keys(LANGS)) {
      expect(homeMeta(lang).description, lang).not.toBe("");
    }
  });
});

describe("404 and error screen copy", () => {
  it("is translated for every language", () => {
    for (const lang of Object.keys(LANGS)) {
      const messages = UI_MESSAGES[lang];
      expect(messages, `messages for "${lang}"`).toBeDefined();
      for (const [key, value] of Object.entries(messages ?? {})) {
        expect(value, `${lang}.${key}`).not.toBe("");
      }
    }
  });
});
