import type { Metadata } from "next";
import FlooringPage from "@/components/sections/spaces/FlooringPage";
import type { SpaceColour } from "@/components/sections/spaces/SpaceBlocks";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { client } from "@/sanity/lib/client";
import { FLOORING_PAGE } from "@/data/flooring-page";

/**
 * /applications/flooring — "Flooring by Pacific Surfaces", laid out like
 * the kitchens page (owner, 2026-10-05) instead of the generic application
 * template, which still serves every other /applications/<slug>. Copy and
 * figures come from the Landscape Edition granite catalogue
 * (data/flooring-page.ts); the granites' names and slab photographs are
 * read from Sanity.
 */

export const metadata: Metadata = {
  title: "Flooring by Pacific Surfaces — Granite Floors, Paving and Steps",
  description:
    "Granite floors, paving and steps in eight granites and six finishes, with pavers in nine formats in 3 and 5 cm. Technical data, finishes and inspiration.",
  alternates: { canonical: "/applications/flooring" },
};

// The colour tiles follow Sanity; refresh hourly.
export const revalidate = 3600;

export default async function FlooringApplicationPage() {
  const rows = await client
    .fetch<{ name: string; slug: string; image: string | null }[]>(
      `*[_type == "product" && slug.current in $slugs && visible != false]{
        name, "slug": slug.current, "image": mainImage.asset->url
      }`,
      { slugs: FLOORING_PAGE.colours.slugs }
    )
    .catch(() => []);
  // Keep the order the page lists them in.
  const colours: SpaceColour[] = FLOORING_PAGE.colours.slugs.flatMap((slug) => {
    const r = rows?.find((x) => x.slug === slug);
    return r ? [{ name: r.name, slug: r.slug, image: r.image }] : [];
  });

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Spaces", url: "/spaces" },
          { name: "Flooring by Pacific Surfaces", url: "/applications/flooring" },
        ]}
      />
      <FaqSchema faqs={FLOORING_PAGE.faqs} />
      <FlooringPage colours={colours} />
    </>
  );
}
