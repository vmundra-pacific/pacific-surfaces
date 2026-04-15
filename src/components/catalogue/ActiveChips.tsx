"use client";

/**
 * ActiveChips — horizontal row of removable chips showing every currently
 * applied filter. Renders nothing when no filters are active.
 *
 * Animations via framer-motion's layout + AnimatePresence so chips
 * slide into place as others are added/removed.
 */

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Hue, Collection, Pattern, Finish, Thickness } from "@/data/slabs";
import type { useFilterState, FilterKey } from "./useFilterState";

type FilterApi = ReturnType<typeof useFilterState>;

interface Chip {
  key: FilterKey;
  value: Hue | Collection | Pattern | Finish | Thickness;
  label: string;
}

const CATEGORY_LABEL: Record<FilterKey, string> = {
  hues: "Hue",
  collections: "Collection",
  patterns: "Pattern",
  finishes: "Finish",
  thicknesses: "Thickness",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ActiveChips({ api }: { api: FilterApi }) {
  // Flatten the filter state into a renderable chip list
  const chips: Chip[] = [];
  api.filters.hues.forEach((h) =>
    chips.push({ key: "hues", value: h, label: capitalize(h) })
  );
  api.filters.collections.forEach((c) =>
    chips.push({ key: "collections", value: c, label: c })
  );
  api.filters.patterns.forEach((p) =>
    chips.push({ key: "patterns", value: p, label: p })
  );
  api.filters.finishes.forEach((f) =>
    chips.push({ key: "finishes", value: f, label: f })
  );
  api.filters.thicknesses.forEach((t) =>
    chips.push({ key: "thicknesses", value: t, label: t })
  );

  if (chips.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1760px] px-6 lg:px-12 pt-4 pb-1 flex flex-wrap items-center gap-2">
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.div
            key={`${chip.key}:${chip.value}`}
            layout
            initial={{ opacity: 0, y: -4, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.2, 0.9, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 pl-3.5 pr-1 py-1 text-xs text-white"
          >
            <span className="text-pacific-mid">{CATEGORY_LABEL[chip.key]}:</span>
            <span>{chip.label}</span>
            <button
              // @ts-expect-error  — chip.value type is a union; toggle is typed per-key
              onClick={() => api.remove(chip.key, chip.value)}
              aria-label={`Remove ${chip.label}`}
              className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-pacific-dark/60 text-pacific-light transition-colors hover:bg-pacific-dark"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={api.clearAll}
        className="ml-2 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-pacific-mid transition-colors hover:text-white"
      >
        Clear all
      </button>
    </div>
  );
}
