import Link from "next/link";
import { startCheckout } from "@/app/actions/billing";
import type { User } from "@/lib/auth";

const FREE = ["1 AI semester plan", "Weekend-by-weekend destinations", "Cost estimates for every trip"];
const PLUS = [
  "Unlimited AI semester plans",
  "Re-plan anytime your calendar or budget changes",
  "Compare plans side by side in your account",
  "Every future feature: budgets, friends, and more",
];

export default function PricingCards({ user }: { user: User | null }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="ticket flex flex-col p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-navy-soft">Free</p>
        <p className="mt-3 font-serif text-6xl">$0</p>
        <p className="text-sm text-navy-soft">Try it on your semester</p>
        <ul className="mt-8 flex-1 space-y-3 text-sm">
          {FREE.map((f) => (
            <li key={f} className="flex gap-3"><span className="text-sky-deep">✓</span>{f}</li>
          ))}
        </ul>
        <Link href={user ? "/plan/new" : "/signup"} className="btn-ghost mt-8">
          {user ? "Plan my semester" : "Start free"}
        </Link>
      </div>

      <div className="ticket relative flex flex-col bg-navy p-8 text-cream">
        <span className="stamp absolute right-6 top-6 !border-sky !text-sky [box-shadow:none]">Most popular</span>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky">Weekndr Plus</p>
        <p className="mt-3 font-serif text-6xl">
          $7.99<span className="text-xl text-cream/60">/month</span>
        </p>
        <p className="text-sm text-cream/70">Less than one museum ticket abroad. Cancel anytime.</p>
        <ul className="mt-8 flex-1 space-y-3 text-sm">
          {PLUS.map((f) => (
            <li key={f} className="flex gap-3"><span className="text-sky">✓</span>{f}</li>
          ))}
        </ul>
        {user?.is_paid ? (
          <p className="mt-8 rounded-full bg-cream/10 py-3.5 text-center text-sm">You&apos;re on Plus ✓</p>
        ) : user ? (
          <form action={startCheckout} className="mt-8">
            <button className="w-full rounded-full bg-cream px-7 py-3.5 text-sm tracking-wide text-navy transition hover:bg-sky">
              Upgrade with Stripe →
            </button>
          </form>
        ) : (
          <Link href="/signup" className="mt-8 rounded-full bg-cream px-7 py-3.5 text-center text-sm tracking-wide text-navy transition hover:bg-sky">
            Create an account to upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
