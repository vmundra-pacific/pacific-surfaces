import "server-only";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";
import type { QuartzHeroVideoProps } from "@/components/catalogue/QuartzHeroVideo";
import type { Slab } from "@/data/slabs";

/**
 * One config entry per "collection landing page" reachable from the
 * Products dropdown. The map key is the URL slug under /products
 * (e.g. /products/quartz uses the entry under `quartz`). At resolve
 * time we:
 *   1. Look up the matching Sanity collection by case-insensitive
 *      name prefix (so editors can rename slugs without breaking
 *      things, and we don't need to know exact slugs ahead of time).
 *   2. Pull every product whose `collection._ref` points at that
 *      collection, plus — when `productType` is set — every product
 *      tagged with that productType regardless of which sub-
 *      collection it sits under. This is the same bleed-in semantics
 *      the existing /products/[slug]/[item] route uses.
 *   3. Render via CatalogueClient with the configured hero override.
 *
 * The shared helper below (`resolveCategoryPage`) takes care of all
 * the data fetching; the static route just imports the config and
 * passes the slabs + hero to <CatalogueClient />.
 */
export interface CategoryConfig {
  /**
   * Case-insensitive prefix matched against the Sanity collection's
   * NAME field. Lets us tolerate slug variations
   * ("kosmic" vs "kosmic-collection") and editor renames.
   */
  match: string;
  /**
   * Optional product type to also pull in regardless of which
   * sub-collection a product sits under. Used by category-level
   * landings like Quartz / Granite / Semi-Precious where we want
   * the page to aggregate every product of that type.
   */
  productType?: string;
  /**
   * Optional hero override forwarded to CatalogueClient. If
   * undefined the default Quartz hero treatment renders — good
   * enough as a starting point for categories that don't yet have
   * tailored video / copy. Override per-category as videos get made.
   */
  hero?: QuartzHeroVideoProps;
}

