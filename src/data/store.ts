/**
 * What the store sells, and how it is grouped.
 *
 * The store opens with the vanity range only — vanities, vanity tops
 * and integrated quartz sinks — rather than the whole 300-slab catalogue. These
 * are finished pieces sold by the unit, which is what makes them
 * orderable without a quotation per square foot; everything else stays
 * browsable at /products, which is unaffected.
 *
 * Sanity groups these under two collections, "Vanity" and "Integra",
 * which is not how they are sold. The store sections below are the
 * customer-facing split, and this file is the only place that mapping
 * lives. (Window sills and thresholds were sold here for a day and moved
 * to their own category under Products on 2026-10-05: /products/
 * pacific-european-window-sill-threshold-collection.)
 */

/** Section order on the storefront. */
export const STORE_SECTIONS = [
  "Vanities",
  "Vanity Tops",
  "Integrated Quartz Sinks",
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
  if (collection === "integra") return "Integrated Quartz Sinks";
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

/* ---- off the shelf ----------------------------------------------------
 * Products taken off the storefront grid without being withdrawn. They
 * keep their section, so /shop/<slug> still opens and a cart line that
 * already holds one still has its options; they simply no longer appear
 * on /shop or in a product page's "similar" strip. Nothing changes in
 * Sanity. Delete a line to put the product back on the shelf.
 * ---------------------------------------------------------------------- */
const UNLISTED_SLUGS = new Set<string>([
  // Taken off the Vanity Tops shelf at the owner's request, 2026-09-30,
  // ahead of the single / double / triple basin range.
  "quartz-vanity", // Eterna Blush Quartz Vanity
  "luna-elite-quartz-vanity", // Luna Elite Quartz Vanity
]);

/** False for a product kept off the storefront grid (see above). */
export function isListedInStore(slug: string): boolean {
  return !UNLISTED_SLUGS.has(slug);
}

/* ---- vanity-top layouts -----------------------------------------------
 * How many basins are cut into a top: the first thing a customer knows
 * about the room they are fitting. One made-to-order top per layout (see
 * VANITY_TOP_PRODUCTS below).
 * ---------------------------------------------------------------------- */
export const VANITY_TOP_LAYOUTS = [
  "Single Basin",
  "Double Basin",
  "Triple Basin",
] as const;

export type VanityTopLayout = (typeof VANITY_TOP_LAYOUTS)[number];

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
  /** What the three dimensions are called where they are not length,
   *  width and height: a sill's third dimension is its thickness. */
  labels?: { length?: string; width?: string; height?: string };
}

/** The caption for a dimension, e.g. dimensionLabel(o, "height") ->
 *  "Thickness" on a sill, "Height" on a vanity. */
export function dimensionLabel(options: StoreOptions | undefined, field: "length" | "width" | "height"): string {
  const fallback = { length: "Length", width: "Width", height: "Height" }[field];
  return options?.labels?.[field] ?? fallback;
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
  // Each integrated sink is one basin design; the number of basins is not
  // a choice on these pages (it offered 1–5 on single basins before).
  "Integrated Quartz Sinks": {
    lengths: ["24", "36", "48", "60", CUSTOM_SIZE],
    widths: ["18", "20", "22", CUSTOM_SIZE],
    heights: ["4", "5", "6", CUSTOM_SIZE],
    basins: [],
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
    const trimmed = v.trim();
    // Sanity has "polished"; show it as the defaults do ("Polished").
    const value = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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
  /** The product's name and slug, which often state its size. */
  name?: string;
  slug?: string;
}): StoreOptions {
  const defaults = OPTIONS_BY_SECTION[input.section];
  const named = namedSize(`${input.name ?? ""} ${input.slug ?? ""}`);
  // A product named "Grand Edge (48 x 22 in)" opens at 48 x 22, not at the
  // first default (24 x 18), so the size in the cart matches the name.
  return {
    ...defaults,
    lengths: named ? merge([named.length], defaults.lengths) : defaults.lengths,
    widths: named ? merge([named.width], defaults.widths) : defaults.widths,
    heights: named?.height ? merge([named.height], defaults.heights) : defaults.heights,
    finishes: merge(input.finishes, defaults.finishes),
  };
}

/** "Aura Flow (36 X 22 IN)", "opal basin (22 x 48 x 3 inches)",
 *  "grand-edge-48-x-22-in" → length, width (the larger plan dimension is the
 *  length) and, when given, height. */
