import "server-only";
import { createClient } from "@sanity/client";
import { unstable_cache } from "next/cache";
import { groq } from "next-sanity";
import { client, freshClient, rawClient } from "@/sanity/lib/client";
import {
  allBlogPostsQuery,
  allResourcesQuery,
  applicationCardsQuery,
  blogPostBySlugQuery,
  careersPageQuery,
  catalogueProductsByCollectionOrTypeQuery,
  catalogueProductsQuery,
  collectionBySlugQuery,
  facadesAndFinishesPageQuery,
  facadesAndFinishesProductsQuery,
  homepageCollectionsQuery,
  inspirationImagesQuery,
  jobOpeningsQuery,
  productBySlugQuery,
  productsByIdsQuery,
  recentBlogPostsQuery,
  signatureProjectsQuery,
  spacePageBySlugQuery,
} from "@/sanity/lib/queries";
import {
  CMS_CACHE_TAG,
  type AnswerKind,
  contentSource,
  contentSourceFor,
  type ContentType,
  readCmsAnswer,
  readCmsPart,
  type ReadQuery,
} from "./client";

export { throwIfCmsFailure } from "./client";

/* eslint-disable @typescript-eslint/no-explicit-any --
   Every fetcher returns what its GROQ query returned, typed by the
   caller through the type argument, as `client.fetch` did. */

/**
 * Every read the website makes from the content store, one fetcher per
 * read. A page or route calls a fetcher here and never the content
 * client itself. Each fetcher does what its call site did before:
 * the same query, the same parameters, the same client, the same
 * answer, and it sets no fetch or cache option, so the page's own
 * `revalidate` still decides how long an answer lives.
 *
 * Fetchers throw when the read fails; the call site keeps whatever
 * catch it had.
 *
 * Lists are always arrays and are passed as given.
 *
 * The source: with CONTENT_SOURCE unset (or "sanity") every
 * fetcher reads Sanity exactly as before. A kind of content can read the
 * other store on its own with CONTENT_SOURCE_<TYPE> (`./content-source.ts`:
 * products, collections, journal, home, resources, careers, Beyond Stone,
 * space pages, FAQ, search, sitemap); unset follows CONTENT_SOURCE. With
 * CONTENT_SOURCE=cms each
 * one reads the matching CMS read answer (`./client.ts`), which gives
 * the same shape the Sanity query gave. A failed or unusable CMS answer
 * throws. Three reads also throw when empty, since a working CMS never
 * gives them empty: the whole catalogue (which also gives the product
 * slugs), the home page's collection cards, and the sitemap's products.
 * The sitemap's products are on that list by choice: an empty list
 * there would drop every product page from the sitemap for an hour.
 * Every other read may be legitimately empty.
 */

/* ------------------------------------------------------------------ */
/* Queries that used to sit inside a page or route                     */
/* ------------------------------------------------------------------ */

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

// $cids is always an array — the single-collection case just passes a
// one-element array — so this one query serves both plain categories
// and the multi-collection (additionalCollections) ones like Fab
// Creations without needing two near-identical GROQ strings.
const productsByCollectionsOrTypeQuery = groq`
  *[_type == "product" && (
    collection._ref in $cids
    || ($pt != null && productType == $pt)
    || slug.current in $refiled
  )] | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "dominantColor": mainImage.asset->metadata.palette.dominant.background,
    "collectionName": collection->name,
    productType,
    finishes,
    thickness,
    ribbons,
    manualHues,
    manualPattern,
    visible
  }
`;

// Ribbon-driven product query. Used by cross-collection categories
// like Ecosurfaces. We pull every product that has at least one
// ribbon entry, then narrow to the requested ribbon label in JS —
// GROQ's `match` is token-based so "eco*surface" doesn't catch the
// two-token string "eco surface". JS-side comparison sidesteps that
// and lets us be case- and whitespace-insensitive.
const productsWithAnyRibbonQuery = groq`
  *[_type == "product" && defined(ribbons) && count(ribbons) > 0]
    | order(name asc) {
    _id,
    name,
    slug,
    "mainImage": mainImage.asset->url,
    "gallery": gallery[].asset->url,
    "dominantColor": mainImage.asset->metadata.palette.dominant.background,
    "collectionName": collection->name,
    productType,
    finishes,
    thickness,
    ribbons,
    manualHues,
    manualPattern,
    visible
  }
`;

/** Slugs of every product (page generation). */
const productSlugsQuery = `*[_type == "product"]{ slug }`;

