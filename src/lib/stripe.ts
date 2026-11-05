import Stripe from "stripe";

export const PLUS_PRICE_CENTS = 799;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key);
}
