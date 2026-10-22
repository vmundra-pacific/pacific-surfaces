import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { preload as reactPreload } from "react-dom";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { ProductDetail } from "@/components/sections/ProductDetail";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import {
  LearnAboutCategory,
  type LearnLink,
} from "@/components/sections/LearnAboutCategory";
import { FAQ } from "@/components/sections/FAQ";
import { getFaqs, type FaqPageKey } from "@/lib/faqs";
import { zoomImageUrl } from "@/lib/zoom-image";
import { collectionPath } from "@/lib/collection-route";
import { clipAtWord, plainText, type PortableBlock } from "@/lib/portable-text";
import { BreadcrumbList, ProductSchema } from "@/components/global/JsonLd";
import { formatCollection } from "@/components/catalogue/labels";
import { REFILE } from "@/data/catalogue-refile";
import { isOfferedThickness, normalizeThickness } from "@/data/sanityToSlab";
import {
  CATEGORY_PAGES,
  heroPosterSrc,
  isCategorySlug,
  resolveCategoryPage,
} from "../_lib/category";

/**
 * Single dispatcher route under /products/[slug]:
 *
 *   - If `slug` is a known category (Quartz, Exotic, Granite, etc.
 *     — see CATEGORY_PAGES in ../_lib/category.ts), render the
 *     CatalogueClient scoped to that collection's products with
 *     the configured hero override. This is the new
 *     /products/<category> single-segment URL hierarchy referenced
 *     by the Products dropdown in the site header.
 *
 *   - Otherwise, treat `slug` as a product detail slug and render
 *     <ProductDetail /> as before. Existing product pages continue
 *     to work unchanged at the same URL.
 *
 * The category and product namespaces share the URL space at
 * /products/<slug>; CATEGORY_PAGES wins when both could match. This
 * is fine in practice because category slugs ("quartz", "exotic",
 * "granite", "kosmic", …) are short identifiers chosen to be
 * distinct from product slugs (which are long and descriptive,
 * e.g. "calacatta-couture" or "noir-stellar").
 */

interface Props {
  params: Promise<{ slug: string }>;
}

// Learn-block configuration per category slug. The "About <Cat>"
// section on each category page (between catalogue and FAQ) renders
// these as link cards. Only Quartz carries a lifetime warranty, so
// only that slug has a third Warranty link.
const LEARN_LINKS_BY_CATEGORY: Record<string, LearnLink[]> = {
  quartz: [
    {
      label: "What is Quartz?",
      href: "/learn/what-is-quartz",
      description:
        "Material 101 — engineered quartz composition, manufacturing, performance, and where Pacific quartz lives.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-quartz",
      description:
        "Daily care, what to avoid, spills, and long-term upkeep for Pacific Quartz.",
    },
    {
      label: "Warranty",
      href: "/learn/warranty-quartz",
      description:
        "Lifetime limited warranty on every Pacific Quartz residential installation — what's covered and how to register.",
    },
  ],
  granites: [
    {
      label: "What is Granite?",
      href: "/learn/what-is-granites",
      description:
        "Geological origin, quarrying, finishing, and where Pacific granite shines in residential and commercial projects.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-granites",
      description:
        "Daily care, sealing, heat and impact, and spill response for natural granite.",
    },
  ],
  "semi-precious": [
    {
      label: "What is Semi-Precious Stones?",
      href: "/learn/what-is-semi-precious",
      description:
        "Composition, hand-laid craft, and where Pacific semi-precious surfaces work best.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-semi-precious",
      description:
        "Gentle daily care, what to avoid, and where these surfaces work best.",
    },
  ],
  "facades-and-finishes": [
    {
      label: "What are Beyond Stone?",
      href: "/learn/what-is-facades-and-finishes",
      description:
        "The product range, architectural use, and specification of Pacific large-format facade surfaces.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-facades-and-finishes",
      description:
        "Care for polished, honed, leathered, brushed, and flamed surfaces — plus exterior considerations.",
    },
  ],
  "centrepiece-couture": [
    {
      label: "What is Centrepiece Couture?",
      href: "/learn/what-is-centrepiece-couture",
      description:
        "Pacific's gallery-grade slab line — what makes it distinct and where it lives.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-centrepiece-couture",
      description:
        "Treat the polish carefully, trivets for hot pans, and long-term character.",
    },
  ],
  exotic: [
    {
      label: "What is the Exotic Collection?",
      href: "/learn/what-is-exotic",
      description:
        "Pacific's curated range of dramatic quartz designs — performance, specification, and where it fits.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-exotic",
      description:
        "Standard quartz care, pattern preservation, and replacement.",
    },
  ],
  vanity: [
    {
      label: "What is Pacific Vanity?",
      href: "/learn/what-is-vanity",
      description:
        "Bath-specific design, Integra sink integration, and where Pacific Vanity lives.",
    },
    {
      label: "Maintenance",
      href: "/learn/maintenance-vanity",
      description:
        "Daily care, personal-care product spills, and Integra sink upkeep.",
    },
  ],
};

