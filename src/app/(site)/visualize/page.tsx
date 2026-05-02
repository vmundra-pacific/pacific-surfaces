import type { Metadata } from "next";
import { VisualizeClient } from "@/components/visualize/VisualizeClient";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";

export const metadata: Metadata = {
  title: "Visualiser — See Pacific slabs in your space",
  description:
    "Upload a photo of your kitchen or bath and preview any Pacific Surfaces slab in place. Auto-detect finds your countertop — you pick the stone.",
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
