import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue — Pacific Surfaces",
  description:
    "Browse the full Pacific Surfaces catalogue. Filter by hue, collection, pattern, finish and thickness to discover the quartz or granite slab engineered for your space.",
  alternates: { canonical: "/catalogue" },
};

export default async function CataloguePage() {
  const products = await client.fetch(catalogueProductsQuery);
  const slabs = mapSanityToCatalogue(products);
  return <CatalogueClient slabs={slabs} />;
}
