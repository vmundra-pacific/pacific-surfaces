/**
 * Mobile verification for the Where to Buy lead form, by Firebase
 * Authentication's phone sign-in (marketing, 2026-10-26).
 *
 * The browser does the texting (lib/firebase-phone.ts): Firebase sends the
 * code behind an invisible reCAPTCHA and, for the right code, gives an ID
 * token naming the number. Here the server checks that token against
 * Google's public keys (no service account needed) and reads the number,
 * so a lead is marked verified only for a number that really got the code.
 *
 * Turned on by the web app's config in NEXT_PUBLIC_FIREBASE_API_KEY,
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN and NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * (setup in .env.example). Without them the form asks for the mobile with
 * no code and the lead is saved as unverified.
 */
import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const phoneVerificationEnabled = () =>
  !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    projectId
  );

// Firebase signs ID tokens with these keys; jose caches them.
const GOOGLE_KEYS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

/**
 * The mobile a Firebase ID token proves, as "+91XXXXXXXXXX", or null when
 * the token is missing, forged, expired, for another project, or not from
 * a phone sign-in.
 */
export async function verifiedPhone(idToken: string): Promise<string | null> {
  if (!idToken || !projectId) return null;
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_KEYS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });
    const provider = (payload.firebase as { sign_in_provider?: string })
      ?.sign_in_provider;
    if (!payload.sub || provider !== "phone") return null;
    return typeof payload.phone_number === "string"
      ? payload.phone_number
      : null;
  } catch (error) {
    console.warn("[phone-verification] token rejected:", error);
    return null;
  }
}
