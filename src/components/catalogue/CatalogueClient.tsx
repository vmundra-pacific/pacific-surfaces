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
import { QuartzHeroVideo, type QuartzHeroVideoProps } from "./QuartzHeroVideo";

interface CatalogueClientProps {
  slabs: Slab[];
  /**
   * Optional per-collection overrides for the hero video block.
   * Each field is optional and falls through to the default Quartz
   * hero treatment. Used by /products/[slug]/[item] to give specific
   * collections (e.g. Chromia → Vision Series video) their own
   * background video and copy without cloning the page.
   */
  hero?: QuartzHeroVideoProps;
  /**
   * When true, skip rendering the built-in hero video block. Used
   * when the surrounding page has already rendered its own hero
   * (e.g. the /products "All Products" page composes a video hero
   * + heritage strip + statement section above the catalogue, and
   * doesn't want a second video underneath them).
   */
  hideHero?: boolean;
  /**
   * When true, render the catalogue as product-type sections
   * (one heading + grid per type) instead of one flat grid, AND
   * suppress the Product Type pill in the filter bar (otherwise
   * users could hide a whole section by deselecting its type).
   * Used on /products; every other surface keeps the flat grid +
   * Product Type pill.
   */
  groupByProductType?: boolean;
}

export function CatalogueClient({
  slabs,
  hero,
  hideHero = false,
  groupByProductType = false,
}: CatalogueClientProps) {
  const api = useFilterState(slabs);

  return (
    <div className="relative min-h-screen bg-[#112732] text-pacific-light">
      {/* Hero video — sits in normal flow above everything, so the
          page scrolls past it naturally while it keeps playing. The
          corner caption stays put inside the video frame; existing
          editorial head + filter + grid render underneath as before.
          Defaults to the Quartz treatment; overridden per-collection
          via the `hero` prop. Suppressed entirely when the host page
          owns its own hero (hideHero=true). */}
      {!hideHero && <QuartzHeroVideo {...hero} />}

      {/* Editorial page head — top padding intentionally smaller
          than a normal page; the full-viewport hero video above
          has already absorbed the navbar offset. */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="mb-5 text-sm font-medium tracking-[0.3em] uppercase text-pacific-mid">
          Our Surfaces · {slabs.length} designs
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6 leading-[1.05]">
          Explore the Collection
        </h1>
        <p className="text-lg text-pacific-mid font-light max-w-2xl leading-relaxed">
          {/* Count derives from the slabs prop so per-category pages
              (Quartz / Granite / etc.) report their actual count
              instead of the catalogue-wide 273+. The eyebrow above
              uses the same value so the two figures stay in sync. */}
          {slabs.length} premium {slabs.length === 1 ? "surface" : "surfaces"}{" "}
          engineered for beauty, crafted for durability. Find the perfect slab
          for your space.
        </p>
      </section>

      {/* Sticky filter bar. When the catalogue is grouped into
          product-type sections, suppress the Product Type pill so
          users can't toggle a whole section away with the same
          filter the sections are built from. */}
      <FilterBar
        api={api}
        total={api.filtered.length}
        hideProductType={groupByProductType}
      />

      {/* Active filter chips */}
      <ActiveChips api={api} />

      {/* Grid — flat by default, grouped per product type when the
          host page opts in (see /products). */}
      <section className="relative z-10 mx-auto max-w-[1760px] px-6 lg:px-12 pt-10 lg:pt-14 pb-24">
        <SlabGrid
          slabs={api.filtered}
          dense={api.dense}
          onClearAll={api.clearAll}
          groupByProductType={groupByProductType}
        />
      </section>
    </div>
  );
}
