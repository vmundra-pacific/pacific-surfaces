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
  title: "Outdoor & Wet Areas — Pacific Surfaces",
  description:
    "Pool surrounds, terrace counters, outdoor kitchens, and wet rooms — Pacific surfaces engineered UV-stable, freeze-thaw rated, and built to last in the elements.",
  alternates: { canonical: "/spaces/outdoor" },
};

const SECTIONS = [
  {
    eyebrow: "Pool Surrounds & Coping",
    headline: "Surfaces that hold up around water, year after year.",
    body: "Beyond Finish stoneface and granite coping cut to your pool's perimeter — UV-stable so the colour doesn't shift, freeze-thaw rated for cold-snap regions, and slip-resistant where it matters. Bonded with marine-grade adhesives that don't soften under chlorine or salt.",
    imageLabel: "Pool surround surface",
    ctaLabel: "Explore Beyond Finish",
    ctaHref: "/products/facades-and-finishes",
  },
  {
    eyebrow: "Outdoor Kitchens & BBQ Counters",
    headline: "Cooking surfaces that live outdoors.",
    body: "Quartz and granite counters for outdoor kitchens — heat-stable around grills, stain-resistant against wine and oil, and engineered to weather the seasons without fading. Cut to size with sink openings, BBQ cut-outs, and concealed mountings ready to install.",
    imageLabel: "Outdoor kitchen counter",
    ctaLabel: "Explore Granites",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Terraces & Outdoor Cladding",
    headline: "Cladding that takes the weather seriously.",
    body: "Large-format Beyond Finish panels and natural stone facade slabs for terraces, garden walls, and rear elevations — drilled for anchor systems, cut to architect's setting-out drawings, and graded to keep their finish through decades of sun, rain, and wind.",
    imageLabel: "Outdoor facade cladding",
    ctaLabel: "Explore Granite & Natural Stone",
    ctaHref: "/products/granites",
  },
  {
    eyebrow: "Wet Rooms & Spa Surfaces",
    headline: "Non-porous surfaces, top to bottom.",
    body: "Full-height shower walls, spa bench tops, and steam-room cladding in engineered quartz and Beyond Finish — non-porous so water can't penetrate, hygienic by design, and finished with seamless joints that won't trap moisture or grime.",
    imageLabel: "Spa wet room surface",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
];

// Render dynamically so published Sanity edits to this space's
// images appear on the next request instead of only after a
// redeploy (editor-managed content). Mirrors /ecosurfaces.
export const revalidate = 0;

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
      <PageHeader
        badge="Spaces · Outdoor & Wet Areas"
        title="Surfaces built for the elements."
        description="Pool surrounds, outdoor kitchens, terraces, and wet rooms — Pacific specified UV-stable, freeze-thaw rated, and non-porous for the spaces where the weather and the water never stop."
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
