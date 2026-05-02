import type { MetadataRoute } from "next";

const SITE_URL = "https://www.pacific-surfaces.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Studio is the Sanity admin UI — never useful in search.
        // /api routes shouldn't be crawled either. /_archive is
        // the legacy collection routes kept around for git history.
        disallow: ["/api/", "/studio/", "/_archive/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
