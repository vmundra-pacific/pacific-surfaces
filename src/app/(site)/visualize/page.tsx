import type { Metadata } from "next";
import { VisualizeClient } from "@/components/visualize/VisualizeClient";
import { BreadcrumbList } from "@/components/global/JsonLd";
import * as cms from "@/cms/read";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";

export const metadata: Metadata = {
  title: "Visualizer: See Slabs in Your Space | Pacific Surfaces",
  description:
    "Upload a photo or pick a demo room. Apply any Pacific quartz, granite, or semi-precious surface. Compare finishes side-by-side and request a sample instantly.",
  alternates: { canonical: "/visualize" },
};

// Re-validate every 60s so newly-published products show up in the
// visualizer without requiring a redeploy.
// At most once an hour since 24 Nov 2026, for fewer reads of the CMS and
// its database. A CMS edit still shows at once: the CMS's "content
// changed" call clears this cache (src/app/api/revalidate).
export const revalidate = 3600;

export default async function VisualizePage() {
  // Same query the products + catalogue pages use, so the visualizer dock
  // always mirrors what's published.
  const products = await cms.productsCatalogue();
  const sanitySlabs = mapSanityToCatalogue(products);
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Visualizer", url: "/visualize" },
        ]}
      />
      <VisualizeClient sanitySlabs={sanitySlabs} />
    </>
  );
}
