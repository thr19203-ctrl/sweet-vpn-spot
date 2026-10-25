import { describe, expect, it, vi } from "vitest";

import { CONTENT } from "@/lib/i18n-content";
import { LANGS, readStoredLang, storeLang } from "@/lib/i18n";

describe("Translations", () => {
  it("covers the same languages for chrome copy and page copy", () => {
    expect(Object.keys(CONTENT).sort()).toEqual(Object.keys(LANGS).sort());
  });

  it("does not advertise a retired Free plan", () => {
    for (const copy of Object.values(CONTENT)) {
      expect(copy.a2).not.toMatch(/\bFree\b/);
    }
  });

  it("ignores blocked localStorage instead of crashing", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStoredLang()).toBeUndefined();
    expect(() => storeLang("en")).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
