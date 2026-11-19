import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CMS_CACHE_TAG } from "@/cms/client";
import {
  CMS_SIGNATURE_HEADER,
  CMS_TIMESTAMP_HEADER,
  checkCmsNotice,
  isCmsNotice,
} from "@/cms/content-changed";

/**
 * Sanity webhook: publishing (or editing, or deleting) a document in the
 * Studio calls this, and every page is rebuilt on its next visit, so the
 * marketing team's changes show on the site within seconds, not at the
 * next 60-second refresh or the next deploy (owner, 2026-10-30).
 *
 * The webhook (manage.sanity.io > API > Webhooks): URL
 * https://pacific-surfaces.com/api/revalidate, method POST, trigger on
 * create, update and delete, dataset production, projection
 * `{_type, "slug": slug.current}`, and the same secret as
 * SANITY_REVALIDATE_SECRET on Vercel. The signature is checked, so only
 * Sanity can call it. Every page also refreshes itself at most a minute
 * after a change (`revalidate = 60`), which covers a missed webhook.
 *
 * The CMS calls the same address when published content changes, with
 * its own headers, x-cms-timestamp and x-cms-signature
 * (src/cms/content-changed.ts), checked with CMS_REVALIDATE_SECRET. A
 * request with either header is taken as the CMS's; any other request is
 * handled as Sanity's, exactly as before.
 */
export async function POST(req: NextRequest) {
  if (isCmsNotice(req.headers)) return cmsNotice(req);

  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 }
    );
  }
  try {
    const { isValidSignature, body } = await parseBody<{
      _type?: string;
      slug?: string;
    }>(req, secret);
    if (!isValidSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }
    // The site's pages draw on many documents (a product shows on its
    // category, the homepage and the search), so the whole tree is marked
    // stale rather than guessing which pages one document touches.
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, type: body?._type ?? null });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Bad request" },
      { status: 400 }
    );
  }
}

/**
 * The CMS's notice. The body is read once, as received, and the
 * signature is checked over exactly those bytes. Any refusal is 401.
 * On success every page is marked stale, as for Sanity, and the
 * per-request reads cached under the `cms` tag are cleared.
 */
async function cmsNotice(req: NextRequest) {
  let body: Buffer;
  try {
    body = Buffer.from(await req.arrayBuffer());
  } catch {
    return refused();
  }
  const check = checkCmsNotice({
    timestamp: req.headers.get(CMS_TIMESTAMP_HEADER),
    signature: req.headers.get(CMS_SIGNATURE_HEADER),
    body,
    secret: process.env.CMS_REVALIDATE_SECRET,
    now: Date.now(),
  });
  if (!check.ok) return refused();
  revalidatePath("/", "layout");
  revalidateTag(CMS_CACHE_TAG);
  return NextResponse.json({ revalidated: true, source: "cms" });
}

const refused = () =>
  NextResponse.json({ message: "Invalid signature" }, { status: 401 });
