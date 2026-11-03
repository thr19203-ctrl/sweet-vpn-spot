import { describe, expect, it } from "vitest";
import { FREE_PLAN, formatPrice } from "@/lib/pricing";

describe("Free plan", () => {
  it("is free", () => {
    expect(FREE_PLAN.name).toBe("Free");
    expect(formatPrice(FREE_PLAN.monthly)).toBe("$0");
  });
  it("sends people to the Discord invite", () => {
    expect(FREE_PLAN.url).toBe("https://discord.gg/SEMMqXQZdP");
  });
});
