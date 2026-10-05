/**
 * Site-wide image loader: no recompression, by the owner's instruction
 * (2026-09-30: "do not compress any image"; the optimizer's quality-75
 * copies showed as soft, pixelated thumbnails).
 *
 *  - Our own files under /public are served exactly as they are. The
 *    width Next asks for is added as a query string only so each size has
 *    its own URL; the static server ignores it.
 *  - Sanity photographs are resized by Sanity's own CDN to the width the
 *    layout needs, at quality 100, so a thumbnail is never a
 *    full-resolution original but is never lossy-recompressed either.
 *  - Anything else is passed through untouched.
 *
 * Wired up in next.config.ts (images.loader = "custom").
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "100");
    url.searchParams.set("fit", "max");
    url.searchParams.set("auto", "format");
    return url.toString();
  }
  if (src.startsWith("/")) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
  return src;
}
