import { describe, expect, it } from "vitest";
import { PLANS, formatPrice, planPrice } from "@/lib/pricing";

describe("User-approved USD pricing", () => {
  it("offers only Plus and Pro, without a Free tier", () => {
    expect(PLANS.map((plan) => plan.name)).toEqual(["Plus", "Pro"]);
  });
  it("offers Plus for $2.99", () => {
    expect(PLANS[0]).toEqual({ name: "Plus", monthly: 2.99 });
    expect(formatPrice(planPrice(PLANS[0].monthly, false))).toBe("$2.99");
  });
  it("offers Pro for $9.99", () => {
    expect(PLANS[1]).toEqual({ name: "Pro", monthly: 9.99 });
    expect(formatPrice(planPrice(PLANS[1].monthly, false))).toBe("$9.99");
  });
  it("preserves the existing annual discount without rounding to whole dollars", () => {
    expect(planPrice(2.99, true)).toBe(2.39);
    expect(planPrice(9.99, true)).toBe(7.99);
  });
});