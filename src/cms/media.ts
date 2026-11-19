import "server-only";
import {
  cmsImg,
  cmsMediaName,
  isCmsMedia,
  MEDIA_NAME_RE,
  mediaBaseUrl,
} from "@/lib/media-url";
import {
  cmsBaseUrl,
  cmsReadKey,
  PROTECTION_BYPASS_HEADER,
  protectionBypass,
  READ_KEY_HEADER,
  READ_KEY_SCHEME,
} from "./client";

/**
 * Fetching a CMS file on this server: for /api/cdn/m/<name> and for the
 * share images. Only `fetch` is used, so it also runs on the edge.
 *
 * A file is fetched from the media folder when this site knows it
 * (NEXT_PUBLIC_MEDIA_BASE_URL, the folder's full address), as
 * `<folder>/<name>`, with no header of ours. Otherwise it is fetched from
 * the CMS's own file route at CMS_URL, which answers only a signed-in
 * reader: with the reader login's key (CMS_READ_KEY) and, when set, the
 * deployment-protection pass. Without the key that route refuses, so no
 * request is made. The key and the pass go to CMS_URL and nowhere else,
 * and no redirect is followed. Only a file name is ever taken from
 * outside: where it is fetched from comes from this site's settings.
 */

export type MediaUpstream = {
  url: string;
  headers: Record<string, string>;
};

/** Where a CMS file is fetched from, or null when that is not set up. */
export function mediaUpstream(name: string): MediaUpstream | null {
  if (!MEDIA_NAME_RE.test(name)) return null;
  const media = mediaBaseUrl();
  if (media) return { url: `${media}/${name}`, headers: {} };
  const cms = cmsBaseUrl();
  if ("problem" in cms) return null;
  const key = cmsReadKey();
  if (!key) return null;
  const headers: Record<string, string> = {
    [READ_KEY_HEADER]: `${READ_KEY_SCHEME} ${key}`,
  };
  const bypass = protectionBypass();
  if (bypass) headers[PROTECTION_BYPASS_HEADER] = bypass;
  return { url: `${cms.base}/api/media/file/${name}`, headers };
}

/** How long a share image waits for its picture. */
const SHARE_IMAGE_TIMEOUT_MS = 8_000;

/** Bytes as base64, in pieces small enough for String.fromCharCode. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/**
 * The share card copy of a CMS picture (1200 wide, JPEG), as a data:
 * address a share image can draw without fetching it again. Undefined
 * when the address is not a CMS picture or the copy cannot be had; the
 * share image is then drawn without a photograph.
 */
export async function cmsShareImage(
  url: string | null | undefined
): Promise<string | undefined> {
  if (!url || !isCmsMedia(url)) return undefined;
  const name = cmsMediaName(cmsImg(url, { share: true }));
  if (!name?.endsWith("-share.jpg")) return undefined;
  const upstream = mediaUpstream(name);
  if (!upstream) return undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHARE_IMAGE_TIMEOUT_MS);
  try {
    const response = await fetch(upstream.url, {
      headers: upstream.headers,
      redirect: "manual",
      signal: controller.signal,
    });
    const type = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (response.status !== 200 || !type.startsWith("image/")) {
      await response.body?.cancel().catch(() => undefined);
      return undefined;
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    return `data:${type};base64,${toBase64(bytes)}`;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}
