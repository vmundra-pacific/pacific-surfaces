import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { APPLICATIONS } from "@/data/applications";

// Apex (no www) is the canonical hostname per the Vercel domains
// config — www 307-redirects here, so emitting apex URLs in the
// sitemap saves Googlebot a redirect hop on every crawled URL and
// improves crawl budget efficiency.
const SITE_URL = "https://pacific-surfaces.com";

// Rebuilt hourly, so an editor's change in Sanity reaches <lastmod>
// without a deploy.
export const revalidate = 3600;

/**
 * Where a page's content comes from in Sanity, if anywhere. Each key is
 * resolved below to the newest `_updatedAt` among those documents, so an
 * editor's change moves the page's date and nothing else does.
 */
type ContentKey =
  | "home"
  | "catalogue"
  | "facades"
  | "blog"
  | "resources"
  | "sustainability"
  | "careers"
  | `space:${string}`;

/**
 * Every static page, with the date its own copy or layout last changed
 * (`since`, YYYY-MM-DD) and, when it draws on Sanity, which documents.
 * A page's <lastmod> is the later of the two.
 *
 * `since` was seeded on 2026-10-05 from git history: the last commit
 * touching the page's own route and section files (brought up to date on
 * 2026-10-07 for the pages changed since, the catalogue re-filing among
 * them). Kitchens, Bathrooms and Hospitality are built in code now, not
 * from their Sanity space pages, so they carry no content key. Bump it when you
 * change a page's content; leave it alone for sitewide header, footer or
 * JSON-LD changes. Never stamp the build time: that would tell Google
 * every page changed on every deploy.
 *
 * Legacy /sinks, /granites, /semi-precious and /ecosurfaces are left out
 * (they 301 to /products/<category>), and so is /catalogue (it canonicals
 * to /products).
 */
const STATIC_PAGES: { path: string; since: string; content?: ContentKey }[] = [
  { path: "", since: "2026-10-07", content: "home" },
  { path: "/about", since: "2026-09-29" },
  { path: "/products", since: "2026-10-05", content: "catalogue" },
  // Category landings, resolved by /products/[slug] through
  // CATEGORY_PAGES (products/_lib/category.ts).
  { path: "/products/quartz", since: "2026-10-05", content: "catalogue" },
  { path: "/products/quartz/about", since: "2026-10-07" },
  { path: "/products/granites", since: "2026-10-05", content: "catalogue" },
  { path: "/products/semi-precious", since: "2026-09-12", content: "catalogue" },
  { path: "/products/exotic", since: "2026-07-06", content: "catalogue" },
  { path: "/products/centrepiece-couture", since: "2026-09-12", content: "catalogue" },
  { path: "/products/integra", since: "2026-09-12", content: "catalogue" },
  { path: "/products/facades-and-finishes", since: "2026-09-12", content: "facades" },
  { path: "/products/vanity", since: "2026-09-12", content: "catalogue" },
  { path: "/products/ecosurfaces", since: "2026-09-12", content: "catalogue" },
  { path: "/products/fab-creations", since: "2026-10-05", content: "catalogue" },
  // Cut pieces: the Pacific European Window Sill & Threshold Collection,
  // built in code.
  { path: "/products/pacific-european-window-sill-threshold-collection", since: "2026-10-07" },
  { path: "/products/translucent", since: "2026-09-12", content: "catalogue" },
  // Quartz series landings, via /products/[slug]/[item].
  { path: "/products/quartz/chromia", since: "2026-10-05", content: "catalogue" },
  { path: "/products/quartz/aurora", since: "2026-10-05", content: "catalogue" },
  { path: "/products/quartz/celestia", since: "2026-07-06", content: "catalogue" },
  { path: "/products/quartz/kosmic", since: "2026-10-05", content: "catalogue" },
  { path: "/products/quartz/luminara", since: "2026-07-06", content: "catalogue" },
  { path: "/products/quartz/nebula", since: "2026-07-06", content: "catalogue" },
  { path: "/spaces", since: "2026-10-05" },
  { path: "/spaces/kitchens", since: "2026-10-05" },
  { path: "/spaces/bathrooms", since: "2026-10-05" },
  { path: "/spaces/architecture", since: "2026-09-12", content: "space:architecture" },
  { path: "/spaces/commercial", since: "2026-07-06", content: "space:commercial" },
  { path: "/spaces/hospitality", since: "2026-10-05" },
  { path: "/spaces/outdoor", since: "2026-09-12", content: "space:outdoor" },
  { path: "/inspirations/inspiration-gallery", since: "2026-09-29" },
  { path: "/professionals/services", since: "2026-09-29" },
  { path: "/professionals/collaboration", since: "2026-09-29" },
  { path: "/professionals/applications", since: "2026-09-29" },
  { path: "/professionals/programs", since: "2026-09-29" },
  // Learn topics share one route file, learn/[topic]/page.tsx.
  { path: "/learn/what-is-quartz", since: "2026-09-12" },
  { path: "/learn/what-is-granites", since: "2026-09-12" },
  { path: "/learn/what-is-semi-precious", since: "2026-09-12" },
  { path: "/learn/maintenance-quartz", since: "2026-09-12" },
  { path: "/learn/maintenance-granites", since: "2026-09-12" },
  { path: "/learn/maintenance-semi-precious", since: "2026-09-12" },
  { path: "/learn/warranty-quartz", since: "2026-09-12" },
  { path: "/blog", since: "2026-07-30", content: "blog" },
  { path: "/resources", since: "2026-07-07", content: "resources" },
  { path: "/sustainability", since: "2026-09-29", content: "sustainability" },
  { path: "/careers", since: "2026-07-06", content: "careers" },
  { path: "/contact", since: "2026-10-07" },
  { path: "/visualize", since: "2026-07-06", content: "catalogue" },
  { path: "/privacy", since: "2026-07-06" },
];

