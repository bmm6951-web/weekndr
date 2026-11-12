import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 pt-14 md:px-10">
        <div className="flex flex-wrap justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/70">
          <p>
            Created by <span className="text-cream">Bhavya Mudduluri</span> · Penn State
          </p>
          <div className="flex gap-6">
            <Link href="/#how-it-works" className="hover:text-cream">How it works</Link>
            <Link href="/community" className="hover:text-cream">Reviews</Link>
            <Link href="/pricing" className="hover:text-cream">Pricing</Link>
            <Link href="/login" className="hover:text-cream">Log in</Link>
          </div>
        </div>
        <p className="mt-8 select-none font-serif text-[23vw] leading-[0.75] tracking-tight md:text-[15rem]">
          weekndr<span className="text-stamp">.</span>
        </p>
      </div>
    </footer>
  );
}
