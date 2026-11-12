import Link from "next/link";
import Photo from "@/components/Photo";
import PricingCards from "@/components/PricingCards";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

// Photos are from Unsplash (free to use under the Unsplash License).
const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const photos = {
  hero: unsplash("1523906834658-6e24ef2386f9", 2200), // Venice
  polaroid: unsplash("1499856871958-5b9627545d1a", 800), // Paris street
  beach: unsplash("1507525428034-b723cf961d3e", 1000),
  rome: unsplash("1552832230-c0197dd311b5", 1000),
  paris: unsplash("1502602898657-3e91760cbb34", 1000),
  map: unsplash("1488646953014-85cb44e25828", 1000),
  london: unsplash("1513635269975-59663e0ac1ad", 1000),
  lake: unsplash("1476514525535-07fb3b4ae5f1", 1000),
};

const cities = ["Barcelona", "Lisbon", "Paris", "Rome", "Amsterdam", "Prague", "Florence", "Copenhagen"];

const steps = [
  { n: "01", title: "Upload your calendar", photo: photos.map, alt: "A map and travel notebook" },
  { n: "02", title: "Set your budget & interests", photo: photos.beach, alt: "A quiet beach with clear water" },
  { n: "03", title: "Get every weekend planned", photo: photos.rome, alt: "The Colosseum in Rome" },
];

const sample = [
  { wk: "Wknd 02", place: "Interlaken", cost: "€210", photo: photos.lake, alt: "A calm lake surrounded by mountains" },
  { wk: "Wknd 05", place: "Paris", cost: "€175", photo: photos.paris, alt: "The Eiffel Tower in Paris" },
  { wk: "Wknd 09", place: "London", cost: "€190", photo: photos.london, alt: "Westminster and the River Thames" },
];

export default async function Home() {
  const user = await getCurrentUser();
  const start = user ? "/plan/new" : "/signup";

  return (
    <div className="overflow-x-hidden">
      <SiteHeader user={user} />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10 md:pt-16">
          <h1 className="font-serif text-[15vw] leading-[0.85] tracking-tight text-navy md:text-[9.5rem]">
            your semester abroad, <em className="text-stamp">all in one place.</em>
          </h1>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-navy/15 pt-6">
            <p className="max-w-md font-mono text-xs uppercase leading-6 tracking-[0.15em] text-navy-soft">
              AI weekend planning for college students studying abroad.
            </p>
            <Link href={start} className="btn-primary">Plan my semester</Link>
          </div>
        </section>
        <section className="mx-auto mt-10 max-w-6xl px-6 md:px-10">
          <Photo src={photos.hero} alt="Gondolas on a canal in Venice" tone="cream" className="aspect-[16/9] w-full rounded-sm" />
        </section>

        {/* Intro */}
        <section id="how-it-works" className="mx-auto grid max-w-6xl scroll-mt-8 items-center gap-12 px-6 py-24 md:grid-cols-[1fr_1.2fr] md:px-10 md:py-32">
          <div className="mx-auto w-64 rotate-[-3deg] bg-white p-3 pb-10 shadow-lg shadow-navy/10 md:w-72">
            <Photo src={photos.polaroid} alt="A Paris street at golden hour" className="aspect-square w-full" />
          </div>
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 font-serif text-5xl leading-[0.95] md:text-7xl">
              Your calendar in. <em>Every weekend out.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-navy-soft">
              Upload your program&apos;s academic calendar. Weekndr finds your free weekends and plans where to go, built
              around your budget and interests.
            </p>
          </div>
        </section>

        {/* Product */}
        <section className="bg-cream-dark/60 py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <p className="eyebrow">The product</p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] md:text-7xl">
              every weekend, <em className="text-stamp">planned and bookable.</em>
            </h2>
            <figure className="mt-12">
              <div className="overflow-hidden rounded-md border border-navy/15 bg-cream shadow-2xl shadow-navy/15">
                <div className="flex gap-1.5 border-b border-navy/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-navy/15" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/product/cards.webp" alt="Weekndr plan cards for Barcelona, Valencia, and Lisbon with costs, book-by dates, and booking links" className="w-full" loading="lazy" />
              </div>
              <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">
                Sample plan · each trip with cost, book-by date, flights, safe places to stay, and live prices
              </figcaption>
            </figure>
            <div className="mt-16 grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
              <figure>
                <div className="overflow-hidden rounded-md border border-navy/15 bg-cream shadow-xl shadow-navy/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/product/calendar.webp" alt="Weekndr semester calendar with weekends colored by trip type" className="w-full" loading="lazy" />
                </div>
                <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">
                  Your semester at a glance · syncs to Google, Apple, or Outlook
                </figcaption>
              </figure>
              <div>
                <h3 className="font-serif text-4xl leading-tight md:text-5xl">
                  why not just <em className="text-stamp">ask a chatbot?</em>
                </h3>
                <ul className="mt-6">
                  {[
                    "Reads your actual academic calendar",
                    "Real reviews from students in your city",
                    "Live flight & hostel prices",
                    "Emails you when prices drop",
                    "Book-by reminders in your calendar",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 border-t border-navy/15 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                      <span className="text-stamp">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/community" className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-stamp hover:underline">
                  Read student trip reviews →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="overflow-hidden border-y border-navy/15 py-6" aria-hidden>
          <div className="marquee flex w-max gap-12 whitespace-nowrap font-serif text-6xl md:text-8xl">
            {[...cities, ...cities].map((city, i) => (
              <span key={i} className={i % 2 ? "italic text-stamp" : ""}>
                {city} <span className="text-navy/25">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <article key={s.n}>
                <Photo src={s.photo} alt={s.alt} className="aspect-[3/4] w-full rounded-sm" />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">
                  <span className="text-stamp">{s.n}</span> — {s.title}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Sample plan */}
        <section className="bg-sea py-24 text-cream md:py-32">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <p className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-cream/70">
              <span>Sample plan</span>
              <span>Spring semester</span>
            </p>
            <h2
              className="photo-text mt-4 font-poster text-[21vw] uppercase leading-[0.85] md:text-[12.5rem]"
              style={{ backgroundImage: `url("${photos.beach}"), linear-gradient(135deg, #d3e4e6, #bf5a32)` }}
            >
              Barcelona
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {sample.map((s) => (
                <figure key={s.wk}>
                  <Photo src={s.photo} alt={s.alt} tone="navy" className="aspect-[4/5] w-full rounded-sm" />
                  <figcaption className="mt-4 flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-cream/80">
                    <span>{s.wk} · {s.place}</span>
                    <span>{s.cost}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>


        {/* Pricing */}
        <section id="pricing" className="border-t border-navy/15 py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-6 md:px-10">
            <h2 className="mb-12 text-center font-serif text-6xl md:text-7xl">pricing</h2>
            <PricingCards user={user} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
