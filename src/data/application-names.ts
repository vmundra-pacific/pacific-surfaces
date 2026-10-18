/**
 * The name of every application page, keyed by its slug.
 *
 * Kept apart from applications.ts on purpose. The Products mega ships in
 * the header on every page and only needs each application's name and
 * slug; importing applications.ts there put every page's sections,
 * specs and FAQs into the shared browser bundle. applications.ts reads
 * its `name` fields from here, so the menu label and the page it opens
 * can't drift apart. A new application gets its name here first.
 */
export const APPLICATION_NAMES = {
  "kitchen-countertops": "Kitchen Countertops",
  "kitchen-islands": "Kitchen Islands",
  backsplashes: "Backsplashes",
  "outdoor-kitchens": "Outdoor Kitchens",
  "bathroom-vanity-tops": "Vanity Tops",
  "shower-walls-and-trays": "Shower Walls",
  washbasins: "Washbasins",
  "wall-cladding": "Wall Cladding",
  facades: "Facades",
  flooring: "Flooring",
  staircases: "Staircases",
  "dining-and-furniture": "Dining & Furniture",
  "bar-counters": "Bar Counters",
  "reception-desks": "Reception Desks",
  "waterfall-islands": "Waterfall Islands",
  "feature-walls": "Feature Walls",
  "backlit-features": "Backlit Features",
  "retail-interiors": "Retail Interiors",
  "hospitality-interiors": "Hospitality Interiors",
  "fireplace-surrounds": "Fireplace Surrounds",
} as const;
