import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { searchPages, searchWords } from "@/data/site-search";
import { shownInRegion } from "@/data/india-range";
import { COUNTRY_COOKIE } from "@/lib/region";

interface SearchHit {
  _type: "product" | "blogPost";
  _id: string;
  name: string;
  slug?: { current?: string } | null;
  mainImage?: string | null;
  collectionName?: string | null;
  productType?: string | null;
}

/**
 * GET /api/search?q=vanity+top
 *
 * The site search: Sanity products and blog posts, and the site's own
 * pages (data/site-search: the store and its vanity tops, the sills
 * collection, every application, space and category page, and so on).
 *
 * A query matches word by word, each word as a word start, so "vanity
 * top", "window sills" or a half-typed "vani" all find their pages (owner,
 * 2026-10-14: searches for things on the site were finding nothing,
 * because the whole query had to match one product name).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const words = searchWords(q);

  if (words.length === 0) {
    return NextResponse.json({ results: [], pages: [] });
  }

  const pages = searchPages(q);
  const terms = words.map((w) => `${w}*`);

  const found: SearchHit[] = await client.fetch(
    groq`
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
    `,
    { terms }
  );

  // Visitors in India find only the quartz and Eclipse colours in the
  // Indian catalogue (data/india-range); the region selector sets the
  // country cookie. Fetched 40, so 20 remain after the filter.
  const country = req.cookies.get(COUNTRY_COOKIE)?.value;
  const results = found
    .filter(
      (r) =>
        r._type !== "product" ||
        shownInRegion(
          {
            slug: r.slug?.current,
            name: r.name,
            productType: r.productType,
            collection: r.collectionName,
          },
          country
        )
    )
    .slice(0, 20);

  return NextResponse.json({ results, pages });
}
