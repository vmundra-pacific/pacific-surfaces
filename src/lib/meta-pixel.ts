/**
 * Meta (Facebook) Pixel — shared ID + a safe event helper.
 *
 * Hardcoded rather than env-var'd for the same reason as
 * GA_MEASUREMENT_ID in src/app/layout.tsx: the pixel ID is a stable,
 * public token that ships in the page source anyway, and routing it
 * through NEXT_PUBLIC_* would only add a Vercel env var that must be
 * kept in sync across preview/production.
 */
export const META_PIXEL_ID = "479074000264530";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a standard Meta event (Lead, Contact, Purchase, ...).
 *
 * Deliberately a no-op when `fbq` is absent — the pixel loads with
 * `afterInteractive`, so an early submit, an ad blocker, or SSR would
 * otherwise throw. Analytics must never be able to break a form.
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, params);
  } catch (err) {
    console.warn("[meta-pixel] event failed:", event, err);
  }
}
