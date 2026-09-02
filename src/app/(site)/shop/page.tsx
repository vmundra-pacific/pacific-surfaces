import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ShopClient, type ShopProduct } from "@/components/shop/ShopClient";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { isInStore } from "@/data/store";

/**
 * /shop — the store.
 *
 * Deliberately separate from /products, which is the marketing
 * catalogue: this is a grid you buy from, grouped into collection
 * sections, with add-to-cart on every card. Nothing is priced or paid
 * for online — an order is a request, and the team follows up.
 */

export const metadata: Metadata = {
  title: "Store — Pacific Surfaces",
  description:
    "Order Pacific vanity tops, vanities and vanity sinks. Add to your cart, place the order, and our team will contact you to confirm quantities, freight and price.",
  alternates: { canonical: "/shop" },
};

// Editors publish new colours regularly; revalidate hourly rather
// than pinning the storefront to build time.
export const revalidate = 3600;

interface CatalogueRow {
  _id: string;
  name?: string;
  slug?: { current?: string } | string;
  mainImage?: string | null;
  collectionName?: string | null;
  thickness?: string[] | null;
  finishes?: string[] | null;
  visible?: boolean;
}

export default async function ShopPage() {
  const rows = await client.fetch<CatalogueRow[]>(catalogueProductsQuery);

  const products: ShopProduct[] = (rows ?? [])
    .filter((r) => r.visible !== false && r.name)
    // The store opens with a short, deliberate range rather than the
    // whole catalogue — see src/data/store.ts to add or remove one.
    .filter((r) =>
      isInStore({
        slug: (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? r._id,
        collection: r.collectionName,
      })
    )
    .map((r) => ({
      id: r._id,
      name: r.name ?? "Untitled",
      slug: (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? r._id,
      image: r.mainImage ?? null,
      collection: r.collectionName ?? "Other",
      thicknesses: r.thickness ?? [],
      finishes: r.finishes ?? [],
    }));

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Store", url: "/shop" },
        ]}
      />
      <PageHeader
        badge="Pacific Store"
        title="Vanities, tops and basins."
        description="The store opens with our vanity range. Add what you need to the cart and place the order — no payment online. Our team confirms quantities, freight and price before anything ships."
      />
      <ShopClient products={products} />
    </>
  );
}
