import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SpaceFeatureSection } from "@/components/sections/SpaceFeatureSection";
import { freshClient } from "@/sanity/lib/client";
import { spacePageBySlugQuery } from "@/sanity/lib/queries";

interface SpacePageImages {
  section1Image?: string | null;
  section2Image?: string | null;
  section3Image?: string | null;
  section4Image?: string | null;
}

export const metadata: Metadata = {
  title: "Architecture — Pacific Surfaces",
  description:
    "Façades, large-format cladding, feature walls, and floor panels — Pacific surfaces engineered for the building skin and the spaces inside it.",
  alternates: { canonical: "/spaces/architecture" },
};

const SECTIONS = [
  {
    eyebrow: "Façades",
    headline: "Large-format surfaces for the building skin.",
    body: "Pacific surfaces engineered for facade use — UV stable, thermally tolerant, rated for exterior weathering. Ventilated rainscreen and direct-fix systems supported across the full Façades and Finishes range.",
    imageLabel: "Facade panel",
    ctaLabel: "Explore Façades & Finishes",
    ctaHref: "/products/facades-and-finishes",
  },
  {
    eyebrow: "Large-format Quartz",
    headline: "Super-jumbo slabs that read as one plane.",
    body: "Pacific quartz at jumbo dimensions reduces joints across long surfaces and creates the unbroken planes architects specify. Repeatable patterns mean matched slabs over an entire elevation.",
    imageLabel: "Large-format slab",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
  {
    eyebrow: "Feature Walls",
    headline: "Statement surfaces for lobbies and entry sequences.",
    body: "Centrepiece Couture is Pacific's gallery-grade slab line — singular, dramatically-veined surfaces specified by designers when the slab itself is the brief.",
    imageLabel: "Feature wall",
    ctaLabel: "Explore Centrepiece Couture",
    ctaHref: "/products/centrepiece-couture",
  },
  {
    eyebrow: "Granite Cladding",
    headline: "Natural stone for the long term.",
    body: "Pacific granite cladding for facades and exterior features — geological durability, weathering naturally over decades. Sourced and finished in-house with full traceability from quarry to install.",
    imageLabel: "Granite cladding",
    ctaLabel: "Explore Granites",
    ctaHref: "/products/granites",
  },
];

export default async function ArchitectureSpacePage() {
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "architecture",
    })) ?? {};
  const sectionImages = [
    images.section1Image,
    images.section2Image,
    images.section3Image,
    images.section4Image,
  ];

  return (
    <>
      <PageHeader
        badge="Spaces · Architecture"
        title="Architecture-grade surfaces."
        description="Facades, cladding, feature walls — Pacific specified for the building, the lobby, and the moments that anchor a project."
      />
      {SECTIONS.map((s, i) => (
        <SpaceFeatureSection
          key={s.eyebrow}
          eyebrow={s.eyebrow}
          headline={s.headline}
          body={s.body}
          imageLabel={s.imageLabel}
          imageUrl={sectionImages[i]}
          ctaLabel={s.ctaLabel}
          ctaHref={s.ctaHref}
          imageOnLeft={i % 2 === 0}
          theme={i % 2 === 0 ? "light" : "dark"}
        />
      ))}
    </>
  );
}
