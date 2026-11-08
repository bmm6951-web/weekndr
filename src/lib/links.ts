// Pre-filled search links for each trip. Prices are always live on the
// partner sites, so clicking a link is the "refresh".

const enc = encodeURIComponent;
const yymmdd = (iso: string) => iso.slice(2).replaceAll("-", "");

export type LinkItem = { label: string; href: string };

export function flightLinks(from: string, to: string, depart: string, ret: string): LinkItem[] {
  return [
    {
      label: "Google Flights",
      href: `https://www.google.com/travel/flights?q=${enc(`Flights from ${from} to ${to} on ${depart} through ${ret}`)}`,
    },
    {
      label: "Skyscanner",
      href: `https://www.skyscanner.com/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${yymmdd(depart)}/${yymmdd(ret)}/`,
    },
    { label: "Kayak", href: `https://www.kayak.com/flights/${from}-${to}/${depart}/${ret}` },
  ];
}

export function groundLinks(fromCity: string, toCity: string): LinkItem[] {
  return [{ label: "Trains & buses (Rome2Rio)", href: `https://www.rome2rio.com/map/${enc(fromCity)}/${enc(toCity)}` }];
}

export function stayLinks(city: string, country: string, checkin: string, checkout: string): LinkItem[] {
  const place = country ? `${city}, ${country}` : city;
  const booking = (filter: string) =>
    `https://www.booking.com/searchresults.html?ss=${enc(place)}&checkin=${checkin}&checkout=${checkout}` +
    `&group_adults=1&no_rooms=1&nflt=${enc(filter)}`;
  return [
    // ht_id=203 hostels, 204 hotels; review_score=80 keeps places rated 8+
    { label: "Hostels 8+", href: booking("ht_id=203;review_score=80") },
    { label: "Hotels 8+", href: booking("ht_id=204;review_score=80") },
    { label: "Airbnb", href: `https://www.airbnb.com/s/${enc(place)}/homes?checkin=${checkin}&checkout=${checkout}&adults=1` },
  ];
}