// Served from the cache and rebuilt at most once a minute, so Sanity
// edits show within 60 s (2026-10-22: with revalidate = 0 every visit
// waited ~1.3 s for a fresh render, failing the phone Core Web Vitals).
export const revalidate = 60;

// Per-request dedupe — generateMetadata and the page body both need
// the same category / product data, which previously meant two
// identical Sanity round-trips per request. React.cache collapses
// them into one fetch each within a single request.
const getCategoryPage = cache((slug: string) => resolveCategoryPage(slug));
const getProduct = cache((slug: string) =>
  client.fetch(productBySlugQuery, { slug })
);

/** The product fields the metadata and the JSON-LD read. */
interface ProductFacts {
  name: string;
  /** Portable Text in Sanity (schemas/product.ts), not a string. */
  description?: string | PortableBlock[] | null;
  productType?: string | null;
  category?: { name?: string; slug?: { current?: string } } | null;
  collection?: { name?: string; slug?: { current?: string } } | null;
}

// Material classification for the Product schema and the metadata
// fallbacks: a generic stone-industry term Google understands. Keyed
// first by the product's category (or collection) slug, then by its
// Sanity productType.
const MATERIAL_BY_SLUG: Record<string, string> = {
  quartz: "Engineered Quartz",
  granites: "Granite",
  granite: "Granite",
  "semi-precious": "Semi-Precious Stones",
  exotic: "Exotic Stone",
  integra: "Engineered Quartz",
  "centrepiece-couture": "Engineered Quartz",
  "facades-and-finishes": "Natural Stone",
};
const MATERIAL_BY_TYPE: Record<string, string> = {
  "quartz-slab": "Engineered Quartz",
  "granite-slab": "Granite",
  "semi-precious": "Semi-Precious Stones",
  "quartz-sink": "Engineered Quartz",
  "granite-finish": "Natural Stone",
};

/**
 * Material and collection label for a product. Products the site
 * re-files (data/catalogue-refile) use the owner's filing, as the
 * catalogue does; the collection goes through formatCollection so the
 * label matches the page ("Vision" reads "Eclipse"). Falls back to the
 * literal category name when no mapping fits.
 */
function productFacts(product: ProductFacts, slug: string) {
  const refile = REFILE[slug];
  const slugKey = (
    product.category?.slug?.current ??
    product.collection?.slug?.current ??
    ""
  ).toLowerCase();
  const material =
    (refile?.productType ? MATERIAL_BY_TYPE[refile.productType] : undefined) ??
    MATERIAL_BY_SLUG[slugKey] ??
    (product.productType ? MATERIAL_BY_TYPE[product.productType] : undefined) ??
    product.category?.name ??
    undefined;
  const collectionName = refile?.collection ?? product.collection?.name;
  const collectionLabel = collectionName
    ? formatCollection(collectionName)
    : undefined;
  return { material, collectionLabel };
}

/** "Absolute Black Granite", unless the name already says the material
 *  ("White Quartz" stays as it is). Reads in the singular: "Blue Agate
 *  Semi-Precious Stone". */
function nameWithMaterial(name: string, material?: string): string {
  const key = material?.split(" ").pop()?.toLowerCase().replace(/s$/, "");
  return material && key && !name.toLowerCase().includes(key)
    ? `${name} ${material.replace(/(stone|surface)s$/i, "$1")}`
    : name;
}

