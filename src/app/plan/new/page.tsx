import Link from "next/link";
import PlanForm from "@/components/PlanForm";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";
import { planAllowance } from "@/lib/limits";

export default async function NewPlanPage() {
  const user = await requireUser();
  const allowance = await planAllowance(user);

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6 md:px-10">
        <h1 className="mb-12 pt-6 font-serif text-6xl md:text-7xl">plan your <em className="text-stamp">semester</em></h1>
        {allowance.canCreate ? (
          <PlanForm />
        ) : (
          <div className="ticket p-8">
            <h2 className="font-serif text-3xl">You&apos;ve used your free plan.</h2>

            <Link href="/pricing" className="btn-primary mt-6 inline-block">Upgrade to Plus</Link>
          </div>
        )}
      </main>
    </>
  );
}
