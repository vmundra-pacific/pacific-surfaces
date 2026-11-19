/**
 * POST /api/where-to-buy/nearest
 *
 * The Poland nearest-distributor finder (owner, 2026-11-19): the visitor
 * says who they are and gives a postal code, and gets back the ONE
 * distributor nearest to it, with the distance and the code's position for
 * the map. The postal code table stays here on the server
 * (lib/poland-postcodes).
 *
 * Body: { region: "pl", who, postcode }. Nothing is stored. Limited to 30
 * searches per visitor per 10 minutes (lib/rate-limit), far above a real
 * visitor's handful.
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { FINDER_AUDIENCES, PACIFIC_POLSKA } from "@/data/partners";
import {
  distanceKm,
  formatPostcode,
  normalisePostcode,
  postcodePosition,
} from "@/lib/poland-postcodes";

export const runtime = "nodejs";

const PRIVATE = { "Cache-Control": "private, no-store" };

const fail = (status: number, error: string) =>
  NextResponse.json({ error }, { status, headers: PRIVATE });

export async function POST(req: NextRequest) {
  const limit = rateLimit(
    `wtb-nearest:${getClientIp(req)}`,
    30,
    10 * 60 * 1000
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please try again in a few minutes." },
      {
        status: 429,
        headers: { ...PRIVATE, "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    region?: unknown;
    who?: unknown;
    postcode?: unknown;
  };
  if (body.region !== "pl") return fail(400, "Unknown region.");
  if (!FINDER_AUDIENCES.some((a) => a.value === body.who)) {
    return fail(400, "Choose who you are.");
  }
  const digits =
    typeof body.postcode === "string"
      ? normalisePostcode(body.postcode.slice(0, 12))
      : null;
  if (!digits) {
    return fail(400, "Enter a Polish postal code, such as 42-130.");
  }
  const origin = postcodePosition(digits);
  if (!origin) {
    return fail(404, "We don't recognise that postal code. Please check it.");
  }

  const ranked = (PACIFIC_POLSKA.distributors ?? [])
    .filter((d) => d.lat != null && d.lng != null)
    .map((d) => ({
      name: d.name,
      km: distanceKm(origin, { lat: d.lat!, lng: d.lng! }),
    }))
    .sort((a, b) => a.km - b.km);
  if (!ranked.length) return fail(503, "No distributor to show yet.");

  return NextResponse.json(
    {
      postcode: formatPostcode(digits),
      origin: {
        lat: Math.round(origin.lat * 100) / 100,
        lng: Math.round(origin.lng * 100) / 100,
      },
      approximate: !origin.exact,
      distributor: ranked[0].name,
      km: Math.max(1, Math.round(ranked[0].km)),
    },
    { headers: PRIVATE }
  );
}
