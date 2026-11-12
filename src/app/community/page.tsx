import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { homeCities, listReviews, VIBES } from "@/lib/reviews";

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

function Dots({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5`} className="tracking-[0.15em]">
      {"●".repeat(n)}
      <span className="text-navy/20">{"●".repeat(5 - n)}</span>
    </span>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; posted?: string }>;
}) {
  const [user, { from, posted }, cities] = await Promise.all([getCurrentUser(), searchParams, homeCities()]);
  const reviews = await listReviews(from || undefined);
  const active = cities.find((c) => c.home_key === from);

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 pb-24 pt-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Student reviews</p>
            <h1 className="mt-3 font-serif text-6xl leading-[0.95] md:text-7xl">
              {active ? (
                <>weekends from <em className="text-stamp">{active.home_city}</em></>
              ) : (
                <>the best <em className="text-stamp">weekend trips</em></>
              )}
            </h1>
            <p className="mt-4 max-w-xl font-light text-navy-soft">
              Real trips from students studying abroad. Weekndr&apos;s planner reads these when it builds your plan.
            </p>
          </div>
          <Link href={user ? `/community/new${active ? `?from=${encodeURIComponent(active.home_city)}` : ""}` : "/signup"} className="btn-primary">
            Share a trip
          </Link>
        </div>

        {posted && <p className="mt-8 rounded-sm bg-sky/60 px-5 py-4 text-sm">Thanks! Your trip is live and will help the next student plan.</p>}

        {cities.length > 0 && (
          <nav className="mt-10 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <Link href="/community" className={`rounded-full border px-4 py-2 ${!from ? "border-stamp bg-stamp text-cream" : "border-navy/15"}`}>All</Link>
            {cities.map((c) => (
              <Link
                key={c.home_key}
                href={`/community?from=${encodeURIComponent(c.home_key)}`}
                className={`rounded-full border px-4 py-2 ${from === c.home_key ? "border-stamp bg-stamp text-cream" : "border-navy/15"}`}
              >
                From {c.home_city} · {c.n}
              </Link>
            ))}
          </nav>
        )}

        {reviews.length === 0 ? (
          <div className="mt-12 rounded-sm border border-dashed border-navy/25 p-12 text-center">
            <p className="font-serif text-4xl">No trips shared yet.</p>
            <p className="mt-2 font-light text-navy-soft">Been somewhere great for a weekend? Be the first.</p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="ticket flex flex-col p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">From {r.home_city}</p>
                <h2 className="mt-2 font-serif text-4xl leading-none">
                  {r.destination}
                  {r.country && <span className="text-navy-soft">, {r.country}</span>}
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em]">
                  <dt className="text-navy-soft">Overall</dt>
                  <dd className="text-stamp"><Dots n={r.rating} /></dd>
                  <dt className="text-navy-soft">Felt safe</dt>
                  <dd className="text-sea"><Dots n={r.safety} /></dd>
                  <dt className="text-navy-soft">Vibe</dt>
                  <dd>{VIBES[r.vibe]}</dd>
                  {r.cost && (
                    <>
                      <dt className="text-navy-soft">Spent</dt>
                      <dd>{SYMBOLS[r.currency] ?? ""}{Math.round(Number(r.cost))}</dd>
                    </>
                  )}
                </dl>
                <p className="mt-4 flex-1 text-sm leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                {r.tags.length > 0 && (
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">{r.tags.join(" · ")}</p>
                )}
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">
                  — {r.name}
                  {r.trip_month &&
                    `, ${new Date(`${r.trip_month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
