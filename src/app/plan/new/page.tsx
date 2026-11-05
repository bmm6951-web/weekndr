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
        <p className="font-hand text-2xl text-stamp">let&apos;s plan your semester</p>
        <h1 className="mt-1 font-serif text-5xl font-medium">Tell us about your semester.</h1>
        <p className="mb-12 mt-4 text-lg font-light text-navy-soft">
          Weekndr&apos;s AI reads your academic calendar, finds every free weekend, and matches each one to a
          destination that fits your budget and interests.
        </p>
        {allowance.canCreate ? (
          <PlanForm />
        ) : (
          <div className="ticket p-8">
            <h2 className="font-serif text-3xl">You&apos;ve used your free plan.</h2>
            <p className="mt-3 font-light text-navy-soft">
              Weekndr Plus unlocks unlimited plans, so you can re-plan whenever your calendar or budget changes.
            </p>
            <Link href="/pricing" className="btn-primary mt-6 inline-block">Upgrade for $7.99/month</Link>
          </div>
        )}
      </main>
    </>
  );
}
