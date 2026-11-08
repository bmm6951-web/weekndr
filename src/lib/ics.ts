import type { PlanInput, PlanResult } from "./planner";

// Builds an iCalendar (.ics) file that Google, Apple, and Outlook calendars can import.

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const day = (iso: string) => iso.replaceAll("-", "");
const nextDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

// Lines longer than 75 octets must be folded (RFC 5545).
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 74;
    while (Buffer.byteLength(rest.slice(0, cut)) > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function planToIcs(planId: number, input: PlanInput, plan: PlanResult) {
  const sym = { USD: "$", EUR: "€", GBP: "£" }[input.currency] ?? "$";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Weekndr//Semester Plan//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${esc(`Weekndr: ${plan.title}`)}`,
  ];

  for (const w of plan.weekends) {
    if (!w.start_date || !w.end_date) continue;
    const isTrip = w.type === "trip" || w.type === "long_trip";
    const summary = isTrip
      ? `✈ ${w.destination} (${sym}${Math.round(w.estimated_cost)})`
      : w.type === "blocked"
        ? `Stay put: ${w.headline}`
        : `Home base: ${w.headline}`;
    const description = [w.why_it_fits, isTrip ? `Getting there: ${w.getting_there}` : "", w.where_to_stay ? `Stay: ${w.where_to_stay}` : "", w.tip ? `Tip: ${w.tip}` : ""]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:weekndr-${planId}-wk${w.index}@weekndr`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(w.start_date)}`,
      `DTEND;VALUE=DATE:${day(nextDay(w.end_date))}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(description)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
    if (isTrip && w.book_by) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:weekndr-${planId}-book${w.index}@weekndr`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${day(w.book_by)}`,
        `DTEND;VALUE=DATE:${day(nextDay(w.book_by))}`,
        `SUMMARY:${esc(`Book ${w.destination} trip (${w.label})`)}`,
        `DESCRIPTION:${esc(`Book transport and a place to stay for ${w.destination}. Budget about ${sym}${Math.round(w.estimated_cost)}.`)}`,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${esc(`Book your ${w.destination} trip`)}`,
        "TRIGGER:PT9H",
        "END:VALARM",
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
