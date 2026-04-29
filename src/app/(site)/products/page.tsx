import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { QuartzHeroVideo } from "@/components/catalogue/QuartzHeroVideo";
import { OriginStats } from "@/components/sections/OriginStats";
import { StatementSection } from "@/components/sections/StatementSection";

export const metadata: Metadata = {
  title: "All Products — Pacific Surfaces",
  description:
    "Browse the full Pacific Surfaces catalogue — 273+ premium quartz slabs, granite surfaces, semi-precious stones, sinks, and finishes.",
};

/**
 * /products — the "All Products" landing page.
 *
 * Layout (top → bottom):
 *   1. Hero video — full-viewport autoplaying loop with editorial
 *      copy. Pulls /videos/all-products.mp4 by default; swap the
 *      video file to change without touching code.
 *   2. Heritage stats strip — re-uses the existing OriginStats
 *      component (273 designs / 44 collections / countries /
 *      years).
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

  return (
    <>
      {/* 1. Video hero. Drop a clip at /public/videos/all-products.mp4
          to swap the visual; the QuartzHeroVideo component handles
          autoplay/loop/scrim. Headline + paragraph below are tuned
          to position this page as the "everything we make" entry
          point rather than a category-specific one. */}
      <QuartzHeroVideo
        videoSrc="/videos/all-products.mp4"
        eyebrow="Pacific Surfaces"
        headline="The full collection,"
        headlineItalic="in one place."
        description="273 surfaces. 44 collections. Every quartz, granite, and semi-precious stone we make — ready to filter."
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
