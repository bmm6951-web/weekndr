import Anthropic from "@anthropic-ai/sdk";
import { cityKey, reviewsForPrompt } from "./reviews";

// The model that powers the semester planner. Change it here to swap models.
export const PLANNER_MODEL = "claude-opus-5-5";

export type PlanInput = {
  homeCity: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalBudget?: number;
  budgetPerTrip?: number; // older plans only
  currency: "USD" | "EUR" | "GBP";
  mustSee?: string;
  leaveThursday?: boolean;
  interests: string[];
  travelStyle: string;
  calendarText: string;
  calendarFileName?: string;
};

export type WeekendType = "trip" | "long_trip" | "home" | "blocked";
export type TransportMode = "flight" | "train" | "bus" | "none";

export type PlanWeekend = {
  index: number;
  label: string;
  type: WeekendType;
  destination: string;
  country: string;
  headline: string;
  why_it_fits: string;
  getting_there: string;
  estimated_cost: number;
  cost_breakdown: string;
  tip: string;
  // Added in v2 plans; older plans may not have these.
  start_date?: string;
  end_date?: string;
  transport_mode?: TransportMode;
  origin_airport?: string;
  destination_airport?: string;
  where_to_stay?: string;
  book_by?: string;
};

export type PlanResult = {
  title: string;
  overview: string;
  estimated_total: number;
  weekends: PlanWeekend[];
  money_tips: string[];
};

export type Weekend = { index: number; start: string; end: string; label: string };

const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// Every weekend (Fri–Sun, or Thu–Sun) whose Saturday falls inside the semester.
// Computed in code (not by the AI) so the dates are always exactly right.
export function listWeekends(startDate: string, endDate: string, leaveThursday = false): Weekend[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const weekends: Weekend[] = [];
  const saturday = new Date(start);
  saturday.setUTCDate(saturday.getUTCDate() + ((6 - saturday.getUTCDay() + 7) % 7));
  while (saturday <= end) {
    const first = new Date(saturday);
    first.setUTCDate(first.getUTCDate() - (leaveThursday ? 2 : 1));
    const sunday = new Date(saturday);
    sunday.setUTCDate(sunday.getUTCDate() + 1);
    weekends.push({
      index: weekends.length + 1,
      start: first.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
      label: `${fmt(first)} – ${fmt(sunday)}`,
    });
    saturday.setUTCDate(saturday.getUTCDate() + 7);
  }
  return weekends;
}

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "overview", "estimated_total", "weekends", "money_tips"],
  properties: {
    title: { type: "string", description: "Short, upbeat plan title, e.g. 'Spring in Barcelona: 15 weekends, 9 cities'" },
    overview: { type: "string", description: "2-3 sentences summarizing the shape of the semester." },
    estimated_total: { type: "number", description: "Sum of estimated_cost across all weekends." },
    weekends: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "index", "label", "type", "destination", "country", "headline",
          "why_it_fits", "getting_there", "estimated_cost", "cost_breakdown", "tip",
          "transport_mode", "origin_airport", "destination_airport", "where_to_stay", "book_by",
        ],
        properties: {
          index: { type: "integer" },
          label: { type: "string", description: "Copy the weekend label exactly as given." },
          type: { type: "string", enum: ["trip", "long_trip", "home", "blocked"] },
          destination: { type: "string", description: "City or region. For home/blocked weekends, the home city." },
          country: { type: "string" },
          headline: { type: "string", description: "A few words, e.g. 'Pastéis and sunset trams'." },
          why_it_fits: { type: "string", description: "1-2 sentences tying the choice to THIS student's interests, budget, and calendar." },
          getting_there: { type: "string", description: "Realistic transport from the home city with typical travel time. 'N/A' if staying home." },
          estimated_cost: { type: "number", description: "Estimated total cost for the weekend in the student's currency." },
          cost_breakdown: { type: "string", description: "e.g. 'Transport ~€60 · Hostel 2 nights ~€50 · Food & activities ~€70'" },
          tip: { type: "string", description: "One practical, specific money-saving or planning tip." },
          transport_mode: { type: "string", enum: ["flight", "train", "bus", "none"], description: "Main way to get there. 'none' for home/blocked weekends." },
          origin_airport: { type: "string", description: "IATA code of the best departure airport for flights (e.g. 'BCN'), else empty string." },
          destination_airport: { type: "string", description: "IATA code of the best arrival airport for flights (e.g. 'LIS'), else empty string." },
          where_to_stay: { type: "string", description: "Safe, well-located neighborhood to stay in and what kind of place (hostel/hotel/apartment) suits the budget. Empty for home/blocked weekends." },
          book_by: { type: "string", description: "Recommended date to book transport and lodging, YYYY-MM-DD, before the trip. Empty string for home/blocked weekends." },
        },
      },
    },
    money_tips: { type: "array", items: { type: "string" }, description: "3-5 semester-wide budget tips." },
  },
} as const;

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£" } as const;

