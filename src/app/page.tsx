import Photo from "@/components/Photo";

const FOUNDER = "Bhavya Mudduluri";

// Photos are from Unsplash (free to use under the Unsplash License).
const unsplash = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const photos = {
  heroMain: unsplash("1502602898657-3e91760cbb34", 1200), // Paris
  heroSmall: unsplash("1523906834658-6e24ef2386f9", 800), // Venice
  plan: unsplash("1488646953014-85cb44e25828"), // map and travel planning
  discover: unsplash("1552832230-c0197dd311b5"), // Rome
  budget: unsplash("1513635269975-59663e0ac1ad"), // London
  comingSoon: unsplash("1476514525535-07fb3b4ae5f1", 2000), // Swiss lake
};

const cities = [
  "Paris",
  "Florence",
  "Barcelona",
  "Lisbon",
  "Amsterdam",
  "Prague",
  "Copenhagen",
  "Vienna",
];

const features = [
  {
    number: "01",
    title: "Plan Your Semester",
    body: "See every free weekend of your semester at a glance, from your first week abroad to your final exams, so you can map out where you want to go before the best trips fill up.",
    photo: photos.plan,
    alt: "A map, camera, and travel notebook laid out for trip planning",
  },
  {
    number: "02",
    title: "Discover Your Next Destination",
    body: "Find cities worth the train ride. Weekndr will suggest destinations based on where you're studying, what you love, and how much time you have.",
    photo: photos.discover,
    alt: "The Colosseum in Rome under a clear sky",
  },
  {
    number: "03",
    title: "Stay on Budget",
    body: "Studying abroad shouldn't mean coming home broke. Keep travel costs organized trip by trip, so you can say yes to more weekends without the guesswork.",
    photo: photos.budget,
    alt: "Westminster and the River Thames in London",
  },
];

const roadmap = [
  { title: "Semester calendar", body: "Every available weekend, in one view." },
  { title: "Trip planner", body: "Organize cities, dates, and details." },
  { title: "Budget tracker", body: "Track travel spending as you go." },
  { title: "AI recommendations", body: "Personalized destination ideas." },
  { title: "Travel with friends", body: "Plan trips together in one place." },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* Navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="font-serif text-3xl font-semibold tracking-tight">
          weekndr<span className="text-sky-deep">.</span>
        </a>
        <nav className="hidden items-center gap-10 text-sm tracking-wide text-navy-soft md:flex">
          <a href="#about" className="transition-colors hover:text-navy">About</a>
          <a href="#features" className="transition-colors hover:text-navy">Features</a>
          <a href="#coming-soon" className="transition-colors hover:text-navy">Coming Soon</a>
        </nav>
        <span className="rounded-full border border-navy/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-navy-soft">
          Coming soon
        </span>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-8 md:grid-cols-2 md:px-10 md:pb-28 md:pt-14">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-navy-soft">
            Semester planning for students abroad
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] font-medium sm:text-6xl lg:text-7xl">
            Your semester abroad, <em className="text-navy-soft">all in one place.</em>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed font-light text-navy-soft">
            Weekndr helps college students studying abroad plan every free
            weekend, discover new cities, and keep travel spending on track, so
            no weekend goes to waste.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#features"
              className="rounded-full bg-navy px-7 py-3.5 text-sm tracking-wide text-cream transition hover:bg-navy-soft"
            >
              Explore Weekndr
            </a>
            <a
              href="#coming-soon"
              className="rounded-full border border-navy/20 px-7 py-3.5 text-sm tracking-wide transition hover:border-navy/50"
            >
              See what&apos;s coming
            </a>
          </div>
          <p className="mt-12 text-sm text-navy-soft">
            Founded by <span className="font-medium text-navy">{FOUNDER}</span>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <Photo
            src={photos.heroMain}
            alt="The Eiffel Tower in Paris seen from a quiet street"
            className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-3xl shadow-2xl shadow-navy/10"
          />
          <Photo
            src={photos.heroSmall}
            alt="Gondolas on a canal in Venice"
            tone="navy"
            className="absolute -bottom-8 -left-4 aspect-square w-36 rounded-2xl border-[6px] border-cream shadow-xl sm:w-44 md:-left-12"
          />
          <div className="absolute -right-2 top-10 rounded-2xl bg-cream px-5 py-4 shadow-lg shadow-navy/10 sm:-right-6">
            <p className="font-serif text-2xl italic">Bonjour, Paris</p>
            <p className="text-xs uppercase tracking-[0.2em] text-navy-soft">Weekend 04</p>
          </div>
        </div>
      </section>

      {/* City strip */}
      <div className="border-y border-navy/10 bg-sky/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-2 px-6 py-5 text-center sm:flex sm:flex-wrap sm:justify-center font-serif text-xl italic text-navy-soft md:justify-between md:px-10">
          {cities.map((city) => (
            <span key={city}>{city}</span>
          ))}
        </div>
      </div>

      {/* About */}
      <section id="about" className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-navy-soft">Why Weekndr</p>
        <h2 className="font-serif text-4xl leading-tight font-medium md:text-5xl">
          Fourteen weekends. A whole continent. One plan.
        </h2>
        <p className="mt-8 text-lg leading-relaxed font-light text-navy-soft">
          A semester abroad goes by fast. Between classes, group chats, and
          a dozen open browser tabs, planning trips gets messy. Weekndr is built
          for college students abroad who want one calm, organized place to plan
          their weekends, choose where to go next, and travel smarter with
          friends.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl space-y-24 px-6 pb-28 md:space-y-32 md:px-10">
        {features.map((feature, i) => (
          <article key={feature.title} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <Photo
              src={feature.photo}
              alt={feature.alt}
              tone={i === 1 ? "cream" : "sky"}
              className={`aspect-[4/3] w-full rounded-3xl ${i % 2 === 1 ? "md:order-2" : ""}`}
            />
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <p className="font-serif text-6xl lining-nums text-sky-deep">{feature.number}</p>
              <h3 className="mt-4 font-serif text-4xl font-medium md:text-5xl">{feature.title}</h3>
              <div className="my-6 h-px w-16 bg-navy/30" />
              <p className="max-w-md text-lg leading-relaxed font-light text-navy-soft">{feature.body}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Coming Soon */}
      <section id="coming-soon" className="relative isolate overflow-hidden bg-navy text-cream">
        <Photo
          src={photos.comingSoon}
          alt="A calm alpine lake in Switzerland"
          tone="navy"
          className="absolute inset-0 -z-10 opacity-25"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 to-navy" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-sky">Coming soon</p>
          <h2 className="max-w-2xl font-serif text-4xl leading-tight font-medium md:text-6xl">
            Your next weekend away is <em>almost here.</em>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed font-light text-cream/80">
            Weekndr is currently in development. Here&apos;s what we&apos;re building
            for students heading abroad:
          </p>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-cream/15 sm:grid-cols-2 lg:grid-cols-5">
            {roadmap.map((item) => (
              <li key={item.title} className="bg-navy/80 p-6 backdrop-blur-sm">
                <p className="font-serif text-2xl">{item.title}</p>
                <p className="mt-2 text-sm font-light text-cream/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <p className="font-serif text-3xl font-semibold">
              weekndr<span className="text-sky-deep">.</span>
            </p>
            <p className="mt-2 text-sm text-navy-soft">Your semester abroad, all in one place.</p>
          </div>
          <div className="text-sm text-navy-soft md:text-right">
            <p>
              Created by <span className="font-medium text-navy">{FOUNDER}</span>
            </p>
            <p className="mt-1">Penn State · &copy; {new Date().getFullYear()} Weekndr</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
