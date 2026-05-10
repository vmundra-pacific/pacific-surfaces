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
  title: "Commercial — Pacific Surfaces",
  description:
    "Reception desks, bar tops, hospitality surfaces, and commercial counters — Pacific specified for high-traffic environments where appearance and durability both have to last.",
  alternates: { canonical: "/spaces/commercial" },
};

const SECTIONS = [
  {
    eyebrow: "Reception & Bar Tops",
    headline: "Surfaces specified for the welcome moment.",
    body: "Sculpted reception desks, bar tops, and check-in counters in Pacific quartz — engineered to take spills, ice, citric acid, and high-traffic use without staining or etching. Custom fabrication for hospitality and corporate environments.",
    imageLabel: "Reception desk",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
  {
    eyebrow: "Hospitality Surfaces",
    headline: "Slabs that anchor the room.",
    body: "Centrepiece Couture pieces specified for hotel lobbies, restaurant feature walls, and signature dining surfaces — single dramatic slab as the room's design centre.",
    imageLabel: "Hospitality piece",
    ctaLabel: "Explore Centrepiece Couture",
    ctaHref: "/products/centrepiece-couture",
  },
  {
    eyebrow: "Granite Counters",
    headline: "Natural durability for high-traffic environments.",
    body: "Pacific granite countertops for restaurant kitchens, retail counters, and workspace surfaces — heat-, scratch-, and stain-resistant under sustained commercial load.",
    imageLabel: "Granite counter",
    ctaLabel: "Explore Granites",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Statement Surfaces",
    headline: "Hand-laid gemstone tops for signature moments.",
    body: "Semi-precious surfaces composed of selected gemstone fragments — for boutique reception desks, lit feature walls, and bespoke commissions where the surface is the project's design moment.",
    imageLabel: "Semi-precious feature",
    ctaLabel: "Explore Semi-Precious",
    ctaHref: "/products/semi-precious",
  },
];

export default async function CommercialSpacePage() {
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "commercial",
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
        badge="Spaces · Commercial"
        title="Commercial surfaces, specified to last."
        description="Hospitality, retail, workspace — Pacific surfaces for the environments that move all day, every day."
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
