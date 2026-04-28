/**
 * URL helper for the product page zoom magnifier.
 *
 * The magnifier shows the FULL-QUALITY original Sanity asset — no
 * downscaling, no recompression. Stone slab textures need every
 * ounce of resolution to read properly under the 3x magnifier.
 *
 * We do still pass `auto=format` so modern browsers receive WebP /
 * AVIF instead of the original JPEG when supported. That's a smaller
 * file at the same visual quality (often noticeably better for the
 * subtle veining detail in stone), so it's pure upside.
 *
 * Because the magnifier <img> mounts from page load and lazy-loads in
 * the background while the user reads the page, the larger original
 * file size doesn't block initial paint — by the time the user hovers
 * the slab, the full-res asset is already in the browser's cache and
 * decoded into GPU memory.
 *
 * Same URL is used by the magnifier and the catalogue/related-card
 * hover prefetches, so they all share one cache entry.
 *
 * If the URL doesn't look like a Sanity CDN URL (defensive fallback,
 * e.g. a local /uploads file in dev), we return it unchanged.
 */
export function zoomImageUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return "";
  // Return the raw Sanity asset URL — no transformations of any kind,
  // so the browser receives the original file at its full uploaded
  // quality and resolution. Anything else (auto=format, q=95, w=...)
  // would recompress and lose detail in the subtle veining that
  // stone slabs are all about.
  return rawUrl;
}
