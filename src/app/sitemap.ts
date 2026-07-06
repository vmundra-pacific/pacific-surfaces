import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

// Apex (no www) is the canonical hostname per the Vercel domains
// config — www 307-redirects here, so emitting apex URLs in the
// sitemap saves Googlebot a redirect hop on every crawled URL and
// improves crawl budget efficiency.
const SITE_URL = "https://pacific-surfaces.com";

// Static routes the build always knows about — every public page in
// `/app/(site)`. Update this list when adding new top-level routes.
const STATIC_PATHS = [
  "",
  "/about",
  "/products",
  "/products/quartz",
  "/products/granites",
  "/products/semi-precious",
  "/products/exotic",
  "/products/centrepiece-couture",
  "/products/integra",
  "/products/facades-and-finishes",
  "/products/vanity",
  "/products/ecosurfaces",
  // Quartz sub-collection landings. Each routes through
  // /products/[slug]/[item] and renders a filtered catalogue
  // for that collection's slabs. SEO value: each collection has
  // its own brand identity (Vision/Eclipse, Kosmic, Aurora, etc.)
  // and ranks for distinct designer queries.
  "/products/quartz/chromia",
  "/products/quartz/aurora",
  "/products/quartz/celestia",
  "/products/quartz/kosmic",
  "/products/quartz/luminara",
  "/products/quartz/nebula",
  // Spaces — environment-led landing pages.
  "/spaces",
  "/spaces/kitchens",
  "/spaces/bathrooms",
  "/spaces/architecture",
  "/spaces/commercial",
  "/spaces/hospitality",
  "/spaces/outdoor",
  // Inspirations gallery.
  "/inspirations/inspiration-gallery",
  // Professionals hub — services, collaboration model, application
  // showcases, and partner programs.
  "/professionals/services",
  "/professionals/collaboration",
  "/professionals/applications",
  "/professionals/programs",
  // Learn — educational topic pages that rank well for
  // informational searches ("what is quartz", "granite care",
  // etc.) and funnel visitors into product browsing.
  "/learn/what-is-quartz",
  "/learn/what-is-granites",
  "/learn/what-is-semi-precious",
  "/learn/maintenance-quartz",
  "/learn/maintenance-granites",
  "/learn/maintenance-semi-precious",
  "/learn/warranty-quartz",
  // Legacy /sinks, /granites, /semi-precious, /ecosurfaces URLs
  // intentionally NOT listed here — they 301-redirect to the
  // /products/<category> equivalents per next.config.ts, and
  // including a redirect source in the sitemap wastes Googlebot's
  // crawl budget. The redirect destinations are already listed
  // above.
  "/blog",
  "/resources",
  "/sustainability",
  "/careers",
  "/contact",
  "/catalogue",
  "/visualize",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pull dynamic slugs from Sanity. We grab everything in parallel
  // so the build doesn't bottleneck on the slowest query.
  const [products, blogPosts] = await Promise.all([
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
  ]);

  // Static pages don't get a `lastModified` — emitting `now` on
  // every build would falsely signal that every page just changed,
  // wasting Googlebot's crawl budget re-fetching unchanged content.
  // Pages whose content actually evolves (products, blog posts)
  // emit real `_updatedAt` timestamps below; everything else stays
  // unlabeled so Google uses its own freshness heuristics. `now`
  // is still used as a fallback for Sanity docs that lack an
  // `_updatedAt` field — see productEntries / blogEntries below.
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.8,
  }));

  // Sanity catalogue uses `/products/[category]/[item]` — we don't
  // know the category from the slug query alone, so list every
  // product under the bare /products/[slug] convention. The actual
  // route resolution happens in the dynamic segment.
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Signature projects don't have their own public routes today —
  // when a /projects/[slug] route exists, add a signatureProject
  // fetch here and emit entries for it.

  return [...staticEntries, ...productEntries, ...blogEntries];
}
