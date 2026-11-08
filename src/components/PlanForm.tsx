"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERESTS = [
  "Food & markets",
  "Beaches",
  "Museums & art",
  "History",
  "Architecture",
  "Nightlife",
  "Hiking & nature",
  "Festivals",
  "Photography",
  "Hidden gems",
];

const STYLES = [
  "Travel almost every weekend",
  "A balance of trips and weekends at home",
  "A few big trips, more weekends exploring my city",
];

const LOADING_MESSAGES = [
  "Reading your academic calendar…",
  "Finding your free weekends…",
  "Checking which cities fit your budget…",
  "Matching destinations to your interests…",
  "Planning around exams and breaks…",
  "Packing your boarding passes…",
];

export default function PlanForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; upgrade?: boolean } | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => setStep((s) => (s + 1) % LOADING_MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, [pending]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    setStep(0);
    try {
      const res = await fetch("/api/plans", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ message: data.error ?? "Something went wrong. Please try again.", upgrade: data.upgrade });
        setPending(false);
        return;
      }
      router.push(`/plan/${data.id}`);
    } catch {
      setError({ message: "Couldn't reach Weekndr. Check your connection and try again." });
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <fieldset disabled={pending} className="space-y-10">
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label htmlFor="homeCity" className="label">City you&apos;re studying in</label>
            <input id="homeCity" name="homeCity" className="field" placeholder="e.g. Barcelona, Spain" required />
          </div>
          <div>
            <label htmlFor="startDate" className="label">Semester starts</label>
            <input id="startDate" name="startDate" type="date" className="field" required />
          </div>
          <div>
            <label htmlFor="endDate" className="label">Semester ends</label>
            <input id="endDate" name="endDate" type="date" className="field" required />
          </div>
          <div>
            <label htmlFor="budgetPerTrip" className="label">Budget per trip</label>
            <div className="flex gap-2">
              <select name="currency" aria-label="Currency" className="field !w-24" defaultValue="EUR">
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="GBP">£ GBP</option>
              </select>
              <input id="budgetPerTrip" name="budgetPerTrip" type="number" min={20} max={5000} className="field" placeholder="200" required />
            </div>
          </div>
        </section>

        <section>
          <p className="label">What are you into?</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <label key={interest} className="cursor-pointer">
                <input type="checkbox" name="interests" value={interest} className="peer sr-only" />
                <span className="inline-block rounded-full border border-navy/15 bg-white/60 px-4 py-2 text-sm transition peer-checked:border-stamp peer-checked:bg-stamp peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-sky-deep">
                  {interest}
                </span>
              </label>
            ))}
          </div>
          <input name="otherInterests" className="field mt-3" placeholder="Anything else? e.g. live football, vegetarian food, rock climbing" />
        </section>

        <section>
          <p className="label">Travel style</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {STYLES.map((style, i) => (
              <label key={style} className="cursor-pointer">
                <input type="radio" name="travelStyle" value={style} defaultChecked={i === 1} className="peer sr-only" />
                <span className="block h-full rounded-sm border border-navy/15 bg-white/60 p-4 text-sm transition peer-checked:border-stamp peer-checked:bg-stamp peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-sky-deep">
                  {style}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-dashed border-navy/25 p-6">
          <p className="label">Your academic calendar</p>
          <p className="mb-5 text-sm font-light text-navy-soft">PDF or pasted text. Optional, but recommended.</p>
          <input
            name="calendarFile"
            type="file"
            accept="application/pdf"
            aria-label="Upload academic calendar PDF"
            className="block w-full text-sm text-navy-soft file:mr-4 file:rounded-full file:border-0 file:bg-stamp file:px-5 file:py-2.5 file:text-sm file:text-cream hover:file:bg-sea"
          />
          <p className="my-4 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-navy/40">or paste it</p>
          <textarea
            name="calendarText"
            rows={6}
            className="field font-mono text-sm"
            placeholder={"Jan 12: Classes begin\nFeb 20-21: Program trip to Valencia (required)\nMar 30 - Apr 6: Spring break\nMay 4-8: Final exams"}
          />
        </section>
      </fieldset>

      {error && (
        <div role="alert" className="rounded-sm bg-stamp/10 px-5 py-4 text-sm text-stamp">
          {error.message}{" "}
          {error.upgrade && (
            <Link href="/pricing" className="underline underline-offset-4">
              See Weekndr Plus
            </Link>
          )}
        </div>
      )}

      {pending ? (
        <div className="ticket flex items-center gap-5 p-6" aria-live="polite">
          <span className="relative flex h-4 w-4 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stamp opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-stamp" />
          </span>
          <div>
            <p className="font-serif text-2xl">{LOADING_MESSAGES[step]}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-navy-soft">About a minute · keep this tab open</p>
          </div>
        </div>
      ) : (
        <button className="btn-primary w-full sm:w-auto">Plan my semester</button>
      )}
    </form>
  );
}
