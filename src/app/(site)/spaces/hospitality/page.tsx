import type { Metadata } from "next";
import SpaceLanding from "@/components/sections/spaces/SpaceLanding";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { HOTELS_PAGE } from "@/data/hotels-page";
import { spaceColours } from "@/lib/space-colours";

/**
 * /spaces/hospitality, "Hotels by Pacific Surfaces", laid out like the
 * kitchens page (owner, 2026-10-05) with the Pacific Hospitality
 * Collection's photographs. Copy and media are in data/hotels-page.ts; the
 * colour tiles are read from Sanity.
 */

export const metadata: Metadata = {
  title: "Hotels by Pacific Surfaces — Lobbies, Bars, Restaurants, Spas and Rooms",
  description:
    "Quartz and Eclipse surfaces for hotels: reception desks, bar counters, restaurants, spa and wellness, rooms and bathrooms, from the Pacific Hospitality Collection.",
  alternates: { canonical: "/spaces/hospitality" },
};

// The colour tiles follow Sanity; refresh hourly.
export const revalidate = 3600;

export default async function HospitalitySpacePage() {
  const colours = await spaceColours(HOTELS_PAGE.colours.slugs);
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Spaces", url: "/spaces" },
          { name: "Hotels by Pacific Surfaces", url: "/spaces/hospitality" },
        ]}
      />
      <FaqSchema faqs={HOTELS_PAGE.faqs} />
      <SpaceLanding page={HOTELS_PAGE} colours={colours} />
    </>
  );
}