export const CATEGORY_PAGES: Record<string, CategoryConfig> = {
  quartz: {
    match: "quartz",
    productType: "quartz-slab",
    hero: {
      videoSrc: "/videos/quartz-hero.mp4",
      eyebrow: "Pacific Surfaces · Quartz",
      headline: "Engineered stone,",
      headlineItalic: "crafted for the everyday.",
      description:
        "Premium quartz slabs designed for kitchens, vanities, and feature walls — beautiful under any light, durable through any season.",
    },
  },
  exotic: {
    match: "exotic",
    hero: {
      videoSrc: "/videos/exotic.mp4",
      eyebrow: "Pacific Surfaces · Exotic",
      headline: "Rare patterns,",
      headlineItalic: "bold by nature.",
      description:
        "Exotic slabs hand-selected for striking veining and singular character — designed for spaces that deserve the unexpected.",
    },
  },
  "semi-precious": {
    match: "semi",
    productType: "semi-precious",
    hero: {
      videoSrc: "/videos/semi-precious.mp4",
      eyebrow: "Pacific Surfaces · Semi-Precious",
      headline: "Nature's rarest",
      headlineItalic: "treasures, refined.",
      description:
        "Hand-selected semi-precious stones — agate, amethyst, malachite — composed into surfaces of singular beauty.",
    },
  },
  // Each non-Quartz category gets its OWN unique videoSrc path —
  // even if the file doesn't exist yet — so categories never silently
  // fall back to /videos/quartz-hero.mp4 (the QuartzHeroVideo default).
  // Drop a real clip into /public/videos/<filename>.mp4 to wire each
  // category up; until then the section renders the scrim + copy
  // over an empty <video> element.
  //
  // Vision is intentionally NOT a CATEGORY_PAGES entry — the Vision
  // landing is the existing Chromia page at /products/quartz/chromia,
  // which already wires the Vision Series video via COLLECTION_HERO
  // in ../[slug]/[item]/page.tsx. The dropdown in Header.tsx links
  // there directly. Kosmic / Nebula were here previously but were
  // removed when the dropdown was simplified to a single "Vision"
  // entry.
  "centrepiece-couture": {
    match: "centrepiece",
    hero: {
      videoSrc: "/videos/centrepiece-couture.mp4",
      eyebrow: "Pacific Surfaces · Centrepiece Couture",
      headline: "The slab as",
      headlineItalic: "a statement.",
      description:
        "Centrepiece Couture — singular, gallery-grade slabs built to anchor a room.",
    },
  },
  integra: {
    match: "integra",
    productType: "quartz-sink",
    hero: {
      videoSrc: "/videos/integra.mp4",
      eyebrow: "Pacific Surfaces · Integra",
      headline: "Sinks that disappear",
      headlineItalic: "into the surface.",
      description:
        "Integra — quartz sinks fabricated to fuse seamlessly with your countertop. One material, no joint, no compromise.",
    },
  },
  "fab-creations": {
    match: "fab",
    hero: {
      videoSrc: "/videos/fab-creations.mp4",
      eyebrow: "Pacific Surfaces · Fab Creations",
      headline: "Patterned by hand,",
      headlineItalic: "produced at scale.",
      description:
        "Fab Creations — bespoke surface treatments for projects that don't settle for catalogue.",
    },
  },
  ecosurfaces: {
    match: "eco",
    hero: {
      videoSrc: "/videos/ecosurfaces.mp4",
      eyebrow: "Pacific Surfaces · Eco",
      headline: "Premium quality,",
      headlineItalic: "lower footprint.",
      description:
        "Ecosurfaces — engineered stone with a fraction of the embodied carbon, no compromise on durability or beauty.",
    },
  },
  granites: {
    match: "granite",
    productType: "granite-slab",
    hero: {
      videoSrc: "/videos/granites.mp4",
      eyebrow: "Pacific Surfaces · Granite",
      headline: "Quarry to kitchen,",
      headlineItalic: "uncompromised.",
      description:
        "Natural granite slabs sourced and finished in-house. Heat, scratch, and stain resistant by nature.",
    },
  },
  // natural-stone-finishes was removed from this map because that
  // URL is now served by a bespoke static route at
  // /products/natural-stone-finishes (see ../natural-stone-finishes/page.tsx)
  // with its own hero / intro / lightbox grid layout. Static routes
  // win over the [slug] dispatcher in Next.js, so leaving this map
  // empty for that slug is the right thing.
};

const collectionByMatchQuery = groq`
  *[_type == "collection" && lower(name) match $pattern] | order(_createdAt asc)[0] {
    _id,
    name,
    description,
    seoTitle,
    seoDescription
  }
`;

const productsByCollectionOrTypeQuery = groq`
  *[_type == "product" && (
    collection._ref == $cid
    || ($pt != null && productType == $pt)
  )] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "dominantColor": mainImage.asset->metadata.palette.dominant.background,
    "collectionName": collection->name,
    finishes,
    thickness,
    ribbons,
    manualHues,
    manualPattern,
    visible
  }
`;

interface ResolvedCategoryPage {
  config: CategoryConfig;
  collection: {
    _id: string;
    name: string;
    description?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
  };
  slabs: Slab[];
}

/**
 * Resolve a category page by URL slug. Returns null when the slug
 * isn't a known category (so the caller can fall through to product
 * detail) or when no matching collection exists in Sanity (caller
 * should 404 in that case).
 */
export async function resolveCategoryPage(
  slug: string
): Promise<ResolvedCategoryPage | null> {
  const config = CATEGORY_PAGES[slug];
  if (!config) return null;

  const collection = await client.fetch(collectionByMatchQuery, {
    pattern: `${config.match.toLowerCase()}*`,
  });
  if (!collection) return null;

  const products = await client.fetch(productsByCollectionOrTypeQuery, {
    cid: collection._id,
    pt: config.productType ?? null,
  });

  return {
    config,
    collection,
    slabs: mapSanityToCatalogue(products),
  };
}

export function isCategorySlug(slug: string): boolean {
  return slug in CATEGORY_PAGES;
}
