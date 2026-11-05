import type { User } from "./auth";
import { db } from "./db";

export const FREE_PLAN_LIMIT = 1; // lifetime plans on the free tier
export const PAID_MONTHLY_LIMIT = 60; // fair-use cap for Weekndr Plus

export async function planAllowance(user: User) {
  const pool = await db();
  if (user.is_paid) {
    const { rows } = await pool.query<{ n: number }>(
      "SELECT COUNT(*)::int AS n FROM plans WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'",
      [user.id],
    );
    return { used: rows[0].n, limit: PAID_MONTHLY_LIMIT, canCreate: rows[0].n < PAID_MONTHLY_LIMIT };
  }
  const { rows } = await pool.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM plans WHERE user_id = $1", [user.id]);
  return { used: rows[0].n, limit: FREE_PLAN_LIMIT, canCreate: rows[0].n < FREE_PLAN_LIMIT };
}
