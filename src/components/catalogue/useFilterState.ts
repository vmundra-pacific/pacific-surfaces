"use client";

/**
 * Centralized filter state for the catalogue.
 *
 * Why a custom hook:
 *  - Keeps <CatalogueClient>, <FilterBar>, <ActiveChips>, and <SlabGrid>
 *    all reading from the same source of truth without prop drilling or
 *    a global context (the page is isolated enough that context would
 *    be overkill).
 *  - Centralizes the Set-based toggle logic so components just call
 *    `toggle('hue', 'white')` instead of duplicating set-copy boilerplate.
 */

import { useMemo, useState } from "react";
import type {
  Slab,
  Collection,
  Pattern,
  Finish,
  Thickness,
} from "@/data/slabs";

export type SortKey = "new" | "name-asc" | "name-desc" | "collection";

export interface FilterState {
  /**
   * Hue selection — `string` rather than the predefined `Hue` union
   * so editors can add custom hue tags via Sanity (e.g. "lavender")
   * and have them flow through the filter set unchanged. Predefined
   * hues retain their hand-tuned gradients in HUE_OPTIONS; custom
   * ones get a neutral fallback gradient in the FilterBar.
   */
  hues: Set<string>;
  collections: Set<Collection>;
  /**
   * Product type (Pacific's broad material taxonomy) — separate from
   * collections so the Collection filter is reserved for actual
   * brand-line collections (Aurora, Kosmic, etc.) and product
   * families like Quartz / Granite / Semi-Precious live here.
   */
  productTypes: Set<string>;
  patterns: Set<Pattern>;
  finishes: Set<Finish>;
  thicknesses: Set<Thickness>;
}

export type FilterKey = keyof FilterState;

const emptyState = (): FilterState => ({
  hues: new Set(),
  collections: new Set(),
  productTypes: new Set(),
  patterns: new Set(),
  finishes: new Set(),
  thicknesses: new Set(),
});

