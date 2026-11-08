import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { checkPrices, loadTrip, saveCheck, significantChange } from "@/lib/trackers";

export const maxDuration = 300;

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

// Runs daily (see vercel.json): re-checks every trip with alerts on and emails price changes.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = await db();
  const { rows } = await pool.query<{ user_id: number; plan_id: number; weekend_index: number; email: string; name: string }>(
    `SELECT t.user_id, t.plan_id, t.weekend_index, u.email, u.name
     FROM price_trackers t JOIN users u ON u.id = t.user_id
     WHERE t.alerts_enabled AND u.is_paid
     ORDER BY t.checked_at NULLS FIRST`,
  );

  const today = new Date().toISOString().slice(0, 10);
  const results = [];
  for (const t of rows) {
    try {
      const trip = await loadTrip(t.user_id, t.plan_id, t.weekend_index);
      if (!trip || trip.weekend.start_date! <= today) continue; // trip already happened
      const saved = await saveCheck(t.user_id, t.plan_id, t.weekend_index, await checkPrices(trip.input, trip.weekend));
      const sym = SYMBOLS[trip.input.currency] ?? "";
      const changes = [
        ["Round-trip flight", significantChange(saved.prev_flight_price, saved.flight_price)],
        ["Cheapest well-rated stay", significantChange(saved.prev_stay_price, saved.stay_price)],
      ].filter(([, c]) => c) as [string, { from: number; to: number; diff: number }][];

      if (changes.length) {
        const w = trip.weekend;
        const lines = changes
          .map(([label, c]) => `<li><b>${label}</b>: ${sym}${c.from} → <b>${sym}${c.to}</b> (${c.diff < 0 ? "▼ down" : "▲ up"} ${sym}${Math.abs(Math.round(c.diff))})</li>`)
          .join("");
        const origin = new URL(request.url).origin;
        await sendEmail(
          t.email,
          `${changes.some(([, c]) => c.diff < 0) ? "Price drop" : "Price change"}: ${w.destination} (${w.label})`,
          `<p>Hi ${t.name.split(" ")[0]},</p><p>Prices moved for your <b>${w.destination}</b> trip (${w.label}):</p><ul>${lines}</ul>` +
            `<p><a href="${origin}/plan/${t.plan_id}">See live options on Weekndr</a></p>`,
        );
      }
      results.push({ plan: t.plan_id, weekend: t.weekend_index, emailed: changes.length > 0 });
    } catch (err) {
      console.error("Price alert check failed", t, err);
      results.push({ plan: t.plan_id, weekend: t.weekend_index, error: true });
    }
  }
  return NextResponse.json({ checked: results.length, results });
}
