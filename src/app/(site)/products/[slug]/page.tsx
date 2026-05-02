import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload as reactPreload } from "react-dom";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { ProductDetail } from "@/components/sections/ProductDetail";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
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
      "natural-stone-finishes",
    ]);
    const faqKey: FaqPageKey | null = CATEGORY_FAQ_KEYS.has(slug)
      ? (slug as FaqPageKey)
      : null;
    const faqs = faqKey ? await getFaqs(faqKey) : [];
    const breadcrumbLabel = data.config.displayName ?? data.collection.name;
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

  const categoryName = product.collection?.name ?? product.category?.name ?? "Products";
  const categorySlugForCrumb = product.collection?.slug?.current ?? product.category?.slug?.current ?? slug;

  // Material classification for Product schema. Maps the product's
  // category to a generic stone-industry term Google understands. Falls
  // back to the literal category name if we don't have a mapping.
  const materialMap: Record<string, string> = {
    quartz: "Engineered Quartz",
    granites: "Granite",
    granite: "Granite",
    "semi-precious": "Semi-Precious Stone",
    exotic: "Exotic Stone",
    integra: "Engineered Quartz",
    "centrepiece-couture": "Engineered Quartz",
    "natural-stone-finishes": "Natural Stone",
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
