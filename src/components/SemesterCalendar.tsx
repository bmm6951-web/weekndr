import type { PlanWeekend } from "@/lib/planner";

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const COLORS: Record<PlanWeekend["type"], string> = {
  trip: "bg-sea text-cream",
  long_trip: "bg-stamp text-cream",
  home: "bg-sky text-navy",
  blocked: "bg-navy/15 text-navy-soft",
};

// Month-by-month grid of the semester, with each weekend colored by type.
export default function SemesterCalendar({
  weekends,
  startDate,
  endDate,
}: {
  weekends: PlanWeekend[];
  startDate: string;
  endDate: string;
}) {
  const byDay = new Map<string, { w: PlanWeekend; first: boolean }>();
  for (const w of weekends) {
    if (!w.start_date || !w.end_date) continue;
    for (let t = Date.parse(`${w.start_date}T00:00:00Z`); t <= Date.parse(`${w.end_date}T00:00:00Z`); t += DAY_MS) {
      const key = iso(new Date(t));
      byDay.set(key, { w, first: key === w.start_date });
    }
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const months: Date[] = [];
  for (let m = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); m <= end; m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))) {
    months.push(m);
  }

  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((month) => {
          const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
          const lead = (month.getUTCDay() + 6) % 7; // Monday-first
          return (
            <div key={iso(month)} className="break-inside-avoid">
              <p className="mb-3 font-serif text-3xl">
                {month.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="pb-1 text-navy-soft">{d}</span>
                ))}
                {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const key = iso(new Date(month.getTime() + i * DAY_MS));
                  const hit = byDay.get(key);
                  const inSemester = key >= startDate && key <= endDate;
                  return (
                    <span
                      key={key}
                      title={hit ? `${hit.w.label}: ${hit.w.destination}` : undefined}
                      className={`flex h-12 flex-col items-start rounded-sm p-1 text-left ${
                        hit ? COLORS[hit.w.type] : inSemester ? "bg-white/50" : "text-navy/25"
                      }`}
                    >
                      <span>{i + 1}</span>
                      {hit?.first && <span className="w-full truncate text-[9px] leading-tight">{hit.w.destination}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.2em] text-navy-soft">
        {[
          ["Trip", COLORS.trip],
          ["Long weekend", COLORS.long_trip],
          ["Home base", COLORS.home],
          ["Stay put", COLORS.blocked],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
