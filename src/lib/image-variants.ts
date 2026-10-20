import variants from "@/data/image-variants.json";

/**
 * Ready-made smaller copies of our own large photographs, written by
 * scripts/make-image-variants.mjs (WebP at quality 95, lossless where the
 * image has transparency, never wider than the original). The image
 * loader and the basin preview pick from them so a thumbnail or a phone
 * frame no longer downloads the full-size original.
 */
const SETS = variants as Record<string, Record<string, string>>;

const widthsOf = (set: Record<string, string>) =>
  Object.keys(set)
    .map(Number)
    .sort((a, b) => a - b);

/** Whether a local image has prepared copies. */
export function hasVariants(src: string): boolean {
  return src.split("?")[0] in SETS;
}

/** The smallest copy at least `width` pixels wide (the largest when none
 *  is that wide), or null when the image has no copies. */
export function localVariant(src: string, width: number): string | null {
  const set = SETS[src.split("?")[0]];
  if (!set) return null;
  const widths = widthsOf(set);
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  return set[String(w)];
}

/** The width of the copy localVariant() would pick, or null. */
export function variantWidth(src: string, width: number): number | null {
  const set = SETS[src.split("?")[0]];
  if (!set) return null;
  const widths = widthsOf(set);
  return widths.find((x) => x >= width) ?? widths[widths.length - 1];
}
