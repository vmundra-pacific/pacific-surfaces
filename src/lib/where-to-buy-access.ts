/**
 * The Where to Buy access cookie: proof that this browser has left its
 * details, so the outlets are shown again on later visits without the form.
 *
 * A signed token, `<payload>.<signature>`: the payload names the lead (its
 * Sanity id) and when the access ends; the signature is an HMAC-SHA256 with
 * AUTH_SECRET (already set for sign-in), so it cannot be forged or
 * extended. httpOnly, so page scripts cannot read or copy it.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE = "wtb_access";
/** 30 days: long enough to come back after a showroom visit. */
export const ACCESS_MAX_AGE = 30 * 24 * 60 * 60;

const secret = () => process.env.AUTH_SECRET || "";

function sign(payload: string) {
  // The prefix keeps these signatures apart from anything else the
  // secret signs.
  return createHmac("sha256", secret())
    .update(`where-to-buy-access:${payload}`)
    .digest("base64url");
}

/** A token for a saved lead, or null when no secret is set. */
export function accessToken(leadId: string): string | null {
  if (!secret()) return null;
  const payload = Buffer.from(
    JSON.stringify({
      l: leadId,
      e: Math.floor(Date.now() / 1000) + ACCESS_MAX_AGE,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** The lead a genuine, unexpired token names, or null. */
export function accessLead(token: string | undefined): string | null {
  if (!token || !secret()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const { l, e } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof e === "number" &&
      e > Date.now() / 1000 &&
      typeof l === "string"
      ? l
      : null;
  } catch {
    return null;
  }
}

/** Is this cookie value a genuine, unexpired token? */
export const hasAccess = (token: string | undefined) => !!accessLead(token);

export const accessCookie = (token: string) => ({
  name: ACCESS_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACCESS_MAX_AGE,
});
