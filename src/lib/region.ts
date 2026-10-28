/**
 * The visitor's region, as chosen in the header's region selector (or
 * placed there by their location on a first visit). Kept in session
 * storage, and in local storage too with "Remember my selection".
 *
 * Besides the selector, the region decides which quartz and Eclipse
 * colours are listed (data/india-range: India sees only its catalogue's).
 * So that lists can follow it:
 *  - useRegionCountry() (lib/use-region-country) re-renders a component
 *    when the region changes;
 *  - the country is set on <html data-region>, and the continent on
 *    <html data-continent> (by an inline script in app/layout before
 *    anything paints, and here on a change), which CSS uses to hide
 *    out-of-range colours, and to show a region's partner (Middle East:
 *    Pacific x Fairdeal, data/partners), before the page's script runs;
 *  - and in the ps-country cookie, for pages rendered on the server
 *    (search).
 */

export const REGION_KEY = "ps-region";
export const COUNTRY_COOKIE = "ps-country";
export const REGION_CHANGE_EVENT = "ps-region-change";

export interface Region {
  continent: string;
  country: string | null;
  lang: string;
}

export function readRegion(): { region: Region; remembered: boolean } | null {
  for (const [storage, remembered] of [
    [() => sessionStorage, false],
    [() => localStorage, true],
  ] as const) {
    try {
      const raw = storage().getItem(REGION_KEY);
      if (raw) return { region: JSON.parse(raw) as Region, remembered };
    } catch {}
  }
  return null;
}

export function saveRegion(region: Region, remember: boolean) {
  try {
    sessionStorage.setItem(REGION_KEY, JSON.stringify(region));
    if (remember) localStorage.setItem(REGION_KEY, JSON.stringify(region));
    else localStorage.removeItem(REGION_KEY);
  } catch {}
  const age = remember ? "; max-age=31536000" : "";
  document.cookie = `${COUNTRY_COOKIE}=${region.country ?? ""}; path=/; SameSite=Lax${age}`;
  if (region.country) document.documentElement.dataset.region = region.country;
  else delete document.documentElement.dataset.region;
  if (region.country && region.continent)
    document.documentElement.dataset.continent = region.continent;
  else delete document.documentElement.dataset.continent;
  window.dispatchEvent(new Event(REGION_CHANGE_EVENT));
}

/** For app/layout's <head>: puts the stored country on <html> before
 *  the page paints. */
export const REGION_BOOT_SCRIPT = `try{var r=JSON.parse(sessionStorage.getItem("${REGION_KEY}")||localStorage.getItem("${REGION_KEY}")||"null");if(r&&r.country){document.documentElement.dataset.region=r.country;if(r.continent)document.documentElement.dataset.continent=r.continent}}catch(e){}`;
