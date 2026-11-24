import { cmsImg, cmsReadable, isCmsMedia, toProxy } from "./media-url";
import { sanityImageProxyUrl, sanityImg, sanityProxyUrl } from "./sanity-img";

/**
 * Which file each place on the site loads for a picture, one small
 * function per place, kept here (with no React) so that
 * scripts/check-cms-read.ts can call every one of them.
 *
 * A Sanity address gets exactly what that place asked Sanity for. A CMS
 * address gets one of the CMS's ready-made copies (lib/media-url): from
 * the media folder when that is set, else through this site's
 * /api/cdn/m/. A canvas needs the same origin, so the places that draw on
 * one always use /api/cdn/m/. Any other address is left as it is.
 */

/**
 * Signature projects (components/sections/SignatureProjects): the video
 * poster.
 *
 * Sanity image CDN tweak: shrink mainImage to ~800px for use as a
 * video poster. Saves bytes (multi-MB master -> ~30 KB AVIF/WebP)
 * without losing visible quality for the time it's on screen before
 * the video plays.
 */
export function thumbUrl(src: string): string {
  // A CMS photograph: its 828 px copy. Tested first, because on this
  // site its address also starts with /api/cdn/.
  if (isCmsMedia(src)) return cmsImg(src, { w: 800 });
  // Pass-through for non-Sanity URLs (or already-proxied /api/cdn/*
  // URLs we may receive from a parent that pre-rewrote them).
  if (!src.includes("cdn.sanity.io") && !src.startsWith("/api/cdn/"))
    return src;
  const sep = src.includes("?") ? "&" : "?";
  const withParams = `${src}${sep}w=800&fit=max&q=70&auto=format`;
  // Route through the first-party proxy if we still have a raw
  // cdn.sanity.io URL. (If src already starts with /api/cdn/ this is
  // a no-op via sanityProxyUrl's pass-through.)
  return sanityProxyUrl(withParams);
}

/**
 * Applications (components/sections/ApplicationsScrollSections): a
 * tile's CSS background.
 *
 * Wraps a Sanity image URL for use in CSS `background-image` (and
 * other contexts that bypass Next/Image). Routes through /api/cdn/
 * to strip the third-party `sanitySession` cookie, AND appends a
 * width/quality transform so the 3×3 tile grid below doesn't pull a
 * 2.7 MB master JPG just to slice into a decorative scatter. Skipped
 * for non-Sanity URLs. `fm=webp` rather than `auto=format`: the proxy
 * fetches server-side without the browser's Accept header, so
 * auto=format would hand back the original JPEG/PNG. A CMS photograph
 * uses its 1290 px copy, loaded directly from the media host (a CSS
 * background needs no same origin).
 */
const SANITY_HOST_LITERAL = "cdn.sanity.io";
export function tileBackgroundUrl(url: string): string {
  if (isCmsMedia(url)) return cmsImg(url, { w: 1200 });
  if (!url.includes(SANITY_HOST_LITERAL)) return url;
  const sep = url.includes("?") ? "&" : "?";
  const transformed = `${url}${sep}w=1200&fit=max&q=70&fm=webp`;
  return sanityImageProxyUrl(transformed);
}

/**
 * Vanity tops (components/shop/VanityTopsListing): a design's swatch,
 * drawn on a canvas.
 *
 * A design's slab photograph as a small swatch (a CSS background).
 * `fm=webp` rather than sanityImg's `auto=format`: the proxy fetches
 * server-side without the browser's Accept header, so auto=format would
 * hand back the original JPEG. A CMS photograph: its 256 px copy, as
 * cmsImg gives it (from the media host; a CSS background needs no same
 * origin).
 */
export const swatchUrl = (image: string | null) =>
  !image
    ? undefined
    : isCmsMedia(image)
      ? cmsImg(image, { w: 120 })
      : sanityImageProxyUrl(
          sanityImg(image, { w: 120 })?.replace(/auto=format$/, "fm=webp") ??
            image
        );

/**
 * The basin preview (components/shop/BasinPreview): a slab photograph as
 * the compositor draws it, through our own proxy (first-party,
 * CORS-clean), resized by Sanity to the canvas width at full quality, or
 * a CMS photograph's ready-made copy at or above that width, straight
 * from the media host where it shares its files with this page's address
 * (lib/media-url cmsReadable). Local files are used as they are.
 */
