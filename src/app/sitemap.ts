import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

const SITE_URL = "https://www.pacific-surfaces.com";

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
  "/products/quartz/chromia",
  "/granites",
  "/semi-precious",
  "/sinks",
  "/ecosurfaces",
  "/blog",
  "/resources",
  "/sustainability",
  "/careers",
  "/contact",
  "/catalogue",
  "/visualize",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pull dynamic slugs from Sanity. We grab everything in parallel
  // so the build doesn't bottleneck on the slowest query.
  const [products, blogPosts, projects] = await Promise.all([
    client
      .fetch<{ slug: string; updatedAt: string | null }[]>(
        groq`*[_type == "product" && defined(slug.current)]{
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
      .fetch<{ slug: string; updatedAt: string | null }[]>(
        groq`*[_type == "signatureProject" && defined(slug.current)]{
          "slug": slug.current, "updatedAt": _updatedAt
        }`
      )
      .catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
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

  // Signature projects don't have their own public routes today,
  // but the Sanity content has slugs. Skip emitting URLs for them
  // until a /projects/[slug] route exists.
  void projects;

  return [...staticEntries, ...productEntries, ...blogEntries];
}
