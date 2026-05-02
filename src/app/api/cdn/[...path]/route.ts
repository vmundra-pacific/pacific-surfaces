import type { NextRequest } from "next/server";

/**
 * Sanity media proxy.
 *
 * Why this exists
 * ---------------
 * `cdn.sanity.io` sets a `sanitySession` cookie on every image and
 * video response. Browsers (and Lighthouse) treat that as a third-party
 * cookie, which trips two Best-Practices audits:
 *
 *   - third-party-cookies
 *   - inspector-issues (same root cause, different audit)
 *
 * Routing those requests through our own domain makes them first-party
 * and lets us drop the offending cookie before it reaches the client.
 *
 * What this route does
 * --------------------
 *   1. Accepts any path under /api/cdn/* — both
 *      /api/cdn/images/{project}/{dataset}/...
 *      and
 *      /api/cdn/files/{project}/{dataset}/...
 *      get forwarded.
 *   2. Forwards the request to https://cdn.sanity.io/{path} preserving
 *      the original query string (so Sanity's image transform params —
 *      `?w=720&q=70&auto=format` — keep working).
 *   3. Streams the upstream response back, pass-through.
 *   4. Strips `Set-Cookie` from the response headers (kills the cookie
 *      audit failures).
 *   5. Sets a long, immutable `Cache-Control` so Vercel's edge caches
 *      every asset hash for a year — the asset URLs are content-
 *      addressed by hash, so they never change in place.
 *
 * What this route does NOT do
 * ---------------------------
 *   - It does not authenticate. Sanity assets are public; the proxy is
 *     just a hop. If you ever publish private datasets, gate this route.
 *   - It does not transform images. We pass query params through to
 *     Sanity, which does the resizing/format negotiation server-side.
 *   - It does not log or rewrite content. Bytes go through unchanged.
 *
 * Tradeoffs
 * ---------
 *   - Cold-cache requests add one Vercel function invocation per asset.
 *     Vercel's edge cache absorbs subsequent requests; for a marketing
 *     site this is well within the free tier.
 *   - Bandwidth shifts from Sanity's CDN bill to your Vercel egress.
 *     Monitor Vercel analytics if traffic spikes.
 */

const SANITY_HOST = "https://cdn.sanity.io";

// Upstream MIME types worth forwarding cleanly. Sanity returns image/*,
// video/*, application/octet-stream for HD downloads. Anything else we
// still pass through; this list is purely informational.
const SAFE_PASSTHROUGH_HEADERS = new Set([
  "content-type",
  "content-length",
  "etag",
  "last-modified",
  "accept-ranges",
  "content-range",
]);

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function proxy(req: NextRequest, ctx: RouteContext, method: "GET" | "HEAD") {
  const { path } = await ctx.params;
  if (!path || path.length === 0) {
    return new Response("Bad request: missing asset path.", { status: 400 });
  }

  // Reconstruct the upstream URL. URI-encoded segments stay intact; we
  // join with "/" to preserve the original path shape.
  const search = req.nextUrl.search ?? "";
  const upstreamUrl = `${SANITY_HOST}/${path.map(encodeURIComponent).join("/")}${search}`;

  // Forward Range requests for video seeking. Without this, scrub bars
  // on <video> elements stutter because the browser can't ask the
  // server for the byte range it actually needs.
  const forwardHeaders: HeadersInit = {};
  const range = req.headers.get("range");
  if (range) forwardHeaders["range"] = range;
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch) forwardHeaders["if-none-match"] = ifNoneMatch;
  const ifModifiedSince = req.headers.get("if-modified-since");
  if (ifModifiedSince) forwardHeaders["if-modified-since"] = ifModifiedSince;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers: forwardHeaders,
      // Sanity assets are public; no credentials.
      redirect: "follow",
    });
  } catch (err) {
    return new Response(
      `Sanity proxy fetch failed: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 502 }
    );
  }

  // Build the response. Pass through whitelisted upstream headers; drop
  // Set-Cookie (the whole reason this proxy exists); set our own
  // Cache-Control so Vercel's edge caches aggressively.
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (SAFE_PASSTHROUGH_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  // Sanity asset URLs are content-hashed; immutable cache is safe.
  responseHeaders.set(
    "Cache-Control",
    "public, max-age=31536000, s-maxage=31536000, immutable"
  );
  // Help Lighthouse's `efficient-cache-policy` audit too.
  responseHeaders.set("X-Sanity-Proxy", "1");

  // 304/206/etc. are valid statuses to surface — preserve.
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "GET");
}

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "HEAD");
}
