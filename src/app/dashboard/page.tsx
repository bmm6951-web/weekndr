import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { planAllowance } from "@/lib/limits";

type PlanRow = { id: number; title: string; home_city: string; weekends: number; created_at: Date };

export default async function DashboardPage() {
  const user = await requireUser();
  const pool = await db();
  const [{ rows: plans }, allowance] = await Promise.all([
    pool.query<PlanRow>(
      `SELECT id, title, input->>'homeCity' AS home_city,
              jsonb_array_length(result->'weekends') AS weekends, created_at
       FROM plans WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id],
    ),
    planAllowance(user),
  ]);

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 pb-24 pt-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Hi, {user.name.split(" ")[0]}</p>
            <h1 className="mt-2 font-serif text-6xl">your plans</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={user.is_paid ? "stamp" : "rounded-full bg-navy/5 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-navy-soft"}>
              {user.is_paid ? "Weekndr Plus" : "Free plan"}
            </span>
            <Link href="/plan/new" className="btn-primary">+ New plan</Link>
          </div>
        </div>

        {!user.is_paid && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-sm bg-sky/60 px-6 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]">
              {allowance.used} of {allowance.limit} free plan used
            </p>
            <Link href="/pricing" className="font-mono text-[11px] uppercase tracking-[0.2em] text-stamp underline underline-offset-4">Upgrade</Link>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="ticket mt-12 p-10 text-center">
            <p className="font-serif text-4xl">No plans yet.</p>
            <Link href="/plan/new" className="btn-primary mt-6 inline-block">Plan my semester</Link>
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link href={`/plan/${plan.id}`} className="ticket block transition hover:-translate-y-1">
                  <div className="flex justify-between border-b border-navy/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">
                    <span>From {plan.home_city}</span>
                    <span>{plan.weekends} weekends</span>
                  </div>
                  <div className="p-6">
                    <p className="font-serif text-3xl leading-tight">{plan.title}</p>
                    <p className="mt-3 font-mono text-xs text-navy-soft">
                      Created {new Date(plan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
