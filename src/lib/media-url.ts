/**
 * Picture and file addresses from the Pacific CMS.
 *
 * A CMS answer gives each picture and file as the address of its
 * original, `<folder>/<hash>.<ext>`. Beside every picture the CMS keeps
 * ready-made copies under fixed names in the same folder, and every name
 * exists for every picture (a picture narrower than a copy gets that
 * copy at its own width):
 *
 *   <hash>-w256.webp … <hash>-w3840.webp   WebP, at most that many pixels wide
 *   <hash>-share.jpg                       JPEG, 1200 wide, for share cards
 *
 * So the site picks a copy from the address alone, in the browser too.
 *
 * Three kinds of address are CMS media:
 *   - the media folder, `NEXT_PUBLIC_MEDIA_BASE_URL/<name>`, when that is
 *     set: used as it is. The setting is the folder's full address, the
 *     same one the CMS's answers carry, path included (for example
 *     `https://media.example.com/media`);
 *   - any address whose path is `/api/media/file/<name>`, the CMS's own
 *     file route: visitors cannot open it, so it always goes through
 *     this site's `/api/cdn/m/<name>`;
 *   - this site's `/api/cdn/m/<name>` itself.
 * Anything else (Sanity, files under /public, other hosts) is not CMS
 * media, and every helper here hands it back unchanged.
 *
 * This file runs in the browser (it is behind the image loader), so it
 * imports nothing server-only and reads its one setting as the literal
 * `process.env.NEXT_PUBLIC_MEDIA_BASE_URL`, which the build fills in.
 */

/** The widths of the ready-made copies, smallest first. */
export const MEDIA_WIDTHS = [
  256, 384, 640, 828, 1080, 1290, 1920, 2560, 3840,
] as const;

/** A CMS file name: an original, a width copy or the share card. */
export const MEDIA_NAME_RE =
  /^[0-9a-f]{32}(-w(256|384|640|828|1080|1290|1920|2560|3840)|-share)?\.[a-z0-9]{2,5}$/;

/** This site's pass-through for CMS files. */
export const MEDIA_PROXY_PATH = "/api/cdn/m/";

/** The CMS's own file route. */
const CMS_FILE_PATH = "/api/media/file/";

/** Originals the CMS cuts copies of. Every other file stays as it is. */
const PICTURE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "tif",
  "tiff",
]);

/**
 * The media folder's full address (NEXT_PUBLIC_MEDIA_BASE_URL), without a
 * trailing slash, or null when it is not set. Files sit directly in it.
 */
export function mediaBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.search || url.hash) return null;
  } catch {
    return null;
  }
  return raw.replace(/\/+$/, "");
}

/** The media host's origin (for preconnect), or null when it is not set. */
export function mediaOrigin(): string | null {
  const base = mediaBaseUrl();
  return base ? new URL(base).origin : null;
}

type MediaAddress = {
  /** The file name, `<hash>[-<size>].<ext>`. */
  name: string;
  hash: string;
  /** "w640", "share", or null for an original. */
  size: string | null;
  ext: string;
  /** The media host's address, for an address on it; else null. */
  mediaFolder: string | null;
};

function nameParts(name: string): Omit<MediaAddress, "mediaFolder"> | null {
  if (!MEDIA_NAME_RE.test(name)) return null;
  const dot = name.lastIndexOf(".");
  const stem = name.slice(0, dot);
  return {
    name,
    hash: stem.slice(0, 32),
    size: stem.length > 32 ? stem.slice(33) : null,
    ext: name.slice(dot + 1),
  };
}

