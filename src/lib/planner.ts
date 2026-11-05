import Anthropic from "@anthropic-ai/sdk";

// The model that powers the semester planner. Change it here to swap models.
export const PLANNER_MODEL = "claude-opus-5-5";

export type PlanInput = {
  homeCity: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  budgetPerTrip: number;
  currency: "USD" | "EUR" | "GBP";
  interests: string[];
  travelStyle: string;
  calendarText: string;
  calendarFileName?: string;
};

export type WeekendType = "trip" | "long_trip" | "home" | "blocked";

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
};

export type PlanResult = {
  title: string;
  overview: string;
  estimated_total: number;
  weekends: PlanWeekend[];
  money_tips: string[];
};

export type Weekend = { index: number; friday: string; label: string };

const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// Every Fri–Sun weekend whose Saturday falls inside the semester. Computed in code
// (not by the AI) so the dates are always exactly right.
export function listWeekends(startDate: string, endDate: string): Weekend[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const weekends: Weekend[] = [];
  const saturday = new Date(start);
  saturday.setUTCDate(saturday.getUTCDate() + ((6 - saturday.getUTCDay() + 7) % 7));
  while (saturday <= end) {
    const friday = new Date(saturday);
    friday.setUTCDate(friday.getUTCDate() - 1);
    const sunday = new Date(saturday);
    sunday.setUTCDate(sunday.getUTCDate() + 1);
    weekends.push({
      index: weekends.length + 1,
      friday: friday.toISOString().slice(0, 10),
      label: `${fmt(friday)} – ${fmt(sunday)}`,
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
        },
      },
    },
    money_tips: { type: "array", items: { type: "string" }, description: "3-5 semester-wide budget tips." },
  },
} as const;

const SYMBOLS = { USD: "$", EUR: "€", GBP: "£" } as const;

function buildPrompt(input: PlanInput, weekends: Weekend[], hasPdf: boolean) {
  const sym = SYMBOLS[input.currency];
  const calendarNote = hasPdf
    ? "The student's academic calendar is attached as a PDF above."
    : input.calendarText
      ? `<academic_calendar>\n${input.calendarText}\n</academic_calendar>`
      : "The student did not provide an academic calendar. Assume a typical semester: avoid travel on the final weekend (finals).";

  return `You are Weekndr, a travel planner for college students spending a semester abroad. Build this student's weekend-by-weekend travel plan for the whole semester.

## The student
- Home base while abroad: ${input.homeCity}
- Semester: ${input.startDate} to ${input.endDate}
- Budget per weekend trip: about ${sym}${input.budgetPerTrip} (${input.currency}), covering transport, lodging, food, and activities
- Interests: ${input.interests.length ? input.interests.join(", ") : "not specified"}
- Travel style: ${input.travelStyle}

## Academic calendar
${calendarNote}

## Every weekend of the semester (plan all of them, in this order, copying index and label exactly)
${weekends.map((w) => `${w.index}. ${w.label}`).join("\n")}

## How to plan
- Read the academic calendar carefully. Mark a weekend "blocked" if it overlaps exams, required program excursions, orientation, or classes on Friday/Saturday; say why in why_it_fits.
- If a weekend touches a break or holiday (e.g. spring break, a public holiday Friday/Monday), use type "long_trip" and pick somewhere farther or worth more days; its budget can be up to 2.5x the normal trip budget.
- Use "home" for some weekends to save money, recover, or explore the home city and nearby day trips. Match how often to the travel style. Give these real suggestions for what to do locally.
- Use "trip" for normal weekend trips. Don't repeat a destination. Start with closer, easier trips in the first weeks while the student settles in.
- Keep each trip near the budget. Prefer destinations reachable by budget flights, trains, or buses from ${input.homeCity}, with realistic travel times. Factor in season and weather for the dates.
- Tie every recommendation to this student's interests. Be specific: name neighborhoods, foods, viewpoints, or free activities.
- All costs are estimates in ${input.currency}; round to whole numbers. Don't invent specific event dates or exact prices.
- Write in a warm, practical voice, like a friend who has studied abroad. Keep each field concise.`;
}

export class PlannerError extends Error {}

export async function generatePlan(input: PlanInput, pdfBase64?: string): Promise<PlanResult> {
  const weekends = listWeekends(input.startDate, input.endDate);
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
  content.push({ type: "text", text: buildPrompt(input, weekends, Boolean(pdfBase64)) });

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
  plan.weekends = plan.weekends.map((w, i) => ({ ...w, label: weekends[i]?.label ?? w.label }));
  return plan;
}
