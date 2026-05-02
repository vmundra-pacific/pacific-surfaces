import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { sustainabilityPageQuery } from "@/sanity/lib/queries";
import { SustainabilityContent } from "@/components/sections/SustainabilityContent";

import { FAQ } from "@/components/sections/FAQ";
import { getFaqs } from "@/lib/faqs";
export const metadata: Metadata = {
  title: "Sustainability — Pacific Surfaces",
  description:
    "Discover Pacific Surfaces' commitment to environmental sustainability. Powered by renewable energy, water conservation, and low-silica ecosurfaces.",
  alternates: { canonical: "/sustainability" },
};

/**
 * /sustainability — fetches the sustainabilityPage singleton from
 * Sanity and hands it to the client component for render. The
 * component owns sensible defaults so the page is fully populated
 * even if the singleton hasn't been created yet.
 */
export default async function SustainabilityPage() {
  const data = await client.fetch(sustainabilityPageQuery);
  const faqs = await getFaqs("sustainability");
  return (
    <>
      <SustainabilityContent data={data} />
      <FAQ questions={faqs} theme="light" />
    </>
  );
}
