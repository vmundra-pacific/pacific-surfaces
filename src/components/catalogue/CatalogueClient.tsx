"use client";

/**
 * CatalogueClient — top-level client component for the /catalogue route.
 *
 * Composes the filter state hook, page head, sticky filter bar,
 * active-chip row, and grid. Keeps its own state so the page is fully
 * interactive without needing server round-trips on each filter change.
 */

import type { Slab } from "@/data/slabs";
import { useFilterState } from "./useFilterState";
import { FilterBar } from "./FilterBar";
import { ActiveChips } from "./ActiveChips";
import { SlabGrid } from "./SlabGrid";
import { QuartzHeroVideo } from "./QuartzHeroVideo";

export function CatalogueClient({ slabs }: { slabs: Slab[] }) {
  const api = useFilterState(slabs);

  return (
    <div className="relative min-h-screen bg-[#112732] text-pacific-light">
      {/* Quartz hero video — sits in normal flow above everything,
          so the page scrolls past it naturally while it keeps
          playing. The corner caption stays put inside the video
          frame; existing editorial head + filter + grid render
          underneath as before. */}
      <QuartzHeroVideo />

      {/* Editorial page head — top padding intentionally smaller
          than a normal page; the full-viewport hero video above
          has already absorbed the navbar offset. */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="mb-5 text-sm font-medium tracking-[0.3em] uppercase text-pacific-mid">
          Our Surfaces · {slabs.length} designs
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6 leading-[1.05]">
          Explore the Collection
        </h1>
        <p className="text-lg text-pacific-mid font-light max-w-2xl leading-relaxed">
          273+ premium surfaces engineered for beauty, crafted for durability.
          Find the perfect slab for your space.
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
