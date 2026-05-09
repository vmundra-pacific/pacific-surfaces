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
   * Optional EXACT Sanity collection slug. When set, the resolver
   * looks the collection up by `slug.current == this` instead of
   * doing the name-prefix match. Use this for categories where the
   * name match would otherwise hit multiple collections — e.g.
   * "vanity*" matches BOTH the parent "Vanity" collection and a
   * sub-collection named "Monolith Quartz Vanity", and the wrong
   * one would win the chronological tiebreak. Setting
   * `collectionSlug: "vanity"` pins the lookup to the correct doc.
   */
  collectionSlug?: string;
  /**
   * Optional display name override — used in the page title and
   * breadcrumb when the Sanity collection's own `name` is the wrong
   * label for the URL category (e.g. URL "/products/granites" plural,
   * Sanity collection "Granite" singular — set displayName "Granites"
   * to keep the visible label consistent with the URL).
   */
  displayName?: string;
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
    // Pin the slug — "quartz*" name match alone would also hit
    // sub-collections like "Monolith Quartz Vanity", and that
    // collection winning the createdAt tiebreak made /products/quartz
    // render with the wrong page title.
    collectionSlug: "quartz",
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
    // productType removed — Semi-Precious is a single Sanity
    // collection, not a multi-collection aggregation like Quartz or
    // Granite. With productType set, the OR logic in the GROQ query
    // pulls in any product tagged with productType="semi-precious"
    // regardless of its collection ref, which let a mis-tagged
    // Vision Series product bleed onto this page. Keeping only the
    // collection match restricts results to the Semi Precious Stones
    // collection (the intended set). With one collection, the
    // FilterBar's `singleCollection` heuristic auto-hides the
    // Collection filter pill and the "By collection" sort option.
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
    // Sanity collection is named "Granite" (singular) but the URL,
    // header nav, and footer all use "Granites" plural. Override the
    // displayName so page title + breadcrumb match the URL.
    displayName: "Granites",
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
  // Vanity is its own top-level category at /products/vanity (not
  // nested under centrepiece-couture). Vanity products are full
  // pieces — SlabCard's PRODUCT_PIECE_URL_PREFIXES catches the URL
  // and flips the cards to View-Product / no-Sample treatment, same
  // as Centrepiece Couture and Integra.
  // posterOnly: no /videos/vanity.mp4 yet — the hero shows just the
  // editorial still (downloaded from the Vanity Sanity collection's
  // image and saved at /public/videos/vanity-poster.jpg). Drop a real
  // clip in later and remove `posterOnly` to switch back to video.
  vanity: {
    match: "vanity",
    // Disambiguates from "Monolith Quartz Vanity" (and any other
    // sub-collection with "vanity" in its name) — the parent
    // collection's slug is exactly "vanity", so pin the lookup.
    collectionSlug: "vanity",
    hero: {
      posterSrc: "/videos/vanity-poster.jpg",
      posterOnly: true,
      eyebrow: "Pacific Surfaces · Vanity",
      headline: "Stone for the bath,",
      headlineItalic: "designed to last.",
      description:
        "Hand-finished vanity tops engineered to anchor the bath — seamless joints, heat- and stain-resistant, designed to read as a single piece.",
    },
  },
  // facades-and-finishes was removed from this map because that
  // URL is now served by a bespoke static route at
  // /products/facades-and-finishes (see ../facades-and-finishes/page.tsx)
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

const collectionBySlugQueryLocal = groq`
  *[_type == "collection" && slug.current == $slug][0] {
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

  // Prefer slug-exact lookup when the config supplies one (it's the
  // unambiguous path). Fall back to the broader name-prefix match
  // for categories that don't pin a slug.
  const collection = config.collectionSlug
    ? await client.fetch(collectionBySlugQueryLocal, {
        slug: config.collectionSlug,
      })
    : await client.fetch(collectionByMatchQuery, {
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
