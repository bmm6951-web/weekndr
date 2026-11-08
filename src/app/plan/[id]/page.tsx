import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import SemesterCalendar from "@/components/SemesterCalendar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { flightLinks, groundLinks, stayLinks, type LinkItem } from "@/lib/links";
import { withDates, type PlanInput, type PlanResult, type PlanWeekend } from "@/lib/planner";

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£" } as const;

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function LinkRow({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div className="mt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">{title}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-navy/15 px-3 py-1 text-xs transition hover:border-stamp hover:text-stamp"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

const TYPE_STYLES: Record<PlanWeekend["type"], { tag: string; bar: string; card: string }> = {
  trip: { tag: "Trip", bar: "text-navy-soft", card: "" },
  long_trip: { tag: "Long weekend", bar: "text-stamp", card: "" },
  home: { tag: "Home base", bar: "text-navy-soft", card: "!bg-sky/40" },
  blocked: { tag: "Stay put", bar: "text-navy-soft", card: "!bg-cream-dark/70 opacity-80" },
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
  const { input } = rows[0];
  const result = withDates(input, rows[0].result);
  const sym = SYMBOLS[input.currency] ?? "$";
  const money = (n: number) => `${sym}${Math.round(n).toLocaleString("en-US")}`;
  const trips = result.weekends.filter((w) => w.type === "trip" || w.type === "long_trip");
  const cities = new Set(trips.map((w) => w.destination));

  return (
    <>
      <div className="print:hidden">
        <SiteHeader user={user} />
      </div>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link href="/dashboard" className="font-mono text-xs uppercase tracking-[0.2em] text-navy-soft hover:text-navy">
            ← All plans
          </Link>
          <a href="#calendar" className="font-mono text-xs uppercase tracking-[0.2em] text-stamp hover:underline">
            Semester calendar ↓
          </a>
        </div>
        <header className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">From {input.homeCity}</p>
            <h1 className="mt-3 font-serif text-5xl leading-[0.95] md:text-7xl">{result.title}</h1>
            <p className="mt-6 max-w-2xl text-lg font-light text-navy-soft">{result.overview}</p>
          </div>
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-sm bg-navy/15 text-center">
            {[
              ["Weekends", result.weekends.length],
              ["Cities", cities.size],
              ["Est. total", money(result.estimated_total)],
            ].map(([label, value]) => (
              <div key={label} className="bg-cream p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">{label}</dt>
                <dd className="mt-1 font-serif text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.weekends.map((w) => {
            const style = TYPE_STYLES[w.type] ?? TYPE_STYLES.trip;
            const isTrip = w.type === "trip" || w.type === "long_trip";
            const hasDates = Boolean(w.start_date && w.end_date);
            const flies = w.transport_mode === "flight" && w.origin_airport && w.destination_airport;
            return (
              <li key={w.index} className={`ticket flex break-inside-avoid flex-col ${style.card}`}>
                <div className={`flex items-center justify-between border-b border-navy/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] ${style.bar}`}>
                  <span>Wknd {String(w.index).padStart(2, "0")}</span>
                  <span>{style.tag}</span>
                </div>
                <div className="flex-1 px-6 pb-5 pt-5">
                  <p className="font-mono text-xs text-navy-soft">{w.label}</p>
                  <h2 className="mt-2 font-serif text-4xl leading-none">
                    {w.destination}
                    {w.country && w.type !== "blocked" && <span className="text-navy-soft">, {w.country}</span>}
                  </h2>
                  <p className="mt-2 font-serif text-xl italic text-stamp">{w.headline}</p>
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
                    <span className="font-serif text-3xl">{money(w.estimated_cost)}</span>
                  </div>
                  {w.cost_breakdown && <p className="mt-1 text-xs text-navy-soft">{w.cost_breakdown}</p>}
                  {w.tip && <p className="mt-3 border-l-2 border-stamp pl-3 text-xs leading-relaxed text-navy-soft">{w.tip}</p>}
                </div>
                {isTrip && hasDates && (
                  <div className="ticket-perf px-6 pb-5 pt-4 print:hidden">
                    {w.book_by && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stamp">Book by {shortDate(w.book_by)}</p>
                    )}
                    {flies ? (
                      <LinkRow title={`Flights ${w.origin_airport} → ${w.destination_airport}`} links={flightLinks(w.origin_airport!, w.destination_airport!, w.start_date!, w.end_date!)} />
                    ) : (
                      <LinkRow title="Getting there" links={groundLinks(input.homeCity, w.destination)} />
                    )}
                    {w.where_to_stay && <p className="mt-3 text-xs leading-relaxed text-navy-soft">{w.where_to_stay}</p>}
                    <LinkRow title="Where to stay" links={stayLinks(w.destination, w.country, w.start_date!, w.end_date!)} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {result.money_tips.length > 0 && (
          <section className="mt-16 rounded-sm bg-sea p-8 text-cream md:p-12">
            <h2 className="font-serif text-5xl">money tips</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {result.money_tips.map((tip) => (
                <li key={tip} className="border-t border-cream/25 pt-4 text-sm font-light leading-relaxed">{tip}</li>
              ))}
            </ul>
          </section>
        )}
        <section id="calendar" className="mt-16 scroll-mt-8 break-before-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-5xl md:text-6xl">your semester</h2>
            <div className="flex flex-wrap gap-3 print:hidden">
              <a href={`/plan/${id}/calendar`} className="btn-primary">Add to my calendar</a>
              <PrintButton className="btn-ghost" />
            </div>
          </div>
          <SemesterCalendar weekends={result.weekends} startDate={input.startDate} endDate={input.endDate} />
        </section>

        <p className="mt-12 text-center text-xs text-navy-soft">
          Costs, travel times, and booking dates are AI estimates. Prices on the linked sites are live.
        </p>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
