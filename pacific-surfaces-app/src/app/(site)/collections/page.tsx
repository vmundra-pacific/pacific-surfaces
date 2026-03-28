import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { allCollectionsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Collections — Pacific Surfaces",
  description:
    "Explore our curated collections of premium quartz, granite, and semi-precious surfaces.",
};

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description: string;
  image: string;
  productCount: number;
}

export default async function CollectionsPage() {
  const collections: Collection[] = await client.fetch(allCollectionsQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Our Collections
      </h1>
      <p className="mt-2 text-gray-600">
        Curated selections of premium surfaces for every style.
      </p>

      {collections.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          Collections are being set up. Check back soon!
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection._id}
              href={`/collections/${collection.slug.current}`}
              className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {collection.image && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {collection.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {collection.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
