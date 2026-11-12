// Shared by the browser-side review form and the server; no database code here.

export const VIBES = {
  chill: "Chill & easygoing",
  balanced: "A bit of everything",
  nightlife: "Great nightlife",
} as const;
export type Vibe = keyof typeof VIBES;

export const TAGS = ["Food", "Beaches", "Culture", "Nature", "Nightlife", "Budget-friendly", "Day trips", "Solo-friendly"];

// "Barcelona, Spain" and "barcelona" both become "barcelona".
export function cityKey(city: string) {
  return city
    .split(",")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}
