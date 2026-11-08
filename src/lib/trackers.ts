import { db } from "./db";
import { withDates, type PlanInput, type PlanResult, type PlanWeekend } from "./planner";
import { findFlight, findStays, type FlightOption, type PriceCheck, type StayOption } from "./prices";

export const MAX_ALERTS = 4; // keeps daily checks inside SerpApi's free monthly quota
export const RECHECK_HOURS = 3; // reuse a recent check instead of spending another search

export type TrackerRow = {
  id: number;
  user_id: number;
  plan_id: number;
  weekend_index: number;
  alerts_enabled: boolean;
  flight: FlightOption | null;
  stays: StayOption[] | null;
  flight_price: string | null;
  stay_price: string | null;
  prev_flight_price: string | null;
  prev_stay_price: string | null;
  checked_at: Date | null;
};

export async function loadTrip(userId: number, planId: number, index: number) {
  const pool = await db();
  const { rows } = await pool.query<{ input: PlanInput; result: PlanResult }>(
    "SELECT input, result FROM plans WHERE id = $1 AND user_id = $2",
    [planId, userId],
  );
  if (!rows[0]) return null;
  const plan = withDates(rows[0].input, rows[0].result);
  const weekend = plan.weekends.find((w) => w.index === index);
  if (!weekend || (weekend.type !== "trip" && weekend.type !== "long_trip") || !weekend.start_date || !weekend.end_date) {
    return null;
  }
  return { input: rows[0].input, weekend };
}

export async function checkPrices(input: PlanInput, w: PlanWeekend): Promise<PriceCheck> {
  const flies = w.transport_mode === "flight" && w.origin_airport && w.destination_airport;
  const [flight, stays] = await Promise.all([
    flies
      ? findFlight({
          from: w.origin_airport!,
          to: w.destination_airport!,
          depart: w.start_date!,
          ret: w.end_date!,
          currency: input.currency,
          eveningDeparture: Boolean(input.leaveThursday),
        })
      : Promise.resolve(null),
    findStays({ city: w.destination, country: w.country, checkIn: w.start_date!, checkOut: w.end_date!, currency: input.currency }),
  ]);
  return { flight, stays };
}

export async function saveCheck(userId: number, planId: number, index: number, check: PriceCheck) {
  const pool = await db();
  const cheapestStay = check.stays.length ? Math.min(...check.stays.map((s) => s.total)) : null;
  const { rows } = await pool.query<TrackerRow>(
    `INSERT INTO price_trackers (user_id, plan_id, weekend_index, flight, stays, flight_price, stay_price, checked_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (plan_id, weekend_index) DO UPDATE SET
       prev_flight_price = price_trackers.flight_price,
       prev_stay_price = price_trackers.stay_price,
       flight = EXCLUDED.flight, stays = EXCLUDED.stays,
       flight_price = EXCLUDED.flight_price, stay_price = EXCLUDED.stay_price,
       checked_at = NOW()
     RETURNING *`,
    [userId, planId, index, JSON.stringify(check.flight), JSON.stringify(check.stays), check.flight?.price ?? null, cheapestStay],
  );
  return rows[0];
}

export async function getTrackers(planId: number) {
  const pool = await db();
  const { rows } = await pool.query<TrackerRow>("SELECT * FROM price_trackers WHERE plan_id = $1", [planId]);
  return rows;
}

// A change worth an email: at least 5% and at least 5 units of currency.
export function significantChange(prev: string | null, next: string | null) {
  if (prev == null || next == null) return null;
  const a = Number(prev);
  const b = Number(next);
  const diff = b - a;
  if (Math.abs(diff) < 5 || Math.abs(diff) / a < 0.05) return null;
  return { from: a, to: b, diff };
}
