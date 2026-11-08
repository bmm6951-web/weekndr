"use client";

import Link from "next/link";
import { useState } from "react";
import type { FlightOption, StayOption } from "@/lib/prices";

export type TrackerData = {
  alerts_enabled: boolean;
  flight: FlightOption | null;
  stays: StayOption[] | null;
  flight_price: string | null;
  stay_price: string | null;
  prev_flight_price: string | null;
  prev_stay_price: string | null;
  checked_at: string | null;
};

const time = (s: string) => s.split(" ")[1] ?? s;
const hours = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;

function Change({ prev, now, sym }: { prev: string | null; now: string | null; sym: string }) {
  if (prev == null || now == null || Number(prev) === Number(now)) return null;
  const diff = Number(now) - Number(prev);
  return (
    <span className={diff < 0 ? "text-sea" : "text-stamp"}>
      {" "}
      {diff < 0 ? "▼" : "▲"} {sym}
      {Math.abs(Math.round(diff))}
    </span>
  );
}

export default function PriceTracker({
  planId,
  index,
  sym,
  isPaid,
  initial,
}: {
  planId: number;
  index: number;
  sym: string;
  isPaid: boolean;
  initial: TrackerData | null;
}) {
  const [tracker, setTracker] = useState<TrackerData | null>(initial);
  const [busy, setBusy] = useState<"check" | "toggle" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isPaid) {
    return (
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">
        Live prices & alerts ·{" "}
        <Link href="/pricing" className="text-stamp underline underline-offset-4">Plus</Link>
      </p>
    );
  }

  async function call(method: "POST" | "PATCH", body: object) {
    setError(null);
    const res = await fetch("/api/trackers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, index, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
    return data.tracker as TrackerData;
  }

  async function check() {
    setBusy("check");
    try {
      setTracker(await call("POST", {}));
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  async function toggle() {
    setBusy("toggle");
    try {
      const next = await call("PATCH", { enabled: !tracker?.alerts_enabled });
      setTracker((t) => ({ ...(t ?? next), alerts_enabled: next.alerts_enabled }));
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  }

  const checked = tracker?.checked_at;
  return (
    <div className="mt-4 border-t border-navy/10 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">Live prices</p>
        <button
          onClick={check}
          disabled={busy !== null}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-stamp hover:underline disabled:opacity-50"
        >
          {busy === "check" ? "Checking…" : checked ? "Refresh" : "Check live prices"}
        </button>
      </div>

      {checked && (
        <div className="mt-3 space-y-3 text-xs">
          {tracker?.flight ? (
            <a href={tracker.flight.url || undefined} target="_blank" rel="noopener noreferrer" className="block rounded-sm bg-white/70 p-3 hover:bg-white">
              <span className="flex justify-between gap-2">
                <span>✈ {tracker.flight.airline}</span>
                <span className="font-serif text-lg leading-none">
                  {sym}{Math.round(tracker.flight.price)}
                  <Change prev={tracker.prev_flight_price} now={tracker.flight_price} sym={sym} />
                </span>
              </span>
              <span className="mt-1 block text-navy-soft">
                Out {time(tracker.flight.depart)} → {time(tracker.flight.arrive)} · {tracker.flight.stops === 0 ? "nonstop" : `${tracker.flight.stops} stop`} · {hours(tracker.flight.durationMin)} · round trip
              </span>
            </a>
          ) : (
            <p className="text-navy-soft">No good flights found (we skip long layovers). Try the search links above.</p>
          )}
          {tracker?.stays?.length ? (
            <ul className="space-y-1.5">
              {tracker.stays.map((s, i) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex justify-between gap-2 rounded-sm bg-white/70 p-3 hover:bg-white">
                    <span>
                      {s.name}
                      <span className="block text-navy-soft">★ {s.rating} ({s.reviews.toLocaleString("en-US")}) · {s.type}</span>
                    </span>
                    <span className="whitespace-nowrap font-serif text-lg leading-none">
                      {sym}{Math.round(s.total)}
                      {i === 0 && <Change prev={tracker.prev_stay_price} now={tracker.stay_price} sym={sym} />}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-navy-soft">No well-reviewed stays found for these dates yet.</p>
          )}
          <p className="text-[10px] text-navy-soft">
            Checked {new Date(checked).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · stay prices are totals for the weekend
          </p>
        </div>
      )}

      <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 text-xs">
        <span>Email me when prices change</span>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(tracker?.alerts_enabled)}
          onClick={toggle}
          disabled={busy !== null}
          className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${tracker?.alerts_enabled ? "bg-stamp" : "bg-navy/20"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${tracker?.alerts_enabled ? "left-[1.1rem]" : "left-0.5"}`} />
        </button>
      </label>
      {error && <p role="alert" className="mt-2 text-xs text-stamp">{error}</p>}
    </div>
  );
}
