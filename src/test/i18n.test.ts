import { describe, expect, it } from "vitest";

import { LANGS } from "@/lib/i18n";
import { CONTENT } from "@/lib/i18n-content";
import { WORKFLOW } from "@/lib/workflow";

const languages = Object.keys(LANGS);

describe("Translations", () => {
  it("offers at least the core language set", () => {
    expect(languages).toEqual(expect.arrayContaining(["en", "ru", "es", "de"]));
  });

  it("has full page, workflow and language-switcher copy for every language", () => {
    for (const lang of languages) {
      expect(WORKFLOW[lang], `workflow copy for "${lang}"`).toBeDefined();
      expect(CONTENT[lang], `page copy for "${lang}"`).toBeDefined();
      expect(LANGS[lang]?.name, `switcher label for "${lang}"`).toBeTruthy();
    }
  });

  it("never renders an empty string in a dictionary", () => {
    for (const [lang, dict] of Object.entries(CONTENT)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `CONTENT.${lang}.${key}`).not.toBe("");
      }
    }
    for (const [lang, copy] of Object.entries(WORKFLOW)) {
      for (const [key, value] of Object.entries(copy)) {
        expect(value, `WORKFLOW.${lang}.${key}`).not.toBe("");
      }
    }
  });
});
