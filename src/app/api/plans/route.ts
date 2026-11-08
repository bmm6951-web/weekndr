import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { planAllowance } from "@/lib/limits";
import { generatePlan, PlannerError, type PlanInput } from "@/lib/planner";

export const maxDuration = 300; // the AI can take a minute or two for a full semester

const MAX_PDF_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const allowance = await planAllowance(user);
  if (!allowance.canCreate) {
    const error = user.is_paid
      ? "You've reached this month's fair-use limit. It resets on a rolling 30-day basis."
      : "Free accounts include 1 semester plan. Upgrade to Weekndr Plus for unlimited plans.";
    return NextResponse.json({ error, upgrade: !user.is_paid }, { status: 403 });
  }

  const form = await request.formData();
  const str = (key: string) => String(form.get(key) ?? "").trim();
  const currency = str("currency");
  const input: PlanInput = {
    homeCity: str("homeCity").slice(0, 100),
    startDate: str("startDate"),
    endDate: str("endDate"),
    totalBudget: Number(str("totalBudget")),
    currency: currency === "EUR" || currency === "GBP" ? currency : "USD",
    interests: form.getAll("interests").map(String).slice(0, 12),
    travelStyle: str("travelStyle").slice(0, 200) || "A balance of trips and weekends at home",
    calendarText: str("calendarText").slice(0, 20000),
    mustSee: str("mustSee").slice(0, 1000),
    leaveThursday: form.get("leaveThursday") === "on",
  };
  const other = str("otherInterests").slice(0, 300);
  if (other) input.interests.push(other);

  if (!input.homeCity) return NextResponse.json({ error: "Please enter the city you're studying in." }, { status: 400 });
  if (!DATE_RE.test(input.startDate) || !DATE_RE.test(input.endDate) || input.endDate <= input.startDate) {
    return NextResponse.json({ error: "Please enter a valid semester start and end date." }, { status: 400 });
  }
  if (!Number.isFinite(input.totalBudget) || input.totalBudget! < 100 || input.totalBudget! > 100000) {
    return NextResponse.json({ error: "Please enter a total travel budget between 100 and 100,000." }, { status: 400 });
  }

  let pdfBase64: string | undefined;
  const file = form.get("calendarFile");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Calendar uploads must be PDF files." }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "That PDF is over 4 MB. Try pasting the calendar text instead." }, { status: 400 });
    }
    pdfBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    input.calendarFileName = file.name.slice(0, 200);
  }

  try {
    const result = await generatePlan(input, pdfBase64);
    const pool = await db();
    const { rows } = await pool.query<{ id: number }>(
      "INSERT INTO plans (user_id, title, input, result) VALUES ($1, $2, $3, $4) RETURNING id",
      [user.id, result.title.slice(0, 200), input, result],
    );
    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if (error instanceof PlannerError) return NextResponse.json({ error: error.message }, { status: 502 });
    console.error("Plan generation failed", error);
    return NextResponse.json({ error: "Something went wrong while building your plan. Please try again." }, { status: 500 });
  }
}
