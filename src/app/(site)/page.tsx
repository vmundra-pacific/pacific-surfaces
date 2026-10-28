import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { client } from "@/sanity/lib/client";
import { sanityProxyUrl } from "@/lib/sanity-img";
import {
  homepageCollectionsQuery,
  signatureProjectsQuery,
  applicationCardsQuery,
  inspirationImagesQuery,
  recentBlogPostsQuery,
  // featuredDealersQuery, // disabled — DealerLocator section hidden below
} from "@/sanity/lib/queries";
import { INDIA_QUARTZ, QUARTZ_COLLECTION_NAMES } from "@/data/india-range";
import { HeroScrollCanvas } from "@/components/sections/HeroScrollCanvas";
import { RecentArticles } from "@/components/sections/RecentArticles";
import type { BlogPost } from "@/components/sections/BlogGrid";
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
import { PartnerBand } from "@/components/where-to-buy/PartnerCard";

// Re-render at most every 60s so homepage content edited in Sanity
// (collections, projects, applications, inspirations) appears
// without a redeploy.
export const revalidate = 60;

// Title, description and the hero's H1 name the brand, what is made and
// where (SEO brief, 2026-10-05): India, not the town (owner, 2026-10-07).
// Facts as in the site's safe list and confirmed by the owner: the plant
// wording, 12/20/30 mm, the superjumbo size and 45+ countries.
export const metadata: Metadata = {
  title: "Pacific Surfaces | Quartz Slab Manufacturer in India",
  description:
    "Pacific Surfaces makes quartz slabs at a state-of-the-art Bretonstone plant in India: 12, 20 and 30 mm, up to 3,480 × 2,007 mm, for 45+ countries.",
  keywords: [
    "quartz slab manufacturer",
    "Pacific Quartz",
    "quartz slabs",
    "granite surfaces",
    "kitchen countertops",
    "bathroom vanities",
    "premium surfaces",
    "Pacific Surfaces",
  ],
  alternates: { canonical: "/" },
};

/** The articles shown above the footer, in this order (owner, 2026-10-20:
 *  posts whose photographs carry no headline text). */
const HOME_ARTICLES = [
  "the-ultimate-beginner-s-guide-to-choosing-the-perfect-surface",
  "pacific-at-the-big-5-dubai-a-week-that-redefined-possibilities",
  "12mm-quartz-slabs-the-next-big-revolution-in-modern-surfaces",
];

export default async function HomePage() {
  // LCP: the first parallax frame is not preloaded from here. The hero
  // poster in HeroScrollCanvas is a <picture> (AVIF, JPG fallback) in the
  // server HTML with fetchPriority="high", so the preload scanner starts
  // it in parallel with the JS bundle, and the canvas loader reuses that
  // same file. A preload() called here was also written into this page's
  // RSC payload, so every page that prefetched "/" (the header logo link)
  // downloaded the frame without showing it.

  // Fetch all homepage data from Sanity in parallel.
  // (featuredDealersQuery removed temporarily — DealerLocator section
  //  is hidden below. Restore the fetch + the destructured `dealers`
  //  slot when the section is re-enabled.)
  const [collections, projects, applications, inspirations, recentPosts] =
    await Promise.all([
      client.fetch(homepageCollectionsQuery, {
        quartzCollections: QUARTZ_COLLECTION_NAMES,
        indiaQuartz: [...INDIA_QUARTZ],
      }),
      client.fetch(signatureProjectsQuery),
      client.fetch(applicationCardsQuery),
      client.fetch(inspirationImagesQuery),
      client
        .fetch<BlogPost[]>(recentBlogPostsQuery, { slugs: HOME_ARTICLES })
        .then((posts) =>
          HOME_ARTICLES.flatMap((s) =>
            posts.filter((p) => p.slug.current === s)
          )
        )
        .catch((): BlogPost[] => []),
    ]);

  // Collect every video URL referenced by the homepage so we can warm
  // the browser cache during the splash-screen window. By the time the
  // user finishes the loading video and scrolls down, these clips are
  // already buffered and the Signature Projects / Applications
  // sections play instantly instead of stalling on first paint.
  // Currently the only multi-clip section that surfaces editor-supplied
  // videos is signature projects; extend this array as more
  // video-driven sections come online.
  // Each URL must be exactly the one the visible <video> plays, or the
  // cache never matches: SignatureProjects plays clips through
  // sanityProxyUrl (/api/cdn/files/..., no Sanity cookie), so the
  // prefetch goes through it too.
  const prefetchVideoUrls: string[] = [
    ...(projects ?? [])
      .map((p: { videoUrl?: string | null }) =>
        p.videoUrl ? sanityProxyUrl(p.videoUrl) : p.videoUrl
      )
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
      {/* A bar of the page's sections under the header, from the end of
          the hero on: underlines the one in view, click to jump. */}
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
        subStatement="A leading brand for over 25 years that inspires designs for kitchens, bathrooms, and home surfaces."
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
      {/* The Middle East's Where to buy: Pacific x Fairdeal, shown to
          visitors whose region is there (owner, 2026-10-28). */}
      <PartnerBand />
      <PartnerWithUs />
      <ClosingCTA />
      {/* The four newest journal articles, just above the footer. */}
      <RecentArticles posts={recentPosts} />
    </>
  );
}
