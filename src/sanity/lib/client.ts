import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

const baseClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false for always-fresh data
});

/**
 * Recursively walk an arbitrary JSON value and rewrite every Sanity
 * CDN URL string to a same-origin proxy path. This lets us strip the
 * `sanitySession` third-party cookie that cdn.sanity.io sets on every
 * asset response — Lighthouse's Best Practices audit was failing on
 * those cookies.
 *
 * Pure function, side-effect-free; returns a new object with shared
 * subtrees rebuilt only along paths that actually contained a CDN URL.
 *
 * The proxy route is implemented at src/app/api/cdn/[...path]/route.ts.
 */
const SANITY_HOST_RE = /^https?:\/\/cdn\.sanity\.io\//;

function rewriteSanityUrls<T>(value: T): T {
  if (typeof value === "string") {
    if (SANITY_HOST_RE.test(value)) {
      return value.replace(SANITY_HOST_RE, "/api/cdn/") as unknown as T;
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
