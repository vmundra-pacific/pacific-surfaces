import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import {
  homepageCollectionsQuery,
  signatureProjectsQuery,
  applicationCardsQuery,
  inspirationImagesQuery,
  featuredDealersQuery,
} from "@/sanity/lib/queries";
import { HeroScrollCanvas } from "@/components/sections/HeroScrollCanvas";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CollectionsShowcaseGrid } from "@/components/sections/CollectionsShowcaseGrid";
import { StatementSection } from "@/components/sections/StatementSection";
import { VisualizerStrip } from "@/components/sections/VisualizerStrip";
import { ApplicationCards } from "@/components/sections/ApplicationCards";
import { DealerLocator } from "@/components/sections/DealerLocator";
import { HeritageSection } from "@/components/sections/HeritageSection";
import { OriginStats } from "@/components/sections/OriginStats";
import { SignatureProjects } from "@/components/sections/SignatureProjects";
import { InspirationGrid } from "@/components/sections/InspirationGrid";
import { PartnerWithUs } from "@/components/sections/PartnerWithUs";
import { ClosingCTA } from "@/components/sections/ClosingCTA";

export const metadata: Metadata = {
  title: "Pacific Surfaces — Premium Quartz & Granite Surfaces",
  description:
    "Discover premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, flooring, and wall cladding. Engineered for beauty and durability.",
  keywords: [
    "quartz slabs",
    "granite surfaces",
    "kitchen countertops",
    "bathroom vanities",
    "premium surfaces",
    "Pacific Surfaces",
  ],
};

export default async function HomePage() {
  // Fetch all homepage data from Sanity in parallel
  const [collections, projects, applications, inspirations, dealers] =
    await Promise.all([
      client.fetch(homepageCollectionsQuery),
      client.fetch(signatureProjectsQuery),
      client.fetch(applicationCardsQuery),
      client.fetch(inspirationImagesQuery),
      client.fetch(featuredDealersQuery),
    ]);

  return (
    <>
      <HeroScrollCanvas />
      <TrustStrip />
      <CollectionsShowcaseGrid collections={collections} />
      <StatementSection
        statement="Imagine surfaces as an intelligent bridge — seamlessly connecting artistry to architecture."
        theme="light"
      />
      <VisualizerStrip />
      <ApplicationCards applications={applications} />
      <DealerLocator dealers={dealers} />
      <HeritageSection />
      <OriginStats />
      <SignatureProjects projects={projects} />
      <InspirationGrid inspirations={inspirations} />
      <PartnerWithUs />
      <ClosingCTA />
    </>
  );
}
