import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { planToIcs } from "@/lib/ics";
import { withDates, type PlanInput, type PlanResult } from "@/lib/planner";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Please log in.", { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });

  const pool = await db();
  const { rows } = await pool.query<{ input: PlanInput; result: PlanResult }>(
    "SELECT input, result FROM plans WHERE id = $1 AND user_id = $2",
    [Number(id), user.id],
  );
  if (rows.length === 0) return new Response("Not found", { status: 404 });

  const { input, result } = rows[0];
  return new Response(planToIcs(Number(id), input, withDates(input, result)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="weekndr-semester-${id}.ics"`,
    },
  });
}
