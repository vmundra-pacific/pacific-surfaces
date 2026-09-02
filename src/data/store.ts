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

/* ---- orderable options ------------------------------------------
 * Vanities and basins carry almost nothing in Sanity: no thickness at
 * all, and at most one finish. But size, thickness and finish are
 * exactly what a customer is choosing when they order one, so the
 * store supplies the choices per section and lets the product's own
 * data win wherever it exists.
 *
 * Sizes are drawn from the range as built — the basin names already
 * encode 36 x 22 and 48 x 22 — plus a custom option, since these are
 * cut to order and a non-standard vanity is a normal request rather
 * than an exception.
 * ---------------------------------------------------------------- */

/** Chosen from the size list to enter your own dimensions. */
export const CUSTOM_SIZE = "Custom size";

interface SectionOptions {
  sizes: string[];
  thicknesses: string[];
  finishes: string[];
}

const OPTIONS_BY_SECTION: Record<StoreSection, SectionOptions> = {
  Vanities: {
    sizes: ['48" x 22"', '60" x 22"', '72" x 22"', CUSTOM_SIZE],
    thicknesses: ["1.2 cm", "2 cm", "3 cm"],
    finishes: ["Polished", "Suede", "Leathered", "Matte"],
  },
  "Vanity Tops": {
    sizes: ['36" x 22"', '48" x 22"', '60" x 22"', '72" x 22"', CUSTOM_SIZE],
    thicknesses: ["1.2 cm", "2 cm", "3 cm"],
    finishes: ["Polished", "Suede", "Leathered", "Matte"],
  },
  "Vanity Sinks": {
    sizes: ['24" x 18"', '36" x 22"', '48" x 22"', CUSTOM_SIZE],
    thicknesses: ["2 cm", "3 cm"],
    finishes: ["Polished", "Suede", "Leathered", "Matte"],
  },
};

/**
 * Merge a product's own values with the section defaults, its own
 * first, ignoring case when deciding what is a duplicate ("polished"
 * from Sanity and "Polished" from the defaults are one option).
 */
function merge(own: string[] | null | undefined, fallback: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of [...(own ?? []), ...fallback]) {
    const value = v.trim();
    if (!value) continue;
    const k = value.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(value);
  }
  return out;
}

/**
 * The options offered for one storefront product.
 *
 * The vanity range carries almost nothing in Sanity — no thickness at
 * all, and a single finish on each vanity — so taking the product's
 * values alone would leave a customer with nothing to choose. The
 * section defaults are the range Pacific actually offers, so they are
 * merged in behind whatever the product declares rather than only
 * filling in when it declares nothing.
 */
export function storeOptions(input: {
  section: StoreSection;
  thicknesses?: string[] | null;
  finishes?: string[] | null;
}): SectionOptions {
  const defaults = OPTIONS_BY_SECTION[input.section];
  return {
    sizes: defaults.sizes,
    thicknesses: merge(input.thicknesses, defaults.thicknesses),
    finishes: merge(input.finishes, defaults.finishes),
  };
}