/** Name, slug and photo of the products named by slug. */
const productTilesQuery = `*[_type == "product" && slug.current in $slugs && visible != false]{
  name, "slug": slug.current, "image": mainImage.asset->url
}`;

/** Slugs of every journal post. */
const blogPostSlugsQuery = `*[_type == "blogPost" && defined(slug.current)].slug.current`;

/** The collection slug the Beyond Stone page's own document names. */
const beyondStoneCollectionSlugQuery = `*[_type == "facadesAndFinishesPage"][0].collectionSlug`;

const faqByKeyQuery = groq`*[_type == "faqPage" && pageKey == $key][0]{
  questions[]{ q, a }
}`;

const searchOverlayQuery = groq`
      *[
        !(_id in path("drafts.**")) && (
          // Same gate as the product page (productBySlugQuery): hidden
          // products (visible == false) and slugless ones have no page,
          // so listing them sent searchers to a 404.
          (_type == "product" && visible != false && defined(slug.current) && (
            (name + " " + coalesce(collection->name, "") + " " + coalesce(category->name, "")) match $terms
          )) ||
          (_type == "blogPost" && title match $terms)
        )
      ] | order(coalesce(name, title) asc) [0...40] {
        _type,
        _id,
        "name": coalesce(name, title),
        slug,
        "mainImage": mainImage.asset->url,
        "collectionName": collection->name,
        productType
      }
    `;

const searchPageQuery = groq`
  *[_type == "product" && !(_id in path("drafts.**")) && visible != false && defined(slug.current) && (
    name match $term + "*" ||
    pt::text(description) match $term + "*" ||
    category->name match $term + "*"
  )] | order(name asc)[0...60] {
    _id,
    name,
    "slug": slug.current,
    "categorySlug": category->slug.current,
    "categoryName": category->name,
    "mainImage": mainImage.asset->url,
    productType,
    "collectionName": collection->name,
  }
`;

const sitemapProductsQuery = groq`*[_type == "product" && defined(slug.current) && visible != false]{
        "slug": slug.current, "updatedAt": _updatedAt
      }`;

const sitemapPostsQuery = groq`*[_type == "blogPost" && defined(slug.current)]{
        "slug": slug.current, "updatedAt": _updatedAt
      }`;

/** The space pages still built from their Sanity space page. */
const SPACES = ["architecture", "commercial", "outdoor"];

/** The newest `_updatedAt` among the documents a filter matches. */
const newest = (filter: string) =>
  `*[${filter}] | order(_updatedAt desc)[0]._updatedAt`;

const contentDatesQuery = groq`{
  "home": ${newest('_type in ["collection", "signatureProject", "applicationCard", "inspirationImage"]')},
  "catalogue": ${newest('_type in ["product", "collection"]')},
  "facades": ${newest('_type in ["facadesAndFinishesPage", "product", "collection"]')},
  "blog": ${newest('_type == "blogPost"')},
  "resources": ${newest('_type == "resource"')},
  "sustainability": ${newest('_type == "sustainabilityPage"')},
  "careers": ${newest('_type in ["careersPage", "jobOpening"]')},
  ${SPACES.map((s) => `"space:${s}": ${newest(`_type == "spacePage" && slug == "${s}"`)}`).join(",\n  ")}
}`;

const jobApplyQuery = `*[_type == "jobOpening" && title == $title][0] { applyEmail, requiresPortfolio }`;

/* ------------------------------------------------------------------ */
/* The CMS side                                                        */
/* ------------------------------------------------------------------ */

const fromCms = (type: ContentType): boolean =>
  contentSourceFor(type) === "cms";

/** The catalogue view of the products answer. Never empty. */
const CATALOGUE = { view: "catalogue" } as const;

const cmsList = <T>(answer: string, query: ReadQuery = {}): Promise<T> =>
  readCmsAnswer<T>(answer, query, { expect: "list" });

const cmsObjectOrNull = <T>(answer: string, query: ReadQuery): Promise<T> =>
  readCmsAnswer<T>(answer, query, { expect: "objectOrNull" });

const cmsPart = <T>(
  answer: string,
  query: ReadQuery,
  part: string,
  expect: AnswerKind
): Promise<T> => readCmsPart<T>(answer, query, part, { expect });

/** A list parameter as the per-request cache keys it: trimmed, unique, sorted. */
const normalisedList = (items: readonly string[]): string[] =>
  [...new Set(items.map((item) => item.trim()).filter(Boolean))].sort();

const perRequestReads = new Map<
  string,
  (query: ReadQuery) => Promise<unknown>
