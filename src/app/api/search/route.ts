import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

/**
 * GET /api/search?q=super+white
 *
 * Searches products AND blog posts by name/title (case-insensitive
 * match via Sanity's `match` operator). Returns lightweight results
 * for the search overlay, tagged with `_type` so the client can route
 * each result to the right URL shape (/products/<slug> vs /blog/<slug>).
 *
 * Per the 2026 UX audit, the search bar should act as a "universal"
 * search rather than products-only. Static singleton pages (About,
 * Sustainability, Careers, etc.) don't carry slugs in Sanity the way
 * products/posts do, so they can't be folded into this GROQ query —
 * those are handled client-side in search-overlay.tsx via a small
 * static page index instead.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = await client.fetch(
    groq`
      *[
        (_type == "product" && (
          name match $term ||
          collection->name match $term
        )) ||
        (_type == "blogPost" && title match $term)
      ] | order(coalesce(name, title) asc) [0...20] {
        _type,
        _id,
        "name": coalesce(name, title),
        slug,
        "mainImage": mainImage.asset->url,
        "collectionName": collection->name
      }
    `,
    { term: `${q}*` }
  );

  return NextResponse.json({ results });
}
