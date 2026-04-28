import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";

export const metadata: Metadata = {
  title: "Products — Pacific Surfaces",
  description:
    "Browse our complete range of 273+ premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, and wall cladding.",
};

export default async function ProductsPage() {
  const products = await client.fetch(catalogueProductsQuery);
  const slabs = mapSanityToCatalogue(products);
  return <CatalogueClient slabs={slabs} />;
}
