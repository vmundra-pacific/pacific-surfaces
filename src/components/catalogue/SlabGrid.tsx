"use client";

/**
 * SlabGrid — the catalogue grid with empty-state handling.
 *
 * Uses framer-motion's layout prop on each SlabCard so filter changes
 * animate into place rather than snapping. AnimatePresence handles
 * enter/exit as cards are filtered in and out.
 */

import { AnimatePresence, motion } from "framer-motion";
import { SlabCard } from "./SlabCard";
import type { Slab } from "@/data/slabs";

interface Props {
  slabs: Slab[];
  dense: boolean;
  onClearAll: () => void;
}

export function SlabGrid({ slabs, dense, onClearAll }: Props) {
  if (slabs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="text-xl font-light tracking-tight text-white">
          No designs match those filters.
        </div>
        <p className="mt-3 max-w-sm text-sm text-pacific-mid">
          Try broadening your selection — or reset the filters to see every slab
          in our catalogue.
        </p>
        <button
          onClick={onClearAll}
          className="mt-6 rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-pacific-light transition-colors hover:bg-white/10"
        >
          Reset filters
        </button>
      </motion.div>
    );
  }

  return (
    <div
      className={[
        "grid gap-4 lg:gap-6",
        dense
          ? "grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3"
          : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]",
      ].join(" ")}
    >
      <AnimatePresence mode="popLayout">
        {slabs.map((slab, i) => (
          <SlabCard key={slab.id} slab={slab} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
