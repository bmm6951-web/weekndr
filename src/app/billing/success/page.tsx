import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import SiteHeader from "@/components/SiteHeader";

export default async function BillingSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const user = await requireUser();
  const { session_id } = await searchParams;

  let confirmed = user.is_paid;
  if (!confirmed && session_id) {
    // Confirm with Stripe directly; never trust the URL alone.
    const session = await getStripe().checkout.sessions.retrieve(session_id);
    if (session.client_reference_id === String(user.id) && session.status === "complete") {
      const pool = await db();
      await pool.query("UPDATE users SET is_paid = TRUE, stripe_customer_id = $2 WHERE id = $1", [
        user.id,
        typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
      ]);
      confirmed = true;
    }
  }

  return (
    <>
      <SiteHeader user={{ ...user, is_paid: confirmed }} />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
                <h1 className="font-serif text-6xl">
          {confirmed ? "Welcome to Weekndr Plus." : "We couldn't confirm your payment."}
        </h1>
        <p className="mt-6 text-lg font-light text-navy-soft">
          {confirmed
            ? "Unlimited semester plans are unlocked."
            : "If you completed checkout, refresh this page in a moment."}
        </p>
        <Link href={confirmed ? "/plan/new" : "/pricing"} className="btn-primary mt-10 inline-block">
          {confirmed ? "Plan my semester" : "Back to pricing"}
        </Link>
      </main>
    </>
  );
}