/** Fallback <title> for a product with no seoTitle: name and material,
 *  then the brand while it fits in about 60 characters. */
function productTitle(product: ProductFacts, slug: string): string {
  const { material } = productFacts(product, slug);
  const named = nameWithMaterial(product.name, material);
  const options = [`${named} — Pacific Surfaces`, named];
  return (
    options.find((t) => t.length <= 60) ?? `${product.name} — Pacific Surfaces`
  );
}

/** Fallback meta description for a product with no seoDescription: the
 *  product's own description, else one built from its material and
 *  collection. Never the same boilerplate on every product. */
function productDescription(product: ProductFacts, slug: string): string {
  const own = plainText(product.description);
  if (own) return clipAtWord(own, 155);
  const { material, collectionLabel } = productFacts(product, slug);
  const named = nameWithMaterial(product.name, material?.toLowerCase());
  const from = collectionLabel
    ? `, from the ${collectionLabel} collection`
    : "";
  // "specifications", not "slab format": basins, sinks and vanity
  // pieces use this fallback too, and every product page has the specs
  // strip and both CTAs.
  return `${named} by Pacific Surfaces${from}. See its specifications, then order a sample or find a dealer.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Category branch — short-circuit before hitting product lookup.
  if (isCategorySlug(slug)) {
    const data = await getCategoryPage(slug);
    if (!data) return { title: "Collection Not Found" };
    const { collection, config } = data;
    const label = config.displayName ?? collection.name;
    // A Sanity collection's description is Portable Text: flatten it,
    // or the meta tag would carry block objects.
    const ownDescription = plainText(collection.description);
    return {
      title: collection.seoTitle || `${label} — Pacific Surfaces`,
      description:
        collection.seoDescription ||
        (ownDescription ? clipAtWord(ownDescription, 155) : null) ||
        `Browse the ${label} collection from Pacific Surfaces.`,
      alternates: { canonical: `/products/${slug}` },
    };
  }

  // Product detail branch.
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle || productTitle(product, slug),
    description: product.seoDescription || productDescription(product, slug),
    keywords: product.seoKeywords,
    alternates: { canonical: `/products/${slug}` },
  };
}

export async function generateStaticParams() {
  // Pre-render every product slug AND every category slug at build
  // time. Category slugs are static (defined in code), product slugs
  // come from Sanity.
  const products = await client.fetch(`*[_type == "product"]{ slug }`);
  const productSlugs: { slug: string }[] = products.map(
    (p: { slug: { current: string } }) => ({ slug: p.slug.current })
  );
  const categorySlugs = Object.keys(CATEGORY_PAGES).map((slug) => ({ slug }));
  return [...categorySlugs, ...productSlugs];
}

export default async function ProductOrCategoryPage({ params }: Props) {
  const { slug } = await params;

  // Category branch.
  if (isCategorySlug(slug)) {
    const data = await getCategoryPage(slug);
    if (!data) notFound();

    // LCP: the hero's still — the poster of a video hero, or the
    // image of a posterOnly one (Ecosurfaces / Vanity) — is the first
    // large paint, so emit a high-priority <link rel="preload"
    // as="image"> for it during SSR, same pattern as the PDP slab
    // preload below. Heroes with no still (posterSrc "") get none.
    const heroPoster = heroPosterSrc(data.config.hero);
    if (heroPoster) {
      reactPreload(heroPoster, { as: "image", fetchPriority: "high" });
    }
    // Map known category slugs to FAQ page keys. If a category
    // doesn't have FAQs yet we just don't render the section. We
    // use a Set<string> for the lookup so the typecheck doesn't
    // demand the array's element type matches the wider FaqPageKey
    // union (which includes "sustainability"/"about" served by
    // separate routes).
    // Categories that show an FAQ block under the catalogue. Keep
    // identical to the same set in ../[item]/page.tsx so category and
    // sub-collection pages stay consistent.
    // Removed by editorial request: exotic, integra, vanity (FAQ
    // doesn't add value on those pages — they're product-piece /
    // statement collections that don't lend themselves to a Q&A
    // format). Their FAQ_DEFAULTS data still exists in src/lib/faqs.ts
    // in case it's wanted back; this allowlist is the gate.
    const CATEGORY_FAQ_KEYS = new Set<string>([
      "quartz",
      "granites",
      "semi-precious",
      "centrepiece-couture",
      "facades-and-finishes",
    ]);
    const faqKey: FaqPageKey | null = CATEGORY_FAQ_KEYS.has(slug)
      ? (slug as FaqPageKey)
      : null;
    const faqs = faqKey ? await getFaqs(faqKey) : [];
    const breadcrumbLabel = data.config.displayName ?? data.collection.name;
    const learnLinks = LEARN_LINKS_BY_CATEGORY[slug];
    return (
      <>
        <BreadcrumbList
          items={[
            { name: "Home", url: "/" },
            { name: "Products", url: "/products" },
            { name: breadcrumbLabel, url: `/products/${slug}` },
          ]}
        />
        <CatalogueClient slabs={data.slabs} hero={data.config.hero} />
        {learnLinks && learnLinks.length > 0 && (
          <LearnAboutCategory
            categoryName={breadcrumbLabel}
            links={learnLinks}
          />
        )}
        {faqs.length > 0 && (
          <FAQ
            questions={faqs}
            theme="dark"
            heading="Frequently Asked Questions"
          />
        )}
      </>
    );
  }

  // Product detail branch — original logic unchanged.
  const product = await getProduct(slug);
  if (!product) notFound();

  // INITIAL-LOAD ZOOM: emit a high-priority <link rel="preload"
  // as="image"> for the slab image during SSR. The slab is the
  // image the page lands on, and it's the only one the magnifier
  // pans, so we want the browser fetching it the instant the HTML
  // hits — in parallel with the JS bundle. By the time React
  // hydrates and the user can hover, the slab is in cache.
  // Other images (close-ups, room scenes) lazy-load on demand.
  if (product.mainImage) {
    reactPreload(zoomImageUrl(product.mainImage), {
      as: "image",
      fetchPriority: "high",
    });
  }

  const { material, collectionLabel } = productFacts(product, slug);

  // BreadcrumbList mirrors the visible breadcrumb in ProductDetail: the
  // collection crumb only when the product has a collection, labelled
  // with formatCollection and linked through collectionPath (collection
  // slugs are not routes: the quartz series live under
  // /products/quartz/<series>). A collection with no page of its own
  // maps to /products, already crumb 2, so it is left out here.
  const collectionCrumbPath = product.collection?.slug?.current
    ? collectionPath(product.collection.slug.current)
    : null;
  const collectionCrumb =
    product.collection?.name &&
    collectionCrumbPath &&
    collectionCrumbPath !== "/products"
      ? {
          name: formatCollection(product.collection.name),
          url: collectionCrumbPath,
        }
      : null;

  // Description as text: Sanity's is Portable Text, which JSON-LD can't
  // carry. An empty seoDescription falls through.
  const ownDescription = plainText(product.description);
  const schemaDescription =
    product.seoDescription?.trim() ||
    (ownDescription ? clipAtWord(ownDescription, 500) : null) ||
    `${product.name} from Pacific Surfaces — premium ${material ?? "stone"} surface.`;

  // Spec lines from what Sanity holds and the page shows (Format,
  // Thicknesses, Finishes Available). Never ProductDetail's display
  // fallbacks for an empty field.
  const thicknesses = [
    ...new Set(
      ((product.thickness ?? []) as string[])
        .map(normalizeThickness)
        .filter(isOfferedThickness)
    ),
  ];
  const specs = [
    ...(product.size?.trim()
      ? [{ name: "Format", value: product.size.trim() }]
      : []),
    ...thicknesses.map((value) => ({ name: "Thickness", value })),
    ...((product.finishes ?? []) as string[]).map((value) => ({
      name: "Finish",
      value,
    })),
  ];

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          ...(collectionCrumb ? [collectionCrumb] : []),
          { name: product.name, url: `/products/${slug}` },
        ]}
      />
      <ProductSchema
        name={product.name}
        url={`/products/${slug}`}
        image={product.mainImage}
        additionalImages={product.gallery}
        description={schemaDescription}
        material={material}
        category={collectionLabel ?? product.category?.name}
        sku={slug}
        properties={specs}
      />
      <ProductDetail product={product} />
    </>
  );
}
