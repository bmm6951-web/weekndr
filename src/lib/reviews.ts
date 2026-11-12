import { db } from "./db";
import { cityKey, VIBES, type Vibe } from "./review-options";

export { cityKey, TAGS, VIBES, type Vibe } from "./review-options";

export type Review = {
  id: number;
  name: string;
  home_city: string;
  destination: string;
  country: string;
  rating: number;
  safety: number;
  vibe: Vibe;
  tags: string[];
  cost: string | null;
  currency: string;
  trip_month: string | null;
  body: string;
  created_at: Date;
};

export type ReviewSummary = {
  count: number;
  rating: number;
  safety: number;
  vibe: Vibe;
  quote: string;
  author: string;
};

const SELECT = `SELECT r.id, split_part(u.name, ' ', 1) AS name, r.home_city, r.destination, r.country, r.rating, r.safety,
  r.vibe, r.tags, r.cost, r.currency, r.trip_month, r.body, r.created_at
  FROM trip_reviews r JOIN users u ON u.id = r.user_id`;

export async function listReviews(homeKey?: string, limit = 60) {
  const pool = await db();
  const { rows } = homeKey
    ? await pool.query<Review>(`${SELECT} WHERE r.home_key = $1 ORDER BY r.created_at DESC LIMIT $2`, [homeKey, limit])
    : await pool.query<Review>(`${SELECT} ORDER BY r.created_at DESC LIMIT $1`, [limit]);
  return rows;
}

export async function homeCities() {
  const pool = await db();
  const { rows } = await pool.query<{ home_key: string; home_city: string; n: number }>(
    `SELECT home_key, MIN(home_city) AS home_city, COUNT(*)::int AS n
     FROM trip_reviews GROUP BY home_key ORDER BY n DESC LIMIT 20`,
  );
  return rows;
}

// Per-destination averages for one home city, keyed by destination.
export async function reviewSummaries(homeKey: string) {
  const reviews = await listReviews(homeKey, 500);
  const groups = new Map<string, Review[]>();
  for (const r of reviews) {
    const key = cityKey(r.destination);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const out = new Map<string, ReviewSummary>();
  for (const [key, rs] of groups) {
    const avg = (f: (r: Review) => number) => Math.round((rs.reduce((t, r) => t + f(r), 0) / rs.length) * 10) / 10;
    const vibeCounts = rs.reduce<Record<string, number>>((m, r) => ({ ...m, [r.vibe]: (m[r.vibe] ?? 0) + 1 }), {});
    const best = [...rs].sort((a, b) => b.rating - a.rating || +b.created_at - +a.created_at)[0];
    out.set(key, {
      count: rs.length,
      rating: avg((r) => r.rating),
      safety: avg((r) => r.safety),
      vibe: Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0][0] as Vibe,
      quote: best.body,
      author: best.name,
    });
  }
  return out;
}

// Compact digest of real student reviews for the AI planner's prompt.
export async function reviewsForPrompt(homeKey: string) {
  const reviews = await listReviews(homeKey, 40);
  return reviews
    .map(
      (r) =>
        `- ${r.destination}${r.country ? `, ${r.country}` : ""}: ${r.rating}/5 overall, safety ${r.safety}/5, vibe: ${VIBES[r.vibe] ?? r.vibe}` +
        `${r.tags.length ? `, good for ${r.tags.join("/")}` : ""}${r.cost ? `, spent about ${Math.round(Number(r.cost))} ${r.currency}` : ""}. "${r.body.replace(/\s+/g, " ").slice(0, 240)}"`,
    )
    .join("\n");
}
