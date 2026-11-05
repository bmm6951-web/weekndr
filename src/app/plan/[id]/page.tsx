import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PlanInput, PlanResult, PlanWeekend } from "@/lib/planner";

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£" } as const;

const TYPE_STYLES: Record<PlanWeekend["type"], { tag: string; bar: string; card: string }> = {
  trip: { tag: "Weekend trip", bar: "bg-navy text-cream", card: "bg-white" },
  long_trip: { tag: "Long weekend", bar: "bg-stamp text-cream", card: "bg-white" },
  home: { tag: "Home base", bar: "bg-sky text-navy", card: "bg-white/70" },
  blocked: { tag: "Stay put", bar: "bg-navy/10 text-navy-soft", card: "bg-cream-dark/60" },
};

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const pool = await db();
  const { rows } = await pool.query<{ input: PlanInput; result: PlanResult; created_at: Date }>(
    "SELECT input, result, created_at FROM plans WHERE id = $1 AND user_id = $2",
    [Number(id), user.id],
  );
  if (rows.length === 0) notFound();
  const { input, result } = rows[0];
  const sym = SYMBOLS[input.currency] ?? "$";
  const money = (n: number) => `${sym}${Math.round(n).toLocaleString("en-US")}`;
  const trips = result.weekends.filter((w) => w.type === "trip" || w.type === "long_trip");
  const cities = new Set(trips.map((w) => w.destination));

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6 md:px-10">
        <Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.2em] text-navy-soft hover:text-navy">
          ← All plans
        </Link>
        <header className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="font-hand text-2xl text-stamp">your semester from {input.homeCity}</p>
            <h1 className="mt-1 font-serif text-5xl leading-[1.05] font-medium md:text-6xl">{result.title}</h1>
            <p className="mt-6 max-w-2xl text-lg font-light text-navy-soft">{result.overview}</p>
          </div>
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-3xl bg-navy/10 text-center">
            {[
              ["Weekends", result.weekends.length],
              ["Cities", cities.size],
              ["Est. total", money(result.estimated_total)],
            ].map(([label, value]) => (
              <div key={label} className="bg-cream p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">{label}</dt>
                <dd className="mt-1 font-serif text-3xl">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.weekends.map((w) => {
            const style = TYPE_STYLES[w.type] ?? TYPE_STYLES.trip;
            return (
              <li key={w.index} className={`ticket flex flex-col ${style.card}`}>
                <div className={`flex items-center justify-between px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] ${style.bar}`}>
                  <span>Wknd {String(w.index).padStart(2, "0")}</span>
                  <span>{style.tag}</span>
                </div>
                <div className="flex-1 px-6 pb-5 pt-5">
                  <p className="font-mono text-xs text-navy-soft">{w.label}</p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight">
                    {w.destination}
                    {w.country && w.type !== "blocked" && <span className="text-navy-soft">, {w.country}</span>}
                  </h2>
                  <p className="font-hand text-xl text-stamp">{w.headline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-navy-soft">{w.why_it_fits}</p>
                  {w.type !== "blocked" && w.getting_there && w.getting_there !== "N/A" && (
                    <p className="mt-3 text-sm">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">Getting there · </span>
                      {w.getting_there}
                    </p>
                  )}
                </div>
                <div className="ticket-perf px-6 pb-5 pt-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">Est. cost</span>
                    <span className="font-serif text-2xl">{money(w.estimated_cost)}</span>
                  </div>
                  {w.cost_breakdown && <p className="mt-1 text-xs text-navy-soft">{w.cost_breakdown}</p>}
                  {w.tip && <p className="mt-3 rounded-xl bg-sky/40 px-3 py-2 text-xs leading-relaxed">💡 {w.tip}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        {result.money_tips.length > 0 && (
          <section className="mt-16 rounded-3xl bg-navy p-8 text-cream md:p-12">
            <p className="font-hand text-2xl text-sky">stay on budget</p>
            <h2 className="font-serif text-4xl">Money tips for your semester</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {result.money_tips.map((tip) => (
                <li key={tip} className="rounded-2xl bg-cream/10 p-5 text-sm font-light leading-relaxed">{tip}</li>
              ))}
            </ul>
          </section>
        )}
        <p className="mt-8 text-center text-xs text-navy-soft">
          Costs and travel times are AI estimates. Check prices and schedules before booking.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
