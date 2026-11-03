import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyStripeSignature } from "@/lib/stripe.server";

const SECRET = "whsec_test_secret";
const PAYLOAD = JSON.stringify({ type: "checkout.session.completed" });
const NOW_MS = 1_800_000_000_000;
const T = NOW_MS / 1000;

const sign = (payload: string, t: number, secret = SECRET) =>
  createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");

describe("verifyStripeSignature", () => {
  it("accepts a valid signature", () => {
    const header = `t=${T},v1=${sign(PAYLOAD, T)}`;
    expect(verifyStripeSignature(PAYLOAD, header, SECRET, NOW_MS)).toBe(true);
  });

  it("accepts when any of several v1 signatures matches", () => {
    const header = `t=${T},v1=${"0".repeat(64)},v1=${sign(PAYLOAD, T)}`;
    expect(verifyStripeSignature(PAYLOAD, header, SECRET, NOW_MS)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const header = `t=${T},v1=${sign(PAYLOAD, T)}`;
    expect(verifyStripeSignature(`${PAYLOAD} `, header, SECRET, NOW_MS)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const header = `t=${T},v1=${sign(PAYLOAD, T, "whsec_other")}`;
    expect(verifyStripeSignature(PAYLOAD, header, SECRET, NOW_MS)).toBe(false);
  });

  it("rejects a stale timestamp (replay)", () => {
    const old = T - 3600;
    const header = `t=${old},v1=${sign(PAYLOAD, old)}`;
    expect(verifyStripeSignature(PAYLOAD, header, SECRET, NOW_MS)).toBe(false);
  });

  it("rejects missing or malformed headers", () => {
    expect(verifyStripeSignature(PAYLOAD, null, SECRET, NOW_MS)).toBe(false);
    expect(verifyStripeSignature(PAYLOAD, "garbage", SECRET, NOW_MS)).toBe(false);
    expect(verifyStripeSignature(PAYLOAD, `t=${T}`, SECRET, NOW_MS)).toBe(false);
  });
});
