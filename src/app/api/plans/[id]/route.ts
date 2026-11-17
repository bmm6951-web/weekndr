import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlannerError, regenerateWeekend, withDates, type PlanInput, type PlanResult, type PlanWeekend } from "@/lib/planner";

export const maxDuration = 120;

const REDO_LIMIT = { free: 3, plus: 40 }; // per plan

// The parts of a weekend that belong to its dates rather than to the trip.
const DATE_FIELDS = ["index", "label", "start_date", "end_date"] as const;

function shiftBookBy(bookBy: string | undefined, from: string, to: string) {
  if (!bookBy) return "";
  const shifted = new Date(Date.parse(`${bookBy}T00:00:00Z`) + (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)));
  const today = new Date().toISOString().slice(0, 10);
  const iso = shifted.toISOString().slice(0, 10);
  return iso < today ? today : iso;
}

function moveTrip(trip: PlanWeekend, slot: PlanWeekend): PlanWeekend {
  const moved: PlanWeekend = { ...trip };
  for (const f of DATE_FIELDS) (moved as Record<string, unknown>)[f] = slot[f];
  moved.book_by = trip.start_date && slot.start_date ? shiftBookBy(trip.book_by, trip.start_date, slot.start_date) : "";
  return moved;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  const planId = Number(id);

  const pool = await db();
  const { rows } = await pool.query<{ input: PlanInput; result: PlanResult; redo_count: number }>(
    "SELECT input, result, redo_count FROM plans WHERE id = $1 AND user_id = $2",
    [planId, user.id],
  );
  if (!rows[0]) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  const { input, redo_count } = rows[0];
  const plan = withDates(input, rows[0].result);
  const body = await request.json().catch(() => ({}));

  if (body.action === "swap") {
    const a = plan.weekends.findIndex((w) => w.index === Number(body.a));
    const b = plan.weekends.findIndex((w) => w.index === Number(body.b));
    if (a < 0 || b < 0 || a === b) return NextResponse.json({ error: "Pick two different weekends." }, { status: 400 });
    const [wa, wb] = [plan.weekends[a], plan.weekends[b]];
    plan.weekends[a] = moveTrip(wb, wa);
    plan.weekends[b] = moveTrip(wa, wb);

    // Saved prices were for the old dates, so clear them and swap any alerts along with the trips.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE plans SET result = $2 WHERE id = $1", [planId, plan]);
      await client.query(
        `UPDATE price_trackers SET weekend_index = CASE weekend_index WHEN $2::int THEN -1 ELSE -2 END
         WHERE plan_id = $1 AND weekend_index IN ($2::int, $3::int)`,
        [planId, wa.index, wb.index],
      );
      await client.query(
        `UPDATE price_trackers SET weekend_index = CASE weekend_index WHEN -1 THEN $3::int ELSE $2::int END,
           flight = NULL, stays = NULL, flight_price = NULL, stay_price = NULL,
           prev_flight_price = NULL, prev_stay_price = NULL, checked_at = NULL
         WHERE plan_id = $1 AND weekend_index IN (-1, -2)`,
        [planId, wa.index, wb.index],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "redo") {
    const index = Number(body.index);
    const limit = user.is_paid ? REDO_LIMIT.plus : REDO_LIMIT.free;
    if (redo_count >= limit) {
      return NextResponse.json(
        { error: user.is_paid ? "You've used all the new ideas for this plan." : `Free plans include ${limit} new ideas. Upgrade for more.`, upgrade: !user.is_paid },
        { status: 403 },
      );
    }
    const note = String(body.note ?? "").trim().slice(0, 300);
    try {
      const fresh = await regenerateWeekend(input, plan, index, note);
      plan.weekends = plan.weekends.map((w) => (w.index === index ? fresh : w));
      plan.estimated_total = plan.weekends.reduce((t, w) => t + (w.estimated_cost || 0), 0);
      await pool.query("UPDATE plans SET result = $2, redo_count = redo_count + 1 WHERE id = $1", [planId, plan]);
      await pool.query(
        `UPDATE price_trackers SET flight = NULL, stays = NULL, flight_price = NULL, stay_price = NULL,
           prev_flight_price = NULL, prev_stay_price = NULL, checked_at = NULL
         WHERE plan_id = $1 AND weekend_index = $2`,
        [planId, index],
      );
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof PlannerError) return NextResponse.json({ error: err.message }, { status: 502 });
      console.error("Weekend redo failed", err);
      return NextResponse.json({ error: "Couldn't get a new idea right now. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