export function slabUrl(src: string, width: number): string {
  if (isCmsMedia(src))
    return cmsReadable(cmsImg(src, { w: Math.round(width) }));
  const m = src.match(/^https?:\/\/cdn\.sanity\.io\/(images\/[^?]+)(\?.*)?$/);
  if (!m) return src;
  const q = new URLSearchParams(m[2]?.slice(1) ?? "");
  if (!q.has("w")) {
    q.set("w", String(Math.round(width)));
    q.set("fit", "max");
    q.set("q", "100");
  }
  return `/api/cdn/${m[1]}?${q.toString()}`;
}

/**
 * The visualiser's slab dock (components/visualize/SlabPicker): a 240x180
 * thumbnail, cut to its box (object-cover). A CMS photograph: the copy
 * that covers that box (lib/media-url), 384 px.
 */
export function slabPickerThumbUrl(photoUrl: string): string {
  return isCmsMedia(photoUrl)
    ? cmsImg(photoUrl, { w: 240, h: 180, crop: true })
    : photoUrl.includes("cdn.sanity.io")
      ? photoUrl +
        (photoUrl.includes("?") ? "&" : "?") +
        "w=240&h=180&fit=crop&q=70&auto=format"
      : photoUrl;
}

/**
 * Facades and finishes (components/sections/FacadesAndFinishesContent):
 * the lightbox picture. A CMS address keeps its copy; one on the CMS's
 * own host goes through /api/cdn/m/. Any other address is unchanged.
 */
export function finishFullImageUrl(finish: {
  fullImage: string | null;
  mainImage: string | null;
}): string | null {
  const fullImage = finish.fullImage || finish.mainImage;
  return fullImage ? cmsImg(fullImage) : fullImage;
}

/**
 * The finish lightbox (components/ui/finish-lightbox, opened from a
 * catalogue card): the main picture, which can be zoomed to 4x. A CMS
 * picture: its largest copy, 3840 px. Any other address as given.
 */
export function lightboxImageUrl(src: string): string {
  return isCmsMedia(src) ? cmsImg(src, { w: 3840 }) : src;
}

/** The finish lightbox's thumbnails (80 px at most). A CMS picture: 256 px. */
export function lightboxThumbUrl(src: string): string {
  return isCmsMedia(src) ? cmsImg(src, { w: 256 }) : src;
}

/**
 * The catalogue reader's cover (components/catalogue/Flipbook, opened
 * from /resources), shown while the PDF loads. A CMS picture: its
 * 1080 px copy. Any other address as given.
 */
export function resourcePosterUrl(src: string | undefined): string | undefined {
  return src && isCmsMedia(src) ? cmsImg(src, { w: 1080 }) : src;
}

/**
 * A resource's PDF (components/sections/ResourcesContent): read in the
 * catalogue reader and downloaded. A CMS file goes through this site's
 * /api/cdn/m/, so the reader's byte ranges and the download's file name
 * work (both need the same origin). Any other address as given.
 */
export function resourcePdfUrl(src: string | undefined): string | undefined {
  return src ? toProxy(src) : src;
}

/**
 * A resource's PDF as the catalogue reader reads it (byte ranges): straight
 * from the media host where it shares its files with this page's address,
 * else through /api/cdn/m/ (lib/media-url cmsReadable). Used only once the
 * reader opens, in the browser. Downloads keep resourcePdfUrl. Any other
 * address as given.
 */
export function resourceReadUrl(src: string | undefined): string | undefined {
  return src ? cmsReadable(src) : src;
}

/** The blog body's ready-made copies (they cover Sanity's 640/960/1400). */
export const CMS_BODY_WIDTHS = [640, 1080, 1920];

/** What a CMS answer adds to an inline image's asset. */
type CmsInlineAsset = { url?: unknown; width?: unknown; height?: unknown };

/**
 * A blog post's inline image from the CMS (components/sections/
 * BlogPostContent): its original's address and size come with the asset.
 * Null for a Sanity image, which is built from its ref.
 */
export function cmsInlineImage(value: {
  asset?: unknown;
}): { url: string; width?: number; height?: number } | null {
  const asset = value.asset as CmsInlineAsset | undefined;
  if (!asset || typeof asset.url !== "string" || !isCmsMedia(asset.url)) {
    return null;
  }
  const size = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n > 0
      ? Math.round(n)
      : undefined;
  const width = size(asset.width);
  const height = size(asset.height);
  return width && height
    ? { url: asset.url, width, height }
    : { url: asset.url };
}

/** The src and srcSet of a blog post's inline CMS image. */
export function cmsInlineSources(url: string): { src: string; srcSet: string } {
  return {
    src: cmsImg(url, { w: 1920 }),
    srcSet: CMS_BODY_WIDTHS.map((w) => `${cmsImg(url, { w })} ${w}w`).join(
      ", "
    ),
  };
}
