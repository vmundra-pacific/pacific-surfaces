import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  facadesAndFinishesPageQuery,
  facadesAndFinishesProductsQuery,
} from "@/sanity/lib/queries";
import { FacadesAndFinishesContent } from "@/components/sections/FacadesAndFinishesContent";
import { BreadcrumbList } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Beyond Finish — Pacific Surfaces",
  description:
    "Polished, honed, leathered, brushed — explore the full palette of finishes available across Pacific's quartz and granite collections.",
  alternates: { canonical: "/products/facades-and-finishes" },
};

/**
 * /products/facades-and-finishes — bespoke layout (NOT the
 * standard catalogue UI).
 *
 * Layout:
 *   1. Full-screen hero with looped video background.
 *   2. Editorial intro split.
 *   3. Grid of finish products from the "Beyond Finish"
 *      Sanity Collection. Tap → high-res lightbox with scroll-zoom.
 *
 * Editor setup checklist (one-time):
 *   1. /studio → Collections → +Add → name "Natural Stone
 *      Finishes", slug "facades-and-finishes". Publish.
 *   2. /studio → Products → +Add per finish (Polished, Honed,
 *      Leathered, …). Upload the texture as Main Image. Tag the
 *      "Beyond Finish" collection. Publish.
 *   3. (Optional) /studio → Beyond Finish Page → tweak
 *      hero / intro / grid copy. The page works with sensible
 *      defaults if this is left untouched.
 *
 * This static route takes precedence over the dynamic
 * /products/[slug] dispatcher for this exact URL — see
 * `_lib/category.ts` where the `facades-and-finishes` entry has
 * been removed.
 */
export default async function FacadesAndFinishesPage() {
  const [pageData, finishes] = await Promise.all([
    client.fetch(facadesAndFinishesPageQuery),
    // Pull the slug from the singleton if the editor has overridden
    // it; default to "facades-and-finishes" otherwise.
    (async () => {
      // Fall back to "stone-finishes" — the existing collection in
      // the Pacific dataset. The singleton's collectionSlug field
      // overrides if the collection is ever renamed.
      const slug =
        ((await client.fetch(
          `*[_type == "facadesAndFinishesPage"][0].collectionSlug`
        )) as string | null) || "stone-finishes";
      return client.fetch(facadesAndFinishesProductsQuery, { slug });
    })(),
  ]);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          {
            name: "Beyond Finish",
            url: "/products/facades-and-finishes",
          },
        ]}
      />
      <FacadesAndFinishesContent
        pageData={pageData}
        finishes={finishes ?? []}
      />
    </>
  );
}
