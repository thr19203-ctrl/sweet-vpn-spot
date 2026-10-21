export const PLANS = [
  { name: "Plus", monthly: 2.99 },
  { name: "Pro", monthly: 9.99 },
] as const;

export function planPrice(monthly: number, yearly: boolean) {
  return Math.round(monthly * (yearly ? 0.8 : 1) * 100) / 100;
}

export function formatPrice(price: number) {
  return `$${price === 0 ? "0" : price.toFixed(2)}`;
}