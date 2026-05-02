import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  naturalStoneFinishesPageQuery,
  naturalStoneFinishesProductsQuery,
} from "@/sanity/lib/queries";
import { NaturalStoneFinishesContent } from "@/components/sections/NaturalStoneFinishesContent";
import { BreadcrumbList } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Natural Stone Finishes — Pacific Surfaces",
  description:
    "Polished, honed, leathered, brushed — explore the full palette of finishes available across Pacific's quartz and granite collections.",
  alternates: { canonical: "/products/natural-stone-finishes" },
};

/**
 * /products/natural-stone-finishes — bespoke layout (NOT the
 * standard catalogue UI).
 *
 * Layout:
 *   1. Full-screen hero with looped video background.
 *   2. Editorial intro split.
 *   3. Grid of finish products from the "Natural Stone Finishes"
 *      Sanity Collection. Tap → high-res lightbox with scroll-zoom.
 *
 * Editor setup checklist (one-time):
 *   1. /studio → Collections → +Add → name "Natural Stone
 *      Finishes", slug "natural-stone-finishes". Publish.
 *   2. /studio → Products → +Add per finish (Polished, Honed,
 *      Leathered, …). Upload the texture as Main Image. Tag the
 *      "Natural Stone Finishes" collection. Publish.
 *   3. (Optional) /studio → Natural Stone Finishes Page → tweak
 *      hero / intro / grid copy. The page works with sensible
 *      defaults if this is left untouched.
 *
 * This static route takes precedence over the dynamic
 * /products/[slug] dispatcher for this exact URL — see
 * `_lib/category.ts` where the `natural-stone-finishes` entry has
 * been removed.
 */
export default async function NaturalStoneFinishesPage() {
  const [pageData, finishes] = await Promise.all([
    client.fetch(naturalStoneFinishesPageQuery),
    // Pull the slug from the singleton if the editor has overridden
    // it; default to "natural-stone-finishes" otherwise.
    (async () => {
      // Fall back to "stone-finishes" — the existing collection in
      // the Pacific dataset. The singleton's collectionSlug field
      // overrides if the collection is ever renamed.
      const slug =
        ((await client.fetch(
          `*[_type == "naturalStoneFinishesPage"][0].collectionSlug`
        )) as string | null) || "stone-finishes";
      return client.fetch(naturalStoneFinishesProductsQuery, { slug });
    })(),
  ]);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: "Natural Stone Finishes", url: "/products/natural-stone-finishes" },
        ]}
      />
      <NaturalStoneFinishesContent
        pageData={pageData}
        finishes={finishes ?? []}
      />
    </>
  );
}
