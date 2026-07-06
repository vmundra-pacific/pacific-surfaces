"use client";

/**
 * Centralized filter state for the catalogue.
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
  hues: Set<string>;
  collections: Set<Collection>;
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

// Collection names hidden from the Collection dropdown because they
// are actually product-type categories surfaced under Product Type
// instead, OR because they have been retired editorially.
const COLLECTION_NAMES_TO_HIDE = new Set([
  "Granite",
  "Stone Finishes",
  "Semi Precious Stones",
  "Semi-Precious Stones",
  "Vanity",
  "Integra",
  "Vision",
  "Centrepiece Couture",
  "Exotic Collection",
  "Top Collection",
]);

const PRODUCT_TYPES_TO_HIDE = new Set(["granite-finish", "luxury", "physical"]);

/**
 * Build, in ONE pass over `slabs`, the per-option counts for every
 * filter key under the "all OTHER keys applied" rule that countFor
 * uses. For each slab we work out which active filter keys it fails:
 * a slab counts toward key K's options when it passes every key
 * except (possibly) K itself — i.e. it fails zero keys (counts for
 * all keys) or fails exactly one key (counts only for that key).
 * Matches the previous per-option full scan exactly, including the
 * fact that the search query is deliberately ignored, without the
 * O(options × slabs) blow-up on every render.
 */
function buildCountMap(
  slabs: Slab[],
  filters: FilterState
): Record<FilterKey, Map<string, number>> {
  const counts: Record<FilterKey, Map<string, number>> = {
    hues: new Map(),
    collections: new Map(),
    productTypes: new Map(),
    patterns: new Map(),
    finishes: new Map(),
    thicknesses: new Map(),
  };
  const keys = Object.keys(filters) as FilterKey[];

  const passes = (s: Slab, fk: FilterKey): boolean => {
    const set = filters[fk];
    if (set.size === 0) return true;
    if (fk === "hues") {
      return s.hues.some((h) => (set as Set<string>).has(h));
    }
    if (fk === "collections") {
      return (set as Set<Collection>).has(s.collection);
    }
    if (fk === "productTypes") {
      return Boolean(s.productType && (set as Set<string>).has(s.productType));
    }
    if (fk === "patterns") {
      return (set as Set<Pattern>).has(s.pattern);
    }
    if (fk === "finishes") {
      return s.finishes.some((f) => (set as Set<Finish>).has(f));
    }
    return s.thicknesses.some((t) => (set as Set<Thickness>).has(t));
  };

  const increment = (s: Slab, key: FilterKey) => {
    const map = counts[key];
    const bump = (v: string) => map.set(v, (map.get(v) ?? 0) + 1);
    if (key === "hues") {
      for (const h of s.hues) bump(h);
    } else if (key === "collections") {
      bump(s.collection);
    } else if (key === "productTypes") {
      if (s.productType) bump(s.productType);
    } else if (key === "patterns") {
      bump(s.pattern);
    } else if (key === "finishes") {
      for (const f of s.finishes) bump(f);
    } else {
      for (const t of s.thicknesses) bump(t);
    }
  };

  for (const s of slabs) {
    let failedKey: FilterKey | null = null;
    let failCount = 0;
    for (const fk of keys) {
      if (!passes(s, fk)) {
        failCount++;
        if (failCount > 1) break;
        failedKey = fk;
      }
    }
    if (failCount === 0) {
      for (const key of keys) increment(s, key);
    } else if (failCount === 1 && failedKey) {
      increment(s, failedKey);
    }
  }

  return counts;
}

export function useFilterState(slabs: Slab[]) {
  const [filters, setFilters] = useState<FilterState>(emptyState());
  const [sort, setSort] = useState<SortKey>("new");
  const [dense, setDense] = useState(false);
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = slabs.filter((s) => {
      if (q) {
        const haystack = (s.name + " " + s.collection).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.hues.size > 0) {
        if (!s.hues.some((h) => filters.hues.has(h))) return false;
      }
      if (
        filters.collections.size > 0 &&
        !filters.collections.has(s.collection)
      ) {
        return false;
      }
      if (
        filters.productTypes.size > 0 &&
        (!s.productType || !filters.productTypes.has(s.productType))
      ) {
        return false;
      }
      if (filters.patterns.size > 0 && !filters.patterns.has(s.pattern)) {
        return false;
      }
      if (filters.finishes.size > 0) {
        if (!s.finishes.some((f) => filters.finishes.has(f))) return false;
      }
      if (filters.thicknesses.size > 0) {
        if (!s.thicknesses.some((t) => filters.thicknesses.has(t)))
          return false;
      }
      return true;
    });

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
        out.sort((a, b) => {
          const rank = (r: typeof a.ribbon) =>
            r === "new" ? 0 : r === "featured" ? 1 : 2;
          return rank(a.ribbon) - rank(b.ribbon);
        });
    }

    return out;
  }, [slabs, filters, sort, query]);

  // One pass over slabs per (slabs, filters) change — countFor is
  // then a map lookup instead of a full catalogue scan per option.
  // NOTE: like the original implementation, this deliberately ignores
  // the search query.
  const countMap = useMemo(() => buildCountMap(slabs, filters), [
    slabs,
    filters,
  ]);

  function countFor<K extends FilterKey>(
    key: K,
    value: FilterState[K] extends Set<infer V> ? V : never
  ): number {
    return countMap[key].get(value as string) ?? 0;
  }

  const activeCount =
    filters.hues.size +
    filters.collections.size +
    filters.productTypes.size +
    filters.patterns.size +
    filters.finishes.size +
    filters.thicknesses.size;

  const uniqueCollections = useMemo(
    () =>
      Array.from(new Set(slabs.map((s) => s.collection)))
        .filter((c) => !COLLECTION_NAMES_TO_HIDE.has(c))
        .sort(),
    [slabs]
  );

  // Collection -> dominant productType. Used by the Collection
  // dropdown / chip strip to render "Mineral infused low silica
  // surface - Aurora" style labels.
  const collectionToProductType = useMemo(() => {
    const tally = new Map<string, Map<string, number>>();
    for (const slab of slabs) {
      if (!slab.productType) continue;
      const counts = tally.get(slab.collection) ?? new Map<string, number>();
      counts.set(slab.productType, (counts.get(slab.productType) ?? 0) + 1);
      tally.set(slab.collection, counts);
    }
    const dominant = new Map<string, string>();
    for (const [collection, counts] of tally) {
      let bestType = "";
      let bestCount = -1;
      for (const [type, count] of counts) {
        if (count > bestCount) {
          bestCount = count;
          bestType = type;
        }
      }
      if (bestType) dominant.set(collection, bestType);
    }
    return dominant;
  }, [slabs]);

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
    collectionToProductType,
  };
}
