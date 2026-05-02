import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import {
  collectionBySlugQuery,
  catalogueProductsByCollectionOrTypeQuery,
} from "@/sanity/lib/queries";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import { CatalogueClient } from "@/components/catalogue/CatalogueClient";
import { BreadcrumbList } from "@/components/global/JsonLd";
import type { QuartzHeroVideoProps } from "@/components/catalogue/QuartzHeroVideo";
import { CATEGORY_PAGES } from "../../_lib/category";
import { FAQ } from "@/components/sections/FAQ";
import { getFaqs, type FaqPageKey } from "@/lib/faqs";

/**
 * Maps a "category-level" collection slug to the product `productType`
 * that should bleed into its page from sub-collections.
 *
 * When the user lands on /products/quartz/quartz we want to show not
 * just products in the literal "Quartz" collection but EVERY product
 * with productType="quartz-slab" — including ones filed under sub-
 * collections like Kosmic, Vision, Aurora, etc. Same pattern for
 * Granite, Semi-Precious, etc.
 *
 * Sub-collection slugs that aren't keys here (e.g. "kosmic") fall
 * through to `null` and the page just shows that collection's own
 * products.
 */
const CATEGORY_PRODUCT_TYPE: Record<string, string> = {
  quartz: "quartz-slab",
  granite: "granite-slab",
  "semi-precious": "semi-precious",
  semiprecious: "semi-precious",
  "semi-precious-stones": "semi-precious",
  integra: "quartz-sink",
  sinks: "quartz-sink",
};

/**
 * Per-collection hero overrides. Keyed by the [item] slug (the
 * collection slug, e.g. "chromia"). Each entry is partial — provide
 * only the fields you want to override; the rest fall through to the
 * default Quartz hero in QuartzHeroVideo.
 *
 * The video file lives in /public/videos/<file>.mp4. Use a normalised
 * lowercase-kebab filename so the URL matches across OSes.
 *
 * NOTE: this is the lightest-weight override mechanism. If/when this
 * map grows past a handful of entries, lift these fields onto the
 * Sanity collection schema (heroVideo, heroEyebrow, heroHeadline, …)
 * so editors can manage them in Studio without a code deploy.
 */
const COLLECTION_HERO: Record<string, QuartzHeroVideoProps> = {
  chromia: {
    videoSrc: "/videos/vision-series.mp4",
  },
};

/**
 * Collection detail page — canonical URL is /products/[slug]/[item].
 *
 * Naming note: the segments are `[slug]` and `[item]` only because
 * Next.js requires the first dynamic segment in a folder to share
 * its name with the sibling /products/[slug]/page.tsx (product
 * detail). Semantically:
 *   - `[slug]`  → category (e.g. "quartz", "granite", "semiprecious")
 *   - `[item]`  → collection slug (e.g. "chromia", "kosmic")
 *
 * The [slug] / category segment is for URL aesthetics + SEO; the
 * actual collection lookup uses only [item]. So the URL doesn't have
 * to be perfectly category-accurate to render — convenient for
 * fallback redirects from old /collections/* links.
 *
 * Renders the SAME rich catalogue UI as /products (hero video +
 * sticky FilterBar + filterable SlabGrid) by mapping fetched
 * products through `mapSanityToCatalogue` and handing them off to
 * `CatalogueClient`. Category-aggregation (productType bleed-in)
 * is handled by `catalogueProductsByCollectionOrTypeQuery`.
 */

interface Props {
  params: Promise<{ slug: string; item: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, item } = await params;
  const collection = await client.fetch(collectionBySlugQuery, { slug: item });
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.seoTitle || `${collection.name} — Pacific Surfaces`,
    description: collection.seoDescription || collection.description,
    alternates: { canonical: `/products/${slug}/${item}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug, item } = await params;
  // If the item is a category-level slug (quartz / granite / etc.),
  // pass the matching productType so the query also pulls in every
  // product of that type filed under sub-collections.
  const productType = CATEGORY_PRODUCT_TYPE[item.toLowerCase()] ?? null;

  const [collection, products] = await Promise.all([
    client.fetch(collectionBySlugQuery, { slug: item }),
    client.fetch(catalogueProductsByCollectionOrTypeQuery, {
      slug: item,
      productType,
    }),
  ]);

  if (!collection) notFound();

  const slabs = mapSanityToCatalogue(products);
  // Hero resolution, in priority order:
  //   1. Per-collection override from COLLECTION_HERO (e.g. chromia
  //      gets the Vision Series video).
  //   2. Category-level hero from CATEGORY_PAGES, keyed on the [slug]
  //      segment — so /products/granites/<anything> picks up the
  //      Granite hero video instead of falling through to
  //      CatalogueClient's Quartz default. This was the bug that made
  //      every product page on the site read as quartz-themed.
  //   3. undefined → CatalogueClient renders its built-in Quartz hero.
  const hero =
    COLLECTION_HERO[item.toLowerCase()] ??
    CATEGORY_PAGES[slug.toLowerCase()]?.hero;

  // Sub-collection pages reuse the parent category's FAQ. /products/
  // semi-precious/exotic-collection (etc) inherits the semi-precious
  // FAQ block. Same allowlist as the category landing in
  // ../page.tsx — keep both in sync if you add a category.
  // Editorially excluded: exotic, integra, vanity (no FAQ block on
  // those pages or any of their sub-collections).
  const CATEGORY_FAQ_KEYS = new Set<string>([
    "quartz",
    "granites",
    "semi-precious",
    "centrepiece-couture",
    "natural-stone-finishes",
  ]);
  const slugLower = slug.toLowerCase();
  const faqKey: FaqPageKey | null = CATEGORY_FAQ_KEYS.has(slugLower)
    ? (slugLower as FaqPageKey)
    : null;
  const faqs = faqKey ? await getFaqs(faqKey) : [];

  // Category breadcrumb label — prefer the explicit displayName from
  // CATEGORY_PAGES so /products/granites/* renders "Granites" (plural,
  // matching the URL) rather than the Sanity-name title-cased URL.
  const parentLabel =
    CATEGORY_PAGES[slug.toLowerCase()]?.displayName ??
    slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <>
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: parentLabel, url: `/products/${slug}` },
          { name: collection.name, url: `/products/${slug}/${item}` },
        ]}
      />
      <CatalogueClient slabs={slabs} hero={hero} />
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
