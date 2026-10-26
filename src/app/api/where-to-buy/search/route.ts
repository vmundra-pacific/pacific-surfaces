/**
 * POST /api/where-to-buy/search
 *
 * Every Where to Buy search after the lead form (marketing, 2026-10-26:
 * the directory is never sent whole, not even to a visitor who has left
 * their details). Only for a browser holding the access cookie that
 * /api/where-to-buy/lead sets; answers with the nearest MAX_SHOWN for the
 * answers and refinements sent (lib/where-to-buy.ts searchOutlets).
 *
 * Limited so the directory cannot be rebuilt a few outlets at a time: 20
 * searches per visitor per 10 minutes and 60 per lead a day, far above a
 * real visitor's handful (in-memory, per instance; see lib/rate-limit).
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { clampField } from "@/lib/escape";
import {
  TYPE_ORDER,
  audienceOf,
  interestOf,
  readGeo,
  type DealerType,
  type SearchQuery,
} from "@/lib/where-to-buy";
import { searchDirectory } from "@/lib/where-to-buy-dealers";
import { ACCESS_COOKIE, accessLead } from "@/lib/where-to-buy-access";

export const runtime = "nodejs";

const PRIVATE = { "Cache-Control": "private, no-store" };

interface Body {
  who?: string;
  interest?: string;
  where?: string;
  geo?: unknown;
  all?: unknown;
  types?: unknown;
  samples?: unknown;
  slabs?: unknown;
}

const tooMany = (retryAfterSeconds: number) =>
  NextResponse.json(
    { error: "Too many searches. Please try again in a few minutes." },
    {
      status: 429,
      headers: { ...PRIVATE, "Retry-After": String(retryAfterSeconds) },
    }
  );

export async function POST(req: NextRequest) {
  const lead = accessLead(req.cookies.get(ACCESS_COOKIE)?.value);
  if (!lead) {
    return NextResponse.json(
      { error: "Leave your details to see the outlets.", locked: true },
      { status: 401, headers: PRIVATE }
    );
  }

  const byVisitor = rateLimit(
    `wtb-search:${getClientIp(req)}`,
    20,
    10 * 60 * 1000
  );
  if (!byVisitor.allowed) return tooMany(byVisitor.retryAfterSeconds);
  const byLead = rateLimit(`wtb-search-lead:${lead}`, 60, 24 * 60 * 60 * 1000);
  if (!byLead.allowed) return tooMany(byLead.retryAfterSeconds);

  const body = (await req.json().catch(() => ({}))) as Body;
  const types = Array.isArray(body.types)
    ? body.types.filter((t): t is DealerType =>
        TYPE_ORDER.some((o) => o.value === t)
      )
    : [];
  const geo = readGeo(body.geo);
  const q: SearchQuery = {
    who: audienceOf(clampField(body.who, 40))?.value ?? null,
    interest: interestOf(clampField(body.interest, 40))?.value ?? null,
    where: geo ? "" : clampField(body.where, 60),
    geo,
    all: body.all === true,
    types: types.length ? types : null,
    samples: body.samples === true,
    slabs: body.slabs === true,
  };
  if (!q.all && !q.who) {
    return NextResponse.json(
      { error: "Tell us who you are.", field: "who" },
      { status: 400, headers: PRIVATE }
    );
  }
  if (!q.all && !q.geo && !q.where) {
    return NextResponse.json(
      { error: "Enter your PIN code or use your location.", field: "where" },
      { status: 400, headers: PRIVATE }
    );
  }

  return NextResponse.json(
    { outcome: searchDirectory(q) },
    { headers: PRIVATE }
  );
}
