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
    "pacific-kitchen",
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
  // Beyond Stone — the architectural, large-format end of the range.
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
    "pacific-kitchen",
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
    "pacific-kitchen",
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
    "pacific-kitchen",
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

/**
 * The photograph the Products mega shows while an application is
 * hovered. Picked by eye, one per application, so the picture is of the
 * thing named: Shower Walls shows a shower wall, Bar Counters a bar.
 * The menu used to take the first project photo of the matching room
 * type, which gave Countertops, Islands and Backsplashes the same
 * kitchen and Reception Desks an unrelated one.
 *
 * `null` means no photograph of that application exists yet. The menu
 * then shows a plain named plate rather than a wrong picture. Replace
 * the null with a path once one is shot.
 */
const MENU_IMAGE: Record<string, string | null> = {
  "pacific-kitchen": "/projects/islands/artemis-kitchen.webp",
  "kitchen-countertops": "/projects/islands/new-application-image.webp",
  "kitchen-islands": "/projects/islands/statuario.webp",
  "waterfall-islands": "/images/spaces/kitchens.png",
  backsplashes: "/projects/islands/orenda-kitchen-new.webp",
  "bathroom-vanity-tops": "/videos/vanity-poster.jpg",
  "shower-walls-and-trays": "/projects/bathrooms/bathroom.webp",
  washbasins: "/videos/integra-poster.jpg",
  "wall-cladding": "/projects/cladding/horizon-veil.webp",
  "feature-walls": "/projects/cladding/patagonia.webp",
  "backlit-features": "/images/products/translucent.jpeg",
  facades: "/images/products/facades.png",
  flooring: "/images/flooring/card-courtyard.webp",
  "bar-counters": "/projects/islands/patagonia.webp",
  "dining-and-furniture": "/projects/islands/almond-mist-application.webp",
  "hospitality-interiors": "/projects/cladding/tiffany.webp",
  "fireplace-surrounds": "/images/products/vision.png",
  "reception-desks": null,
  staircases: null,
  "retail-interiors": null,
};

/**
 * Where a collection has its own photograph of an application, it wins
 * over the general one above, so Granites › Kitchen Countertops shows a
 * granite worktop. Only designs that belong to the collection are used:
 * the four-digit codes (Arya 3008, Alabaster Noir 3003, Ruskin 5028,
 * Alabaster 3001) are quartz, the P codes (Taj Vein P01, Orenda P25)
 * are Eclipse.
 */
const COLLECTION_MENU_IMAGE: Record<string, Record<string, string>> = {
  quartz: {
    "kitchen-islands": "/projects/islands/arya-application-kitchen.webp",
    "kitchen-countertops": "/projects/islands/alabaster-noir.webp",
    "bathroom-vanity-tops": "/projects/bathrooms/alabaster-and-latte-luxe.webp",
    "wall-cladding": "/projects/cladding/ruskin.webp",
  },
  vision: {
    "pacific-kitchen": "/projects/islands/orenda-application.webp",
    "kitchen-islands": "/projects/islands/taj-application.webp",
    "kitchen-countertops": "/projects/islands/taj-vein-application-2.webp",
  },
  "fab-creations": {
    "bathroom-vanity-tops": "/images/products/fab-creations.jpeg",
  },
  granites: {
    "kitchen-countertops": "/images/products/granites.png",
  },
  "semi-precious": {
    "backlit-features": "/images/products/semi-precious.png",
    "kitchen-islands": "/images/products/semi-precious.png",
  },
};

/** The Products-mega preview for one application of one collection. */
export function menuImageFor(categorySlug: string, applicationSlug: string): string | null {
  return COLLECTION_MENU_IMAGE[categorySlug]?.[applicationSlug] ?? MENU_IMAGE[applicationSlug] ?? null;
}

/**
 * Product pages listed beside the applications in a collection's menu.
 * Not applications (no /applications/<slug> page): each links straight
 * to its own page under /products.
 */
export const MENU_EXTRA_LINKS: Record<string, { name: string; href: string; image: string | null }[]> = {};
const SILLS = {
  name: "Window Sills & Thresholds",
  href: "/products/pacific-european-window-sill-threshold-collection",
  image: "/images/thresholds-and-sills/granite-sills-black-row.jpg",
};
// Listed under Granites and Fab Creations, not as a plate of its own
// (owner, 2026-10-05).
for (const slug of ["granites", "fab-creations"]) MENU_EXTRA_LINKS[slug] = [SILLS];

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
