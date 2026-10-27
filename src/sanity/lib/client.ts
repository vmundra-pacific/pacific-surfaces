import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "../env";

/**
 * Read-token wiring. `readToken` is server-only (see src/sanity/env.ts)
 * and optional: while the dataset is public it is undefined and these
 * clients behave exactly as before, and once the dataset is flipped to
 * private the same clients start authenticating with no other change.
 * `server-only` makes importing these clients from browser code a build
 * error, so no query (and no token) can end up in a client bundle.
 *
 * The CDN: reads go through Sanity's API CDN, token or not. It serves
 * token-authenticated queries on this private dataset (checked
 * 2026-10-27: same results as the live API) in ~50 ms against 190-410 ms
 * for the live API in Europe, and CDN requests are the cheaper kind on
 * Sanity's bill. Until the dataset went private the site read through
 * the CDN anyway (no token). freshClient below stays on the live API.
 *
 * `perspective: "published"`: a token can see drafts, and the site must
 * only ever show published documents. It is already the API's default
 * for this API version; set here so a token never changes that.
 */
const baseClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  ...(readToken ? { token: readToken } : {}),
});

// Always-fresh client (useCdn: false). Use this for editor-managed
// content where waiting for the Sanity CDN cache to expire is not
// acceptable — the spacePage and learnTopic image documents in
// particular, where editors expect their published changes to appear
// on the site within a render cycle, not "in a minute or two when
// the CDN catches up".
//
// Trade-off: every fetch bypasses Sanity's CDN, costing ~50-150 ms
// extra latency vs the CDN-cached path. Reserve for content paths
// where freshness matters more than that latency budget.
const freshBaseClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  ...(readToken ? { token: readToken } : {}),
});

/**
 * Recursively walk an arbitrary JSON value and rewrite Sanity CDN
 * *file* URLs (videos, HD downloads) to a same-origin proxy path.
 * This strips the `sanitySession` cookie that cdn.sanity.io sets on
 * file responses, which was failing the third-party-cookies audit.
 *
 * IMPORTANT: We deliberately DO NOT rewrite cdn.sanity.io/images/*
 * URLs. Those are consumed by Next/Image, which already proxies them
 * through /_next/image — that pipeline strips cookies, applies AVIF/
 * WebP transforms, and serves a much smaller payload. Rewriting
 * /images/ URLs would short-circuit the Next/Image optimizer and ship
 * full-size masters to the browser, tanking LCP. Performance regressed
 * from ~96 to ~65 the first time we made that mistake; don't repeat it.
 *
 * Pure function, side-effect-free; returns a new object with shared
 * subtrees rebuilt only along paths that actually contained a file URL.
 *
 * The proxy route is implemented at src/app/api/cdn/[...path]/route.ts.
 */
const SANITY_FILES_RE = /^https?:\/\/cdn\.sanity\.io\/files\//;

function rewriteSanityUrls<T>(value: T): T {
  if (typeof value === "string") {
    if (SANITY_FILES_RE.test(value)) {
      return value.replace(SANITY_FILES_RE, "/api/cdn/files/") as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => rewriteSanityUrls(v)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = rewriteSanityUrls(v);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Sanity client whose `.fetch()` method post-processes results to
 * route every cdn.sanity.io URL through /api/cdn/*. Other methods
 * (listen, transactions, etc.) pass through to the underlying client
 * unchanged — the rewrite only applies to read responses, which are
 * the only place URLs end up rendered as src attributes.
 *
 * To opt out (e.g. when you need a raw Sanity URL for an OG image
 * generated server-side at build time and never reaches the browser),
 * use `baseClient` directly via the `rawClient` export below.
 */
export const client = new Proxy(baseClient, {
  get(target, prop, receiver) {
    if (prop === "fetch") {
      const originalFetch = Reflect.get(
        target,
        prop,
        receiver
      ) as typeof target.fetch;
      return (...args: Parameters<typeof originalFetch>) => {
        return originalFetch
          .apply(target, args)
          .then((res) => rewriteSanityUrls(res));
      };
    }
    return Reflect.get(target, prop, receiver);
  },
}) as typeof baseClient;

/**
 * Direct client without URL rewriting. Use for build-time tasks
 * (sitemap generation, server-only OG image fetches) where the URL
 * never ends up in the browser. Most callers should use `client`.
 */
export const rawClient = baseClient;

/**
 * Always-fresh client (bypasses Sanity CDN) WITH URL rewriting. Use
 * for editor-managed content where new uploads should appear on
 * site immediately instead of waiting for the Sanity CDN to expire
 * its cached version (~1–2 minutes).
 */
export const freshClient = new Proxy(freshBaseClient, {
  get(target, prop, receiver) {
    if (prop === "fetch") {
      const originalFetch = Reflect.get(
        target,
        prop,
        receiver
      ) as typeof target.fetch;
      return (...args: Parameters<typeof originalFetch>) => {
        return originalFetch
          .apply(target, args)
          .then((res) => rewriteSanityUrls(res));
      };
    }
    return Reflect.get(target, prop, receiver);
  },
}) as typeof freshBaseClient;
