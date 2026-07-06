import type { Metadata } from "next";
import { VisualizeClient } from "@/components/visualize/VisualizeClient";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";

export const metadata: Metadata = {
  title: "Visualizer — See Pacific Slabs in Your Space",
  description:
    "Upload a photo or pick a demo room. Apply any Pacific quartz, granite, or semi-precious surface. Compare finishes side-by-side and request a sample instantly.",
  alternates: { canonical: "/visualize" },
};

// Re-validate every 60s so newly-published products show up in the
// visualizer without requiring a redeploy.
export const revalidate = 60;

export default async function VisualizePage() {
  // Same query the products + catalogue pages use, so the visualizer dock
  // always mirrors what's published.
  const products = await client.fetch(catalogueProductsQuery);
  const sanitySlabs = mapSanityToCatalogue(products);
  return <VisualizeClient sanitySlabs={sanitySlabs} />;
}
