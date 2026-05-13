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
  title: "Kitchens — Pacific Surfaces",
  description:
    "Worktops, islands, splashbacks, and sinks for the kitchen — engineered to take heat, knives, wine, and every weeknight cooking session.",
  alternates: { canonical: "/spaces/kitchens" },
};

const SECTIONS = [
  {
    eyebrow: "Quartz Worktops",
    headline: "Engineered for the kitchen's hardest hours.",
    body: "Pacific quartz worktops handle heat, knives, wine, and every weeknight cooking session without flinching. Engineered consistency means matching slabs across a long run, jumbo formats reduce joints on islands, and the non-porous surface never needs sealing.",
    imageLabel: "Quartz worktop",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
  {
    eyebrow: "Granite Islands",
    headline: "Quarry-cut character at the room's heart.",
    body: "Where the kitchen island is the visual anchor, natural granite brings movement no engineered surface can match. Each slab is one of one. Pacific granite is sourced and finished in-house — heat- and scratch-resistant by nature.",
    imageLabel: "Granite island",
    ctaLabel: "Explore Granites",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Integra Sinks",
    headline: "Sinks that disappear into the worktop.",
    body: "Integra fabricates the sink directly from your Pacific quartz slab — no metal joint, no silicone seam, no break in the surface. Single material from countertop into basin, designed to read as one continuous piece.",
    imageLabel: "Integra sink",
    ctaLabel: "Explore Integra",
    ctaHref: "/products/integra",
  },
  {
    eyebrow: "Splashbacks & Cladding",
    headline: "Stone from worktop to underside-of-cabinet.",
    body: "Continuous Pacific surfaces carry the worktop pattern up the wall — bookmatched veining, no grout lines, no seams. Beyond Finish specifies the same stone for the splashback at large-format scale.",
    imageLabel: "Splashback panel",
    ctaLabel: "Explore Beyond Finish",
    ctaHref: "/products/facades-and-finishes",
  },
];

export default async function KitchensSpacePage() {
  // Fetch editor-managed images from Sanity. Returns null when the
  // doc doesn't exist yet — sections render with gradient
  // placeholders until an editor uploads photos.
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "kitchens",
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
        badge="Spaces · Kitchens"
        title="Kitchens designed around the surface."
        description="Worktops, islands, splashbacks, and sinks — Pacific surfaces engineered for the room people actually cook in."
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
