import type { Metadata } from "next";
import { freshClient } from "@/sanity/lib/client";
import { allResourcesQuery } from "@/sanity/lib/queries";
import {
  ResourcesContent,
  type SanityResource,
} from "@/components/sections/ResourcesContent";
import { BreadcrumbList } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Resources: Spec Sheets & Brochures | Pacific Surfaces",
  description:
    "Download Pacific Surfaces spec sheets, brochures, care guides and project case studies: everything architects, designers and fabricators need to spec our slabs.",
  alternates: { canonical: "/resources" },
};

// Render dynamically so newly published/updated resources appear on the
// next request instead of only after a redeploy (editor-managed content).
export const revalidate = 0;

export default async function ResourcesPage() {
  // Fetch all visible resources from Sanity. Returns [] when none have
  // been authored yet — ResourcesContent gracefully falls back to its
  // hardcoded card list in that case so the page is never empty.
  const resources =
    await freshClient.fetch<SanityResource[]>(allResourcesQuery);
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />
      <ResourcesContent resources={resources} />
    </>
  );
}
