import Link from "next/link";
import { startCheckout } from "@/app/actions/billing";
import type { User } from "@/lib/auth";

const FREE = ["1 semester plan", "Every weekend planned", "Cost estimates"];
const PLUS = ["Unlimited semester plans", "Re-plan anytime", "New features first"];

const item = "border-t py-3 font-mono text-[11px] uppercase tracking-[0.2em]";

export default function PricingCards({ user }: { user: User | null }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col rounded-sm border border-navy/15 p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">Free</p>
        <p className="mt-2 font-serif text-7xl">$0</p>
        <ul className="mt-8 flex-1">
          {FREE.map((f) => (
            <li key={f} className={`${item} border-navy/10`}>{f}</li>
          ))}
        </ul>
        <Link href={user ? "/plan/new" : "/signup"} className="btn-ghost mt-8">
          {user ? "Plan my semester" : "Start free"}
        </Link>
      </div>

      <div className="flex flex-col rounded-sm bg-sea p-8 text-cream">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/75">Weekndr Plus</p>
        <p className="mt-2 font-serif text-7xl">
          $7.99<span className="font-mono text-xs uppercase tracking-[0.2em] text-cream/75"> / month</span>
        </p>
        <ul className="mt-8 flex-1">
          {PLUS.map((f) => (
            <li key={f} className={`${item} border-cream/25`}>{f}</li>
          ))}
        </ul>
        {user?.is_paid ? (
          <p className="mt-8 rounded-full border border-cream/40 py-3.5 text-center font-mono text-xs uppercase tracking-[0.2em]">
            You&apos;re on Plus
          </p>
        ) : user ? (
          <form action={startCheckout} className="mt-8">
            <button className="w-full rounded-full bg-cream px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-sea transition hover:bg-white">
              Upgrade
            </button>
          </form>
        ) : (
          <Link href="/signup" className="mt-8 rounded-full bg-cream px-7 py-3.5 text-center font-mono text-xs uppercase tracking-[0.2em] text-sea transition hover:bg-white">
            Get started
          </Link>
        )}
      </div>
    </div>
  );
}
