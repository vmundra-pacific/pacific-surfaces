import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import {
  collectionBySlugQuery,
  productsByCollectionQuery,
} from "@/sanity/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { CollectionProducts } from "@/components/sections/CollectionProducts";

/**
 * Collection detail page — canonical URL is /products/[slug]/[item].
 *
 * Naming note: the segments are `[slug]` and `[item]` only because
 * Next.js requires the first dynamic segment in a folder to share
 * its name with the sibling /products/[slug]/page.tsx (product
 * detail). Semantically:
 *   - `[slug]`  → category (e.g. "quartz", "granite", "semiprecious")
 *   - `[item]`  → collection slug (e.g. "chromia", "kosmic")
 *
 * The [slug] / category segment is for URL aesthetics + SEO; the
 * actual collection lookup uses only [item]. So the URL doesn't have
 * to be perfectly category-accurate to render — convenient for
 * fallback redirects from old /collections/* links.
 *
 * Replaces the old /collections/[slug] route, which was deleted.
 * Old URLs are permanently redirected via next.config.ts.
 */

interface Props {
  params: Promise<{ slug: string; item: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { item } = await params;
  const collection = await client.fetch(collectionBySlugQuery, { slug: item });
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.seoTitle || `${collection.name} — Pacific Surfaces`,
    description: collection.seoDescription || collection.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { item } = await params;
  const [collection, products] = await Promise.all([
    client.fetch(collectionBySlugQuery, { slug: item }),
    client.fetch(productsByCollectionQuery, { slug: item }),
  ]);

  if (!collection) notFound();

  return (
    <>
      <PageHeader
        badge={`${products.length} Surfaces`}
        title={collection.name}
        description={collection.description}
        dark
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <CollectionProducts
          products={products}
          collectionName={collection.name}
        />
      </section>
    </>
  );
}
