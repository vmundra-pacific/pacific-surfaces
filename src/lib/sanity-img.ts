/**
 * Single source of truth for Sanity CDN URLs (images AND files).
 *
 * Sanity master images come back via `mainImage.asset->url` at full
 * resolution — typically 2-4 MB JPGs. Render targets are a fraction
 * of that size (300 px slab cards, 800 px hero crops, etc.). This
 * helper appends transform params so the CDN serves an appropriately
 * sized AVIF/WebP instead of the raw master.
 *
 * Two responsibilities:
 *
 *   1. Append CDN transform params (`?w=720&q=70&auto=format`).
 *   2. Rewrite cdn.sanity.io URLs through our first-party proxy at
 *      /api/cdn/* so the requests no longer pick up the
 *      `sanitySession` third-party cookie that Sanity sets on every
 *      asset response. Lighthouse's BP audits flagged that cookie;
 *      proxying makes those requests first-party and the audits pass.
 *
 * Pass-through for any non-Sanity URL so callers can wire it into
 * every image source without branching.
 *
 * Defaults: q=70, fit=max, auto=format. Always pass `w` to actually
 * benefit — without it the CDN still serves the master.
 */
export type SanityImgOpts = {
  w?: number;
  h?: number;
  q?: number;
  fit?: "max" | "crop" | "fill" | "fillmax" | "scale";
};

const SANITY_HOST_RE = /^https?:\/\/cdn\.sanity\.io\//;
const PROXIED_RE = /^\/api\/cdn\//;

/**
 * Convert any cdn.sanity.io URL into a same-origin /api/cdn/* URL.
 * Already-proxied or external URLs pass through unchanged.
 *
 * Exported so callers handling URLs without needing transform params
 * (e.g. video src, HD downloads) can still ensure first-party routing.
 */
export function sanityProxyUrl(url: string): string {
  if (PROXIED_RE.test(url)) return url; // already proxied
  if (!SANITY_HOST_RE.test(url)) return url; // non-Sanity
  return url.replace(SANITY_HOST_RE, "/api/cdn/");
}

/**
 * Returns true if the URL points at Sanity's CDN, in either the raw
 * cdn.sanity.io form or the same-origin /api/cdn/* proxy form. This
 * is what callers care about when deciding "should I append transform
 * params" — both forms accept Sanity's image transform query string.
 */
function isSanityUrl(url: string): boolean {
  return SANITY_HOST_RE.test(url) || PROXIED_RE.test(url);
}

export function sanityImg(
  url: string | null | undefined,
  opts: SanityImgOpts = {},
): string | undefined {
  if (!url) return undefined;
  // For non-Sanity URLs (e.g. images.unsplash.com, local /public/...),
  // pass through unchanged — no transforms, no proxying.
  if (!isSanityUrl(url)) return url;

  // Append CDN transform params. Sanity's transform engine reads them
  // from the query string regardless of host; the proxy forwards the
  // full query string upstream to cdn.sanity.io.
  const { w, h, q = 70, fit = "max" } = opts;
  const params: string[] = [];
  if (w) params.push(`w=${w}`);
  if (h) params.push(`h=${h}`);
  params.push(`q=${q}`);
  params.push(`fit=${fit}`);
  params.push("auto=format");
  const sep = url.includes("?") ? "&" : "?";
  const withParams = `${url}${sep}${params.join("&")}`;

  // Always finish in proxied form. If the URL was already proxied,
  // sanityProxyUrl is a no-op; if it was a raw cdn.sanity.io URL,
  // it gets rewritten to /api/cdn/*.
  return sanityProxyUrl(withParams);
}