/** The /applications/<slug> pages, built from data/applications.ts;
 *  Flooring has had a page of its own since 2026-10-05. */
const APPLICATIONS_SINCE = "2026-09-12";
const APPLICATION_SINCE: Record<string, string> = { flooring: "2026-10-05" };

/** The space pages still built from their Sanity space page. */
const SPACES = ["architecture", "commercial", "outdoor"];

/** The newest `_updatedAt` among the documents a filter matches. */
const newest = (filter: string) => `*[${filter}] | order(_updatedAt desc)[0]._updatedAt`;

const contentDatesQuery = groq`{
  "home": ${newest('_type in ["collection", "signatureProject", "applicationCard", "inspirationImage"]')},
  "catalogue": ${newest('_type in ["product", "collection"]')},
  "facades": ${newest('_type in ["facadesAndFinishesPage", "product", "collection"]')},
  "blog": ${newest('_type == "blogPost"')},
  "resources": ${newest('_type == "resource"')},
  "sustainability": ${newest('_type == "sustainabilityPage"')},
  "careers": ${newest('_type in ["careersPage", "jobOpening"]')},
  ${SPACES.map((s) => `"space:${s}": ${newest(`_type == "spacePage" && slug == "${s}"`)}`).join(",\n  ")}
}`;

/** The later of a code date (written as the plain date) and a content
 *  timestamp (written as Sanity gives it). Both are valid W3C dates. */
function later(since: string, content?: string | null): string {
  if (!content) return since;
  const edited = new Date(content).getTime();
  return Number.isNaN(edited) || edited < new Date(`${since}T00:00:00Z`).getTime() ? since : content;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pull dynamic slugs and the content dates from Sanity in parallel.
  const [products, blogPosts, contentDates] = await Promise.all([
    client
      .fetch<{ slug: string; updatedAt: string | null }[]>(
        groq`*[_type == "product" && defined(slug.current) && visible != false]{
          "slug": slug.current, "updatedAt": _updatedAt
        }`
      )
      .catch(() => []),
    client
      .fetch<{ slug: string; updatedAt: string | null }[]>(
        groq`*[_type == "blogPost" && defined(slug.current)]{
          "slug": slug.current, "updatedAt": _updatedAt
        }`
      )
      .catch(() => []),
    client
      .fetch<Partial<Record<ContentKey, string | null>>>(contentDatesQuery)
      .catch((): Partial<Record<ContentKey, string | null>> => ({})),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: later(p.since, p.content ? contentDates[p.content] : null),
    changeFrequency: p.path === "" ? "weekly" : "monthly",
    priority: p.path === "" ? 1 : 0.8,
  }));

  // Application pages. Vanity Tops carries the long-form copy and FAQ,
  // so it is ranked above its siblings here.
  const applicationEntries: MetadataRoute.Sitemap = APPLICATIONS.map((a) => ({
    url: `${SITE_URL}/applications/${a.slug}`,
    lastModified: later(APPLICATION_SINCE[a.slug] ?? APPLICATIONS_SINCE),
    changeFrequency: "monthly",
    priority: a.seo ? 0.9 : 0.7,
  }));

  // Sanity catalogue uses `/products/[category]/[item]` — we don't
  // know the category from the slug query alone, so list every
  // product under the bare /products/[slug] convention. The actual
  // route resolution happens in the dynamic segment. Products and posts
  // carry their own `_updatedAt`; one without is left undated rather
  // than stamped with the build time.
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    ...(b.updatedAt ? { lastModified: new Date(b.updatedAt) } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Signature projects don't have their own public routes today —
  // when a /projects/[slug] route exists, add a signatureProject
  // fetch here and emit entries for it.

  return [
    ...staticEntries,
    ...applicationEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
