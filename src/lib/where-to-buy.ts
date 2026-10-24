/**
 * Where to Buy: the outlet data and the search behind /where-to-buy.
 *
 * Pilot data is Bengaluru only, built from the internal sample-stand master
 * by scripts/build-dealers-bangalore.py (public business details only).
 * Everything here is pure, so the page can rank on the server for the first
 * paint and again in the browser as the visitor searches.
 *
 * Ranking (owner's brief): an exact PIN or area match first, then distance
 * from what was searched (the PIN's or locality's centre, or the visitor's
 * own location), then name.
 */
import dealerData from "@/data/dealers-bangalore.json";
import placeData from "@/data/bangalore-places.json";

export type DealerType =
  | "dealer"
  | "distributor"
  | "kitchen-studio"
  | "interior-studio";

export interface Dealer {
  id: string;
  name: string;
  type: DealerType;
  typeLabel: string;
  /** Street address without city/PIN; empty when the master names only an area. */
  address: string;
  area: string;
  pin: string;
  city: string;
  phone: { display: string; href: string } | null;
  lat: number;
  lng: number;
  /** How the position was found: the team's own map pin, the street
   *  address, the locality, or only the PIN code's centre. */
  geo: "pin" | "address" | "area" | "pin-code";
  /** Pacific samples (a sample stand) on show. */
  samples: boolean;
  /** Full display slabs or a display wall on show. */
  slabs: boolean;
  /** Colours on the display slabs or wall, as recorded. */
  onDisplay: string[];
}

export interface Locality {
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
}

export const DEALERS = dealerData.dealers as Dealer[];
export const PIN_CENTRES: Record<string, number[]> = placeData.pins;
export const LOCALITIES = placeData.localities as Locality[];

export const TYPE_ORDER: {
  value: DealerType;
  label: string;
  plural: string;
}[] = [
  { value: "dealer", label: "Dealer", plural: "Dealers" },
  { value: "distributor", label: "Distributor", plural: "Distributors" },
  {
    value: "kitchen-studio",
    label: "Kitchen studio",
    plural: "Kitchen studios",
  },
  {
    value: "interior-studio",
    label: "Interior studio",
    plural: "Interior studios",
  },
];

