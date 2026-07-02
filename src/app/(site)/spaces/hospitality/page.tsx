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
  title: "Hospitality — Pacific Surfaces",
  description:
    "Bar tops, restaurant counters, hotel bathrooms, and signature feature walls — Pacific surfaces engineered for the wear, spills, and pace of a real service week.",
  alternates: { canonical: "/spaces/hospitality" },
};

const SECTIONS = [
  {
    eyebrow: "Bar Tops & Service Counters",
    headline: "Bars built for a full service week.",
    body: "Quartz and granite bar tops engineered to take ice, citrus, alcohol, and constant wipe-downs without staining or etching. Custom cut to your DWG with seamless joins so the slab reads as one continuous piece across the length of the bar.",
    imageLabel: "Hospitality bar top",
    ctaLabel: "Explore Quartz",
    ctaHref: "/products/quartz",
  },
  {
    eyebrow: "Reception & Front-of-House",
    headline: "The first surface the guest touches.",
    body: "Sculpted reception desks and concierge counters in Centrepiece Couture or large-format quartz — fabricated in sections, bolted on site, joined invisibly. Lighting cutouts, signage rebates, and concealed cable management built into the cut file.",
    imageLabel: "Hotel reception desk",
    ctaLabel: "Explore Centrepiece Couture",
    ctaHref: "/products/centrepiece-couture",
  },
  {
    eyebrow: "Guestroom Bathrooms",
    headline: "Vanities and showers, hotel-spec.",
    body: "Drop-in or undermount basins on engineered quartz vanities, full-height shower walls in Beyond Finish large-format slabs, and Integra integrated sinks where waterproof joints matter most. Non-porous, hygienic, easy to clean between turnovers.",
    imageLabel: "Hotel bathroom vanity",
    ctaLabel: "Explore Beyond Finish",
    ctaHref: "/products/facades-and-finishes",
  },
  {
    eyebrow: "Restaurant & Lobby Feature Walls",
    headline: "Single slab as the room's design moment.",
    body: "Semi-Precious Stones and Exotic surfaces for restaurant feature walls, hotel lobby cladding, and signature dining backdrops. Hand-laid gemstone fragments or bookmatched natural stone — the kind of surface guests photograph.",
    imageLabel: "Restaurant feature wall",
    ctaLabel: "Explore Semi-Precious Stones",
    ctaHref: "/products/semi-precious",
  },
];

// Render dynamically so published Sanity edits to this space's
// images appear on the next request instead of only after a
// redeploy (editor-managed content). Mirrors /ecosurfaces.
export const revalidate = 0;

export default async function HospitalitySpacePage() {
  const images =
    (await freshClient.fetch<SpacePageImages | null>(spacePageBySlugQuery, {
      slug: "hospitality",
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
        badge="Spaces · Hospitality"
        title="Surfaces specified for the room that has to perform."
        description="Bars, reception desks, guestroom bathrooms, and feature walls — Pacific surfaces for hotels, restaurants, and venues that don't get a quiet day."
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
