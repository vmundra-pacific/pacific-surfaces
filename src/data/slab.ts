/**
 * The superjumbo slab, as the owner gave it (2026-10-28): 137 × 79 inches,
 * 3,500 × 2,050 mm ("2050 X 3500MM SLAB SIZE"). The millimetres are the
 * owner's nominal size, not a conversion of the inches (137 × 79 in is
 * 3,480 × 2,007 mm). Every page that states the slab size takes it from
 * here, or writes the same numbers.
 */
export const SLAB_IN = "137 × 79 in";
export const SLAB_MM = "3,500 × 2,050 mm";
export const SLAB_SIZE = `${SLAB_IN} (${SLAB_MM})`;

/**
 * A size typed into Sanity ("137 x 79 inches") shown in full. Anything
 * that is not the superjumbo slab (a granite size, a sill) is left alone.
 */
export function slabSizeLabel(size: string): string {
  return /(^|[^\d.])137(\.0)?\s*(["″”]|in\w*)?\s*[x×X]\s*79(\.0)?(?![\d.])/.test(
    size
  )
    ? SLAB_SIZE
    : size;
}
