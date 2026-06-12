import type { Metadata } from "next";
import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { QuartzHeroVideo } from "@/components/catalogue/QuartzHeroVideo";
import { OriginStats } from "@/components/sections/OriginStats";
import { StatementSection } from "@/components/sections/StatementSection";

/**
 * Metadata is computed dynamically so the description reports the
 * actual number of products in the catalogue rather than a hardcoded
 * "273+" that drifts as the catalogue grows or shrinks. The same
 * count is used by the hero block below.
 */
// Per-request dedupe — generateMetadata only needs the product COUNT,
// but previously paid for a second full catalogue fetch to get it.
// React.cache shares one fetch between metadata and the page body.
const getCatalogueProducts = cache(() => client.fetch(catalogueProductsQuery));

export async function generateMetadata(): Promise<Metadata> {
  const products = await getCatalogueProducts();
  const count = Array.isArray(products) ? products.length : 0;
  return {
    title: "All Products — Pacific Surfaces",
    description: `Browse the full Pacific Surfaces catalogue — ${count} premium quartz slabs, granite surfaces, semi-precious stones, sinks, and finishes.`,
    alternates: { canonical: "/products" },
  };
}

/**
 * /products — the "All Products" landing page.
 *
 * Layout (top → bottom):
 *   1. Hero video — full-viewport autoplaying loop with editorial
 *      copy. Pulls /videos/all-products.mp4 by default; swap the
 *      video file to change without touching code.
 *   2. Heritage stats strip — re-uses the existing OriginStats
 *      component (the section copy + background video; the previous
 *      hardcoded stat row was removed in an earlier pass).
 *   3. Brand promise — re-uses StatementSection with the
 *      "intelligent bridge" line that already runs on the homepage.
 *   4. Catalogue — every visible product, filterable by hue /
 *      finish / thickness via the same FilterBar UI used on every
 *      collection landing. CatalogueClient renders without its
 *      built-in hero (hideHero=true) so we don't double-stack
 *      videos.
 *
 * Replaces the previous /products → /products/quartz/quartz redirect
 * (removed in next.config.ts) — /products is now its own page rather
 * than an alias for the Quartz landing.
 */
export default async function AllProductsPage() {
  const products = await getCatalogueProducts();
  const slabs = mapSanityToCatalogue(products);

  // (Previously computed `collectionCount` for use in the hero copy,
  // but the literal description below no longer references it. Drop
  // the calc rather than carrying a dead variable; restore from git
  // history if the copy ever needs the count back.)

  return (
    <>
      {/* 1. Video hero. Drop a clip at /public/videos/all-products.mp4
          to swap the visual; the QuartzHeroVideo component handles
          autoplay/loop/scrim. Headline + paragraph below are tuned
          to position this page as the "everything we make" entry
          point rather than a category-specific one. The slab and
          collection counts are derived from the live catalogue so
          this copy never drifts out of sync. */}
      <QuartzHeroVideo
        videoSrc="/videos/all-products.mp4"
        eyebrow="Pacific Surfaces"
        headline="The full collection,"
        headlineItalic="in one place."
        description="Infinite possibilities — every quartz, granite, exotic, and semi-precious surface we make, ready to filter, compare, and request."
        centered
      />

      {/* 2. Heritage stats — already polished, no need to reinvent. */}
      <OriginStats />

      {/* 3. Brand promise. Theme="light" gives the cream-on-navy
          treatment, matching the homepage usage. */}
      <StatementSection
        statement="Imagine surfaces as an intelligent bridge — seamlessly connecting artistry to architecture."
        theme="light"
      />

      {/* 4. Catalogue. hideHero suppresses the built-in QuartzHeroVideo
          so this page's own hero (above) is the only one.
          groupByProductType renders the grid as sections (Mineral
          infused low silica surface, Granite, Semi-Precious Stones, etc.)
          with a heading above each — replaces the old Product Type
          filter pill, which is suppressed in this mode. */}
      <CatalogueClient slabs={slabs} hideHero groupByProductType />
    </>
  );
}
