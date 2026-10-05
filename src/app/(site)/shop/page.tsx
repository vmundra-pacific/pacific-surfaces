import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ShopClient, type ShopProduct } from "@/components/shop/ShopClient";
import { client } from "@/sanity/lib/client";
import { catalogueProductsQuery } from "@/sanity/lib/queries";
import { CUT_PIECE_PRODUCTS, VANITY_TOP_PRODUCTS, isListedInStore, storeSection } from "@/data/store";
import { REFILE } from "@/data/catalogue-refile";

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
    "Order Pacific vanity tops, vanities, integrated quartz sinks, window sills and thresholds. Add to your cart, place the order, and our team will contact you to confirm quantities, freight and price.",
  alternates: { canonical: "/shop" },
};

// Editors publish new colours regularly; revalidate hourly rather
// than pinning the storefront to build time.
export const revalidate = 3600;

interface CatalogueRow {
  _id: string;
  productType?: string | null;
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
    .flatMap((r) => {
      const slug =
        (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? r._id;
      const section = storeSection({ slug, collection: r.collectionName });
      // Unlisted products keep their store page but leave the grid.
      if (!section || !isListedInStore(slug)) return [];
      return [
        {
          id: r._id,
          name: r.name ?? "Untitled",
          slug,
          image: r.mainImage ?? null,
          section,
          collection: r.collectionName ?? "Other",
          finishes: r.finishes ?? [],
        },
      ];
    });

  // The made-to-order vanity tops (one per basin layout) are defined in
  // data/store.ts, not Sanity, and sit on the Vanity Tops shelf.
  products.push(
    ...VANITY_TOP_PRODUCTS.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      image: t.image,
      section: "Vanity Tops" as const,
      layout: t.layout,
      collection: "Vanity",
      finishes: [],
    }))
  );

  // Sills, thresholds and bath pieces, also defined in code. Each brings its
  // own sizes; a granite sill offers the granite range.
  products.push(
    ...CUT_PIECE_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] ?? null,
      section: "Window Sills & Thresholds" as const,
      collection: p.material,
      finishes: [],
      options: p.options,
      piece: p.piece,
      ...(p.material === "Granite" ? { colourRange: "granite" as const } : {}),
    }))
  );

  // A vanity is made from one of our quartz designs, so the colour list is
  // the range itself rather than a hand-kept list that would drift as
  // editors publish new colours.
  const seenColours = new Set<string>();
  const colours = (rows ?? [])
    .filter((r) => r.visible !== false && r.productType === "quartz-slab")
    .flatMap((r) => {
      const name = r.name?.trim();
      if (!name || seenColours.has(name)) return [];
      seenColours.add(name);
      return [{ name, image: r.mainImage ?? null }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Granite sills: every visible granite, including those the catalogue
  // re-files as granite.
  const seenGranites = new Set<string>();
  const graniteColours = (rows ?? [])
    .filter((r) => {
      if (r.visible === false) return false;
      const slug = (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? "";
      return r.productType === "granite-slab" || REFILE[slug]?.productType === "granite-slab";
    })
    .flatMap((r) => {
      const name = r.name?.trim();
      if (!name || seenGranites.has(name)) return [];
      seenGranites.add(name);
      return [{ name, image: r.mainImage ?? null }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
        title="Vanities, tops, sinks and sills."
        description="Our vanity range, and window sills, thresholds and shower pieces cut to standard sizes. Add what you need to the cart and place the order — no payment online. Our team confirms quantities, freight and price before anything ships."
      />
      <ShopClient products={products} colours={colours} graniteColours={graniteColours} />
    </>
  );
}