>();

/**
 * The three reads made on every visitor request (favourites, the search
 * box, the search page), kept an hour per parameter set and tagged
 * `cms`, so the revalidate route can clear them. Only with
 * CONTENT_SOURCE=cms; made on first use, so the edge routes never touch
 * it. The query passed in is already normalised: it is both the cache
 * key and what is sent.
 */
function cachedPerRequest<T>(
  answer: string,
  view: string,
  query: ReadQuery
): Promise<T> {
  const name = `${answer}:${view}`;
  let read = perRequestReads.get(name);
  if (!read) {
    read = unstable_cache(
      (normalised: ReadQuery) => cmsList<unknown>(answer, normalised),
      ["cms-read", answer, view],
      { revalidate: 3600, tags: [CMS_CACHE_TAG] }
    );
    perRequestReads.set(name, read);
  }
  return read(query) as Promise<T>;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/** products, view "catalogue": every product, for the catalogue, shop, cart and the like. */
export const productsCatalogue = <T = any>(): Promise<T> =>
  fromCms("products")
    ? readCmsAnswer<T>("products", CATALOGUE, {
        expect: "list",
        neverEmpty: true,
      })
    : client.fetch<T>(catalogueProductsQuery);

/** products, view "ids": the products with the given ids. Cached per request with the CMS. */
export const productsByIds = <T = any>(ids: string[]): Promise<T> =>
  fromCms("products")
    ? cachedPerRequest<T>("products", "ids", {
        view: "ids",
        ids: normalisedList(ids),
      })
    : client.fetch<T>(productsByIdsQuery, { ids });

/** products, view "collectionOrType": a collection page's products. */
export const productsByCollectionOrType = <T = any>(params: {
  slug: string;
  productType: string | null;
}): Promise<T> =>
  fromCms("products")
    ? cmsList<T>("products", {
        view: "collectionOrType",
        slug: params.slug,
        productType: params.productType,
      })
    : client.fetch<T>(catalogueProductsByCollectionOrTypeQuery, params);

/** products, view "category": the products of one or more collections or a type. */
export const productsForCategory = <T = any>(params: {
  cids: string[];
  pt: string | null;
  refiled: string[];
}): Promise<T> =>
  fromCms("products")
    ? cmsList<T>("products", {
        view: "category",
        cids: params.cids,
        pt: params.pt,
        refiled: params.refiled,
      })
    : client.fetch<T>(productsByCollectionsOrTypeQuery, params);

/** products, view "category" with ribbons "any": every product with a ribbon. Read past the cache. */
export const productsWithAnyRibbon = <T = any>(): Promise<T> =>
  fromCms("products")
    ? cmsList<T>("products", { view: "category", ribbons: "any" })
    : freshClient.fetch<T>(productsWithAnyRibbonQuery);

/** products, slugs only: for page generation. From the CMS: the catalogue, each row cut to its slug. */
export const productSlugs = <T = any>(): Promise<T> =>
  fromCms("products")
    ? readCmsAnswer<{ slug: unknown }[]>("products", CATALOGUE, {
        expect: "list",
        neverEmpty: true,
      }).then((rows) => rows.map((row) => ({ slug: row.slug })) as T)
    : client.fetch<T>(productSlugsQuery);

/** product: one product with its related cards, or null. */
export const product = <T = any>(slug: string): Promise<T> =>
  fromCms("products")
    ? cmsObjectOrNull<T>("product", { slug })
    : client.fetch<T>(productBySlugQuery, { slug });

/** product, for the share image that runs on the edge (no URL rewriting). */
export const productForShareImage = <T = any>(slug: string): Promise<T> =>
  fromCms("products")
    ? cmsObjectOrNull<T>("product", { slug })
    : rawClient.fetch<T>(productBySlugQuery, { slug });

/** productTiles: name, slug and photo of the products named by slug. */
export const productTiles = <T = any>(slugs: string[]): Promise<T> =>
  fromCms("products")
    ? cmsList<T>("product-tiles", { slugs })
    : client.fetch<T>(productTilesQuery, { slugs });

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

/** homepageCollections: the collection cards of the home page. Never empty. */
export const homepageCollections = <T = any>(params: {
  quartzCollections: string[];
  indiaQuartz: string[];
}): Promise<T> =>
  fromCms("collections")
    ? readCmsAnswer<T>(
        "homepage-collections",
        {
          quartzCollections: params.quartzCollections,
          indiaQuartz: params.indiaQuartz,
        },
        { expect: "list", neverEmpty: true }
      )
    : client.fetch<T>(homepageCollectionsQuery, params);

/** collection, full: one collection by slug. */
export const collection = <T = any>(slug: string): Promise<T> =>
  fromCms("collections")
    ? cmsObjectOrNull<T>("collection", { view: "bySlug", slug })
    : client.fetch<T>(collectionBySlugQuery, { slug });

/** collection, short: one collection by slug, fewer fields. */
export const collectionShort = <T = any>(slug: string): Promise<T> =>
  fromCms("collections")
    ? cmsObjectOrNull<T>("collection", { view: "bySlugShort", slug })
    : client.fetch<T>(collectionBySlugQueryLocal, { slug });

/** collection, by name match: the oldest collection whose lower-case name matches the pattern. */
export const collectionByMatch = <T = any>(pattern: string): Promise<T> =>
  fromCms("collections")
    ? cmsObjectOrNull<T>("collection", { view: "byMatch", pattern })
    : client.fetch<T>(collectionByMatchQuery, { pattern });

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

/** blogPosts, view "all": every post, newest first. */
export const blogPostsAll = <T = any>(): Promise<T> =>
  fromCms("journal")
    ? cmsList<T>("blog-posts", { view: "all" })
    : client.fetch<T>(allBlogPostsQuery);

/** blogPosts, view "recent": the three newest posts. */
export const blogPostsRecent = <T = any>(): Promise<T> =>
  fromCms("journal")
    ? cmsList<T>("blog-posts", { view: "recent" })
    : client.fetch<T>(recentBlogPostsQuery);

/** blogPosts, view "slugs": every post's slug. */
export const blogPostSlugs = <T = any>(): Promise<T> =>
  fromCms("journal")
    ? cmsList<T>("blog-posts", { view: "slugs" })
    : client.fetch<T>(blogPostSlugsQuery);

/** blogPost: one post by slug, or null. */
export const blogPost = <T = any>(slug: string): Promise<T> =>
  fromCms("journal")
    ? cmsObjectOrNull<T>("blog-post", { slug })
    : client.fetch<T>(blogPostBySlugQuery, { slug });

/** blogPost, for the share image that runs on the edge (no URL rewriting). */
export const blogPostForShareImage = <T = any>(slug: string): Promise<T> =>
  fromCms("journal")
    ? cmsObjectOrNull<T>("blog-post", { slug })
    : rawClient.fetch<T>(blogPostBySlugQuery, { slug });

/* ------------------------------------------------------------------ */
/* Home page                                                           */
/* ------------------------------------------------------------------ */

/** homepage, signatureProjects. */
export const homepageSignatureProjects = <T = any>(): Promise<T> =>
  fromCms("home")
    ? cmsPart<T>("homepage", {}, "signatureProjects", "list")
    : client.fetch<T>(signatureProjectsQuery);

/** homepage, applicationCards. */
export const homepageApplicationCards = <T = any>(): Promise<T> =>
  fromCms("home")
    ? cmsPart<T>("homepage", {}, "applicationCards", "list")
    : client.fetch<T>(applicationCardsQuery);

/** homepage, inspirationImages. */
export const homepageInspirationImages = <T = any>(): Promise<T> =>
  fromCms("home")
    ? cmsPart<T>("homepage", {}, "inspirationImages", "list")
    : client.fetch<T>(inspirationImagesQuery);

/* ------------------------------------------------------------------ */
/* Resources, careers, Beyond Stone, space pages, FAQ                  */
/* ------------------------------------------------------------------ */

/** resources: the downloads list. Read past the cache. */
export const resources = <T = any>(): Promise<T> =>
  fromCms("resources")
    ? cmsList<T>("resources")
    : freshClient.fetch<T>(allResourcesQuery);

/** careers, page: the careers page text. */
export const careersPage = <T = any>(): Promise<T> =>
  fromCms("careers")
    ? cmsPart<T>("careers", {}, "page", "objectOrNull")
    : client.fetch<T>(careersPageQuery);

/** careers, jobs: the visible job openings. */
export const careersJobs = <T = any>(): Promise<T> =>
  fromCms("careers")
    ? cmsPart<T>("careers", {}, "jobs", "list")
    : client.fetch<T>(jobOpeningsQuery);

/** beyondStone, page: the Beyond Stone page text. */
export const beyondStonePage = <T = any>(): Promise<T> =>
  fromCms("beyondStone")
    ? cmsPart<T>("beyond-stone", {}, "page", "objectOrNull")
    : client.fetch<T>(facadesAndFinishesPageQuery);

/** beyondStone, collectionSlug: the collection the page names, if any. */
export const beyondStoneCollectionSlug = <T = any>(): Promise<T> =>
  fromCms("beyondStone")
    ? cmsPart<T>("beyond-stone", {}, "collectionSlug", "textOrNull")
    : client.fetch<T>(beyondStoneCollectionSlugQuery);

/** beyondStone, products: the products of that collection. */
export const beyondStoneProducts = <T = any>(slug: string): Promise<T> =>
  fromCms("beyondStone")
    ? cmsPart<T>("beyond-stone", { slug }, "products", "list")
    : client.fetch<T>(facadesAndFinishesProductsQuery, { slug });

/** spacePage: the four feature images of a space page. Read past the cache. */
export const spacePage = <T = any>(slug: string): Promise<T> =>
  fromCms("spacePages")
    ? cmsObjectOrNull<T>("space-page", { slug })
    : freshClient.fetch<T>(spacePageBySlugQuery, { slug });

/** faq: the questions of one FAQ page. */
export const faq = <T = any>(key: string): Promise<T> =>
  fromCms("faq")
    ? cmsObjectOrNull<T>("faq", { key })
    : client.fetch<T>(faqByKeyQuery, { key });

/* ------------------------------------------------------------------ */
/* Search and sitemap                                                  */
/* ------------------------------------------------------------------ */

/** search, view "overlay": up to 40 hits for the search box. Cached per request with the CMS. */
export const searchOverlay = <T = any>(terms: string[]): Promise<T> =>
  fromCms("search")
    ? cachedPerRequest<T>("search", "overlay", {
        view: "overlay",
        terms: normalisedList(terms),
      })
    : client.fetch<T>(searchOverlayQuery, { terms });

/** search, view "page": up to 60 products for the search page. Cached per request with the CMS. */
export const searchPage = <T = any>(term: string): Promise<T> =>
  fromCms("search")
    ? cachedPerRequest<T>("search", "page", { view: "page", term: term.trim() })
    : client.fetch<T>(searchPageQuery, { term });

/** sitemap, products. Never empty. */
export const sitemapProducts = <T = any>(): Promise<T> =>
  fromCms("sitemap")
    ? readCmsPart<T>("sitemap", {}, "products", {
        expect: "list",
        neverEmpty: true,
      })
    : client.fetch<T>(sitemapProductsQuery);

/** sitemap, posts. */
export const sitemapPosts = <T = any>(): Promise<T> =>
  fromCms("sitemap")
    ? cmsPart<T>("sitemap", {}, "posts", "list")
    : client.fetch<T>(sitemapPostsQuery);

/** sitemap, dates: when each content area last changed. */
export const sitemapDates = <T = any>(): Promise<T> =>
  fromCms("sitemap")
    ? cmsPart<T>("sitemap", {}, "dates", "object")
    : client.fetch<T>(contentDatesQuery);

/* ------------------------------------------------------------------ */
/* Old Sanity file addresses (CMS only)                                */
/* ------------------------------------------------------------------ */

/**
 * legacyFiles: each old Sanity file address (`https://cdn.sanity.io/…`)
 * and the name the file has in the CMS, for the redirects of
 * /api/cdn/images|files/…. Only with CONTENT_SOURCE=cms; with Sanity as
 * the source there is nothing to look up, and it is empty.
 */
export const legacyFiles = <T = Record<string, string>>(): Promise<T> =>
  contentSource() === "cms"
    ? readCmsAnswer<T>("legacy-files", {}, { expect: "object" })
    : Promise.resolve({} as T);

/* ------------------------------------------------------------------ */
/* Job application (server only)                                       */
/* ------------------------------------------------------------------ */

/**
 * jobApply: the applied-for role's notification address and portfolio
 * rule. From Sanity it reads with the write token, as the apply route
 * always did, and throws when the token is missing, which the route
 * treats as a failed look-up. From the CMS it is the private
 * `job-apply` answer, for this server only.
 */
export async function jobApply<T = any>(title: string): Promise<T> {
  if (fromCms("careers")) return cmsObjectOrNull<T>("job-apply", { title });
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !writeToken) {
    throw new Error("The job look-up is not configured");
  }
  const reader = createClient({
    projectId,
    dataset,
    apiVersion: "2026-03-28",
    useCdn: false,
    token: writeToken,
  });
  return reader.fetch<T>(jobApplyQuery, { title });
}