const withoutQuery = (value: string) => value.replace(/[?#].*$/, "");

function parseMedia(url: string | null | undefined): MediaAddress | null {
  if (!url || typeof url !== "string") return null;
  const base = mediaBaseUrl();
  if (base && url.startsWith(`${base}/`)) {
    const parts = nameParts(withoutQuery(url.slice(base.length + 1)));
    if (parts) return { ...parts, mediaFolder: base };
  }
  let path: string;
  try {
    path = new URL(url, "http://relative.invalid").pathname;
  } catch {
    return null;
  }
  for (const prefix of [CMS_FILE_PATH, MEDIA_PROXY_PATH]) {
    if (path.startsWith(prefix)) {
      const parts = nameParts(path.slice(prefix.length));
      if (parts) return { ...parts, mediaFolder: null };
    }
  }
  return null;
}

/** True for an address of a CMS picture or file, in any of its three forms. */
export function isCmsMedia(url: string | null | undefined): boolean {
  return parseMedia(url) !== null;
}

/** The file name of a CMS address (`<hash>[-<size>].<ext>`), or null. */
export function cmsMediaName(url: string | null | undefined): string | null {
  return parseMedia(url)?.name ?? null;
}

/** The copy width at or above `width`; above the largest, the largest. */
export function mediaWidthFor(width: number): number {
  return (
    MEDIA_WIDTHS.find((cut) => cut >= width) ??
    MEDIA_WIDTHS[MEDIA_WIDTHS.length - 1]
  );
}

export type CmsImgOptions = {
  /** The width the picture is drawn at: the copy at or above it is used. */
  w?: number;
  /** The share card copy (1200 wide, JPEG) instead of a width. */
  share?: boolean;
  /**
   * The picture fills a `w` x `h` box and is cut to it (object-fit:
   * cover). The copies keep the picture's shape, so the copy asked for is
   * wide enough to cover the box for a picture twice as wide as tall:
   * the copy at or above max(w, 2 x h).
   */
  crop?: boolean;
  /** The box's height, used with `crop`. */
  h?: number;
};

/** The width to ask for: `w`, or for a crop box max(w, 2 x h). */
function widthAskedFor(options: CmsImgOptions): number | undefined {
  const { w, h, crop } = options;
  if (crop && typeof h === "number" && Number.isFinite(h) && h > 0) {
    return Math.max(typeof w === "number" && Number.isFinite(w) ? w : 0, 2 * h);
  }
  return w;
}

/**
 * A CMS address as the browser should load it. A picture asked for at
 * a width becomes the copy at or above that width; `share` asks for the
 * share card; a file that is not a picture (a PDF, a video), or a
 * picture asked for with neither, keeps its name. On the media host the
 * result is on the media host; any other CMS address goes through
 * `/api/cdn/m/`. An address that is not CMS media comes back unchanged.
 */
export function cmsImg(url: string, options: CmsImgOptions = {}): string {
  const media = parseMedia(url);
  if (!media) return url;
  let name = media.name;
  const picture = media.size !== null || PICTURE_EXTENSIONS.has(media.ext);
  const width = widthAskedFor(options);
  if (picture && options.share) {
    name = `${media.hash}-share.jpg`;
  } else if (
    picture &&
    typeof width === "number" &&
    Number.isFinite(width) &&
    width > 0
  ) {
    name = `${media.hash}-w${mediaWidthFor(width)}.webp`;
  }
  return media.mediaFolder
    ? `${media.mediaFolder}/${name}`
    : `${MEDIA_PROXY_PATH}${name}`;
}

/**
 * A CMS address through this site's own `/api/cdn/m/<name>`, for the
 * uses that need the same origin: drawing on a canvas, the catalogue
 * reader's byte ranges, and download links. An address that is not CMS
 * media comes back unchanged.
 */
export function toProxy(url: string): string {
  const media = parseMedia(url);
  return media ? `${MEDIA_PROXY_PATH}${media.name}` : url;
}

/**
 * The site addresses the media host lets read its files' bytes (its
 * sharing rule, CORS): with ranges, for the catalogue reader, and as
 * pixels, for a canvas. These must match that rule: the live site's two
 * addresses and this project's preview deployments. A page on any other
 * address (a laptop, say) goes through /api/cdn/m/ instead, as before.
 */
export const MEDIA_SHARED_WITH: readonly string[] = [
  "https://pacific-surfaces.com",
  "https://www.pacific-surfaces.com",
];
const MEDIA_SHARED_PREVIEW_RE =
  /^https:\/\/pacific-surfaces-[a-z0-9-]+-pacific3\.vercel\.app$/;

/** True when the media host shares its files' bytes with this address. */
export function mediaSharedWith(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return (
    MEDIA_SHARED_WITH.includes(origin) || MEDIA_SHARED_PREVIEW_RE.test(origin)
  );
}

/**
 * A CMS address for a use that reads the file's bytes in the page
 * (drawing a picture on a canvas and reading it back, the catalogue
 * reader's byte ranges): straight from the media host when this page's
 * address is one it shares with (mediaSharedWith), so the file does not
 * pass through this site's server; else through /api/cdn/m/, as toProxy.
 * Decided in the browser, so call it only where the result is not in the
 * server-rendered markup (it is the proxy on the server). An address that
 * is not CMS media comes back unchanged.
 */
export function cmsReadable(url: string): string {
  const media = parseMedia(url);
  if (!media) return url;
  const base = mediaBaseUrl();
  const origin =
    typeof window === "undefined" ? null : (window.location?.origin ?? null);
  if (base && mediaSharedWith(origin)) {
    return `${base}/${media.name}`;
  }
  return `${MEDIA_PROXY_PATH}${media.name}`;
}

/** Where a CMS file name is loaded from: the media host when set, else through `/api/cdn/m/`. */
export function cmsFileAddress(name: string): string {
  const base = mediaBaseUrl();
  return base ? `${base}/${name}` : `${MEDIA_PROXY_PATH}${name}`;
}
