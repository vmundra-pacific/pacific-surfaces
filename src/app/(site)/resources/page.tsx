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

// Served from the cache and rebuilt at most once a minute, so Sanity
// edits show within 60 s (2026-10-22: with revalidate = 0 every visit
// waited ~1.3 s for a fresh render, failing the phone Core Web Vitals).
export const revalidate = 60;

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