function buildPrompt(input: PlanInput, weekends: Weekend[], hasPdf: boolean, studentReviews: string) {
  const sym = SYMBOLS[input.currency];
  const budgetLine = input.totalBudget
    ? `Total travel budget for the whole semester: ${sym}${input.totalBudget} (${input.currency}), covering transport, lodging, food, and activities`
    : `Budget per weekend trip: about ${sym}${input.budgetPerTrip} (${input.currency})`;
  const calendarNote = hasPdf
    ? "The student's academic calendar is attached as a PDF above."
    : input.calendarText
      ? `<academic_calendar>\n${input.calendarText}\n</academic_calendar>`
      : "The student did not provide an academic calendar. Assume a typical semester: avoid travel on the final weekend (finals).";

  return `You are Weekndr, a travel planner for college students spending a semester abroad. Build this student's weekend-by-weekend travel plan for the whole semester.

Today's date: ${new Date().toISOString().slice(0, 10)}

## The student
- Home base while abroad: ${input.homeCity}
- Semester: ${input.startDate} to ${input.endDate}
- ${budgetLine}
- Trips leave: ${input.leaveThursday ? "Thursday evening (no Friday classes) and return Sunday" : "Friday and return Sunday"}
- Must-see places: ${input.mustSee ? input.mustSee : "none listed"}
- Interests: ${input.interests.length ? input.interests.join(", ") : "not specified"}
- Travel style: ${input.travelStyle}

## Academic calendar
${calendarNote}

## What real students studying in ${input.homeCity} said about their weekend trips
${studentReviews || "No student reviews yet for this city."}

## Every weekend of the semester (plan all of them, in this order, copying index and label exactly)
${weekends.map((w) => `${w.index}. ${w.label}`).join("\n")}

## How to plan
- Read the academic calendar carefully. Mark a weekend "blocked" if it overlaps exams, required program excursions, orientation, or classes on Friday/Saturday; say why in why_it_fits.
- If a weekend touches a break or holiday (e.g. spring break, a public holiday Friday/Monday), use type "long_trip" and pick somewhere farther or worth more days.
- Fit every must-see place into a weekend (or a long trip if it needs more time), at a good time of year for it. Mention in why_it_fits when a trip covers a must-see.
- Split the total budget across the semester: nearby or home weekends cost little, so pricier trips and long trips can get more. The sum of estimated_cost must not exceed the total budget.
- For each trip, set book_by to a realistic booking date: about 4-6 weeks before for budget flights, 8-10 weeks before for long trips and peak dates, and never before today or after the trip.
- For flights, give real IATA airport codes, choosing the cheapest sensible airports (e.g. budget-airline airports). For trains or buses, leave the airport codes empty.
- In where_to_stay, recommend a safe, central, well-reviewed area and the type of stay that fits the budget. Do not invent specific hostel or hotel names.
- Use "home" for some weekends to save money, recover, or explore the home city and nearby day trips. Match how often to the travel style. Give these real suggestions for what to do locally.
- Use "trip" for normal weekend trips. Don't repeat a destination. Start with closer, easier trips in the first weeks while the student settles in.
- Prefer destinations reachable by budget flights, trains, or buses from ${input.homeCity}, with realistic travel times. Factor in season and weather for the dates.
- Tie every recommendation to this student's interests. Be specific: name neighborhoods, foods, viewpoints, or free activities.
- All costs are estimates in ${input.currency}; round to whole numbers. Don't invent specific event dates or exact prices.
- Use the student reviews above as real-world evidence: favor highly rated trips, respect safety scores, and match each trip's vibe to this student (e.g. if they want safety or calm weekends, avoid nightlife-heavy picks). When a review shaped a pick, say so briefly in why_it_fits (e.g. "students from Barcelona rate it 4.8/5"). Only cite the reviews listed; never invent student opinions.
- Write in a warm, practical voice, like a friend who has studied abroad. Keep each field concise.`;
}

