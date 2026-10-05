import { NextResponse } from "next/server";
import { CERTIFICATES, isCertificateId } from "@/lib/certificates/registry";
import { getCertificatePages } from "@/lib/certificates/render";

export const runtime = "nodejs";

/**
 * GET /api/certificates/:id — what the viewer needs to lay the pages
 * out before they load: the title and each page's proportions. Holds no
 * document content, so it can sit in the CDN.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isCertificateId(id)) {
    return NextResponse.json({ error: "Unknown certificate" }, { status: 404 });
  }
  try {
    const pages = await getCertificatePages(id);
    return NextResponse.json(
      { id, title: CERTIFICATES[id].title, pages },
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error(`[certificates] ${id}:`, err);
    return NextResponse.json(
      { error: "Certificate unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
