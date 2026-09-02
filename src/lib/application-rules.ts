/**
 * Which materials may be specified for which application.
 *
 * Engineered quartz is resin-bound. UV degrades the resin and yellows
 * the surface, and its thermal movement cracks it outdoors — which is
 * why Cosentino sells Silestone for countertops, bathrooms and
 * furniture only, and routes every facade and floor to Dekton, their
 * resin-free porcelain. We have no porcelain line, so granite (and
 * the Beyond Finish natural-stone range) is the only family we can
 * put outside or on a floor.
 *
 * The `application` field is editor-set per product in Sanity, so
 * nothing stops a quartz slab being tagged "Flooring". This module is
 * the guard: the product page filters its applications through
 * `allowedApplications` before rendering, so a mis-tagged product
 * quietly drops the claim it should not be making rather than
 * publishing it.
 *
 * Values match the `application` enum in sanity/schemas/product.ts.
 */

/** Material families, derived from a product's type and collection. */
export type MaterialFamily =
  | "engineered" // Quartz, Eclipse, Ecosurfaces, Vanity, Exotic
  | "natural" // Granite, Beyond Finish
  | "decorative" // Semi-Precious, Translucent
  | "fabricated"; // Integra sinks, Centrepiece furniture

/**
 * Applications each family may claim. Anything absent is refused.
 * Keys are the Sanity enum values; labels are matched loosely so
 * "Flooring", "flooring" and "Floors" all resolve.
 */
const ALLOWED: Record<MaterialFamily, string[]> = {
  // Indoor, non-structural, non-trafficked. No outdoor, no facade,
  // no flooring.
  engineered: [
    "countertops",
    "island-tops",
    "vanity-top",
    "wall-cladding",
    "backsplash",
    "table-top",
  ],
  // The only family cleared for weather and foot traffic.
  natural: [
    "countertops",
    "island-tops",
    "vanity-top",
    "wall-cladding",
    "flooring",
    "backsplash",
    "table-top",
  ],
  // Feature material. Not a working surface, not a floor.
  decorative: ["wall-cladding", "table-top"],
  // Made as a finished object; the application is the object itself.
  fabricated: ["countertops", "vanity-top", "table-top"],
};

/**
 * Work out which family a product belongs to from its Sanity
 * productType and collection name. Defaults to "engineered" — the
 * most restrictive of the two slab families — so an untagged or
 * unrecognised product errs toward claiming less, not more.
 */
export function materialFamily(input: {
  productType?: string | null;
  collectionName?: string | null;
  categoryName?: string | null;
}): MaterialFamily {
  const type = (input.productType ?? "").toLowerCase();
  const context =
    `${input.collectionName ?? ""} ${input.categoryName ?? ""}`.toLowerCase();

  if (type === "quartz-sink" || context.includes("integra"))
    return "fabricated";
  if (context.includes("centrepiece")) return "fabricated";

  if (type === "semi-precious" || context.includes("semi-precious"))
    return "decorative";
  if (context.includes("translucent")) return "decorative";

  if (type === "granite-slab" || type === "granite-finish") return "natural";
  if (context.includes("granite")) return "natural";
  if (context.includes("beyond finish") || context.includes("stone finishes"))
    return "natural";

  return "engineered";
}

/** Normalise a label or enum value to its enum form for comparison. */
function normalise(application: string): string {
  const a = application.toLowerCase().trim();
  if (a.includes("floor")) return "flooring";
  if (a.includes("island")) return "island-tops";
  if (a.includes("vanity")) return "vanity-top";
  if (a.includes("clad")) return "wall-cladding";
  if (a.includes("backsplash") || a.includes("splashback")) return "backsplash";
  if (a.includes("table")) return "table-top";
  if (a.includes("counter") || a.includes("worktop")) return "countertops";
  return a.replace(/\s+/g, "-");
}

/** True when this family may be specified for this application. */
export function isApplicationAllowed(
  application: string,
  family: MaterialFamily
): boolean {
  return ALLOWED[family].includes(normalise(application));
}

/**
 * Drop any application a product's material cannot honestly claim.
 * Order is preserved so an editor's intended emphasis survives.
 */
export function allowedApplications(
  applications: string[],
  family: MaterialFamily
): string[] {
  return applications.filter((a) => isApplicationAllowed(a, family));
}
