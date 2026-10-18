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
 *     authorName="Jane Doe"
 *     url="/blog/why-137-slabs-matter"
 *   />
 *
 * Brand, publisher and organisation authors point at the site graph's
 * Organization node (ORG_ID, emitted on every page by app/layout), so
 * search and answer engines read them as one entity.
 */

import { safeJsonLd } from "@/lib/escape";
import { LOGO_ID, LOGO_URL, ORG_ID, SITE_URL } from "@/data/business";

/** The Organization from the site graph, by reference plus its name. */
const ORG_REF = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Pacific Surfaces",
} as const;

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
      dangerouslySetInnerHTML={{ __html: safeJsonLd(json) }}
    />
  );
}

/**
 * FAQPage structured data.
 *
 * Both competitors in this category publish an FAQ block on their landing
 * pages — Cosentino's bathroom page carries one, Quantra's does not — and
 * it is what earns the expandable answers under a search result. Emitting
 * the schema is only half of it: the same questions must be visible on the
 * page, or Google treats the markup as mismatched.
 */
export function FaqSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (!faqs || faqs.length === 0) return null;
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(json) }}
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
  /** The byline as printed on the page. A person's name becomes a
   *  Person; none, or an organisation-style byline ("Pacific Surfaces
   *  Team"), credits the Organization. */
  authorName?: string;
  /** Path or absolute URL of the article page. */
  url: string;
  description?: string;
  /** schema.org type; blog posts use "BlogPosting". */
  type?: "Article" | "BlogPosting";
}

/** One spec line, as shown on the page (e.g. Thickness: 20 mm). */
interface ProductProperty {
  name: string;
  value: string;
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
  /** Brand name; defaults to Pacific Surfaces, which links the brand to
   *  the site graph's Organization. */
  brandName?: string;
  /** Spec lines shown on the page, emitted as additionalProperty. Only
   *  values the CMS actually holds: never a display fallback. */
  properties?: ProductProperty[];
}

/**
 * Product JSON-LD without offers/price. Not eligible for Google's
 * product rich results, which need offers, a review or an
 * aggregateRating; it still names the product, its material and specs
 * for search and answer engines. Pricing is intentionally omitted —
 * Pacific Surfaces sells through dealers and doesn't list MSRP, and a
 * fake price or a placeholder triggers Google's "Pricing inaccurate"
 * warnings; the schema is valid without it.
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
  properties,
}: ProductSchemaProps) {
  const absUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const toAbs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const allImages = [
    ...(image ? [toAbs(image)] : []),
    ...(additionalImages ?? []).filter(Boolean).map(toAbs),
  ];
  const specs = (properties ?? []).filter((p) => p.name && p.value);
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: absUrl,
    brand:
      brandName === ORG_REF.name
        ? ORG_REF
        : { "@type": "Brand", name: brandName },
    ...(allImages.length ? { image: allImages } : {}),
    ...(description ? { description } : {}),
    ...(material ? { material } : {}),
    ...(category ? { category } : {}),
    ...(sku ? { sku } : {}),
    ...(specs.length
      ? {
          additionalProperty: specs.map((p) => ({
            "@type": "PropertyValue",
            name: p.name,
            value: p.value,
          })),
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(json) }}
    />
  );
}

/** Bylines that name the company or a desk rather than a person. */
const ORG_BYLINE = /\b(pacific|team|editorial|editors?|staff|admin)\b/i;

export function ArticleSchema({
  headline,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
  description,
  type = "Article",
}: ArticleSchemaProps) {
  const absUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const absImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : undefined;
  const byline = authorName?.trim();
  const json = {
    "@context": "https://schema.org",
    "@type": type,
    headline,
    ...(absImage ? { image: [absImage] } : {}),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author:
      byline && !ORG_BYLINE.test(byline)
        ? { "@type": "Person", name: byline }
        : ORG_REF,
    // Same logo node (and URL) as the site graph's Organization.
    publisher: {
      ...ORG_REF,
      logo: { "@type": "ImageObject", "@id": LOGO_ID, url: LOGO_URL },
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
      dangerouslySetInnerHTML={{ __html: safeJsonLd(json) }}
    />
  );
}
