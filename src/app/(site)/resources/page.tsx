import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allResourcesQuery } from "@/sanity/lib/queries";
import {
  ResourcesContent,
  type SanityResource,
} from "@/components/sections/ResourcesContent";

export const metadata: Metadata = {
  title: "Resources — Pacific Surfaces",
  description:
    "Download premium stone catalogs, technical documentation, and design guides. Browse quartz, granite, and ecosurface collections.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage() {
  // Fetch all visible resources from Sanity. Returns [] when none have
  // been authored yet — ResourcesContent gracefully falls back to its
  // hardcoded card list in that case so the page is never empty.
  const resources = await client.fetch<SanityResource[]>(allResourcesQuery);
  return <ResourcesContent resources={resources} />;
}
