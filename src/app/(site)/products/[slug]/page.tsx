import type { Metadata } from "next";
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
import { BreadcrumbList, ProductSchema } from "@/components/global/JsonLd";
import {
  CATEGORY_PAGES,
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
      label: "What are Beyond Finish?",
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

// Bypass Next's data cache so ribbon-driven category pages
// (Ecosurfaces) reflect Sanity edits on the next request rather than
// only on a fresh deploy. Other category pages benefit too — toggling
// a product's collection or visibility now propagates immediately.
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Category branch — short-circuit before hitting product lookup.
  if (isCategorySlug(slug)) {
    const data = await resolveCategoryPage(slug);
    if (!data) return { title: "Collection Not Found" };
    const { collection, config } = data;
    const label = config.displayName ?? collection.name;
    return {
      title: collection.seoTitle || `${label} — Pacific Surfaces`,
      description:
        collection.seoDescription ||
        collection.description ||
        `Browse the ${label} collection from Pacific Surfaces.`,
      alternates: { canonical: `/products/${slug}` },
    };
  }

  // Product detail branch.
  const product = await client.fetch(productBySlugQuery, { slug });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle || `${product.name} — Pacific Surfaces`,
    description:
      product.seoDescription ||
      `Discover ${product.name} from Pacific Surfaces. Premium quartz and granite surfaces for modern spaces.`,
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
    const data = await resolveCategoryPage(slug);
    if (!data) notFound();
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
  const product = await client.fetch(productBySlugQuery, { slug });
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

  const categoryName =
    product.collection?.name ?? product.category?.name ?? "Products";
  const categorySlugForCrumb =
    product.collection?.slug?.current ??
    product.category?.slug?.current ??
    slug;

  // Material classification for Product schema. Maps the product's
  // category to a generic stone-industry term Google understands. Falls
  // back to the literal category name if we don't have a mapping.
  const materialMap: Record<string, string> = {
    quartz: "Engineered Quartz",
    granites: "Granite",
    granite: "Granite",
    "semi-precious": "Semi-Precious Stones",
    exotic: "Exotic Stone",
    integra: "Engineered Quartz",
    "centrepiece-couture": "Engineered Quartz",
    "facades-and-finishes": "Natural Stone",
  };
  const categorySlugLower = (
    product.category?.slug?.current ??
    product.collection?.slug?.current ??
    ""
  ).toLowerCase();
  const material =
    materialMap[categorySlugLower] ?? product.category?.name ?? undefined;

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: categoryName, url: `/products/${categorySlugForCrumb}` },
          { name: product.name, url: `/products/${slug}` },
        ]}
      />
      <ProductSchema
        name={product.name}
        url={`/products/${slug}`}
        image={product.mainImage}
        additionalImages={product.gallery}
        description={
          product.seoDescription ??
          product.description ??
          `${product.name} from Pacific Surfaces — premium ${material ?? "stone"} surface.`
        }
        material={material}
        category={categoryName}
        sku={slug}
      />
      <ProductDetail product={product} />
    </>
  );
}
