import "server-only";
import { MEDIA_NAME_RE } from "@/lib/media-url";
import { contentSource } from "./client";
import { mediaUpstream } from "./media";

/**
 * This site's pass-through for CMS files, /api/cdn/m/<name>
 * (src/app/api/cdn/m/[name]/route.ts).
 *
 * It serves the uses that need the same origin (drawing on a canvas, the
 * catalogue reader's byte ranges, downloads) and every file on the CMS's
 * own host, which visitors cannot open.
 *
 * - Only with CONTENT_SOURCE=cms. Otherwise every name is not found, as
 *   before this route existed.
 * - Only a CMS file name is accepted: `<32 hex>[-w<width>|-share].<ext>`.
 *   Anything else, a path or `..` included, is not found.
 * - The file comes from the media folder when this site knows it, else
 *   from the CMS's file route with the reader key and the
 *   deployment-protection pass (src/cms/media.ts). With neither the
 *   folder nor CMS_URL and CMS_READ_KEY set it is not found.
 * - A Range header is passed on, and the answer keeps the upstream's
 *   status (200, 206, 404, or 416 for a range past the end), with its
 *   Content-Type, Content-Length, Content-Range and Accept-Ranges, and a
 *   year's cache for a file (names never change). Any other upstream
 *   answer (a refusal, a redirect, an error) becomes an empty 502, so a
 *   login page never comes through.
 */

const PASSED_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
] as const;

const LONG_CACHE = "public, max-age=31536000, s-maxage=31536000, immutable";

const notFound = () => new Response("Not found.", { status: 404 });

const emptyAnswer = (status: number, headers: Headers = new Headers()) => {
  headers.set("Cache-Control", "no-store");
  return new Response(null, { status, headers });
};

export async function proxyCmsMedia(
  request: Request,
  name: string,
  method: "GET" | "HEAD"
): Promise<Response> {
  if (contentSource() !== "cms") return notFound();
  if (typeof name !== "string" || !MEDIA_NAME_RE.test(name)) return notFound();
  const upstream = mediaUpstream(name);
  if (!upstream) return notFound();

  // Ask for the bytes as stored, so a passed-on Content-Length and
  // Content-Range describe exactly what is sent.
  const headers: Record<string, string> = {
    ...upstream.headers,
    "accept-encoding": "identity",
  };
  const range = request.headers.get("range");
  if (range) headers.range = range;

  let response: Response;
  try {
    response = await fetch(upstream.url, {
      method,
      headers,
      redirect: "manual",
      // A signal of its own: the framework keeps a second copy of the
      // body of a fetch made without one (to share it with a later
      // identical fetch), which for a file of hundreds of megabytes is
      // held in memory, and which stops the body below from closing.
      signal: new AbortController().signal,
    });
  } catch {
    return emptyAnswer(502);
  }

  const status = response.status;
  if (status !== 200 && status !== 206) {
    void response.body?.cancel().catch(() => undefined);
    if (status === 404) return notFound();
    if (status === 416) {
      const passed = new Headers();
      const contentRange = response.headers.get("content-range");
      if (contentRange) passed.set("content-range", contentRange);
      return emptyAnswer(416, passed);
    }
    return emptyAnswer(502);
  }

  const passed = new Headers();
  for (const header of PASSED_HEADERS) {
    const value = response.headers.get(header);
    if (value) passed.set(header, value);
  }
  passed.set("Cache-Control", LONG_CACHE);
  if (method === "HEAD") {
    void response.body?.cancel().catch(() => undefined);
    return new Response(null, { status, headers: passed });
  }
  return new Response(response.body, { status, headers: passed });
}
