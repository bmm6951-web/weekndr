"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { cityKey, TAGS, VIBES } from "@/lib/review-options";

export type ReviewState = { error?: string };

export async function submitReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await requireUser();
  const str = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

  const homeCity = str("homeCity", 100);
  const destination = str("destination", 100);
  const country = str("country", 60);
  const rating = Number(form.get("rating"));
  const safety = Number(form.get("safety"));
  const vibe = str("vibe", 20);
  const tags = form.getAll("tags").map(String).filter((t) => TAGS.includes(t));
  const costRaw = str("cost", 10);
  const cost = costRaw ? Number(costRaw) : null;
  const currency = ["EUR", "USD", "GBP"].includes(str("currency", 3)) ? str("currency", 3) : "EUR";
  const tripMonth = /^\d{4}-\d{2}$/.test(str("tripMonth", 7)) ? str("tripMonth", 7) : null;
  const body = str("body", 600);

  if (!homeCity || !destination) return { error: "Please enter where you studied and where you went." };
  if (![1, 2, 3, 4, 5].includes(rating) || ![1, 2, 3, 4, 5].includes(safety)) return { error: "Please rate the trip and how safe it felt." };
  if (!(vibe in VIBES)) return { error: "Please pick the vibe." };
  if (cost != null && (!Number.isFinite(cost) || cost < 0 || cost > 20000)) return { error: "Please enter a realistic cost." };
  if (body.length < 20) return { error: "Tell other students a bit more (at least 20 characters)." };

  const pool = await db();
  await pool.query(
    `INSERT INTO trip_reviews (user_id, home_city, home_key, destination, dest_key, country, rating, safety, vibe, tags, cost, currency, trip_month, body)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (user_id, home_key, dest_key) DO UPDATE SET
       home_city = EXCLUDED.home_city, destination = EXCLUDED.destination, country = EXCLUDED.country,
       rating = EXCLUDED.rating, safety = EXCLUDED.safety, vibe = EXCLUDED.vibe, tags = EXCLUDED.tags,
       cost = EXCLUDED.cost, currency = EXCLUDED.currency, trip_month = EXCLUDED.trip_month, body = EXCLUDED.body,
       created_at = NOW()`,
    [user.id, homeCity, cityKey(homeCity), destination, cityKey(destination), country, rating, safety, vibe, tags, cost, currency, tripMonth, body],
  );
  redirect(`/community?from=${encodeURIComponent(cityKey(homeCity))}&posted=1`);
}
