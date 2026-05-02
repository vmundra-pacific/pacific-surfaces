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

interface ProductSchemaProps {
  name: string;
  /** Path or absolute URL of the product page. */
  url: string;
  /** Primary image URL. Will be made absolute if relative. */
  image?: string;
  /** Optional gallery images, also made absolute. */
  additionalImages?: string[];
  description?: string;
  /** Material name (e.g. "Engineered Quartz", "Granite"). */
  material?: string;
  /** Category / collection display name. */
  category?: string;
  /** Stable identifier — use product slug if no SKU exists. */
  sku?: string;
  /** Brand name; defaults to Pacific Surfaces. */
  brandName?: string;
}

/**
 * Product JSON-LD without offers/price. Eligible for rich product
 * cards, image carousels, and Discover. Pricing block is intentionally
 * omitted — Pacific Surfaces sells through dealers and doesn't list
 * MSRP. Adding a fake price or a placeholder triggers Google's
 * "Pricing inaccurate" warnings; the schema is still valid without it.
 */
export function ProductSchema({
  name,
  url,
  image,
  additionalImages,
  description,
  material,
  category,
  sku,
  brandName = "Pacific Surfaces",
}: ProductSchemaProps) {
  const absUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const toAbs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const allImages = [
    ...(image ? [toAbs(image)] : []),
    ...(additionalImages ?? []).filter(Boolean).map(toAbs),
  ];
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: absUrl,
    brand: { "@type": "Brand", name: brandName },
    ...(allImages.length ? { image: allImages } : {}),
    ...(description ? { description } : {}),
    ...(material ? { material } : {}),
    ...(category ? { category } : {}),
    ...(sku ? { sku } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
