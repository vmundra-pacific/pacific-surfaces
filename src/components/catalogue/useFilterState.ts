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
  Hue,
  Collection,
  Pattern,
  Finish,
  Thickness,
} from "@/data/slabs";

export type SortKey = "new" | "name-asc" | "name-desc" | "collection";

export interface FilterState {
  hues: Set<Hue>;
  collections: Set<Collection>;
  patterns: Set<Pattern>;
  finishes: Set<Finish>;
  thicknesses: Set<Thickness>;
}

export type FilterKey = keyof FilterState;

const emptyState = (): FilterState => ({
  hues: new Set(),
  collections: new Set(),
  patterns: new Set(),
  finishes: new Set(),
  thicknesses: new Set(),
});

export function useFilterState(slabs: Slab[]) {
  const [filters, setFilters] = useState<FilterState>(emptyState());
  const [sort, setSort] = useState<SortKey>("new");
  const [dense, setDense] = useState(false);

  /* --- Core toggle helper ------------------------------------------ */
  function toggle<K extends FilterKey>(key: K, value: FilterState[K] extends Set<infer V> ? V : never) {
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) } as FilterState;
      const set = next[key] as Set<typeof value>;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return next;
    });
  }

  function remove<K extends FilterKey>(key: K, value: FilterState[K] extends Set<infer V> ? V : never) {
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
    const out = slabs.filter((s) => {
      // Hue: slab must have at least one selected hue (OR within category)
      if (filters.hues.size > 0) {
        if (!s.hues.some((h) => filters.hues.has(h))) return false;
      }
      // Collection
      if (filters.collections.size > 0 && !filters.collections.has(s.collection)) {
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
        if (!s.thicknesses.some((t) => filters.thicknesses.has(t))) return false;
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
  }, [slabs, filters, sort]);

  /* --- Count how many slabs would match each candidate option ------ *
   * Used to render "Vision Series (24)" style counts. Computing this
   * against the current filter state (but excluding the category being
   * counted) gives "combinable" counts that update live.
   */
  function countFor<K extends FilterKey>(key: K, value: FilterState[K] extends Set<infer V> ? V : never): number {
    return slabs.filter((s) => {
      // Apply all filters EXCEPT the one we're counting against
      for (const fk of Object.keys(filters) as FilterKey[]) {
        if (fk === key) continue;
        const set = filters[fk];
        if (set.size === 0) continue;

        if (fk === "hues") {
          if (!s.hues.some((h) => (set as Set<Hue>).has(h))) return false;
        } else if (fk === "collections") {
          if (!(set as Set<Collection>).has(s.collection)) return false;
        } else if (fk === "patterns") {
          if (!(set as Set<Pattern>).has(s.pattern)) return false;
        } else if (fk === "finishes") {
          if (!s.finishes.some((f) => (set as Set<Finish>).has(f))) return false;
        } else if (fk === "thicknesses") {
          if (!s.thicknesses.some((t) => (set as Set<Thickness>).has(t))) return false;
        }
      }
      // Then check if this slab matches the candidate value for `key`
      if (key === "hues") return s.hues.includes(value as Hue);
      if (key === "collections") return s.collection === value;
      if (key === "patterns") return s.pattern === value;
      if (key === "finishes") return s.finishes.includes(value as Finish);
      if (key === "thicknesses") return s.thicknesses.includes(value as Thickness);
      return false;
    }).length;
  }

  const activeCount =
    filters.hues.size +
    filters.collections.size +
    filters.patterns.size +
    filters.finishes.size +
    filters.thicknesses.size;

  return {
    filters,
    filtered,
    sort,
    setSort,
    dense,
    setDense,
    toggle,
    remove,
    clearAll,
    countFor,
    activeCount,
  };
}
