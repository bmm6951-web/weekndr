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
        <h1 className="mb-12 pt-10 text-center font-serif text-7xl md:text-8xl">pricing</h1>
        {canceled && (
          <p className="mb-8 rounded-sm bg-sky/60 px-5 py-4 text-center text-sm">Checkout canceled. You haven&apos;t been charged.</p>
        )}
        <PricingCards user={user} />
      </main>
      <SiteFooter />
    </>
  );
}
