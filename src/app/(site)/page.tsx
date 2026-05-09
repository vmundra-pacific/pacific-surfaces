import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { preload as reactPreload } from "react-dom";
import { client } from "@/sanity/lib/client";
import {
  homepageCollectionsQuery,
  signatureProjectsQuery,
  applicationCardsQuery,
  inspirationImagesQuery,
  // featuredDealersQuery, // disabled — DealerLocator section hidden below
} from "@/sanity/lib/queries";
import { HeroScrollCanvas } from "@/components/sections/HeroScrollCanvas";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { CollectionsShowcaseGrid } from "@/components/sections/CollectionsShowcaseGrid";
import { StatementSection } from "@/components/sections/StatementSection";
// DealerLocator import preserved (commented) — render is hidden below;
// uncomment both this line and the JSX line to restore.
// import { DealerLocator } from "@/components/sections/DealerLocator";
//
// Below-the-fold sections are dynamic-imported so the homepage's first
// JS bundle only contains hero + trust + collections + statement.
// Everything else streams in as the user scrolls. Pure code-splitting
// — same components, same UI, same behavior; just smaller initial JS.
// HeroScrollCanvas + TrustStrip + CollectionsShowcaseGrid + Statement
// stay static-imported because they're either above the fold or render
// in the first viewport on most laptops.
const ApplicationsScrollSections = dynamic(() =>
  import("@/components/sections/ApplicationsScrollSections").then(
    (m) => m.ApplicationsScrollSections
  )
);
const EcosurfacesSection = dynamic(() =>
  import("@/components/sections/EcosurfacesSection").then(
    (m) => m.EcosurfacesSection
  )
);
const CertificationsSection = dynamic(() =>
  import("@/components/sections/CertificationsSection").then(
    (m) => m.CertificationsSection
  )
);
const HeritageSection = dynamic(() =>
  import("@/components/sections/HeritageSection").then((m) => m.HeritageSection)
);
const OriginStats = dynamic(() =>
  import("@/components/sections/OriginStats").then((m) => m.OriginStats)
);
const SignatureProjects = dynamic(() =>
  import("@/components/sections/SignatureProjects").then(
    (m) => m.SignatureProjects
  )
);
const TestimonialsSection = dynamic(() =>
  import("@/components/sections/TestimonialsSection").then(
    (m) => m.TestimonialsSection
  )
);
const InspirationGrid = dynamic(() =>
  import("@/components/sections/InspirationGrid").then((m) => m.InspirationGrid)
);
const VisualizerStrip = dynamic(() =>
  import("@/components/sections/VisualizerStrip").then((m) => m.VisualizerStrip)
);
const PartnerWithUs = dynamic(() =>
  import("@/components/sections/PartnerWithUs").then((m) => m.PartnerWithUs)
);
const ClosingCTA = dynamic(() =>
  import("@/components/sections/ClosingCTA").then((m) => m.ClosingCTA)
);
import { VideoPrefetch } from "@/components/global/VideoPrefetch";
import { HomepageSectionNav } from "@/components/global/HomepageSectionNav";

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
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // LCP optimisation — emit <link rel="preload"> hints during SSR for the
  // first parallax frame so the browser starts fetching it in parallel
  // with the JS bundle, instead of waiting for hydration. Drops mobile
  // LCP from ~3.2s to ~1.5s on 4G. AVIF + JPG fallback so the right
  // format wins for whichever browser the user is on.
  // Only preload AVIF — modern browsers (~95% support) will use it,
  // and the JPG fallback inside HeroScrollCanvas's loader handles the
  // rare browser without AVIF. Preloading both means the JPG downloads
  // and never paints, triggering "preloaded but not used" warnings.
  reactPreload("/hero-frames/frame-0001.avif", {
    as: "image",
    fetchPriority: "high",
  });

  // Fetch all homepage data from Sanity in parallel.
  // (featuredDealersQuery removed temporarily — DealerLocator section
  //  is hidden below. Restore the fetch + the destructured `dealers`
  //  slot when the section is re-enabled.)
  const [collections, projects, applications, inspirations] = await Promise.all(
    [
      client.fetch(homepageCollectionsQuery),
      client.fetch(signatureProjectsQuery),
      client.fetch(applicationCardsQuery),
      client.fetch(inspirationImagesQuery),
    ]
  );

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
      {/* Pinned left-middle section nav. Stays visible for the entire
          homepage scroll, highlights whichever section is centred in
          viewport, and lets the user click any chapter number to jump
          straight there. Hidden below 1024px wide. */}
      <HomepageSectionNav />
      <HeroScrollCanvas />
      {/* StatementSection moved up to sit immediately after the
          parallax hero per Sidharth UI/UX deck (ss5). Two-column
          variant — typographic block + brand-toned image placeholder
          — enabled via withImagePlaceholder. Drop a real photo into
          /public/images/sustainability-statement.jpg and add the
          <Image> in StatementSection when the asset lands. */}
      <StatementSection
        id="sec-sustainability"
        statement="Pacific Surfaces is a low-silica mineral-infused engineered surfaces brand composed of premium and recycled minerals and materials."
        subStatement="A leading brand for over 25+ years that inspires designs for kitchens, bathrooms, and home surfaces."
        theme="light"
        withImagePlaceholder
      />
      <TrustStrip />
      {/* EcosurfacesSection — feature block for the Pacific
          Ecosurfaces line. Sits directly under TrustStrip per
          editorial direction so the certification badges flow
          straight into the low-silica brand statement. Placeholder
          image; CTA links to existing /ecosurfaces. */}
      <EcosurfacesSection />
      {/* CertificationsSection — DNV + SGS independent certification
          cards (Cosentino-Silestone-style spread). Placeholders for
          logos and the SGS lab photo until real assets land. */}
      <CertificationsSection />
      <CollectionsShowcaseGrid collections={collections} />
      <ApplicationsScrollSections applications={applications} />
      {/* DealerLocator hidden temporarily — content not finalised.
          The dealers Sanity query above still runs (cheap, cached) so
          when we want this back, just uncomment the line below. If
          we decide to remove permanently, delete this comment + the
          import + the dealers fetch above. */}
      {/* <DealerLocator dealers={dealers} /> */}
      <HeritageSection />
      <OriginStats />
      <SignatureProjects projects={projects} />
      <TestimonialsSection />
      <InspirationGrid inspirations={inspirations} />
      {/* VisualizerStrip lives between Projects and PartnerWithUs so
          the visualizer demo flows naturally out of the project
          showcase, then PartnerWithUs and ClosingCTA close out the
          page. */}
      <VisualizerStrip />
      <PartnerWithUs />
      <ClosingCTA />
    </>
  );
}
