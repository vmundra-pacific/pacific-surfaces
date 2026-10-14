import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { searchPages, searchWords } from "@/data/site-search";

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

  const results = await client.fetch(
    groq`
      *[
        !(_id in path("drafts.**")) && (
          (_type == "product" && (
            (name + " " + coalesce(collection->name, "") + " " + coalesce(category->name, "")) match $terms
          )) ||
          (_type == "blogPost" && title match $terms)
        )
      ] | order(coalesce(name, title) asc) [0...20] {
        _type,
        _id,
        "name": coalesce(name, title),
        slug,
        "mainImage": mainImage.asset->url,
        "collectionName": collection->name
      }
    `,
    { terms }
  );

  return NextResponse.json({ results, pages });
}
