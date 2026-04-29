import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { resolveCategoryPage } from "../_lib/category";

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
  if (!data) return { title: "Exotic Collection — Pacific Surfaces" };
  return {
    title:
      data.collection.seoTitle || `${data.collection.name} — Pacific Surfaces`,
    description:
      data.collection.seoDescription ||
      data.collection.description ||
      "Premium exotic stone surfaces with rare patterns and bold veining.",
  };
}

export default async function ExoticPage() {
  const data = await resolveCategoryPage("exotic");
  if (!data) notFound();
  return <CatalogueClient slabs={data.slabs} hero={data.config.hero} />;
}
