import { NextRequest } from "next/server";

/**
 * Lightweight in-memory rate limiter for the visualizer's Replicate-backed
 * routes (/api/depth, /api/segment, /api/segment-point, /api/process-surface).
 *
 * Every call to those routes costs real money on Replicate, and none of
 * them require a login — anyone who finds the endpoint can hit it directly
 * (skipping the UI entirely) and run up the bill. This caps each visitor
 * to a fixed number of calls in a rolling time window, shared across all
 * four routes (one visualizing session naturally calls all of them), so a
 * single bad actor or runaway script can't exhaust the Replicate account.
 *
 * IMPORTANT — in-memory limitation: this Map lives in the Node.js process
 * running the serverless function. On Vercel, a function can cold-start on
 * a fresh instance at any time (new deploy, scale-up, long idle period),
 * which resets this Map to empty — so the limit is "per warm instance,"
 * not a hard global guarantee across every instance simultaneously. For a
 * single low/medium-traffic app this still meaningfully blocks the common
 * abuse case (one client hammering the endpoint), but it is NOT airtight
 * under high concurrency across many regions/instances. If this ever needs
 * to be bulletproof (e.g. after a real abuse incident), swap this module's
 * internals for Upstash Redis + @upstash/ratelimit — same call signature,
 * just backed by a shared store instead of a local Map — everything that
 * calls `rateLimit()` below stays unchanged.
 */

type Bucket = number[]; // sorted ascending timestamps (ms) of recent hits

const buckets = new Map<string, Bucket>();

// Cheap opportunistic cleanup so `buckets` doesn't grow forever from
// one-off visitors. Runs at most once a minute, triggered by traffic
// rather than a setInterval (nothing to leak/clean up on serverless
// shutdown this way).
let lastSweep = 0;
function sweep(now: number, maxAgeMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < maxAgeMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Requests left in the current window if allowed. */
  remaining: number;
  /** Seconds until the caller should retry, only meaningful when blocked. */
  retryAfterSeconds: number;
}

/**
 * Sliding-window rate limit check. Records a hit immediately when allowed
 * (call once per incoming request, right before doing any real work).
 *
 * @param key group + identifier, e.g. `visualize:${ip}` — shared key
 *   namespace lets multiple routes draw from the same quota.
 * @param limit max hits allowed inside `windowMs`.
 * @param windowMs rolling window size in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const oldest = hits[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    buckets.set(key, hits);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  hits.push(now);
  buckets.set(key, hits);
  return {
    allowed: true,
    remaining: limit - hits.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP extraction for Vercel/Next.js 15 (NextRequest no
 * longer exposes `.ip` directly). Falls back to a constant bucket key when
 * no forwarding header is present (e.g. local `next dev`), which means
 * local development shares one quota — fine, since this only matters
 * once deployed behind Vercel's proxy, which always sets this header.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Shared quota for the visualizer's Replicate-backed routes: 20 calls
 * per 15 minutes per visitor. One photo costs 2 calls automatically
 * (/api/segment + /api/depth) plus 1 more per surface the user has to
 * manually tap to fix — so 20 covers a genuinely engaged session (3-4
 * rooms, a couple of corrections each) without ever feeling like a
 * wall, while still stopping a runaway script cold well before it
 * burns through meaningful Replicate credit. Started at 10, raised
 * after walking through the real per-photo call math.
 */
export const VISUALIZE_RATE_LIMIT = {
  limit: 20,
  windowMs: 15 * 60 * 1000,
};
