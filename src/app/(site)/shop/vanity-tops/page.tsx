import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { CUSTOM_SIZE, VANITY_TOP_PRODUCTS, vanityTopOptions } from "@/data/store";
import { applicationBySlug } from "@/data/applications";
import {
  VanityTopsListing,
  type ListingColour,
  type ListingTop,
} from "@/components/shop/VanityTopsListing";

/**
 * /shop/vanity-tops — the vanity tops aisle of the store, laid out after
 * Lowe's vanity-tops listing (owner, 2026-10-05): sink-count and width
 * tiles, a results count, filter menus, and a grid of tops. Every top is
 * one of the three made-to-order layouts in one of the quartz designs, and
 * each card composites that design into the layout's scene live (the
 * visualizer's compositor, BasinPreview), so the grid shows real colours
 * rather than one stock photograph.
 *
 * No prices or ratings: the store takes order requests, and nothing is
 * shown that the business has not stated. The guide copy and FAQ are the
 * vanity-tops application page's (data/applications), so the two pages
 * say the same thing.
 */

export const metadata: Metadata = {
  title: "Quartz Vanity Tops | Pacific Store",
  description:
    "Quartz vanity tops in single, double and triple basin layouts, in 125+ Pacific designs, made to your size. Preview any colour on the top, add it to your cart, and our team confirms price and freight.",
  alternates: { canonical: "/shop/vanity-tops" },
};

export const revalidate = 3600;

interface CatalogueRow {
  _id: string;
  name?: string | null;
  slug?: { current?: string } | string;
  mainImage?: string | null;
  productType?: string | null;
  collectionName?: string | null;
  visible?: boolean;
}

export default async function VanityTopsPage() {
  const rows = await client.fetch<CatalogueRow[]>(catalogueProductsQuery);

  const seen = new Set<string>();
  const colours: ListingColour[] = (rows ?? [])
    .filter((r) => r.visible !== false && r.productType === "quartz-slab" && r.mainImage)
    .flatMap((r) => {
      const name = r.name?.trim();
      if (!name || seen.has(name)) return [];
      seen.add(name);
      const slug = (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? "";
      return [{ name, slug, image: r.mainImage ?? null, series: r.collectionName?.trim() || "Pacific Quartz" }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const tops: ListingTop[] = VANITY_TOP_PRODUCTS.map((t) => {
    const options = vanityTopOptions(t.layout);
    return {
      slug: t.slug,
      name: t.name,
      layout: t.layout,
      basins: ["Single Basin", "Double Basin", "Triple Basin"].indexOf(t.layout) + 1,
      widths: options.lengths.filter((l) => l !== CUSTOM_SIZE),
      layers: t.layers,
      image: t.image,
    };
  });

  const guide = applicationBySlug("bathroom-vanity-tops")?.seo;

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Store", url: "/shop" },
          { name: "Vanity Tops", url: "/shop/vanity-tops" },
        ]}
      />
      <VanityTopsListing
        tops={tops}
        colours={colours}
        intro={guide?.intro ?? []}
        faqs={guide?.faqs ?? []}
      />
    </>
  );
}
