import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import { clickSign, sameAmount, verifyClickSign } from "@/lib/click.server";
import { chargeUzs } from "@/lib/pricing";

const md5 = (s: string) => createHash("md5").update(s).digest("hex");

describe("Click UZS prices", () => {
  it("charges Plus 35 000 UZS per month", () => {
    expect(chargeUzs("Plus", false)).toBe(35000);
  });
  it("charges Pro 119 000 UZS per month", () => {
    expect(chargeUzs("Pro", false)).toBe(119000);
  });
  it("charges a year with the 20% discount", () => {
    expect(chargeUzs("Plus", true)).toBe(336000);
    expect(chargeUzs("Pro", true)).toBe(1142400);
  });
});

describe("Click signature", () => {
  const base = { click_trans_id: "111", service_id: "22", merchant_trans_id: "ord", amount: "35000", sign_time: "2026-11-01 12:00:00" };
  it("signs Prepare without merchant_prepare_id", () => {
    const f = { ...base, action: "0", merchant_prepare_id: "x" };
    expect(clickSign(f, "SECRET")).toBe(md5("11122SECRETord350000" + base.sign_time));
  });
  it("signs Complete with merchant_prepare_id", () => {
    const f = { ...base, action: "1", merchant_prepare_id: "ord" };
    expect(clickSign(f, "SECRET")).toBe(md5("11122SECRETordord350001" + base.sign_time));
  });
  it("rejects a forged signature", () => {
    const f = { ...base, action: "0", sign_string: md5("forged") };
    expect(verifyClickSign(f, "SECRET")).toBe(false);
    expect(verifyClickSign({ ...f, sign_string: clickSign(f, "SECRET") }, "SECRET")).toBe(true);
  });
  it("rejects a wrong amount", () => {
    expect(sameAmount("35000.00", 35000)).toBe(true);
    expect(sameAmount("3500", 35000)).toBe(false);
  });
});
