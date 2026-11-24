import type { QuartzHeroVideoProps } from "@/components/catalogue/QuartzHeroVideo";
import { cmsImg, isCmsMedia } from "./media-url";

/**
 * Hero videos picked in the CMS ("Video at the top of the page").
 *
 * A pick reaches the site as the full address of the video file, given
 * the way a picture's original is: in the media folder, or on the CMS's
 * own file route. It is loaded the way every CMS file is (cmsImg in
 * ./media-url: the media folder as it is, the CMS's file route through
 * this site's /api/cdn/m/). The CMS gives no poster picture for it.
 *
 * With no video picked, every page plays the video it has today.
 *
 * This file runs in the browser too (the Careers and Beyond Stone pages
 * are client components), so it imports nothing server-only.
 */

/** The Careers page's own video (plant and people). */
export const CAREERS_HERO_VIDEO = "/videos/careers-hero.mp4";

/**
 * A collection's `heroVideo` from the CMS as the browser loads it, or
 * null when no video is picked. Sanity's collections have no such field,
 * so for them it is always null.
 */
export function pickedHeroVideo(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const address = value.trim();
  return address ? cmsImg(address) : null;
}

/**
 * A range page's hero with the video picked in the CMS: a new hero
 * object with that video playing (so a poster-only hero plays it too),
 * or the same hero, unchanged, when no video is picked. The page's own
 * config is never changed.
 */
export function withPickedHeroVideo(
  hero: QuartzHeroVideoProps | undefined,
  picked: unknown
): QuartzHeroVideoProps | undefined {
  const videoSrc = pickedHeroVideo(picked);
  if (!videoSrc) return hero;
  return { ...hero, videoSrc, posterOnly: false };
}

/**
 * The Careers page's video. Its read answer gives the picked video in
 * `heroVideoUrl` when one is picked, and the typed address otherwise.
 * The page has played its own video whatever the typed address says,
 * so only a video from the CMS's library counts; anything else plays
 * the page's own video, as today.
 */
export function careersHeroVideo(heroVideoUrl: unknown): string {
  if (typeof heroVideoUrl !== "string") return CAREERS_HERO_VIDEO;
  const address = heroVideoUrl.trim();
  return isCmsMedia(address) ? cmsImg(address) : CAREERS_HERO_VIDEO;
}

/**
 * The Beyond Stone page's video, from its `heroVideoUrl` (the picked
 * video, else the typed address, else the page's own file): a CMS file
 * as the browser loads it, anything else as it is.
 */
export function heroVideoAddress(address: string): string {
  return cmsImg(address);
}
