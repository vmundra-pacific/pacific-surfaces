"use client";

/**
 * CatalogueClient — top-level client component for the /catalogue route.
 *
 * Composes the filter state hook, page head, sticky filter bar,
 * active-chip row, and grid. Keeps its own state so the page is fully
 * interactive without needing server round-trips on each filter change.
 */

import { slabs } from "@/data/slabs";
import { useFilterState } from "./useFilterState";
import { FilterBar } from "./FilterBar";
import { ActiveChips } from "./ActiveChips";
import { SlabGrid } from "./SlabGrid";

export function CatalogueClient() {
  const api = useFilterState(slabs);

  return (
    <div className="relative min-h-screen bg-[#0a1620] text-pacific-light">
      {/* Ambient page tint (echoes the rest of the site) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(154,168,182,0.06), transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(154,168,182,0.04), transparent 60%)",
        }}
      />

      {/* Editorial page head */}
      <section className="relative z-10 mx-auto max-w-[1760px] px-6 lg:px-12 pt-24 lg:pt-32 pb-12 lg:pb-16">
        <div className="mb-7 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-pacific-mid">
          <span className="h-1.5 w-1.5 rounded-full bg-pacific-mid" />
          The Catalogue · {slabs.length} designs
        </div>
        <h1
          className="font-light leading-[0.95] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(48px, 7vw, 128px)" }}
        >
          Every slab,{" "}
          <em className="not-italic font-light text-pacific-mid">discoverable.</em>
        </h1>
        <p
          className="mt-7 max-w-xl leading-[1.55] text-pacific-mid"
          style={{ fontSize: "clamp(14px, 1.1vw, 16px)" }}
        >
          Browse the full range of Pacific quartz, granite, and semi-precious
          surfaces. Filter by hue, pattern, collection, or finish — order physical
          samples to be delivered within 48 hours.
        </p>
      </section>

      {/* Sticky filter bar */}
      <FilterBar api={api} total={api.filtered.length} />

      {/* Active filter chips */}
      <ActiveChips api={api} />

      {/* Grid */}
      <section className="relative z-10 mx-auto max-w-[1760px] px-6 lg:px-12 pt-10 lg:pt-14 pb-24">
        <SlabGrid
          slabs={api.filtered}
          dense={api.dense}
          onClearAll={api.clearAll}
        />
      </section>
    </div>
  );
}
