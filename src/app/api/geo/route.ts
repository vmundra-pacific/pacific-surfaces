/**
 * GET /api/geo — the visitor's country, from the header Vercel's edge adds
 * to every request (x-vercel-ip-country, ISO 3166-1 alpha-2). The region
 * selector asks once, on a visitor's first page, to pick their country and
 * language; it stores the answer, so returning visitors never call this.
 * Nothing about the visitor is logged or kept here.
 */
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country");
  return Response.json(
    { country: country && /^[A-Z]{2}$/.test(country) ? country : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