export class PlannerError extends Error {}

export async function generatePlan(input: PlanInput, pdfBase64?: string): Promise<PlanResult> {
  const weekends = listWeekends(input.startDate, input.endDate, input.leaveThursday);
  if (weekends.length === 0) throw new PlannerError("Your semester dates don't include any weekends.");
  if (weekends.length > 26) throw new PlannerError("Please choose a semester of 6 months or less.");

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new PlannerError("The AI planner isn't set up yet (missing ANTHROPIC_API_KEY).");
  }
  const client = new Anthropic();
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (pdfBase64) {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
    });
  }
  const studentReviews = await reviewsForPrompt(cityKey(input.homeCity)).catch(() => "");
  content.push({ type: "text", text: buildPrompt(input, weekends, Boolean(pdfBase64), studentReviews) });

  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await client.beta.messages.create({
      model: PLANNER_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: PLAN_SCHEMA } },
      messages: [{ role: "user", content }],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new PlannerError("The AI service isn't configured correctly (invalid API key).");
    } else if (error instanceof Anthropic.RateLimitError) {
      throw new PlannerError("The AI planner is busy right now. Please try again in a minute.");
    } else if (error instanceof Anthropic.BadRequestError) {
      throw new PlannerError("The AI couldn't read that request. If you uploaded a PDF, try pasting the calendar text instead.");
    } else if (error instanceof Anthropic.APIError) {
      throw new PlannerError(`The AI service returned an error (${error.status}). Please try again.`);
    }
    throw error;
  }

  if (response.stop_reason === "refusal") {
    throw new PlannerError("The AI couldn't create a plan from that input. Please check your calendar and try again.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new PlannerError("The plan was too long to finish. Try a shorter semester or a shorter calendar.");
  }
  const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
  if (!text) throw new PlannerError("The AI returned an empty plan. Please try again.");

  const plan = JSON.parse(text) as PlanResult;
  // Keep the dates from our own calendar math, whatever the model echoed back.
  const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  const today = new Date().toISOString().slice(0, 10);
  plan.weekends = plan.weekends.map((w, i) => {
    const wk = weekends[i];
    return {
      ...w,
      label: wk?.label ?? w.label,
      start_date: wk?.start,
      end_date: wk?.end,
      book_by:
        w.book_by && isDate(w.book_by) && (!wk || w.book_by < wk.start)
          ? (w.book_by < today ? today : w.book_by)
          : "",
      origin_airport: (w.origin_airport ?? "").toUpperCase().slice(0, 3),
      destination_airport: (w.destination_airport ?? "").toUpperCase().slice(0, 3),
    };
  });
  return plan;
}

// Older plans were saved before weekends stored their dates; fill them in.
export function withDates(input: PlanInput, plan: PlanResult): PlanResult {
  if (plan.weekends.every((w) => w.start_date && w.end_date)) return plan;
  const weekends = listWeekends(input.startDate, input.endDate, input.leaveThursday);
  return {
    ...plan,
    weekends: plan.weekends.map((w, i) => ({
      ...w,
      start_date: w.start_date ?? weekends[i]?.start,
      end_date: w.end_date ?? weekends[i]?.end,
    })),
  };
}
