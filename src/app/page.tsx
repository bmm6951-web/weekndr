import Link from "next/link";
import Photo from "@/components/Photo";
import PricingCards from "@/components/PricingCards";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

// Photos are from Unsplash (free to use under the Unsplash License).
const unsplash = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const photos = {
  hero: unsplash("1502602898657-3e91760cbb34", 1200), // Paris
  plan: unsplash("1488646953014-85cb44e25828"), // map and travel planning
  discover: unsplash("1523906834658-6e24ef2386f9"), // Venice
  budget: unsplash("1552832230-c0197dd311b5"), // Rome
};

const cities = ["BCN", "LIS", "PAR", "AMS", "PRG", "FLR", "CPH", "VIE", "DUB", "ATH"];

const tabs = [
  "cheap flights bcn to ???",
  "is lisbon worth it for a weekend",
  "hostels prague under €30",
  "spring break europe ideas reddit",
  "ryanair baggage rules 2027",
  "when is my midterm again",
  "group chat: where r we going",
];

const steps = [
  {
    n: "01",
    title: "Upload your calendar",
    body: "Drop in your program's academic calendar or syllabus as a PDF, or paste the dates. Weekndr's AI reads it and spots exams, breaks, and required program trips.",
  },
  {
    n: "02",
    title: "Tell us your budget & vibe",
    body: "Where you're living, what you can spend per trip, and what you love: beaches, museums, food markets, nightlife, hikes.",
  },
  {
    n: "03",
    title: "Get every weekend planned",
    body: "A boarding pass for every weekend: where to go, why it fits you, how to get there, and what it'll cost. Saved to your account.",
  },
];

const sample = [
  { wk: "01", date: "Jan 16–18", place: "Barcelona", note: "settle in, Gothic Quarter + Bunkers sunset", tag: "Home base", cost: "€40" },
  { wk: "02", date: "Jan 23–25", place: "Valencia", note: "paella where it was invented", tag: "Trip", cost: "€130" },
  { wk: "05", date: "Feb 13–15", place: "Lisbon", note: "pastéis & sunset trams", tag: "Trip", cost: "€175" },
  { wk: "07", date: "Feb 27–Mar 1", place: "Program trip", note: "required Madrid excursion", tag: "Blocked", cost: "€0" },
  { wk: "10", date: "Mar 27–Apr 5", place: "Amalfi + Rome", note: "spring break: go big", tag: "Long weekend", cost: "€420" },
  { wk: "14", date: "Apr 24–26", place: "Mallorca", note: "beach weekend before finals", tag: "Trip", cost: "€150" },
];

