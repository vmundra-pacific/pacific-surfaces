/**
 * Validation for the `image` field accepted by the visualizer's
 * Replicate-backed routes (/api/segment, /api/segment-point,
 * /api/depth, /api/process-surface).
 *
 * WHY THIS EXISTS
 *
 * Those routes previously accepted `image` as either a data-URL *or* an
 * arbitrary http(s) URL, and passed it straight through to Replicate.
 * Replicate then fetched that URL from its own infrastructure. That made
 * the endpoints an anonymous, unauthenticated URL fetcher: an attacker
 * could point them at any address and have someone else's servers
 * request it. The blast radius was limited (the request originates from
 * Replicate, not from us, so it can't reach our private network), but it
 * is still an abuse of our Replicate account and there was no scheme
 * allowlist, no host allowlist and no size bound.
 *
 * The fix is to accept ONLY inline data-URLs. This is not a functional
 * restriction: every real caller already sends one — see the three
 * fetches in src/components/visualize/use-segment.ts, which all post
 * `image: imageDataUrl`. The remote-URL branch had no legitimate user.
 */

/** Raster formats the visualizer models actually accept. */
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

/**
 * Upper bound on the base64 payload, in characters.
 *
 * Vercel's serverless request body limit (4.5 MB) already rejects
 * anything larger than this in practice, so it is a defensive backstop
 * rather than the primary control — it bounds memory use if the route
 * is ever invoked outside that environment (local dev, a self-hosted
 * deploy, or a future runtime change).
 */
const MAX_BASE64_CHARS = 15 * 1024 * 1024;

const DATA_URL_RE = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i;

export type ImageInputResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string };

/**
 * Validate an incoming `image` value. Returns a discriminated union so
 * callers can map the failure straight onto a 400 without inventing
 * their own message.
 */
export function validateImageInput(image: unknown): ImageInputResult {
  if (typeof image !== "string" || image.length === 0) {
    return { ok: false, error: "Missing image" };
  }

  const match = DATA_URL_RE.exec(image.trim());
  if (!match) {
    // Deliberately explicit: the old contract allowed a plain URL, so a
    // stale client sending one deserves a message that explains the
    // change rather than a generic rejection.
    return {
      ok: false,
      error:
        "Image must be an inline base64 data-URL (e.g. data:image/jpeg;base64,...). Remote URLs are not accepted.",
    };
  }

  const [, mime, base64] = match;

  if (!ALLOWED_MIME.has(mime.toLowerCase())) {
    return {
      ok: false,
      error: "Unsupported image format. Use PNG, JPEG or WebP.",
    };
  }

  if (base64.length > MAX_BASE64_CHARS) {
    return { ok: false, error: "Image is too large." };
  }

  return { ok: true, dataUrl: image.trim() };
}
