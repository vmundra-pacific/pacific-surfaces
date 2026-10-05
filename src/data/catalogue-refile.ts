/**
 * Products the site files differently from Sanity, until Sanity itself
 * is corrected.
 *
 * These carried no collection in Sanity and most had the legacy
 * "physical" productType, so they surfaced as "Uncategorised" among the
 * quartz. The owner classified them on 2026-09-30: twelve are granites;
 * White Quartz and the Royal Basin are Fab Creations. The change is made
 * here, in code, by the owner's choice, so nothing moves on the live
 * site until the code is published. Once the same values are set in
 * Sanity, delete the entries.
 *
 * Applied in mapSanityToCatalogue (every catalogue surface) and in the
 * category-page query (so /products/granites and /products/fab-creations
 * fetch them even though Sanity does not point them there).
 */

export interface Refile {
  /** Collection name the catalogue shows. */
  collection: string;
  /** productType the catalogue uses for its sections; unset keeps Sanity's. */
  productType?: string;
  /** The category page (/products/<page>) that should list it. */
  page: string;
}

const GRANITE: Refile = { collection: "Granite", productType: "granite-slab", page: "granites" };
const FAB: Refile = { collection: "Fab Creations", page: "fab-creations" };

export const REFILE: Record<string, Refile> = {
  "ruby-star": GRANITE,
  "sapphire-blue": GRANITE,
  "sierra-white": GRANITE,
  "silver-pearl": GRANITE,
  "spice-black": GRANITE,
  "supreme-black": GRANITE,
  titanium: GRANITE,
  "tropical-brown": GRANITE,
  "tundra-brown": GRANITE,
  "verona-white": GRANITE,
  "white-strata": GRANITE,
  "mist-black": GRANITE,
  "white-quartz": FAB,
  "royal-basin-60-x-21-inches": FAB,
  // Statuario (P27) is filed under Eclipse in Sanity but has no
  // productType, so the quartz section and /products/quartz (both keyed
  // on "quartz-slab") left it out. Owner, 2026-09-30: it belongs in
  // Eclipse.
  statuario: { collection: "Eclipse", productType: "quartz-slab", page: "quartz" },
};

/** Slugs a category page lists on top of what Sanity assigns it. */
export function refiledForPage(page: string): string[] {
  return Object.entries(REFILE)
    .filter(([, r]) => r.page === page)
    .map(([slug]) => slug);
}
