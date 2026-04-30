import type { Metadata } from "next";
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
export async function generateMetadata(): Promise<Metadata> {
  const products = await client.fetch(catalogueProductsQuery);
  const count = Array.isArray(products) ? products.length : 0;
  return {
    title: "All Products — Pacific Surfaces",
    description: `Browse the full Pacific Surfaces catalogue — ${count} premium quartz slabs, granite surfaces, semi-precious stones, sinks, and finishes.`,
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
  const products = await client.fetch(catalogueProductsQuery);
  const slabs = mapSanityToCatalogue(products);

  // Count of distinct collections referenced by the catalogue, used
  // alongside slabs.length in the hero description so both numbers
  // reflect the actual catalogue state. Filters out slabs without a
  // collection so the count is honest.
  const collectionCount = new Set(
    slabs
      .map((s) => s.collection)
      .filter((c): c is string => Boolean(c && c.length))
  ).size;

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
        description={`${slabs.length} surfaces. ${collectionCount} collections. Every quartz, granite, and semi-precious stone we make — ready to filter.`}
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
          so this page's own hero (above) is the only one. */}
      <CatalogueClient slabs={slabs} hideHero />
    </>
  );
}
