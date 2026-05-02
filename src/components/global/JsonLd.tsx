/**
 * Inline JSON-LD <script> helpers — server-renderable React components.
 *
 * Usage in any page.tsx:
 *
 *   <BreadcrumbList items={[
 *     { name: "Home", url: "/" },
 *     { name: "Products", url: "/products" },
 *     { name: "Quartz", url: "/products/quartz" },
 *   ]} />
 *
 *   <ArticleSchema
 *     headline="Why 137\" slabs matter"
 *     image="/blog/some-image.jpg"
 *     datePublished="2026-04-12"
 *     dateModified="2026-04-15"
 *     authorName="Pacific Surfaces Editorial"
 *     url="/blog/why-137-slabs-matter"
 *   />
 */

const SITE_URL = "https://www.pacific-surfaces.com";

interface BreadcrumbItem {
  name: string;
  /** Path or absolute URL. Relative paths are joined with SITE_URL. */
  url: string;
}

export function BreadcrumbList({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  /** Absolute or relative image URL. */
  image?: string;
  /** ISO 8601 date string. */
  datePublished: string;
  /** ISO 8601 date string. Defaults to datePublished. */
  dateModified?: string;
  authorName?: string;
  /** Path or absolute URL of the article page. */
  url: string;
  description?: string;
}

export function ArticleSchema({
  headline,
  image,
  datePublished,
  dateModified,
  authorName = "Pacific Surfaces Editorial",
  url,
  description,
}: ArticleSchemaProps) {
  const absUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const absImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : undefined;
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    ...(absImage ? { image: [absImage] } : {}),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Pacific Surfaces",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logos/monogram-light.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absUrl,
    },
    ...(description ? { description } : {}),
    url: absUrl,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
