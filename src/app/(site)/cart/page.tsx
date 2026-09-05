import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CartClient } from "@/components/shop/CartClient";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { storeOptions, storeSection, type StoreOptions } from "@/data/store";

/**
 * /cart — review and place the order.
 *
 * The cart itself is client-side (localStorage), but the thickness and
 * finish choices are not: they come from Sanity here and are passed
 * down, so a line can only ever offer options the product actually has
 * — even though the stored cart is whatever the browser says it is.
 */

export const metadata: Metadata = {
  title: "Your cart — Pacific Surfaces",
  description:
    "Review your order and place it. No payment online — our team will contact you to confirm quantities, freight and price.",
  alternates: { canonical: "/cart" },
  robots: { index: false },
};

export const revalidate = 3600;

interface CatalogueRow {
  _id: string;
  name?: string | null;
  productType?: string | null;
  slug?: { current?: string } | string;
  collectionName?: string | null;
  thickness?: string[] | null;
  finishes?: string[] | null;
}

export default async function CartPage() {
  const rows = await client.fetch<CatalogueRow[]>(catalogueProductsQuery);

  const optionsByProduct: Record<string, StoreOptions> = {};
  for (const r of rows ?? []) {
    const slug =
      (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? r._id;
    const section = storeSection({ slug, collection: r.collectionName });
    if (!section) continue;
    optionsByProduct[r._id] = storeOptions({ section, finishes: r.finishes });
  }

  // Same list the storefront offers, so a line can be re-coloured here.
  const colours = Array.from(
    new Set(
      (rows ?? [])
        .filter((r) => r.productType === "quartz-slab")
        .map((r) => r.name?.trim())
        .filter((n): n is string => Boolean(n))
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHeader
        badge="Pacific Store"
        title="Your cart."
        description="Set size, thickness, finish and quantity for each piece, then place the order. Nothing is charged online."
      />
      <CartClient optionsByProduct={optionsByProduct} colours={colours} />
    </>
  );
}
