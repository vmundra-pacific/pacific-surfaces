import type { MetadataRoute } from "next";

const SITE_URL = "https://pacific-surfaces.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Studio is the Sanity admin UI — never useful in search.
        // /api routes shouldn't be crawled either. /_archive is
        // the legacy collection routes kept around for git history.
        //
        // DELIBERATELY NOT LISTED: /customer/. The portal is excluded
        // from search via `robots: { index: false }` on
        // src/app/customer/layout.tsx instead. Adding a Disallow here
        // would be counterproductive right now: the portal was
        // previously indexable, so pages may already be in Google's
        // index, and a crawler that is blocked from fetching a URL can
        // never see its noindex tag — the stale entries would be frozen
        // in place rather than dropped. Once Search Console shows
        // /customer/* fully de-indexed, adding "/customer/" here is a
        // sensible belt-and-braces follow-up.
        disallow: ["/api/", "/studio/", "/_archive/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
