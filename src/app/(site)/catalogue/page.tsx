import type { Metadata } from "next";
import * as cms from "@/cms/read";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue — Pacific Surfaces",
  description:
    "Browse the full Pacific Surfaces catalogue. Filter by hue, collection, pattern, finish and thickness to discover the quartz or granite slab engineered for your space.",
  // Canonical points at /products, NOT at itself. This page renders the
  // same CatalogueClient over the same catalogueProductsQuery as
  // /products — the only difference is that /products additionally shows
  // the hero video, OriginStats and StatementSection. Two URLs
  // self-canonicalling to near-identical content split their own ranking
  // signals and let Google pick a winner arbitrarily. Consolidating on
  // /products keeps the richer page as the indexed one while leaving
  // /catalogue working for existing inbound links.
  alternates: { canonical: "/products" },
};

// Re-check Sanity for new/updated products every 60s instead of only
// at build time, so a product added or edited in Sanity Studio shows
// up on the live site on its own — no manual redeploy needed. Matches
// the same pattern already used on /visualize.
// At most once an hour since 24 Nov 2026, for fewer reads of the CMS and
// its database. A CMS edit still shows at once: the CMS's "content
// changed" call clears this cache (src/app/api/revalidate).
export const revalidate = 3600;

export default async function CataloguePage() {
  const products = await cms.productsCatalogue();
  const slabs = mapSanityToCatalogue(products);
  return <CatalogueClient slabs={slabs} />;
}
