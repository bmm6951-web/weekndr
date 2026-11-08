// Live flight and lodging prices from Google Flights / Google Hotels via SerpApi.

export type FlightOption = {
  price: number;
  airline: string;
  depart: string; // "2027-01-21 18:05"
  arrive: string;
  stops: number;
  durationMin: number;
  url: string;
};

export type StayOption = {
  name: string;
  type: string;
  rating: number;
  reviews: number;
  total: number;
  perNight: number;
  url: string;
};

export type PriceCheck = { flight: FlightOption | null; stays: StayOption[] };

export class PriceError extends Error {}

const MAX_LAYOVER_MIN = 180;

type SerpLeg = {
  departure_airport?: { time?: string };
  arrival_airport?: { time?: string };
  airline?: string;
};
type SerpFlight = {
  flights?: SerpLeg[];
  layovers?: { duration?: number }[];
  total_duration?: number;
  price?: number;
};
type SerpHotel = {
  name?: string;
  type?: string;
  link?: string;
  overall_rating?: number;
  reviews?: number;
  rate_per_night?: { extracted_lowest?: number };
  total_rate?: { extracted_lowest?: number };
};

async function serp(params: Record<string, string>) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new PriceError("Live prices aren't set up yet (missing SERPAPI_API_KEY).");
  const base = process.env.SERPAPI_BASE_URL ?? "https://serpapi.com"; // overridable for local testing
  const res = await fetch(`${base}/search.json?${new URLSearchParams({ ...params, api_key: key })}`, {
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    // "hasn't returned any results" is a normal empty search, not a failure
    if (typeof data.error === "string" && /hasn't returned any results/i.test(data.error)) return {};
    throw new PriceError(`Price search failed${data.error ? `: ${data.error}` : ""}.`);
  }
  return data;
}

export async function findFlight(opts: {
  from: string;
  to: string;
  depart: string;
  ret: string;
  currency: string;
  eveningDeparture: boolean;
}): Promise<FlightOption | null> {
  const data = await serp({
    engine: "google_flights",
    departure_id: opts.from,
    arrival_id: opts.to,
    outbound_date: opts.depart,
    return_date: opts.ret,
    currency: opts.currency,
    hl: "en",
    type: "1", // round trip
    stops: "2", // 1 stop or fewer
    ...(opts.eveningDeparture ? { outbound_times: "16,23" } : {}),
  });
  const all: SerpFlight[] = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];
  const feasible = all
    .filter((f) => typeof f.price === "number" && f.flights?.length)
    .filter((f) => (f.layovers ?? []).every((l) => (l.duration ?? 0) <= MAX_LAYOVER_MIN))
    .sort((a, b) => a.price! - b.price!);
  const best = feasible[0];
  if (!best) return null;
  const legs = best.flights!;
  return {
    price: best.price!,
    airline: [...new Set(legs.map((l) => l.airline).filter(Boolean))].join(" + ") || "Airline",
    depart: legs[0].departure_airport?.time ?? "",
    arrive: legs[legs.length - 1].arrival_airport?.time ?? "",
    stops: legs.length - 1,
    durationMin: best.total_duration ?? 0,
    url: data.search_metadata?.google_flights_url ?? "",
  };
}

export async function findStays(opts: {
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  currency: string;
}): Promise<StayOption[]> {
  const data = await serp({
    engine: "google_hotels",
    q: `hostels and hotels in ${opts.city}${opts.country ? `, ${opts.country}` : ""}`,
    check_in_date: opts.checkIn,
    check_out_date: opts.checkOut,
    adults: "1",
    currency: opts.currency,
    hl: "en",
    rating: "8", // 4.0+
    sort_by: "3", // lowest price
  });
  const props: SerpHotel[] = data.properties ?? [];
  return props
    .filter((p) => p.name && (p.overall_rating ?? 0) >= 4 && (p.reviews ?? 0) >= 100)
    .filter((p) => typeof p.total_rate?.extracted_lowest === "number")
    .sort((a, b) => a.total_rate!.extracted_lowest! - b.total_rate!.extracted_lowest!)
    .slice(0, 3)
    .map((p) => ({
      name: p.name!,
      type: p.type ?? "hotel",
      rating: p.overall_rating!,
      reviews: p.reviews!,
      total: p.total_rate!.extracted_lowest!,
      perNight: p.rate_per_night?.extracted_lowest ?? 0,
      url: p.link ?? `https://www.google.com/travel/search?q=${encodeURIComponent(`${p.name} ${opts.city}`)}`,
    }));
}
