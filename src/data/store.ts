/**
 * What the store sells, and how it is grouped.
 *
 * The store opens with the vanity range only — vanities, vanity tops
 * and vanity sinks — rather than the whole 300-slab catalogue. These
 * are finished pieces sold by the unit, which is what makes them
 * orderable without a quotation per square foot; everything else stays
 * browsable at /products, which is unaffected.
 *
 * Sanity groups these under two collections, "Vanity" and "Integra",
 * which is not how they are sold. The three store sections below are
 * the customer-facing split, and this file is the only place that
 * mapping lives.
 */

/** Section order on the storefront. */
export const STORE_SECTIONS = [
  "Vanities",
  "Vanity Tops",
  "Vanity Sinks",
] as const;

export type StoreSection = (typeof STORE_SECTIONS)[number];

/**
 * Products whose section can't be inferred from their collection.
 *
 * The Vanity collection holds both whole vanities and vanity tops, and
 * nothing in the product data separates them — the distinction only
 * shows up in each product's own SEO title ("Luxury Architectural
 * Vanity" versus "Premium Bathroom Vanity Top"). Listed explicitly
 * here so the split is visible and editable rather than guessed at
 * runtime. Anything in the Vanity collection but absent from this map
 * falls back to Vanity Tops.
 */
const SECTION_BY_SLUG: Record<string, StoreSection> = {
  "monolith-quartz-vanity": "Vanities",
  "quartz-vanity": "Vanity Tops",
  "luna-elite-quartz-vanity": "Vanity Tops",
};

/**
 * The store section a product belongs to, or null when it isn't sold
 * in the store at all.
 */
export function storeSection(input: {
  slug: string;
  collection?: string | null;
}): StoreSection | null {
  const explicit = SECTION_BY_SLUG[input.slug];
  if (explicit) return explicit;

  const collection = (input.collection ?? "").trim().toLowerCase();
  // Integra is the sink line — every basin in it is a vanity sink.
  if (collection === "integra") return "Vanity Sinks";
  // A new vanity an editor publishes lands in Vanity Tops until it is
  // given a section above. Better a slightly wrong shelf than missing
  // from the store entirely.
  if (collection === "vanity") return "Vanity Tops";

  return null;
}

/** True when this product is offered in the store. */
export function isInStore(input: {
  slug: string;
  collection?: string | null;
}): boolean {
  return storeSection(input) !== null;
}
