import "server-only";
import { unstable_cache } from "next/cache";
import { cmsFileAddress, cmsImg, MEDIA_NAME_RE } from "@/lib/media-url";
import { CMS_CACHE_TAG } from "./client";
import * as cms from "./read";

/**
 * Old Sanity file addresses on this site
 * (/api/cdn/images|files/<project>/<dataset>/<asset>), sent on to the
 * same file in the CMS. Used by src/app/api/cdn/[...path]/route.ts, only
 * with CONTENT_SOURCE=cms.
 *
 * The CMS's `legacy-files` answer names, for each old address, the file
 * it became. It is kept for a day, and cleared by a content-changed
 * notice like the other CMS reads.
 */

/** How long the list of old addresses is kept, in seconds. */
const KEPT_FOR_S = 86_400;

/**
 * Where an old address goes: the file's address in the CMS, or null when
 * the list does not know it. A `w` from the old address picks the copy at
 * or above that width, for a picture.
 */
export function legacyTarget(
  files: Record<string, unknown> | null | undefined,
  sanityAddress: string,
  w: string | null
): string | null {
  if (!files || !Object.prototype.hasOwnProperty.call(files, sanityAddress)) {
    return null;
  }
  const name = files[sanityAddress];
  if (typeof name !== "string" || !MEDIA_NAME_RE.test(name)) return null;
  const width = w !== null && /^\d{1,5}$/.test(w) ? Number(w) : undefined;
  return cmsImg(cmsFileAddress(name), { w: width });
}

let cachedList: (() => Promise<Record<string, string>>) | null = null;

/** The CMS's list of old addresses, kept for a day. Made on first use. */
function legacyList(): Promise<Record<string, string>> {
  cachedList ??= unstable_cache(
    () => cms.legacyFiles<Record<string, string>>(),
    ["cms-read", "legacy-files"],
    { revalidate: KEPT_FOR_S, tags: [CMS_CACHE_TAG] }
  );
  return cachedList();
}

/**
 * Where an old address goes, or null: unknown, or the list could not be
 * read. A null leaves the address to Sanity, as before.
 */
export async function legacyRedirect(
  sanityAddress: string,
  w: string | null
): Promise<string | null> {
  try {
    return legacyTarget(await legacyList(), sanityAddress, w);
  } catch {
    return null;
  }
}
