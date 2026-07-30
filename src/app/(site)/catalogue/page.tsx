import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
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
export const revalidate = 60;

export default async function CataloguePage() {
  const products = await client.fetch(catalogueProductsQuery);
  const slabs = mapSanityToCatalogue(products);
  return <CatalogueClient slabs={slabs} />;
}
