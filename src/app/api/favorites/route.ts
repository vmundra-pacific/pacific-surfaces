import { NextRequest, NextResponse } from "next/server";
import * as cms from "@/cms/read";
import { mapSanityToCatalogue } from "@/data/sanityToSlab";

/**
 * GET /api/favorites?ids=id1,id2,id3
 *
 * Favorites live in the browser's localStorage only (see
 * ps_favorites_v1 in ProductDetail.tsx) — there's no server-side
 * concept of "this visitor's favorites." The /favorites page reads
 * the id list from localStorage client-side, then calls this route
 * to resolve those ids into full product records so it can render
 * them through the same SlabGrid the catalogue uses.
 */
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids")?.trim();

  if (!idsParam) {
    return NextResponse.json({ slabs: [] });
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ slabs: [] });
  }

  const products = await cms.productsByIds(ids);
  const slabs = mapSanityToCatalogue(products);

  return NextResponse.json({ slabs });
}
