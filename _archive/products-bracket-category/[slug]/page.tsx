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
 * Collection detail page — canonical URL is /products/[category]/[slug].
 *
 * The [category] segment is for URL aesthetics and SEO (so editors and
 * users see a meaningful hierarchy like /products/quartz/chromia rather
 * than a flat /collections/chromia). The actual collection lookup uses
 * only the [slug] segment; [category] is captured but not validated
 * against the collection's true category — keeps things flexible and
 * avoids needing per-collection category metadata in Sanity.
 *
 * Replaces the old /collections/[slug] route, which has been deleted.
 * Old URLs are permanently redirected via next.config.ts.
 */

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await client.fetch(collectionBySlugQuery, { slug });
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.seoTitle || `${collection.name} — Pacific Surfaces`,
    description: collection.seoDescription || collection.description,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [collection, products] = await Promise.all([
    client.fetch(collectionBySlugQuery, { slug }),
    client.fetch(productsByCollectionQuery, { slug }),
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