function namedSize(text: string): { length: string; width: string; height?: string } | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:x|×|-x-)\s*(\d+(?:\.\d+)?)(?:\s*(?:x|×|-x-)\s*(\d+(?:\.\d+)?))?/i);
  if (!m) return null;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return {
    length: String(Math.max(a, b)),
    width: String(Math.min(a, b)),
    height: m[3],
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

/* ---- made-to-order vanity tops ------------------------------------------
 * One store product per basin layout, shown on the Vanity Tops shelf like
 * any other piece: a card with its options, and a page of its own at
 * /shop/<slug>. They are defined here rather than in Sanity. The basin
 * count is fixed by the layout, and the lengths offered depend on it,
 * because a top has to be long enough for the basins cut into it.
 *
 * A top with layers gets the visualizer treatment on its page: choosing
 * a colour recomposites the stone into the scene (BasinPreview). The
 * lengths are a working range agreed with the owner on 2026-09-30, to be
 * replaced with Pacific's own figures. Custom stays on every list.
 * ---------------------------------------------------------------------- */

export interface MadeToOrderTop {
  /** Cart line id (not a Sanity _id). */
  id: string;
  slug: string;
  name: string;
  layout: VanityTopLayout;
  /** Card and gallery photograph. */
  image: string;
  description: string;
  layers: BasinLayers | null;
}

const VANITY_TOP_LENGTHS: Record<VanityTopLayout, string[]> = {
  "Single Basin": ["24", "30", "36", "48"],
  "Double Basin": ["48", "60", "72"],
  "Triple Basin": ["72", "84", "96"],
};

export const VANITY_TOP_PRODUCTS: MadeToOrderTop[] = [
  {
    id: "vanity-top-single-basin",
    slug: "single-basin-quartz-vanity-top",
    name: "Single Basin Quartz Vanity Top",
    layout: "Single Basin",
    image: "/store-basins/single-basin-scene/base.webp",
    description: "One basin cut into a quartz top, made to your size. Pick a colour to see it on the top.",
    // The owner's four-layer scene (scene, stone mask, shadows, highlights).
    layers: {
      base: "/store-basins/single-basin-scene/base.webp",
      mask: "/store-basins/single-basin-scene/mask.webp",
      shadows: "/store-basins/single-basin-scene/shadows.webp",
      highlights: "/store-basins/single-basin-scene/highlights.webp",
    },
  },
  {
    id: "vanity-top-double-basin",
    slug: "double-basin-quartz-vanity-top",
    name: "Double Basin Quartz Vanity Top",
    layout: "Double Basin",
    image: "/store-basins/double-basin-scene/base.webp",
    description: "Two basins cut into one quartz top, made to your size. Pick a colour to see it on the top.",
    // The owner's four-layer scene (room, stone mask, shadows, highlights).
    layers: {
      base: "/store-basins/double-basin-scene/base.webp",
      mask: "/store-basins/double-basin-scene/mask.webp",
      shadows: "/store-basins/double-basin-scene/shadows.webp",
      highlights: "/store-basins/double-basin-scene/highlights.webp",
    },
  },
  {
    id: "vanity-top-triple-basin",
    slug: "triple-basin-quartz-vanity-top",
    name: "Triple Basin Quartz Vanity Top",
    layout: "Triple Basin",
    image: "/store-basins/triple-basin-scene/base.webp",
    description: "Three basins cut into one long quartz top, made to your size. Pick a colour to see it on the top.",
    // The owner's four-layer scene (scene, stone mask, shadows, highlights).
    layers: {
      base: "/store-basins/triple-basin-scene/base.webp",
      mask: "/store-basins/triple-basin-scene/mask.webp",
      shadows: "/store-basins/triple-basin-scene/shadows.webp",
      highlights: "/store-basins/triple-basin-scene/highlights.webp",
    },
  },
];

export function vanityTopBySlug(slug: string): MadeToOrderTop | null {
  return VANITY_TOP_PRODUCTS.find((t) => t.slug === slug) ?? null;
}

/** The options for a made-to-order top: its lengths, its one basin layout. */
export function vanityTopOptions(layout: VanityTopLayout): StoreOptions {
  const defaults = OPTIONS_BY_SECTION["Vanity Tops"];
  return {
    ...defaults,
    lengths: [...VANITY_TOP_LENGTHS[layout], CUSTOM_SIZE],
    // Shown and ordered as a word ("Single", "Double", "Triple").
    basins: [layout.split(" ")[0]],
  };
}
