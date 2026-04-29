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
import { ApplicationsScrollSections } from "@/components/sections/ApplicationsScrollSections";
import { DealerLocator } from "@/components/sections/DealerLocator";
import { HeritageSection } from "@/components/sections/HeritageSection";
import { OriginStats } from "@/components/sections/OriginStats";
import { SignatureProjects } from "@/components/sections/SignatureProjects";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { InspirationGrid } from "@/components/sections/InspirationGrid";
import { PartnerWithUs } from "@/components/sections/PartnerWithUs";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { VideoPrefetch } from "@/components/global/VideoPrefetch";

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

  // Collect every video URL referenced by the homepage so we can warm
  // the browser cache during the splash-screen window. By the time the
  // user finishes the loading video and scrolls down, these clips are
  // already buffered and the Signature Projects / Applications
  // sections play instantly instead of stalling on first paint.
  // Currently the only multi-clip section that surfaces editor-supplied
  // videos is signature projects; extend this array as more
  // video-driven sections come online.
  const prefetchVideoUrls: string[] = [
    ...(projects ?? [])
      .map((p: { videoUrl?: string | null }) => p.videoUrl)
      .filter((u: string | null | undefined): u is string => !!u),
  ];

  return (
    <>
      {/* Hidden off-screen <video> elements that begin fetching the
          videos used further down the page while the splash screen
          is still on top. Bytes land in the browser cache during the
          loading window; the visible <video> elements later pull
          from cache instead of re-fetching. */}
      <VideoPrefetch urls={prefetchVideoUrls} />
      <HeroScrollCanvas />
      <TrustStrip />
      <CollectionsShowcaseGrid collections={collections} />
      <StatementSection
        statement="Imagine surfaces as an intelligent bridge — seamlessly connecting artistry to architecture."
        theme="light"
      />
      <ApplicationsScrollSections applications={applications} />
      <DealerLocator dealers={dealers} />
      <HeritageSection />
      <OriginStats />
      <SignatureProjects projects={projects} />
      <TestimonialsSection />
      <InspirationGrid inspirations={inspirations} />
      <PartnerWithUs />
      {/* VisualizerStrip moved to bottom — sits just before the
          closing CTA so it acts as the final interactive prompt
          before the page-ending call-to-action. */}
      <VisualizerStrip />
      <ClosingCTA />
    </>
  );
}
