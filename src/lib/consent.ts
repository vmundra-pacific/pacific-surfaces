/**
 * The visitor's cookie choice for advertising (owner, 2026-10-20: raise
 * Lighthouse Best Practices, which failed on the Google Ads and Meta
 * cookies being set before anyone agreed to them).
 *
 *  - Until a visitor accepts, Google's tags run in Consent Mode with
 *    advertising storage denied (set in the root layout before Tag
 *    Manager loads), and the Meta Pixel is not loaded at all.
 *  - Analytics (first-party GA4 cookies) runs either way.
 *  - The choice is kept in localStorage; "granted" restores everything
 *    on the next visit before any tag fires.
 */
export const CONSENT_KEY = "pacific-consent";
export const CONSENT_EVENT = "pacific:consent";

export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Private mode or storage blocked: the choice holds for this page only.
  }
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  const update = {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  };
  if (typeof w.gtag !== "function") {
    // Google's tags read the Arguments object gtag() pushes, not an array.
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
  }
  w.gtag("consent", "update", update);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** The inline script for <head>: Consent Mode defaults, before Tag Manager. */
export const CONSENT_DEFAULTS_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
var pc=null;try{pc=localStorage.getItem('${CONSENT_KEY}')}catch(e){}
var pg=pc==='granted'?'granted':'denied';
gtag('consent','default',{ad_storage:pg,ad_user_data:pg,ad_personalization:pg,analytics_storage:'granted'});
if(pc==='granted'||pc==='denied')document.documentElement.setAttribute('data-consent',pc);`;
