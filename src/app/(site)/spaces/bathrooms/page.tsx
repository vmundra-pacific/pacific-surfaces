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
  title: "Bathrooms — Pacific Surfaces",
  description:
    "Vanity tops, sinks, shower trays, and wall cladding — Pacific surfaces engineered for the bath, where seamless joints and stain resistance matter every day.",
  alternates: { canonical: "/spaces/bathrooms" },
};

const SECTIONS = [
  {
    eyebrow: "Vanity Tops",
    headline: "Hand-finished tops that anchor the bath.",
    body: "Pacific Vanity is a dedicated bathroom product line — tops fabricated with seamless joints, hand-finished edges, and stain resistance built for daily use. Designed to integrate directly with our quartz sinks.",
    imageLabel: "Vanity top",
    ctaLabel: "Explore Vanity",
    ctaHref: "/products/vanity",
  },
  {
    eyebrow: "Wall Cladding",
    headline: "Floor-to-ceiling stone, no grout.",
    body: "Façades and Finishes brings authentic stone character to bathroom walls and feature areas at large-format scale. Continuous panels reduce joints; bookmatched options on request.",
    imageLabel: "Wall cladding",
    ctaLabel: "Explore Façades & Finishes",
    ctaHref: "/products/facades-and-finishes",
  },
  {
    eyebrow: "Integra Sinks",
    headline: "Quartz basins fused into the vanity.",
    body: "Integra sinks for the bath fabricate seamlessly into Pacific vanity tops — no joint to discolour, no rim to gather grime. Single material from counter into basin.",
    imageLabel: "Integra basin",
    ctaLabel: "Explore Integra",
    ctaHref: "/products/integra",
  },
  {
    eyebrow: "Shower Trays",
    headline: "Single-piece quartz shower bases.",
    body: "Pacific quartz cut and finished as a one-piece shower tray — no tile grid to clean, no liner to fail. Slip-rated finishes available; sized to standard and bespoke shower openings.",
    imageLabel: "Shower tray",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
];

export default async function BathroomsSpacePage() {
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "bathrooms",
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
        badge="Spaces · Bathrooms"
        title="Bathrooms that read as one piece."
        description="Vanity, sinks, shower trays, and cladding — Pacific surfaces engineered to fuse the bath together."
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
