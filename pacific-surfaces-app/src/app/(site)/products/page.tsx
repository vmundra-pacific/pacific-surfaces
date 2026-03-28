import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Products — Pacific Surfaces",
  description:
    "Browse our complete range of 273+ premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, and wall cladding.",
};

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  price: { amount: number; currency: string };
  ribbons: string[];
  collection: { name: string; slug: { current: string } };
}

export default async function ProductsPage() {
  const products: Product[] = await client.fetch(allProductsQuery);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          All Products
        </h1>
        <p className="mt-2 text-gray-600">
          Explore our complete range of premium surfaces.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">
          Products are being imported. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
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
                {product.ribbons?.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {product.ribbons.map((ribbon) => (
                      <span
                        key={ribbon}
                        className="inline-flex items-center rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        {ribbon}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="font-semibold text-gray-900">{product.name}</h2>
                {product.collection && (
                  <p className="text-sm text-gray-500 mt-1">
                    {product.collection.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
