"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getStripe, PLUS_PRICE_CENTS } from "@/lib/stripe";

export async function startCheckout() {
  const user = await requireUser();
  if (user.is_paid) redirect("/dashboard");

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: String(user.id),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PLUS_PRICE_CENTS,
          recurring: { interval: "month" },
          product_data: {
            name: "Weekndr Plus",
            description: "Unlimited AI semester plans for your semester abroad",
          },
        },
      },
    ],
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
  });

  redirect(session.url!);
}
