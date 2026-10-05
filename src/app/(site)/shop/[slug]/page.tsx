import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { BreadcrumbList } from "@/components/global/JsonLd";
import {
  ShopProductClient,
  type BasinVariant,
  type ShopProductDetail,
} from "@/components/shop/ShopProductClient";
import type { ShopColour } from "@/components/shop/ShopClient";
import { client } from "@/sanity/lib/client";
import {
  catalogueProductsQuery,
  productBySlugQuery,
} from "@/sanity/lib/queries";
import {
  VANITY_TOP_PRODUCTS,
  basinLayers,
  isListedInStore,
  storeOptions,
  storeSection,
  vanityTopBySlug,
  vanityTopOptions,
  type MadeToOrderTop,
} from "@/data/store";
import { applicationBySlug } from "@/data/applications";
import type { VanityDetails } from "@/components/shop/VanityTopDetails";

/**
 * /shop/<slug> — the store's product page.
 *
 * Separate from /products/<slug>, which is the marketing page for a colour.
 * This one exists to be configured and ordered: gallery, options, quantity,
 * add to cart.
 */

export const revalidate = 3600;

/** The window sills, thresholds and bath pieces the store sold for a day
 *  (2026-10-05) before they became their own category under Products:
 *  their old store addresses lead there now. */
const RETIRED_PIECE = /^(quartz|granite)-(threshold-1-bevel|threshold-2-bevels|threshold-hollywood|window-sill|shower-jamb|corner-shelf|corner-seat|shower-bench)$/;
const SILLS_PAGE = "/products/pacific-european-window-sill-threshold-collection";

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
  const top = vanityTopBySlug(slug);
  if (top) {
    return {
      title: `${top.name} — Pacific Store`,
      description: top.description,
      alternates: { canonical: `/shop/${slug}` },
    };
  }
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

  // A made-to-order vanity top is defined in code, not Sanity.
  const top = vanityTopBySlug(slug);
  if (top) {
    const rows = await client.fetch<CatalogueRow[]>(catalogueProductsQuery);
    return <MadeToOrderTopPage top={top} colours={rangeColours(rows)} details={vanityDetails(rows)} />;
  }

  if (RETIRED_PIECE.test(slug)) permanentRedirect(SILLS_PAGE);

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

  const colours = rangeColours(rows);

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
      if (rowSection !== section || !isListedInStore(rowSlug)) return [];
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
        options={storeOptions({ section, finishes: doc.finishes, name: doc.name, slug })}
        colours={colours}
        similar={similar}
        layers={basinLayers(slug)}
      />
    </>
  );
}

/**
 * The colours a piece can be made in: the visible quartz range, one row per
 * name, alphabetical.
 */
function rangeColours(rows: CatalogueRow[] | null): ShopColour[] {
  const seen = new Set<string>();
  return (rows ?? [])
    .filter((r) => r.visible !== false && r.productType === "quartz-slab")
    .flatMap((r) => {
      const name = r.name?.trim();
      if (!name || seen.has(name)) return [];
      seen.add(name);
      return [{ name, image: r.mainImage ?? null }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The page for a made-to-order vanity top: the same layout as any store
 * product. Where the top has composite layers (Double Basin), the main
 * image is the live preview, so picking a colour lays that slab into the
 * scene the way the visualizer does.
 */
function topDetail(t: MadeToOrderTop): ShopProductDetail {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    code: null,
    description: t.description,
    images: [t.image],
    collection: "Vanity",
    section: "Vanity Tops",
    hdFileUrl: null,
    specSheetUrl: null,
  };
}

/** The vanity-tops guide's copy, specs and FAQ, and each design's
 *  collection, for the detail sections of a vanity top's page. */
function vanityDetails(rows: CatalogueRow[] | null): VanityDetails | undefined {
  const guide = applicationBySlug("bathroom-vanity-tops")?.seo;
  if (!guide) return undefined;
  const series: Record<string, string> = {};
  for (const r of rows ?? []) {
    const name = r.name?.trim();
    if (name && r.productType === "quartz-slab" && r.collectionName) series[name] = r.collectionName;
  }
  return {
    intro: guide.intro,
    // Benefits exist only where the guide has them; the store page shows
    // what the guide says and nothing more.
    benefits: ((guide as { benefits?: { title: string; body: string }[] }).benefits ?? []).map((x) => ({
      title: x.title,
      body: x.body,
    })),
    specs: guide.specs,
    faqs: guide.faqs,
    series,
  };
}

function MadeToOrderTopPage({
  top,
  colours,
  details,
}: {
  top: MadeToOrderTop;
  colours: ShopColour[];
  details?: VanityDetails;
}) {
  // All three tops, so the Basins field can move between them in place
  // (Single / Double / Triple) without losing the chosen colour.
  const variants: BasinVariant[] = VANITY_TOP_PRODUCTS.map((t) => {
    const options = vanityTopOptions(t.layout);
    return {
      basins: options.basins[0],
      product: topDetail(t),
      options,
      layers: t.layers,
      similar: VANITY_TOP_PRODUCTS.filter((o) => o.slug !== t.slug).map((o) => ({
        name: o.name,
        slug: o.slug,
        image: o.image,
      })),
    };
  });
  const current = variants.find((v) => v.product.slug === top.slug)!;
  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Store", url: "/shop" },
          { name: top.name, url: `/shop/${top.slug}` },
        ]}
      />
      <nav className="bg-white px-6 pt-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 text-xs font-light text-pacific-dark/55">
          <Link href="/" className="hover:text-pacific-dark">
            Home
          </Link>
          <span>/</span>
          {/* Ends at the shelf: the Basins field switches the top in place,
              so naming one here would go stale. The heading names it. */}
          <Link href="/shop" className="text-pacific-dark hover:opacity-70">
            Vanity Tops
          </Link>
        </div>
      </nav>
      <ShopProductClient
        product={current.product}
        options={current.options}
        colours={colours}
        similar={current.similar}
        layers={current.layers}
        variants={variants}
        details={details}
      />
    </>
  );
}
