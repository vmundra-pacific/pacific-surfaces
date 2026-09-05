import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbList } from "@/components/global/JsonLd";
import {
  ShopProductClient,
  type ShopProductDetail,
} from "@/components/shop/ShopProductClient";
import type { ShopColour } from "@/components/shop/ShopClient";
import { client } from "@/sanity/lib/client";
import {
  catalogueProductsQuery,
  productBySlugQuery,
} from "@/sanity/lib/queries";
import { basinLayers, storeOptions, storeSection } from "@/data/store";

/**
 * /shop/<slug> — the store's product page.
 *
 * Separate from /products/<slug>, which is the marketing page for a colour.
 * This one exists to be configured and ordered: gallery, options, quantity,
 * add to cart.
 */

export const revalidate = 3600;

/** A Portable Text block, as far as this page needs to understand one. */
interface PortableBlock {
  _type?: string;
  children?: { text?: string }[];
}

interface ProductDoc {
  _id: string;
  name?: string;
  slug?: { current?: string } | string;
  /** Sanity stores this as Portable Text, not a string. */
  description?: string | PortableBlock[];
  mainImage?: string | null;
  gallery?: string[] | null;
  roomScenes?: string[] | null;
  hdFileUrl?: string | null;
  specSheetUrl?: string | null;
  collection?: { name?: string } | null;
  finishes?: string[] | null;
}

interface CatalogueRow {
  _id: string;
  name?: string | null;
  slug?: { current?: string } | string;
  mainImage?: string | null;
  productType?: string | null;
  collectionName?: string | null;
  visible?: boolean;
}

/**
 * Flatten Sanity's Portable Text to a plain paragraph. The store page shows
 * a short intro, not formatted copy, and rendering the blocks straight into
 * JSX throws — they are objects, not strings.
 */
function plainText(value: string | PortableBlock[] | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  const text = value
    .filter((b) => b?._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await client.fetch<ProductDoc | null>(productBySlugQuery, {
    slug,
  });
  if (!doc?.name) return {};
  return {
    title: `${doc.name} — Pacific Store`,
    description:
      plainText(doc.description) ??
      `Order ${doc.name} from Pacific Surfaces. Choose colour, dimensions and finish.`,
    alternates: { canonical: `/shop/${slug}` },
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [doc, rows] = await Promise.all([
    client.fetch<ProductDoc | null>(productBySlugQuery, { slug }),
    client.fetch<CatalogueRow[]>(catalogueProductsQuery),
  ]);

  if (!doc?.name) notFound();

  const section = storeSection({
    slug,
    collection: doc.collection?.name,
  });
  // Only the vanity range is sold here; anything else belongs on the
  // marketing product page rather than a configurator.
  if (!section) notFound();

  const seen = new Set<string>();
  const colours: ShopColour[] = (rows ?? [])
    .filter((r) => r.visible !== false && r.productType === "quartz-slab")
    .flatMap((r) => {
      const name = r.name?.trim();
      if (!name || seen.has(name)) return [];
      seen.add(name);
      return [{ name, image: r.mainImage ?? null }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Similar products: the rest of this shelf. Same section rather than same
  // Sanity collection, because the shelf is how the range is actually
  // shopped — a basin sits beside other basins, not beside vanity tops.
  const similar = (rows ?? [])
    .filter((r) => r.visible !== false && r._id !== doc._id)
    .flatMap((r) => {
      const rowSlug =
        (typeof r.slug === "string" ? r.slug : r.slug?.current) ?? "";
      if (!rowSlug || !r.name) return [];
      const rowSection = storeSection({
        slug: rowSlug,
        collection: r.collectionName,
      });
      if (rowSection !== section) return [];
      return [{ name: r.name, slug: rowSlug, image: r.mainImage ?? null }];
    })
    .slice(0, 8);

  const images = [
    doc.mainImage,
    ...(doc.gallery ?? []),
    ...(doc.roomScenes ?? []),
  ].filter((u): u is string => Boolean(u));

  // Product code: the number many of these carry in their name, e.g.
  // "Noble Basin (48 x 22 inches)" has none, "Adonis (5059)" has 5059.
  const code = doc.name.match(/\(([A-Z0-9-]{2,10})\)/)?.[1] ?? null;

  const product: ShopProductDetail = {
    id: doc._id,
    name: doc.name,
    slug,
    code,
    description: plainText(doc.description),
    images,
    collection: doc.collection?.name ?? null,
    section,
    hdFileUrl: doc.hdFileUrl ?? null,
    specSheetUrl: doc.specSheetUrl ?? null,
  };

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Store", url: "/shop" },
          { name: doc.name, url: `/shop/${slug}` },
        ]}
      />

      <nav className="bg-white px-6 pt-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 text-xs font-light text-pacific-dark/55">
          <Link href="/" className="hover:text-pacific-dark">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-pacific-dark">
            {section}
          </Link>
          <span>/</span>
          <span className="text-pacific-dark">{doc.name}</span>
        </div>
      </nav>

      <ShopProductClient
        product={product}
        options={storeOptions({ section, finishes: doc.finishes })}
        colours={colours}
        similar={similar}
        layers={basinLayers(slug)}
      />
    </>
  );
}
