import type { Metadata } from "next";
import { ResourcesContent } from "@/components/sections/ResourcesContent";

export const metadata: Metadata = {
  title: "Resources — Pacific Surfaces",
  description:
    "Download premium stone catalogs, technical documentation, and design guides. Browse quartz, granite, and ecosurface collections.",
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
