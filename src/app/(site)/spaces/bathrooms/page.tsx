import type { Metadata } from "next";
import SpaceLanding from "@/components/sections/spaces/SpaceLanding";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { BATHROOMS_PAGE } from "@/data/bathrooms-page";
import { spaceColours } from "@/lib/space-colours";

/**
 * /spaces/bathrooms, "Bathrooms by Pacific Surfaces", laid out like the
 * kitchens page (owner, 2026-10-05) with the bathrooms of the Pacific
 * Hospitality Collection. Copy and media are in data/bathrooms-page.ts; the
 * colour tiles are read from Sanity.
 */

export const metadata: Metadata = {
  title: "Bathrooms by Pacific Surfaces — Vanity Tops, Basins, Shower Trays and Walls",
  description:
    "Quartz and Eclipse for the bathroom: vanity tops with Integra washbasins, one-piece shower trays, and shower and feature walls in Superjumbo slabs.",
  alternates: { canonical: "/spaces/bathrooms" },
};

// The colour tiles follow Sanity; refresh hourly.
export const revalidate = 3600;

export default async function BathroomsSpacePage() {
  const colours = await spaceColours(BATHROOMS_PAGE.colours.slugs);
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Spaces", url: "/spaces" },
          { name: "Bathrooms by Pacific Surfaces", url: "/spaces/bathrooms" },
        ]}
      />
      <FaqSchema faqs={BATHROOMS_PAGE.faqs} />
      <SpaceLanding page={BATHROOMS_PAGE} colours={colours} />
    </>
  );
}
