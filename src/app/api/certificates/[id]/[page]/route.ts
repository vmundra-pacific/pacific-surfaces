import { isCertificateId } from "@/lib/certificates/registry";
import { renderCertificatePage } from "@/lib/certificates/render";

export const runtime = "nodejs";

/**
 * GET /api/certificates/:id/:page — one watermarked page image, for the
 * certificate viewer only.
 *
 * Answered only when a page on this site draws it as an image: browsers
 * send `Sec-Fetch-Dest: document` when the URL is typed, pasted or opened
 * in a new tab, and `Sec-Fetch-Site` other than same-origin when another
 * site embeds it — both get 403. That is a deterrent, not a lock (the
 * headers can be forged outside a browser), which is why the watermark is
 * baked into the pixels as well.
 *
 * Deliberately never cached, at the CDN or in the browser: either copy
 * would be served without re-running these checks (a fresh browser cache
 * entry answered a direct visit with the image). Pages are memoised in
 * render.ts instead, so a re-fetch costs nothing but the round trip.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; page: string }> },
) {
  const { id, page } = await params;
  const pageNumber = Number(page);
  if (!isCertificateId(id) || !Number.isInteger(pageNumber) || pageNumber < 1) {
    return new Response("Not found", { status: 404 });
  }

  const dest = req.headers.get("sec-fetch-dest");
  const site = req.headers.get("sec-fetch-site");
  if (dest === "document" || (site !== null && site !== "same-origin")) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const image = await renderCertificatePage(id, pageNumber);
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
        "Content-Disposition": "inline",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, noimageindex",
      },
    });
  } catch (err) {
    if (err instanceof RangeError) {
      return new Response("Not found", { status: 404 });
    }
    console.error(`[certificates] ${id} p${pageNumber}:`, err);
    return new Response("Certificate unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
