import ReviewForm from "@/components/ReviewForm";
import SiteHeader from "@/components/SiteHeader";
import { requireUser } from "@/lib/auth";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; country?: string }>;
}) {
  const [user, defaults] = await Promise.all([requireUser(), searchParams]);
  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="mb-10 font-serif text-6xl md:text-7xl">share a <em className="text-stamp">trip</em></h1>
        <ReviewForm defaults={defaults} />
      </main>
    </>
  );
}
