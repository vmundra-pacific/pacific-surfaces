import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import {
  collectionBySlugQuery,
  productsByCollectionQuery,
} from "@/sanity/lib/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await client.fetch(collectionBySlugQuery, { slug });
  if (!collection) return { title: "Collection Not Found" };

  return {
    title:
      collection.seoTitle || `${collection.name} — Pacific Surfaces`,
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        {" / "}
        <Link href="/collections" className="hover:text-gray-700">Collections</Link>
        {" / "}
        <span className="text-gray-900">{collection.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
      <p className="mt-2 text-gray-600">{products.length} products</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(
          (product: {
            _id: string;
            name: string;
            slug: { current: string };
            mainImage: string;
            ribbons: string[];
          }) => (
            <Link
              key={product._id}
              href={`/products/${product.slug.current}`}
              className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {product.mainImage && (
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-gray-900">{product.name}</h2>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
