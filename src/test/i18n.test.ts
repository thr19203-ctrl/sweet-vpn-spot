import { afterEach, describe, expect, it, vi } from "vitest";

import { LANGS, readStoredLang, storeLang } from "@/lib/i18n";
import { CONTENT } from "@/lib/i18n-content";
import { WORKFLOW } from "@/lib/workflow";

const languages = Object.keys(LANGS);

describe("Translations", () => {
  it("offers at least the core language set", () => {
    expect(languages).toEqual(expect.arrayContaining(["en", "ru", "es", "de"]));
  });

  it("covers the same languages for chrome copy and page copy", () => {
    expect(Object.keys(CONTENT).sort()).toEqual([...languages].sort());
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

  it("does not advertise a retired Free plan", () => {
    for (const [lang, copy] of Object.entries(CONTENT)) {
      expect(copy.a2, `CONTENT.${lang}.a2`).not.toMatch(/\bFree\b/);
    }
  });
});

describe("Stored language", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("ignores blocked localStorage instead of crashing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStoredLang()).toBeUndefined();
    expect(() => storeLang("en")).not.toThrow();
  });

  it("round-trips a supported language", () => {
    storeLang("de");
    expect(readStoredLang()).toBe("de");
  });

  it("rejects unknown values, including Object.prototype keys", () => {
    for (const bad of ["xx", "constructor", "__proto__", "toString"]) {
      localStorage.setItem("lang", bad);
      expect(readStoredLang(), bad).toBeUndefined();
    }
  });
});
