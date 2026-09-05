import { APPLICATIONS, type Application } from "@/data/applications";

/**
 * Which applications each product collection is shown for.
 *
 * The Products mega used to list one flat set of fifteen applications
 * against every category, which claimed the same uses for translucent
 * backlit panels as for granite. Each collection now gets its own
 * list, in its own order, drawn from the canonical applications in
 * applications.ts — so every label in the menu is the title of the
 * page it opens.
 *
 * The lists come from Pacific's own application sheets. Wording was
 * harmonised where the sheets said the same thing differently: "Bar
 * Counters", "Custom Bar Counters" and "Luxury Bar Counters" are one
 * application, and "Exterior Facades" and "Facade Cladding" are
 * Facades. Collapsing them keeps one real page per use instead of
 * three near-identical ones.
 *
 * The material rules in lib/application-rules still hold: engineered
 * surfaces (Quartz, Eclipse, Fab Creations) claim no facades and no
 * flooring, and the decorative lines (Translucent, Semi-Precious) stay
 * off working and trafficked surfaces.
 *
 * Keys are the category slugs used by PRODUCTS_CATEGORIES in Header.
 */
export const COLLECTION_APPLICATIONS: Record<string, string[]> = {
  // Mineral infused low silica surface — the flagship engineered line.
  quartz: [
    "kitchen-countertops",
    "kitchen-islands",
    "backsplashes",
    "bathroom-vanity-tops",
    "shower-walls-and-trays",
    "washbasins",
    "wall-cladding",
    "reception-desks",
    "bar-counters",
    "dining-and-furniture",
  ],
  // Beyond Finish — the architectural, large-format end of the range.
  "facades-and-finishes": [
    "feature-walls",
    "facades",
    "wall-cladding",
    "flooring",
    "staircases",
    "reception-desks",
    "retail-interiors",
    "hospitality-interiors",
    "bar-counters",
    "dining-and-furniture",
  ],
  // Eclipse — inlayered design quartz. Engineered, so interiors only.
  vision: [
    "kitchen-countertops",
    "kitchen-islands",
    "waterfall-islands",
    "bathroom-vanity-tops",
    "bar-counters",
    "reception-desks",
    "dining-and-furniture",
    "feature-walls",
    "wall-cladding",
    "backsplashes",
  ],
  // Fab Creations — bespoke cut-to-size, so the list leans to the
  // pieces that are made rather than specified from a catalogue.
  "fab-creations": [
    "waterfall-islands",
    "kitchen-countertops",
    "kitchen-islands",
    "bathroom-vanity-tops",
    "bar-counters",
    "reception-desks",
    "dining-and-furniture",
    "feature-walls",
    "wall-cladding",
  ],
  // Translucent — backlit only; it is a light source, not a worktop.
  translucent: [
    "backlit-features",
    "feature-walls",
    "bar-counters",
    "reception-desks",
    "kitchen-islands",
    "bathroom-vanity-tops",
  ],
  // Granites — natural stone, the only line cleared for outdoors and
  // underfoot.
  granites: [
    "kitchen-countertops",
    "kitchen-islands",
    "bathroom-vanity-tops",
    "shower-walls-and-trays",
    "wall-cladding",
    "reception-desks",
    "bar-counters",
    "dining-and-furniture",
    "staircases",
    "facades",
  ],
  // Semi-Precious Stones — statement material, never a working
  // surface.
  "semi-precious": [
    "feature-walls",
    "backlit-features",
    "bar-counters",
    "reception-desks",
    "kitchen-islands",
    "bathroom-vanity-tops",
    "dining-and-furniture",
    "wall-cladding",
  ],
};

/** Shown when a category has no list of its own. */
const FALLBACK = [
  "kitchen-countertops",
  "kitchen-islands",
  "bathroom-vanity-tops",
  "wall-cladding",
  "reception-desks",
  "bar-counters",
];

const BY_SLUG = new Map(APPLICATIONS.map((a) => [a.slug, a]));

/**
 * The applications to list for a product category, resolved to full
 * records. Unknown slugs are dropped rather than rendered as broken
 * links, so a typo here can never ship a 404 into the menu.
 */
export function applicationsForCollection(categorySlug: string): Application[] {
  const slugs = COLLECTION_APPLICATIONS[categorySlug] ?? FALLBACK;
  return slugs.flatMap((slug) => {
    const app = BY_SLUG.get(slug);
    return app ? [app] : [];
  });
}
