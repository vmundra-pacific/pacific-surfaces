import type { Metadata } from "next";
import KitchensPage, { type KitchenColour } from "@/components/sections/spaces/KitchensPage";
import { BreadcrumbList, FaqSchema } from "@/components/global/JsonLd";
import { client } from "@/sanity/lib/client";
import { KITCHENS_PAGE } from "@/data/kitchens-page";

/**
 * /spaces/kitchens — laid out after cosentino.com/kitchens: hero, five
 * reasons in tabs, the kitchen applications, planning, inspiration,
 * popular colours, catalogue, FAQ and the other spaces. Copy lives in
 * data/kitchens-page.ts; the colours' names and slab photographs are read
 * from Sanity, so they follow the catalogue.
 */

export const metadata: Metadata = {
  title: "Kitchens by Pacific Surfaces — Quartz Worktops, Islands and Backsplashes",
  description:
    "Quartz and Eclipse worktops, islands, backsplashes and integrated sinks: Superjumbo slabs, heat, stain and scratch resistant, with a lifetime warranty.",
  alternates: { canonical: "/spaces/kitchens" },
};

// The colour tiles follow Sanity; refresh hourly.
export const revalidate = 3600;

export default async function KitchensSpacePage() {
  const rows = await client.fetch<{ name: string; slug: string; image: string | null }[]>(
    `*[_type == "product" && slug.current in $slugs && visible != false]{
      name, "slug": slug.current, "image": mainImage.asset->url
    }`,
    { slugs: KITCHENS_PAGE.colours.slugs }
  );
  // Keep the order the page lists them in.
  const colours: KitchenColour[] = KITCHENS_PAGE.colours.slugs.flatMap((slug) => {
    const r = rows?.find((x) => x.slug === slug);
    return r ? [{ name: r.name, slug: r.slug, image: r.image }] : [];
  });

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Spaces", url: "/spaces" },
          { name: "Kitchens by Pacific Surfaces", url: "/spaces/kitchens" },
        ]}
      />
      <FaqSchema faqs={KITCHENS_PAGE.faqs} />
      <KitchensPage colours={colours} />
    </>
  );
}
