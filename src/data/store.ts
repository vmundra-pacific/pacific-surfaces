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
 * Modelled on how this range is actually configured elsewhere in the
 * category (quantra.in prices an integrated vanity sink by colour,
 * length, width, height and number of basins). Thickness is not one of
 * the choices: these are finished pieces cut to a size, not slabs sold
 * by the millimetre, and offering it only invited a question the
 * customer cannot answer.
 *
 * Dimensions are in inches, matching the product names already in the
 * catalogue (Aura Flow 36 x 22, Grand Edge 48 x 22).
 * ---------------------------------------------------------------- */

/** Offered in every dimension list, for a piece cut to order. */
export const CUSTOM_SIZE = "Custom";

export interface StoreOptions {
  lengths: string[];
  widths: string[];
  heights: string[];
  /** Empty where the question does not apply. */
  basins: string[];
  finishes: string[];
}

const FINISHES = ["Polished", "Suede", "Leathered", "Matte"];

const OPTIONS_BY_SECTION: Record<StoreSection, StoreOptions> = {
  Vanities: {
    lengths: ["48", "60", "72", CUSTOM_SIZE],
    widths: ["20", "22", "24", CUSTOM_SIZE],
    heights: ["4", "5", "6", CUSTOM_SIZE],
    basins: ["1", "2"],
    finishes: FINISHES,
  },
  "Vanity Tops": {
    lengths: ["36", "48", "60", "72", CUSTOM_SIZE],
    widths: ["18", "20", "22", "24", CUSTOM_SIZE],
    heights: ["4", "5", "6", CUSTOM_SIZE],
    basins: [],
    finishes: FINISHES,
  },
  "Vanity Sinks": {
    lengths: ["24", "36", "48", "60", CUSTOM_SIZE],
    widths: ["18", "20", "22", CUSTOM_SIZE],
    heights: ["4", "5", "6", CUSTOM_SIZE],
    basins: ["1", "2", "3", "4", "5"],
    finishes: FINISHES,
  },
};

/**
 * Merge a product's own values with the section defaults, its own first,
 * ignoring case when deciding what is a duplicate ("polished" from Sanity
 * and "Polished" from the defaults are one option).
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
 * The vanity range carries almost nothing in Sanity — no dimensions, and a
 * single finish on each vanity — so taking the product's values alone would
 * leave a customer with nothing to choose. The section defaults are the
 * range Pacific actually offers, merged in behind whatever the product
 * declares.
 */
export function storeOptions(input: {
  section: StoreSection;
  finishes?: string[] | null;
}): StoreOptions {
  const defaults = OPTIONS_BY_SECTION[input.section];
  return {
    ...defaults,
    finishes: merge(input.finishes, defaults.finishes),
  };
}

/* ---- live colour preview ----------------------------------------------
 * Products with a hand-authored layer set get the visualizer treatment on
 * their store page: choosing a colour recomposites the stone into the bowl
 * rather than just naming it.
 *
 * The layers mirror the demo rooms — base photo, mask, shadows, highlights
 * — and are produced in Photoshop per product. Anything absent from this
 * map simply shows its photograph, so adding a product is a matter of
 * dropping four PNGs into public/store-basins/<name>/ and adding a line.
 */
export interface BasinLayers {
  base: string;
  mask: string;
  shadows?: string;
  highlights?: string;
}

const BASIN_LAYERS: Record<string, BasinLayers> = {
  // The double-basin layer set. Belongs to the vanity tops, not to a
  // single basin: the photograph is a vanity top with two bowls cut into
  // it, which is what these products are.
  "quartz-vanity": {
    base: "/store-basins/double-basin/base.png",
    mask: "/store-basins/double-basin/mask.png",
    shadows: "/store-basins/double-basin/shadows.png",
    highlights: "/store-basins/double-basin/highlights.png",
  },
  "luna-elite-quartz-vanity": {
    base: "/store-basins/double-basin/base.png",
    mask: "/store-basins/double-basin/mask.png",
    shadows: "/store-basins/double-basin/shadows.png",
    highlights: "/store-basins/double-basin/highlights.png",
  },
  "opal-basin": {
    base: "/store-basins/double-basin/base.png",
    mask: "/store-basins/double-basin/mask.png",
    shadows: "/store-basins/double-basin/shadows.png",
    highlights: "/store-basins/double-basin/highlights.png",
  },
};

/** The composite layers for a product, when it has them. */
export function basinLayers(slug: string): BasinLayers | null {
  return BASIN_LAYERS[slug] ?? null;
}
