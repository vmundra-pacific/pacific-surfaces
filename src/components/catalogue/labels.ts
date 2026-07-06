/**
 * Shared display labels for catalogue filter values.
 *
 * Sanity stores enum tokens / collection names verbatim; the front-end
 * surfaces them through the maps below. Keeping a single source of
 * truth means the Product Type pill, the Collection pill, the active
 * chips strip, and the grouped-grid section headings all stay in sync
 * - change a label here and every surface picks it up.
 */
import type { Slab } from "@/data/slabs";

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  "quartz-slab": "Mineral infused low silica surface",
  "granite-slab": "Granite",
  "quartz-sink": "Integra",
  "granite-finish": "Beyond Finish",
  "semi-precious": "Semi-Precious Stones",
  luxury: "Luxury",
};

export const COLLECTION_LABELS: Record<string, string> = {
  "Vision Series": "Eclipse",
  Vision: "Eclipse",
  "Stone Finishes": "Beyond Finish",
};

export const PRODUCT_TYPE_SECTION_ORDER: string[] = [
  "quartz-slab",
  "granite-slab",
  "semi-precious",
  "quartz-sink",
];

// productType tokens that should NOT render as their own section on
// the grouped /products page. Editors can still tag products with
// these types - they just won't surface as a section heading.
// Currently retiring: "luxury" and "physical" (a Sanity-side typo /
// legacy enum that crept in).
export const PRODUCT_TYPES_TO_HIDE_FROM_SECTIONS: Set<string> = new Set([
  "luxury",
  "physical",
]);

// Collection-name -> target productType section override. Lets us
// route specific branded collections into a different section than
// their underlying productType would suggest.
//
// Use case: Centrepiece Couture and Vanity products are both tagged
// productType="luxury" in Sanity (which we hide from sections), but
// editorially they belong under the Integra (quartz-sink) section
// on /products. Mapping by collection name keeps Exotic Collection
// (also productType="luxury") correctly hidden.
//
// Case-sensitive match against the slab's `collection` field exactly
// as Sanity stores it.
export const COLLECTION_TO_SECTION: Record<string, string> = {
  "Centrepiece Couture": "quartz-sink",
  Vanity: "quartz-sink",
};

export function titleCase(value: string): string {
  if (!value) return value;
  return value
    .split(/[\s\-_]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

export function formatCollection(name: string): string {
  return COLLECTION_LABELS[name] ?? name;
}

export function formatProductType(token: string | undefined | null): string {
  if (!token) return "Other";
  return PRODUCT_TYPE_LABELS[token] ?? titleCase(token);
}

export function formatCollectionWithType(
  name: string,
  typeMap?: Map<string, string> | ReadonlyMap<string, string>
): string {
  const collectionLabel = formatCollection(name);
  const type = typeMap?.get(name);
  if (!type) return collectionLabel;
  const typeLabel = formatProductType(type);
  if (typeLabel === "Other") return collectionLabel;
  return typeLabel + " - " + collectionLabel;
}

export interface GroupedSection {
  key: string;
  label: string;
  slabs: Slab[];
}

/**
 * Decide which section a slab belongs to on the grouped /products
 * page. Order of precedence:
 *   1. Collection-name override (COLLECTION_TO_SECTION) - lets us
 *      pull specific branded collections into a different section
 *      than their raw productType would suggest.
 *   2. Slab's productType.
 *   3. "" (empty key) -> "Other" bucket.
 */
function sectionKeyFor(slab: Slab): string {
  const override = COLLECTION_TO_SECTION[slab.collection];
  if (override) return override;
  return slab.productType ?? "";
}

export function groupByProductType(slabs: Slab[]): GroupedSection[] {
  const buckets = new Map<string, Slab[]>();
  for (const slab of slabs) {
    const key = sectionKeyFor(slab);
    // Skip slabs whose effective section key is on the hide list -
    // they don't get bucketed, so no section appears for them.
    // Slabs without any productType (key === "") still land in the
    // "Other" bucket; we only filter the explicitly retired tokens.
    if (key && PRODUCT_TYPES_TO_HIDE_FROM_SECTIONS.has(key.toLowerCase()))
      continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(slab);
  }
  const keys = Array.from(buckets.keys()).sort((a, b) => {
    if (a === "" && b !== "") return 1;
    if (b === "" && a !== "") return -1;
    const ai = PRODUCT_TYPE_SECTION_ORDER.indexOf(a);
    const bi = PRODUCT_TYPE_SECTION_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  return keys.map((key) => ({
    key,
    label: formatProductType(key),
    slabs: buckets.get(key)!,
  }));
}