export function useFilterState(slabs: Slab[]) {
  const [filters, setFilters] = useState<FilterState>(emptyState());
  const [sort, setSort] = useState<SortKey>("new");
  const [dense, setDense] = useState(false);
  const [query, setQuery] = useState("");

  /* --- Core toggle helper ------------------------------------------ */
  function toggle<K extends FilterKey>(
    key: K,
    value: FilterState[K] extends Set<infer V> ? V : never
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) } as FilterState;
      const set = next[key] as Set<typeof value>;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return next;
    });
  }

  function remove<K extends FilterKey>(
    key: K,
    value: FilterState[K] extends Set<infer V> ? V : never
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) } as FilterState;
      (next[key] as Set<typeof value>).delete(value);
      return next;
    });
  }

  function clearAll() {
    setFilters(emptyState());
  }

  /* --- Apply filters + sort ---------------------------------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = slabs.filter((s) => {
      // Text search: match against name and collection
      if (q) {
        const haystack = `${s.name} ${s.collection}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Hue: slab must have at least one selected hue (OR within category)
      if (filters.hues.size > 0) {
        if (!s.hues.some((h) => filters.hues.has(h))) return false;
      }
      // Collection
      if (
        filters.collections.size > 0 &&
        !filters.collections.has(s.collection)
      ) {
        return false;
      }
      // Product Type (Quartz / Granite / etc.)
      if (
        filters.productTypes.size > 0 &&
        (!s.productType || !filters.productTypes.has(s.productType))
      ) {
        return false;
      }
      // Pattern
      if (filters.patterns.size > 0 && !filters.patterns.has(s.pattern)) {
        return false;
      }
      // Finish: OR within category
      if (filters.finishes.size > 0) {
        if (!s.finishes.some((f) => filters.finishes.has(f))) return false;
      }
      // Thickness: OR within category
      if (filters.thicknesses.size > 0) {
        if (!s.thicknesses.some((t) => filters.thicknesses.has(t)))
          return false;
      }
      return true;
    });

    // Sort
    switch (sort) {
      case "name-asc":
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        out.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "collection":
        out.sort((a, b) => a.collection.localeCompare(b.collection));
        break;
      case "new":
      default:
        // "New" ribbons float to the top, then featured, then the rest
        out.sort((a, b) => {
          const rank = (r: typeof a.ribbon) =>
            r === "new" ? 0 : r === "featured" ? 1 : 2;
          return rank(a.ribbon) - rank(b.ribbon);
        });
    }

    return out;
  }, [slabs, filters, sort, query]);

  /* --- Count how many slabs would match each candidate option ------ *
   * Used to render "Vision Series (24)" style counts. Computing this
   * against the current filter state (but excluding the category being
   * counted) gives "combinable" counts that update live.
   */
  function countFor<K extends FilterKey>(
    key: K,
    value: FilterState[K] extends Set<infer V> ? V : never
  ): number {
    return slabs.filter((s) => {
      // Apply all filters EXCEPT the one we're counting against
      for (const fk of Object.keys(filters) as FilterKey[]) {
        if (fk === key) continue;
        const set = filters[fk];
        if (set.size === 0) continue;

        if (fk === "hues") {
          if (!s.hues.some((h) => (set as Set<string>).has(h))) return false;
        } else if (fk === "collections") {
          if (!(set as Set<Collection>).has(s.collection)) return false;
        } else if (fk === "productTypes") {
          if (!s.productType || !(set as Set<string>).has(s.productType))
            return false;
        } else if (fk === "patterns") {
          if (!(set as Set<Pattern>).has(s.pattern)) return false;
        } else if (fk === "finishes") {
          if (!s.finishes.some((f) => (set as Set<Finish>).has(f)))
            return false;
        } else if (fk === "thicknesses") {
          if (!s.thicknesses.some((t) => (set as Set<Thickness>).has(t)))
            return false;
        }
      }
      // Then check if this slab matches the candidate value for `key`
      if (key === "hues") return s.hues.includes(value as string);
      if (key === "collections") return s.collection === value;
      if (key === "productTypes") return s.productType === value;
      if (key === "patterns") return s.pattern === value;
      if (key === "finishes") return s.finishes.includes(value as Finish);
      if (key === "thicknesses")
        return s.thicknesses.includes(value as Thickness);
      return false;
    }).length;
  }

  const activeCount =
    filters.hues.size +
    filters.collections.size +
    filters.productTypes.size +
    filters.patterns.size +
    filters.finishes.size +
    filters.thicknesses.size;

  /* --- Unique option values derived from current data set ----------- */
  // Collection names that are actually product-type categories. We
  // hide these from the Collection filter because they're surfaced
  // under the new Product Type filter instead. Editors can still tag
  // products with these collection names; the catalogue just doesn't
  // double-list them.
  const COLLECTION_NAMES_TO_HIDE = new Set([
    "Granite",
    "Stone Finishes",
    "Semi Precious Stones",
    "Semi-Precious Stones",
    "Vanity",
    "Integra",
    "Vision",
  ]);
  const uniqueCollections = useMemo(
    () =>
      Array.from(new Set(slabs.map((s) => s.collection)))
        .filter((c) => !COLLECTION_NAMES_TO_HIDE.has(c))
        .sort(),
    [slabs]
  );
  // Product-type values we don't want surfacing in the catalogue
  // filter. "granite-finish" + "luxury" are existing Sanity enum
  // tokens that the brand has retired from front-end browsing;
  // "physical" is an editor-typed alternate that crept in. Hiding
  // them client-side keeps the filter clean without forcing a
  // Sanity-side migration.
  const PRODUCT_TYPES_TO_HIDE = new Set([
    "granite-finish",
    "luxury",
    "physical",
  ]);
  const uniqueProductTypes = useMemo(
    () =>
      Array.from(
        new Set(
          slabs.map((s) => s.productType).filter((t): t is string => Boolean(t))
        )
      )
        .filter((t) => !PRODUCT_TYPES_TO_HIDE.has(t.toLowerCase()))
        .sort(),
    [slabs]
  );
  const uniquePatterns = useMemo(
    () => Array.from(new Set(slabs.map((s) => s.pattern))).sort() as Pattern[],
    [slabs]
  );
  const uniqueHues = useMemo(
    () => Array.from(new Set(slabs.flatMap((s) => s.hues))).sort(),
    [slabs]
  );
  const uniqueFinishes = useMemo(
    () =>
      Array.from(new Set(slabs.flatMap((s) => s.finishes))).sort() as Finish[],
    [slabs]
  );
  const uniqueThicknesses = useMemo(
    () =>
      Array.from(
        new Set(slabs.flatMap((s) => s.thicknesses))
      ).sort() as Thickness[],
    [slabs]
  );

  return {
    filters,
    filtered,
    query,
    setQuery,
    sort,
    setSort,
    dense,
    setDense,
    toggle,
    remove,
    clearAll,
    countFor,
    activeCount,
    uniqueCollections,
    uniqueProductTypes,
    uniquePatterns,
    uniqueHues,
    uniqueFinishes,
    uniqueThicknesses,
  };
}