/** Lower case, letters and digits only: "J. P. Nagar" and "jp nagar" meet. */
export const squash = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Lower case words separated by single spaces, padded: " j p nagar ". */
const spaced = (s: string) =>
  ` ${s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

/** Does an address name a place: as whole words ("Agara" is not inside
 *  "Sadashivanagar"), or squeezed when the name is long ("JP Nagar"). */
function namesPlace(address: string, alias: string) {
  if (spaced(address).includes(spaced(alias))) return true;
  const sa = squash(alias);
  return sa.length >= 8 && squash(address).includes(sa);
}

const CITY_WORDS = /\b(bengaluru|bangalore|blr|karnataka|india)\b/gi;

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Origin {
  lat: number;
  lng: number;
  /** For the results line: "560102", "HSR Layout", "your location". */
  label: string;
  kind: "pin" | "area" | "name" | "geo";
}

export interface SearchResult {
  /** What the query was understood as, or null for "everything". */
  origin: Origin | null;
  /** Outlet ids that match the query exactly (PIN, area, name or street). */
  exact: Set<string>;
  /** The query was not empty but matched nothing we know. */
  unknown: boolean;
  /** The query named the city itself ("Bengaluru"): show everything. */
  wholeCity: boolean;
  /** A six-digit PIN outside the pilot's coverage. */
  outsidePin: boolean;
}

const EMPTY: SearchResult = {
  origin: null,
  exact: new Set(),
  unknown: false,
  wholeCity: false,
  outsidePin: false,
};

function centroid(list: Dealer[]) {
  return {
    lat: list.reduce((s, d) => s + d.lat, 0) / list.length,
    lng: list.reduce((s, d) => s + d.lng, 0) / list.length,
  };
}

/** The locality a query names, best match first: exact alias, then prefix. */
export function findLocality(q: string): Locality | null {
  const s = squash(q);
  if (s.length < 3) return null;
  let prefix: Locality | null = null;
  for (const l of LOCALITIES) {
    for (const a of l.aliases.concat(l.name)) {
      const sa = squash(a);
      if (sa === s) return l;
      if (!prefix && sa.startsWith(s)) prefix = l;
    }
  }
  if (prefix) return prefix;
  // "HSR Layout Sector 2" or "jayanagar 4th block": the longest alias inside.
  let best: { l: Locality; n: number } | null = null;
  for (const l of LOCALITIES) {
    for (const a of l.aliases.concat(l.name)) {
      const sa = squash(a);
      if (sa.length >= 6 && s.includes(sa) && (!best || sa.length > best.n))
        best = { l, n: sa.length };
    }
  }
  return best?.l ?? null;
}

export function interpret(
  query: string,
  dealers: Dealer[] = DEALERS
): SearchResult {
  const raw = query.trim();
  if (!raw) return EMPTY;

  // PIN code, whole or partial.
  const digits = raw.replace(/\s+/g, "");
  if (/^\d{3,6}$/.test(digits)) {
    const hits = dealers.filter((d) => d.pin.startsWith(digits));
    const exact = new Set(hits.map((d) => d.id));
    if (digits.length === 6) {
      const c = PIN_CENTRES[digits];
      const at = c
        ? { lat: c[0], lng: c[1] }
        : hits.length
          ? centroid(hits)
          : null;
      if (!at) return { ...EMPTY, unknown: true, outsidePin: true };
      return { ...EMPTY, origin: { ...at, label: digits, kind: "pin" }, exact };
    }
    if (!hits.length) return { ...EMPTY, unknown: true };
    return {
      ...EMPTY,
      origin: { ...centroid(hits), label: `PIN ${digits}…`, kind: "pin" },
      exact,
    };
  }

  const text = raw.replace(CITY_WORDS, " ").replace(/[,]+/g, " ").trim();
  const s = squash(text);
  if (!s) return { ...EMPTY, wholeCity: true };

  // An area of the city.
  const place = findLocality(text);
  if (place) {
    const aliases = place.aliases.concat(place.name);
    const exact = new Set(
      dealers
        .filter(
          (d) =>
            d.area === place.name ||
            aliases.some((a) => namesPlace(d.address, a))
        )
        .map((d) => d.id)
    );
    return {
      ...EMPTY,
      origin: {
        lat: place.lat,
        lng: place.lng,
        label: place.name,
        kind: "area",
      },
      exact,
    };
  }

  // A business by name, or a street in an address.
  const byName = dealers.filter((d) => squash(d.name).includes(s));
  const byStreet =
    s.length >= 4 ? dealers.filter((d) => squash(d.address).includes(s)) : [];
  const hits = byName.length ? byName : byStreet;
  if (hits.length) {
    const at = hits.length === 1 ? hits[0] : centroid(hits);
    return {
      ...EMPTY,
      origin: {
        lat: at.lat,
        lng: at.lng,
        label: hits.length === 1 ? hits[0].name : raw,
        kind: "name",
      },
      exact: new Set(hits.map((d) => d.id)),
    };
  }
  return { ...EMPTY, unknown: true };
}

export interface Ranked {
  dealer: Dealer;
  exact: boolean;
  km: number | null;
}

/** Exact matches first, then nearest to the origin, then by name. */
export function rank(
  dealers: Dealer[],
  search: SearchResult,
  origin: Origin | null = search.origin
): Ranked[] {
  return dealers
    .map((dealer) => ({
      dealer,
      exact: search.exact.has(dealer.id),
      km: origin ? distanceKm(origin, dealer) : null,
    }))
    .sort(
      (a, b) =>
        Number(b.exact) - Number(a.exact) ||
        (a.km ?? 0) - (b.km ?? 0) ||
        a.dealer.name.localeCompare(b.dealer.name, "en", {
          sensitivity: "base",
        })
    );
}

/** Google Maps directions, no key: the outlet's own pin when we have it,
 *  otherwise its name and address (or area), which Maps resolves to the
 *  business better than our approximate point. */
export function directionsUrl(d: Dealer) {
  const destination =
    d.geo === "pin"
      ? `${d.lat},${d.lng}`
      : [d.name, d.address, d.area, `${d.city} ${d.pin}`.trim()]
          .filter(Boolean)
          .join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function fullAddress(d: Dealer) {
  const tail = `${d.city}${d.pin ? ` ${d.pin}` : ""}`;
  if (d.address) return `${d.address}, ${tail}`;
  return `${d.area}, ${tail}`;
}

export function formatKm(km: number) {
  if (km < 1) return `${Math.max(0.1, Math.round(km * 10) / 10)} km`;
  if (km < 20) return `${Math.round(km * 10) / 10} km`;
  return `${Math.round(km)} km`;
}

/* ---- Who is looking, and for what ---------------------------------------
 * The form at the top of /where-to-buy (like Cosentino's) asks who the
 * visitor is and what they want before it lists anything, and shows only
 * the outlets that suit them: homeowners see showrooms with Pacific on
 * display, the trade sees where Pacific is stocked.
 */

export type Audience =
  | "homeowner"
  | "designer"
  | "studio"
  | "builder"
  | "trade";
export type Interest =
  | "kitchen"
  | "bath"
  | "floors-walls"
  | "facades"
  | "sills"
  | "browsing";

export const AUDIENCES: {
  value: Audience;
  label: string;
  /** For the results line: "for homeowners". */
  plural: string;
  types: DealerType[];
  /** Only outlets with samples or slabs on show. */
  needsDisplay: boolean;
}[] = [
  {
    value: "homeowner",
    label: "Homeowner",
    plural: "homeowners",
    types: ["dealer", "kitchen-studio", "interior-studio"],
    needsDisplay: true,
  },
  {
    value: "designer",
    label: "Architect or interior designer",
    plural: "architects and designers",
    types: ["dealer", "kitchen-studio", "interior-studio", "distributor"],
    needsDisplay: false,
  },
  {
    value: "studio",
    label: "Kitchen or interior studio",
    plural: "kitchen and interior studios",
    types: ["distributor", "dealer"],
    needsDisplay: false,
  },
  {
    value: "builder",
    label: "Builder or developer",
    plural: "builders and developers",
    types: ["distributor", "dealer"],
    needsDisplay: false,
  },
  {
    value: "trade",
    label: "Fabricator or dealer",
    plural: "fabricators and dealers",
    types: ["distributor"],
    needsDisplay: false,
  },
];

export const INTERESTS: {
  value: Interest;
  label: string;
  /** The contact form's "Looking for" value, for the enquiry. */
  application: string;
  /** Studios fit out kitchens and bathrooms; stone for floors, walls,
   *  facades and sills is bought from dealers. */
  studios: boolean;
}[] = [
  {
    value: "kitchen",
    label: "Kitchen worktops",
    application: "kitchen-countertops",
    studios: true,
  },
  {
    value: "bath",
    label: "Bathrooms and vanities",
    application: "vanity-tops",
    studios: true,
  },
  {
    value: "floors-walls",
    label: "Flooring and walls",
    application: "flooring",
    studios: false,
  },
  {
    value: "facades",
    label: "Facades and outdoor",
    application: "wall-cladding",
    studios: false,
  },
  {
    value: "sills",
    label: "Window sills",
    application: "window-sills-thresholds",
    studios: false,
  },
  { value: "browsing", label: "Just browsing", application: "", studios: true },
];

export const audienceOf = (v: string | null) =>
  AUDIENCES.find((a) => a.value === v) ?? null;
export const interestOf = (v: string | null) =>
  INTERESTS.find((i) => i.value === v) ?? null;

/** The outlet types that suit a visitor and what they want. */
export function typesFor(
  who: Audience,
  interest: Interest | null
): DealerType[] {
  const a = audienceOf(who)!;
  const i = interest ? interestOf(interest) : null;
  if (!i || i.studios) return a.types;
  const narrowed = a.types.filter(
    (t) => t !== "kitchen-studio" && t !== "interior-studio"
  );
  return narrowed.length ? narrowed : a.types;
}

/** Results shown at first, and added by each "Show more". */
export const PAGE_SIZE = 8;
/** Beyond this the results line says the nearest outlet is far. */
export const NEAR_KM = 15;
