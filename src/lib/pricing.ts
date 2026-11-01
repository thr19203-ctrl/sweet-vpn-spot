export const PLANS = [
  { name: "Plus", monthly: 2.99, monthlyUzs: 35000 },
  { name: "Pro", monthly: 9.99, monthlyUzs: 119000 },
] as const;

export type PlanName = (typeof PLANS)[number]["name"];

export function planPrice(monthly: number, yearly: boolean) {
  return Math.round(monthly * (yearly ? 0.8 : 1) * 100) / 100;
}

export function formatPrice(price: number) {
  return `$${price === 0 ? "0" : price.toFixed(2)}`;
}

/** Amount charged through Click: one month, or 12 months with the 20% yearly discount. */
export function chargeUzs(plan: PlanName, yearly: boolean) {
  const found = PLANS.find((p) => p.name === plan);
  if (!found) throw new Error(`Unknown plan ${plan}`);
  return yearly ? Math.round(found.monthlyUzs * 12 * 0.8) : found.monthlyUzs;
}

export function formatUzs(amount: number) {
  return `${amount.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} UZS`;
}
