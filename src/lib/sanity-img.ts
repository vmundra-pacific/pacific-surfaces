/**
 * Single source of truth for Sanity CDN image URLs.
 *
 * Sanity master images come back via `mainImage.asset->url` at full
 * resolution — typically 2-4 MB JPGs. Render targets are a fraction
 * of that size (300 px slab cards, 800 px hero crops, etc.). This
 * helper appends transform params so the CDN serves an appropriately
 * sized AVIF/WebP instead of the raw master.
 *
 * Pass-through for any non-Sanity URL so callers can wire it into
 * every image source without branching.
 *
 * Defaults: q=70, fit=max, auto=format. Always pass `w` to actually
 * benefit — without it the CDN still serves the master.
 *
 * Note on cookie hardening: cdn.sanity.io serves cookies on /files/
 * (videos, HD downloads) but NOT on /images/. The /api/cdn/* proxy
 * exists to strip those file cookies; image URLs are NOT rewritten,
 * because the Next/Image optimizer at /_next/image already proxies
 * cdn.sanity.io/images/* requests through Next's pipeline (cookies
 * stripped, AVIF/WebP applied). Routing image URLs through our own
 * proxy would short-circuit Next/Image and tank LCP — see
 * `src/sanity/lib/client.ts` for the same warning.
 */
export type SanityImgOpts = {
  w?: number;
  h?: number;
  q?: number;
  fit?: "max" | "crop" | "fill" | "fillmax" | "scale";
};

const SANITY_HOST_RE = /^https?:\/\/cdn\.sanity\.io\//;
const SANITY_FILES_RE = /^https?:\/\/cdn\.sanity\.io\/files\//;
const SANITY_IMAGES_RE = /^https?:\/\/cdn\.sanity\.io\/images\//;
const PROXIED_RE = /^\/api\/cdn\//;

/**
 * Convert a cdn.sanity.io /files/* URL (videos, HD downloads) into a
 * same-origin /api/cdn/files/* URL. Image URLs and non-Sanity URLs
 * pass through unchanged — Next/Image handles those.
 *
 * Exported so callers that need first-party routing for video src
 * attributes can opt in explicitly.
 */
export function sanityProxyUrl(url: string): string {
  if (PROXIED_RE.test(url)) return url; // already proxied
  if (!SANITY_FILES_RE.test(url)) return url; // image or non-Sanity
  return url.replace(SANITY_FILES_RE, "/api/cdn/files/");
}

/**
 * Direct-fetch image proxy. Use ONLY for places that bypass Next/Image
 * — i.e. CSS `background-image: url(...)`, `<video poster>` attrs, or
 * raw `<img>` tags that can't be replaced with `<Image>`. Routes the
 * cdn.sanity.io request through /api/cdn/images/* so Sanity's
 * `sanitySession` cookie never reaches the browser. Lighthouse's
 * third-party-cookies audit flags any direct browser request to
 * cdn.sanity.io because the response sets cookies; first-party
 * routing strips them.
 *
 * Do NOT use this for `<Image>` src — Next/Image already handles it
 * via its own /_next/image optimizer (which strips cookies AND applies
 * AVIF/WebP). Wrapping `<Image>` URLs through here short-circuits the
 * optimizer and ships full-size masters to the browser.
 */
export function sanityImageProxyUrl(url: string): string {
  if (PROXIED_RE.test(url)) return url; // already proxied
  if (!SANITY_IMAGES_RE.test(url)) return url; // file or non-Sanity
  return url.replace(SANITY_IMAGES_RE, "/api/cdn/images/");
}

export function sanityImg(
  url: string | null | undefined,
  opts: SanityImgOpts = {},
): string | undefined {
  if (!url) return undefined;
  // For non-Sanity URLs (e.g. images.unsplash.com, local /public/...),
  // pass through unchanged — no transforms.
  if (!SANITY_HOST_RE.test(url)) return url;

  // Append CDN transform params. Sanity's transform engine reads them
  // from the query string; for /images/ URLs these are honored
  // upstream when Next/Image proxies the request.
  const { w, h, q = 70, fit = "max" } = opts;
  const params: string[] = [];
  if (w) params.push(`w=${w}`);
  if (h) params.push(`h=${h}`);
  params.push(`q=${q}`);
  params.push(`fit=${fit}`);
  params.push("auto=format");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${params.join("&")}`;
}
