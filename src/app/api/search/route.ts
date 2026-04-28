import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

/**
 * GET /api/search?q=super+white
 *
 * Searches products by name (case-insensitive match via Sanity's
 * `match` operator). Returns lightweight results for the search overlay.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = await client.fetch(
    groq`
      *[_type == "product" && (
        name match $term ||
        collection->name match $term
      )] | order(name asc) [0...20] {
        _id,
        name,
        slug,
        "mainImage": mainImage.asset->url,
        "collectionName": collection->name
      }
    `,
    { term: `${q}*` }
  );

  return NextResponse.json({ results });
}
