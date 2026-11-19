import type { NextRequest } from "next/server";
import { proxyCmsMedia } from "@/cms/media-proxy";

/**
 * CMS files on this site's own address: /api/cdn/m/<name>. What it
 * accepts and where it fetches from are in src/cms/media-proxy.ts.
 *
 * Node.js runtime, like the Sanity proxy beside it: catalogue PDFs run
 * to hundreds of megabytes, past what an edge function streams.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ name: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { name } = await ctx.params;
  return proxyCmsMedia(req, name, "GET");
}

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  const { name } = await ctx.params;
  return proxyCmsMedia(req, name, "HEAD");
}
