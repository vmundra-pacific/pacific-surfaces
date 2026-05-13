"use client";

/**
 * SlabGrid — the catalogue grid with empty-state handling.
 *
 * Two render modes:
 *   1. Flat (default) — one big grid of every slab in the order they
 *      came in. Used on per-category landing pages and collection
 *      pages where the surrounding page context already establishes
 *      what's being shown.
 *   2. Grouped by product type — slabs are bucketed by their
 *      productType field and each bucket renders under its own
 *      heading. Used on /products (the "All Products" page) so the
 *      catalogue reads as browsable sections — Mineral infused low
 *      silica surface, Granite, Semi-Precious Stones, etc. — rather than a
 *      flat wall of 200+ slabs.
 */

import { AnimatePresence, motion } from "framer-motion";
import { SlabCard } from "./SlabCard";
import type { Slab } from "@/data/slabs";
import { groupByProductType } from "./labels";

interface Props {
  slabs: Slab[];
  dense: boolean;
  onClearAll: () => void;
  /**
   * When true, bucket slabs by their productType field and render
   * each bucket under a heading. When false (default), render one
   * flat grid in input order.
   */
  groupByProductType?: boolean;
}

export function SlabGrid({
  slabs,
  dense,
  onClearAll,
  groupByProductType: shouldGroup = false,
}: Props) {
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

  const gridClass = [
    "grid gap-4 lg:gap-6",
    dense
      ? "grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3"
      : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]",
  ].join(" ");

  if (shouldGroup) {
    // Group slabs by productType using the shared helper so the
    // section order stays consistent with the rest of the catalogue.
    const sections = groupByProductType(slabs);

    // If grouping collapses to a single bucket, drop the heading —
    // a lone section header would feel redundant. This happens when
    // every product happens to share one productType (or the user
    // has filtered down to one).
    if (sections.length <= 1) {
      return (
        <div className={gridClass}>
          <AnimatePresence mode="popLayout">
            {slabs.map((slab, i) => (
              <SlabCard key={slab.id} slab={slab} index={i} />
            ))}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-14 lg:gap-20">
        {sections.map((section) => (
          <section key={section.key || "other"}>
            {/* Section heading — kept editorial: lightweight uppercase
                eyebrow with a hairline below, matching the rest of
                the dark-section type rhythm. Count is muted so the
                eye lands on the label first. */}
            <header className="mb-6 lg:mb-8 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
              <h2 className="text-2xl lg:text-3xl font-light tracking-tight text-white">
                {section.label}
              </h2>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-pacific-mid tabular-nums">
                {section.slabs.length}{" "}
                {section.slabs.length === 1 ? "design" : "designs"}
              </span>
            </header>
            <div className={gridClass}>
              <AnimatePresence mode="popLayout">
                {section.slabs.map((slab, i) => (
                  <SlabCard
                    key={slab.id}
                    slab={slab}
                    // Stagger index restarts per section so each
                    // section's first card animates from the top of
                    // the stagger curve rather than inheriting the
                    // index from the previous section's tail.
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      <AnimatePresence mode="popLayout">
        {slabs.map((slab, i) => (
          <SlabCard key={slab.id} slab={slab} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
