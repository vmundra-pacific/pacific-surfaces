import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SpaceFeatureSection } from "@/components/sections/SpaceFeatureSection";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { freshClient } from "@/sanity/lib/client";
import { spacePageBySlugQuery } from "@/sanity/lib/queries";

interface SpacePageImages {
  section1Image?: string | null;
  section2Image?: string | null;
  section3Image?: string | null;
  section4Image?: string | null;
}

export const metadata: Metadata = {
  title: "Outdoor & Wet Areas — Pacific Surfaces",
  description:
    "Pool surrounds, outdoor kitchens, terraces and wet rooms. Outdoors, Pacific Surfaces specifies natural granite and Beyond Stone; engineered quartz stays indoors.",
  alternates: { canonical: "/spaces/outdoor" },
};

const SECTIONS = [
  {
    eyebrow: "Pool Surrounds & Coping",
    headline: "Surfaces that hold up around water, year after year.",
    body: "Beyond Stone stoneface and granite coping cut to your pool's perimeter. Natural stone has no resin binder for direct sun to yellow, and a flamed or leathered finish keeps grip where feet are wet.",
    imageLabel: "Pool surround surface",
    ctaLabel: "Explore Beyond Stone",
    ctaHref: "/products/facades-and-finishes",
  },
  {
    eyebrow: "Outdoor Kitchens & BBQ Counters",
    headline: "Cooking surfaces that live outdoors.",
    body: "Granite counters for outdoor kitchens. Granite is the surface we specify outdoors: natural stone, with no resin binder to yellow in the sun, tolerant of the heat around a grill, and sealed against wine and oil. Cut to size with sink openings and BBQ cut-outs. Engineered quartz is resin-bound, so it stays indoors.",
    imageLabel: "Outdoor kitchen counter",
    ctaLabel: "Explore Granites",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Terraces & Outdoor Cladding",
    headline: "Cladding that takes the weather seriously.",
    body: "Large-format Beyond Stone panels and granite facade slabs for terraces, garden walls and rear elevations, drilled for anchor systems and cut to the architect's setting-out drawings. Flamed, leathered and brushed finishes suit exposed surfaces.",
    imageLabel: "Outdoor facade cladding",
    ctaLabel: "Explore Granite & Natural Stone",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Wet Rooms & Spa Surfaces",
    headline: "Low-porosity surfaces, floor to ceiling.",
    body: "Full-height shower walls and spa bench tops in engineered quartz, for indoor wet rooms: low porosity, so water stays on the surface, and finished with tight joints that don't trap moisture or grime.",
    imageLabel: "Spa wet room surface",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
];

// Served from the cache and rebuilt at most once a minute, so Sanity
// edits show within 60 s (2026-10-22: with revalidate = 0 every visit
// waited ~1.3 s for a fresh render, failing the phone Core Web Vitals).
export const revalidate = 60;

export default async function OutdoorSpacePage() {
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "outdoor",
    })) ?? {};
  const sectionImages = [
    images.section1Image,
    images.section2Image,
    images.section3Image,
    images.section4Image,
  ];

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Spaces", url: "/spaces" },
          { name: "Outdoor & Wet Areas", url: "/spaces/outdoor" },
        ]}
      />
      <PageHeader
        badge="Spaces · Outdoor & Wet Areas"
        title="Surfaces built for the elements."
        description="Pool surrounds, outdoor kitchens, terraces and wet rooms. Natural granite and Beyond Stone for the outdoors; engineered quartz for indoor wet rooms."
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
