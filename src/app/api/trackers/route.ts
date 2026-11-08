import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PriceError } from "@/lib/prices";
import { checkPrices, loadTrip, MAX_ALERTS, RECHECK_HOURS, saveCheck, type TrackerRow } from "@/lib/trackers";

export const maxDuration = 60;

async function readBody(request: Request) {
  const body = await request.json().catch(() => ({}));
  return { planId: Number(body.planId), index: Number(body.index), enabled: Boolean(body.enabled) };
}

async function plusUser() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Please log in first." }, { status: 401 }) };
  if (!user.is_paid) {
    return { error: NextResponse.json({ error: "Live prices and alerts are part of Weekndr Plus.", upgrade: true }, { status: 403 }) };
  }
  return { user };
}

// Check live prices for one trip now (reuses a check from the last few hours).
export async function POST(request: Request) {
  const { user, error } = await plusUser();
  if (error) return error;
  const { planId, index } = await readBody(request);
  const trip = await loadTrip(user.id, planId, index);
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  const pool = await db();
  const { rows } = await pool.query<TrackerRow>(
    `SELECT * FROM price_trackers WHERE plan_id = $1 AND weekend_index = $2
     AND checked_at > NOW() - make_interval(hours => $3)`,
    [planId, index, RECHECK_HOURS],
  );
  if (rows[0]) return NextResponse.json({ tracker: rows[0] });

  try {
    const check = await checkPrices(trip.input, trip.weekend);
    return NextResponse.json({ tracker: await saveCheck(user.id, planId, index, check) });
  } catch (err) {
    if (err instanceof PriceError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("Price check failed", err);
    return NextResponse.json({ error: "Couldn't check prices right now. Please try again." }, { status: 500 });
  }
}

// Turn daily price-change emails on or off for one trip.
export async function PATCH(request: Request) {
  const { user, error } = await plusUser();
  if (error) return error;
  const { planId, index, enabled } = await readBody(request);
  const trip = await loadTrip(user.id, planId, index);
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  const pool = await db();
  if (enabled) {
    const { rows } = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM price_trackers
       WHERE user_id = $1 AND alerts_enabled AND NOT (plan_id = $2 AND weekend_index = $3)`,
      [user.id, planId, index],
    );
    if (rows[0].n >= MAX_ALERTS) {
      return NextResponse.json(
        { error: `You can track up to ${MAX_ALERTS} trips at a time. Turn one off first.` },
        { status: 400 },
      );
    }
  }
  const { rows } = await pool.query<TrackerRow>(
    `INSERT INTO price_trackers (user_id, plan_id, weekend_index, alerts_enabled) VALUES ($1, $2, $3, $4)
     ON CONFLICT (plan_id, weekend_index) DO UPDATE SET alerts_enabled = EXCLUDED.alerts_enabled
     RETURNING *`,
    [user.id, planId, index, enabled],
  );
  return NextResponse.json({ tracker: rows[0] });
}
