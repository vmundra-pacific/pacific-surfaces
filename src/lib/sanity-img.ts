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
 */
export type SanityImgOpts = {
  w?: number;
  h?: number;
  q?: number;
  fit?: "max" | "crop" | "fill" | "fillmax" | "scale";
};

export function sanityImg(
  url: string | null | undefined,
  opts: SanityImgOpts = {},
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cdn.sanity.io")) return url;
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
