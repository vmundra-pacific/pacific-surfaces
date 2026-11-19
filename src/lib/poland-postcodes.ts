/**
 * Polish postal codes to map positions, for the Poland nearest-distributor
 * finder (owner, 2026-11-19). The data is GeoNames' postal code dump (CC BY
 * 4.0), one position per code; see scripts/build-poland-postcodes.py.
 *
 * `server-only`: the table is about 440 KB, so it stays in the API route
 * and never reaches a browser.
 */
import "server-only";
import data from "@/data/poland-postcodes.json";

const CODES: Record<string, number[]> = data.codes;

/** "42-130", "42130" or "42 130" to "42130"; null for anything else. */
export function normalisePostcode(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "");
  return /^\d{5}$/.test(digits) ? digits : null;
}

/** "42130" to "42-130", the way Poles write it. */
export const formatPostcode = (digits: string) =>
  `${digits.slice(0, 2)}-${digits.slice(2)}`;

/**
 * The code's own position, else the mean of the codes that share its first
 * three, then its first two digits (a new or rare code in a known area).
 * `exact` says which.
 */
export function postcodePosition(
  digits: string
): { lat: number; lng: number; exact: boolean } | null {
  const own = CODES[digits];
  if (own) return { lat: own[0], lng: own[1], exact: true };
  for (const n of [3, 2]) {
    const near = Object.entries(CODES).filter(([c]) =>
      c.startsWith(digits.slice(0, n))
    );
    if (near.length) {
      const lat = near.reduce((s, [, p]) => s + p[0], 0) / near.length;
      const lng = near.reduce((s, [, p]) => s + p[1], 0) / near.length;
      return { lat, lng, exact: false };
    }
  }
  return null;
}

/** Great-circle distance in km. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
