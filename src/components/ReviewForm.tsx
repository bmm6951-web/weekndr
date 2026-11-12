"use client";

import { useActionState } from "react";
import { submitReview, type ReviewState } from "@/app/actions/reviews";
import { TAGS, VIBES } from "@/lib/review-options";

const chip =
  "inline-block cursor-pointer rounded-full border border-navy/15 bg-white/60 px-4 py-2 text-sm transition peer-checked:border-stamp peer-checked:bg-stamp peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-sky-deep";

function Scale({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input type="radio" name={name} value={n} required className="peer sr-only" />
            <span className={`${chip} !px-0 w-11 text-center`}>{n}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ReviewForm({ defaults }: { defaults: { from?: string; to?: string; country?: string } }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  return (
    <form action={action} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="homeCity" className="label">I studied in</label>
          <input id="homeCity" name="homeCity" className="field" defaultValue={defaults.from} placeholder="Barcelona" required />
        </div>
        <div>
          <label htmlFor="destination" className="label">Weekend trip to</label>
          <input id="destination" name="destination" className="field" defaultValue={defaults.to} placeholder="Lisbon" required />
        </div>
        <div>
          <label htmlFor="country" className="label">Country</label>
          <input id="country" name="country" className="field" defaultValue={defaults.country} placeholder="Portugal" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Scale name="rating" label="Overall (1–5)" />
        <Scale name="safety" label="How safe it felt (1–5)" />
      </div>

      <div>
        <p className="label">The vibe</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(VIBES).map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="vibe" value={value} required className="peer sr-only" />
              <span className={chip}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Good for</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <label key={t}>
              <input type="checkbox" name="tags" value={t} className="peer sr-only" />
              <span className={chip}>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cost" className="label">What you spent (optional)</label>
          <div className="flex gap-2">
            <select name="currency" aria-label="Currency" className="field !w-24" defaultValue="EUR">
              <option value="EUR">€</option>
              <option value="USD">$</option>
              <option value="GBP">£</option>
            </select>
            <input id="cost" name="cost" type="number" min={0} className="field" placeholder="180" />
          </div>
        </div>
        <div>
          <label htmlFor="tripMonth" className="label">When (optional)</label>
          <input id="tripMonth" name="tripMonth" type="month" className="field" />
        </div>
      </div>

      <div>
        <label htmlFor="body" className="label">Your take</label>
        <textarea
          id="body"
          name="body"
          rows={4}
          maxLength={600}
          required
          className="field"
          placeholder="What made it great (or not)? Where did you stay? Anything you'd tell a friend before going?"
        />
      </div>

      {state.error && <p role="alert" className="rounded-sm bg-stamp/10 px-4 py-3 text-sm text-stamp">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Posting…" : "Share my trip"}</button>
    </form>
  );
}
