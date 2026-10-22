import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreloadImage } from "@/components/global/PreloadImage";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { heroPosterSrc, resolveCategoryPage } from "../_lib/category";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { clipAtWord, plainText } from "@/lib/portable-text";

/**
 * Static route for /products/exotic.
 *
 * Kept as a static route ONLY because Next.js prefers static segments
 * over dynamic ones when both could match — this guarantees the
 * Exotic landing always resolves to the catalogue, even if a product
 * with slug "exotic" were ever created. The actual rendering logic
 * is shared with the dispatcher in ../[slug]/page.tsx via the
 * `resolveCategoryPage` helper, so config changes only need to be
 * made in one place (CATEGORY_PAGES["exotic"] in ../_lib/category.ts).
 */

export async function generateMetadata(): Promise<Metadata> {
  const data = await resolveCategoryPage("exotic");
  if (!data)
    return {
      title: "Exotic Collection — Pacific Surfaces",
      alternates: { canonical: "/products/exotic" },
    };
  // A Sanity collection's description is Portable Text: flatten it, or
  // the meta tag would carry block objects (as in ../[slug]/page.tsx).
  const ownDescription = plainText(data.collection.description);
  return {
    title:
      data.collection.seoTitle || `${data.collection.name} — Pacific Surfaces`,
    description:
      data.collection.seoDescription ||
      (ownDescription ? clipAtWord(ownDescription, 155) : null) ||
      "Premium exotic stone surfaces with rare patterns and bold veining.",
    alternates: { canonical: "/products/exotic" },
  };
}

export default async function ExoticPage() {
  const data = await resolveCategoryPage("exotic");
  if (!data) notFound();
  // LCP: preload the hero video's poster at high priority, as the
  // [slug] dispatcher does for every other category hero.
  const heroPoster = heroPosterSrc(data.config.hero);
  return (
    <>
      <PreloadImage href={heroPoster} />
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: "Exotic Collection", url: "/products/exotic" },
        ]}
      />
      <CatalogueClient slabs={data.slabs} hero={data.config.hero} />
    </>
  );
}
