/**
 * What the store sells.
 *
 * The store opens with the vanity range only — vanity tops, vanities
 * and vanity sinks — rather than the whole 300-slab catalogue. These
 * are finished pieces sold by the unit, which is what makes them
 * orderable without a quotation per square foot; everything else stays
 * browsable at /products, which is unaffected.
 *
 * Scoping is by Sanity collection name, so a new vanity or basin
 * published by an editor appears in the store automatically. Matching
 * is case-insensitive and exact against the collection name.
 */
export const STORE_COLLECTIONS: string[] = [
  // Vanity tops and vanities.
  "Vanity",
  // Vanity sinks and basins.
  "Integra",
];

/**
 * Individual products to include regardless of collection. Use this
 * for one-off additions; leave empty when the collection list is
 * enough.
 */
export const STORE_EXTRA_SLUGS: string[] = [];

/** True when this product is offered in the store. */
export function isInStore(input: {
  slug: string;
  collection?: string | null;
}): boolean {
  if (STORE_EXTRA_SLUGS.includes(input.slug)) return true;
  const collection = (input.collection ?? "").trim().toLowerCase();
  if (!collection) return false;
  return STORE_COLLECTIONS.some((c) => c.toLowerCase() === collection);
}
