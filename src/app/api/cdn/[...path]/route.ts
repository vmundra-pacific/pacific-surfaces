import type { NextRequest } from "next/server";
import { legacyRedirect } from "@/cms/legacy-files";

/**
 * Old Sanity file addresses on this site.
 *
 * Pages once loaded Sanity's pictures and files through this route
 * (/api/cdn/images/{project}/{dataset}/... and
 * /api/cdn/files/{project}/{dataset}/...), so those addresses live on in
 * bookmarks, search results and old emails.
 *
 * What this route does
 * --------------------
 *   - An address whose file the CMS holds is redirected (302) to that
 *     file, a `w` picking the copy at or above that width
 *     (src/cms/legacy-files.ts).
 *   - Any other address answers 404. Nothing is fetched from Sanity any
 *     more.
 */

// Node.js runtime: the CMS's list of old addresses is kept with
// unstable_cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const SANITY_HOST = "https://cdn.sanity.io";

function notFound(): Response {
  return new Response("Not found.", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

async function redirectOld(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  if (!path || path.length === 0) {
    return new Response("Bad request: missing asset path.", { status: 400 });
  }
  if (path.length < 3 || (path[0] !== "images" && path[0] !== "files")) {
    return notFound();
  }

  // The CMS's list knows each old address by its full Sanity form.
  const target = await legacyRedirect(
    `${SANITY_HOST}/${path.map(encodeURIComponent).join("/")}`,
    req.nextUrl.searchParams.get("w")
  );
  // The target is the media host's address or this site's own path.
  if (target) {
    return new Response(null, { status: 302, headers: { Location: target } });
  }
  return notFound();
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return redirectOld(req, ctx);
}

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return redirectOld(req, ctx);
}