const features = [
  {
    title: "Plan Your Semester",
    body: "Every weekend from arrival to finals, mapped out at once, so you book early, skip the bad weekends, and never waste a free one.",
    photo: photos.plan,
    alt: "A map, camera, and travel notebook laid out for trip planning",
  },
  {
    title: "Discover Your Next Destination",
    body: "Recommendations matched to your interests, the season, and how far you can get from your home base, not a generic top-10 list.",
    photo: photos.discover,
    alt: "Gondolas on a canal in Venice",
  },
  {
    title: "Stay on Budget",
    body: "Estimated costs for transport, beds, and food on every trip, plus money tips, so you can say yes to more weekends.",
    photo: photos.budget,
    alt: "The Colosseum in Rome under a clear sky",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="overflow-x-hidden">
      <SiteHeader user={user} />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-6 md:px-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-hand text-3xl text-stamp">hola, future study abroad student!</p>
            <h1 className="mt-2 font-serif text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-[5.25rem]">
              Your semester abroad, <em className="text-navy-soft">all in one place.</em>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed font-light text-navy-soft">
              Upload your academic calendar and Weekndr&apos;s AI plans every free weekend of your semester: where to
              go, why it fits you, and what it&apos;ll cost. Built for college students studying abroad in Europe.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={user ? "/plan/new" : "/signup"} className="btn-primary">
                Plan my semester free →
              </Link>
              <a href="#how-it-works" className="btn-ghost">See how it works</a>
            </div>
            <p className="mt-10 text-sm text-navy-soft">
              Founded by <span className="font-medium text-navy">Bhavya Mudduluri</span> · Penn State
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Photo
              src={photos.hero}
              alt="The Eiffel Tower in Paris seen from a quiet street"
              className="ml-auto aspect-[4/5] w-[85%] rounded-[2rem] shadow-2xl shadow-navy/10"
            />
            <span className="stamp absolute right-2 top-6 rotate-12 bg-cream/90 text-sm">Paris · Wknd 09</span>
            <span className="stamp absolute right-16 top-28 -rotate-12 bg-cream/90 !border-navy !text-navy [box-shadow:inset_0_0_0_2px_var(--color-cream),inset_0_0_0_3px_var(--color-navy)]">
              Approved
            </span>

            {/* Sample boarding pass */}
            <div className="ticket absolute -bottom-10 left-0 w-[88%] -rotate-3 sm:w-80">
              <div className="flex items-center justify-between bg-navy px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cream">
                <span>Weekndr pass</span>
                <span>Sample</span>
              </div>
              <div className="flex items-end justify-between px-5 pt-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">From</p>
                  <p className="font-serif text-4xl font-semibold">BCN</p>
                </div>
                <span className="mb-2 text-xl text-stamp">✈</span>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">To</p>
                  <p className="font-serif text-4xl font-semibold">LIS</p>
                </div>
              </div>
              <p className="px-5 pb-4 font-hand text-xl text-stamp">pastéis &amp; sunset trams</p>
              <div className="ticket-perf flex items-center justify-between gap-4 px-5 py-4">
                <div className="font-mono text-[10px] uppercase leading-5 tracking-[0.15em] text-navy-soft">
                  Wknd 05 · Feb 13–15
                  <br />
                  Est. €175 · fits your budget
                </div>
                <div className="barcode h-9 w-20 opacity-80" />
              </div>
            </div>
          </div>
        </section>

        {/* Departures board */}
        <div className="bg-navy py-4 text-cream">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1 px-6 font-mono text-sm tracking-[0.3em] md:justify-between md:px-10">
            {cities.map((code) => (
              <span key={code}>
                {code}
                <span className="ml-6 hidden text-sky-deep md:inline">✈</span>
              </span>
            ))}
          </div>
        </div>

        {/* The problem */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 md:px-10 md:py-32 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">The problem</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight font-medium md:text-5xl">
              Fourteen weekends. Fifty open tabs. <em>One group chat.</em>
            </h2>
            <p className="mt-6 text-lg leading-relaxed font-light text-navy-soft">
              A semester abroad flies by. Most students spend their first few weekends figuring out how to plan, then
              realize half their free weekends are gone. Weekndr turns all of that research into one plan, in about a
              minute.
            </p>
          </div>
          <div className="relative">
            <div className="space-y-2.5">
              {tabs.map((t, i) => (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-full border border-navy/10 bg-white/80 px-5 py-2.5 text-sm text-navy-soft line-through decoration-stamp/60 shadow-sm"
                  style={{ marginLeft: `${(i % 3) * 1.5}rem` }}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-navy/20" />
                  {t}
                </div>
              ))}
            </div>
            <p className="absolute -bottom-12 right-0 -rotate-3 font-hand text-3xl text-stamp sm:-right-4">
              → one plan. done.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-8 bg-sky/50 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">How it works</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight font-medium md:text-5xl">
              Your calendar in. Your whole semester out.
            </h2>
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <li key={s.n} className="ticket p-8">
                  <p className="font-mono text-sm text-stamp">{s.n}</p>
                  <h3 className="mt-3 font-serif text-3xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed font-light text-navy-soft">{s.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-20 flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-serif text-3xl">What a plan looks like</h3>
              <p className="font-hand text-2xl text-stamp">a sample Barcelona semester ↓</p>
            </div>
            <div className="-mx-6 mt-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0">
              {sample.map((s) => (
                <div key={s.wk} className="ticket w-60 shrink-0 snap-start">
                  <div
                    className={`flex justify-between px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] ${
                      s.tag === "Blocked" ? "bg-navy/10 text-navy-soft" : s.tag === "Long weekend" ? "bg-stamp text-cream" : s.tag === "Home base" ? "bg-sky text-navy" : "bg-navy text-cream"
                    }`}
                  >
                    <span>Wknd {s.wk}</span>
                    <span>{s.tag}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-[11px] text-navy-soft">{s.date}</p>
                    <p className="mt-1 font-serif text-2xl">{s.place}</p>
                    <p className="font-hand text-lg leading-tight text-stamp">{s.note}</p>
                  </div>
                  <div className="ticket-perf flex justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">
                    <span>Est. cost</span>
                    <span className="text-navy">{s.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <article key={f.title}>
                <Photo src={f.photo} alt={f.alt} tone={i === 1 ? "cream" : "sky"} className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-3xl" />
                <p className="mt-6 font-mono text-xs text-stamp">0{i + 1}</p>
                <h3 className="mt-2 font-serif text-3xl font-medium">{f.title}</h3>
                <p className="mt-3 leading-relaxed font-light text-navy-soft">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Founder note */}
        <section className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
          <div className="relative rotate-1 rounded-3xl bg-white p-8 shadow-xl shadow-navy/10 md:p-12">
            <span className="stamp absolute -top-4 right-8 bg-cream">Barcelona · Spring</span>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">Why I&apos;m building this</p>
            <p className="mt-5 font-hand text-[1.75rem] leading-snug text-navy">
              I&apos;m studying abroad in Barcelona next semester. When I started thinking about where to travel, I had no
              idea where to begin: tabs everywhere, friends sending ideas, and no clue which weekends I&apos;d even be
              free. You only get one semester abroad. I don&apos;t want to waste a single weekend, and I don&apos;t think
              you should either.
            </p>
            <p className="mt-6 font-hand text-3xl text-stamp">— Bhavya Mudduluri, founder</p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-cream-dark/60 py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-6 md:px-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">Pricing</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight font-medium md:text-5xl">
              Worth it by your first weekend.
            </h2>
            <p className="mb-12 mt-4 max-w-2xl text-lg font-light text-navy-soft">
              One well-planned trip saves more than a month of Weekndr Plus. Start free; upgrade when you want to
              re-plan as your semester changes.
            </p>
            <PricingCards user={user} />
          </div>
        </section>

        {/* Coming soon */}
        <section className="bg-navy text-cream">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-14 md:px-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-sky">Coming soon</p>
              <p className="mt-2 font-serif text-3xl">Trip budgets & expense tracking · Plan trips with friends</p>
            </div>
            <Link href={user ? "/plan/new" : "/signup"} className="rounded-full bg-cream px-7 py-3.5 text-sm text-navy hover:bg-sky">
              Plan my semester free →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
