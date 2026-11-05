import PricingCards from "@/components/PricingCards";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const [user, { canceled }] = await Promise.all([getCurrentUser(), searchParams]);
  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-6 md:px-10">
        <p className="font-hand text-2xl text-stamp">simple pricing</p>
        <h1 className="mb-4 font-serif text-5xl font-medium md:text-6xl">One semester. Every weekend planned.</h1>
        <p className="mb-12 max-w-2xl text-lg font-light text-navy-soft">
          Hours of research across dozens of tabs, done in about a minute and built around your calendar, budget, and
          interests.
        </p>
        {canceled && (
          <p className="mb-8 rounded-2xl bg-sky/60 px-5 py-4 text-sm">Checkout canceled. You haven&apos;t been charged.</p>
        )}
        <PricingCards user={user} />
      </main>
      <SiteFooter />
    </>
  );
}
