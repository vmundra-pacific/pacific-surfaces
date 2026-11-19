import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The CMS's "content changed" notice to the website's /api/revalidate.
 *
 * The CMS sends `POST` with the JSON body
 * `{"source":"cms","collection":<slug>,"id":<id or global slug>,"at":<ms>}`
 * and two headers:
 * - `x-cms-timestamp`: the same milliseconds since the epoch, as text;
 * - `x-cms-signature`: the hex HMAC-SHA256 of `${timestamp}.${body}`,
 *   keyed with CMS_REVALIDATE_SECRET.
 *
 * The route accepts a notice only when both headers are well formed, the
 * timestamp is within five minutes of now (either way), and the
 * signature matches, compared in constant time. Without the secret every
 * notice is refused.
 *
 * Node only (it uses node:crypto): imported by the revalidate route alone.
 */

export const CMS_TIMESTAMP_HEADER = "x-cms-timestamp";
export const CMS_SIGNATURE_HEADER = "x-cms-signature";
/** How far a notice's timestamp may be from now, in either direction. */
export const CMS_NOTICE_WINDOW_MS = 5 * 60 * 1000;

/** Does this request carry the CMS's form (either of its headers)? */
export function isCmsNotice(headers: Headers): boolean {
  return headers.has(CMS_TIMESTAMP_HEADER) || headers.has(CMS_SIGNATURE_HEADER);
}

const digest = (secret: string, timestamp: string, body: string | Uint8Array) =>
  createHmac("sha256", secret).update(`${timestamp}.`).update(body).digest();

/** The signature of a notice: what the CMS sends in x-cms-signature. */
export function signCmsNotice(
  secret: string,
  timestamp: string,
  body: string | Uint8Array
): string {
  return digest(secret, timestamp, body).toString("hex");
}

export type CmsNoticeCheck =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "no secret"
        | "missing header"
        | "malformed header"
        | "out of time"
        | "wrong signature";
    };

/**
 * Checks one notice. `body` is the request body exactly as received.
 * Every refusal is answered 401 by the route.
 */
export function checkCmsNotice(notice: {
  timestamp: string | null;
  signature: string | null;
  body: string | Uint8Array;
  secret: string | undefined;
  now: number;
}): CmsNoticeCheck {
  const { timestamp, signature, body, secret, now } = notice;
  if (!secret) return { ok: false, reason: "no secret" };
  if (timestamp === null || signature === null) {
    return { ok: false, reason: "missing header" };
  }
  if (!/^\d{1,15}$/.test(timestamp) || !/^[0-9a-fA-F]{64}$/.test(signature)) {
    return { ok: false, reason: "malformed header" };
  }
  if (Math.abs(now - Number(timestamp)) > CMS_NOTICE_WINDOW_MS) {
    return { ok: false, reason: "out of time" };
  }
  const expected = digest(secret, timestamp, body);
  const given = Buffer.from(signature, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "wrong signature" };
  }
  return { ok: true };
}
