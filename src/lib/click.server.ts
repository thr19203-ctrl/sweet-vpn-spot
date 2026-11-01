import { createHash } from "crypto";

export type ClickFields = Record<string, string>;

export const CLICK_ERRORS = {
  ok: 0,
  signFailed: -1,
  badAmount: -2,
  actionNotFound: -3,
  alreadyPaid: -4,
  orderNotFound: -5,
  transactionNotFound: -6,
  badRequest: -8,
  cancelled: -9,
} as const;

/** Click Shop API signature: md5 over the documented field order. */
export function clickSign(f: ClickFields, secretKey: string) {
  const prepareId = f["action"] === "1" ? (f["merchant_prepare_id"] ?? "") : "";
  const raw =
    (f["click_trans_id"] ?? "") +
    (f["service_id"] ?? "") +
    secretKey +
    (f["merchant_trans_id"] ?? "") +
    prepareId +
    (f["amount"] ?? "") +
    (f["action"] ?? "") +
    (f["sign_time"] ?? "");
  return createHash("md5").update(raw).digest("hex");
}

export function verifyClickSign(f: ClickFields, secretKey: string) {
  const given = (f["sign_string"] ?? "").toLowerCase();
  const expected = clickSign(f, secretKey);
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Click sends amounts like "35000" or "35000.00"; compare as whole sums. */
export function sameAmount(given: string | undefined, expected: number) {
  const n = Number(given);
  return Number.isFinite(n) && Math.abs(n - expected) < 0.01;
}
