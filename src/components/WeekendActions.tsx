"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { index: number; label: string; destination: string; blocked: boolean };

const small = "font-mono text-[10px] uppercase tracking-[0.2em]";

export default function WeekendActions({ planId, index, options }: { planId: number; index: number; options: Option[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"swap" | "redo" | null>(null);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ message: string; upgrade?: boolean } | null>(null);

  async function send(body: object, kind: "swap" | "redo") {
    setBusy(kind);
    setError(null);
    const res = await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError({ message: data.error ?? "Something went wrong.", upgrade: data.upgrade });
      return;
    }
    setAsking(false);
    setNote("");
    router.refresh();
  }

  function swap(target: string) {
    const t = options.find((o) => o.index === Number(target));
    if (!t) return;
    if (t.blocked && !confirm(`Weekend ${t.index} is marked "stay put" (${t.destination}). Move this trip there anyway?`)) return;
    send({ action: "swap", a: index, b: t.index }, "swap");
  }

  return (
    <div className="mt-4 border-t border-navy/10 pt-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className={`${small} flex min-w-0 flex-1 items-center gap-2 text-navy-soft`}>
          <span className="whitespace-nowrap">Move to</span>
          <select
            value=""
            disabled={busy !== null}
            onChange={(e) => swap(e.target.value)}
            className="min-w-0 flex-1 truncate rounded-full border border-navy/15 bg-white/70 px-2 py-1 font-mono text-[10px] normal-case tracking-normal text-navy"
          >
            <option value="" disabled>
              {busy === "swap" ? "Moving…" : "weekend…"}
            </option>
            {options.map((o) => (
              <option key={o.index} value={o.index}>
                Wknd {String(o.index).padStart(2, "0")} · {o.label} · {o.destination}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setAsking((a) => !a)}
          disabled={busy !== null}
          className={`${small} whitespace-nowrap text-stamp hover:underline disabled:opacity-50`}
        >
          {busy === "redo" ? "Finding a new idea…" : "New idea"}
        </button>
      </div>
      {asking && busy !== "redo" && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send({ action: "redo", index, note }, "redo");
          }}
        >
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            placeholder="What would you rather do? (optional)"
            className="field !py-2 text-sm"
          />
          <button className="btn-primary !px-4 !py-2">Go</button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-stamp">
          {error.message}{" "}
          {error.upgrade && <Link href="/pricing" className="underline">Upgrade</Link>}
        </p>
      )}
    </div>
  );
}
