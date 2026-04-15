import type { Metadata } from "next";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue — Pacific Surfaces",
  description:
    "Browse the full Pacific Surfaces catalogue. Filter by hue, collection, pattern, finish and thickness to discover the quartz or granite slab engineered for your space.",
};

export default function CataloguePage() {
  return <CatalogueClient />;
}
