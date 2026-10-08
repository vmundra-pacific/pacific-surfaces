/**
 * Where a Sanity collection lives on the site.
 *
 * Product pages link their collection (breadcrumb, label, BreadcrumbList
 * JSON-LD). The Sanity slug is not always a route: the quartz series live
 * under /products/quartz/<series>, and several collections are shown on a
 * category page with a different slug. Linking the raw slug sent about 300
 * product pages to a 404 (site audit, 2026-10-01).
 */

/** Quartz and Eclipse series, each with a page at /products/quartz/<slug>. */
const QUARTZ_SERIES = new Set(["kosmic", "nebula", "chromia", "aurora", "celestia", "luminara", "solid-series"]);

/** Collections shown on a category page under another slug. */
const TO_CATEGORY: Record<string, string> = {
  granite: "granites",
  granites: "granites",
  sinks: "integra",
  "semi-precious-stones": "semi-precious",
  "exotic-collection": "exotic",
  quartzite: "exotic",
  "stone-finishes": "facades-and-finishes",
  cuttosize: "fab-creations",
  "eco-surface": "ecosurfaces",
  ecosurfaces: "ecosurfaces",
  "monolith-quartz-vanity": "vanity",
  vanity: "vanity",
  translucent: "translucent",
  "centrepiece-couture": "centrepiece-couture",
  quartz: "quartz",
  // "Top Collection" (slug "Nebula") and Statuario sit in the quartz range.
  Nebula: "quartz/nebula",
  statuario: "quartz/chromia",
};

export function collectionPath(slug: string | undefined | null): string {
  if (!slug) return "/products";
  if (TO_CATEGORY[slug]) return `/products/${TO_CATEGORY[slug]}`;
  if (QUARTZ_SERIES.has(slug)) return `/products/quartz/${slug}`;
  // Colour tags and other legacy collections have no page of their own.
  return "/products";
}
