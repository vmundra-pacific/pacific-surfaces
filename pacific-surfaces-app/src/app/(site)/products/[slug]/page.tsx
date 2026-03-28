import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery, allProductsQuery } from "@/sanity/lib/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await client.fetch(productBySlugQuery, { slug });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || `${product.name} — Pacific Surfaces`,
    description:
      product.seoDescription ||
      `Discover ${product.name} from Pacific Surfaces. Premium quartz and granite surfaces for modern spaces.`,
    keywords: product.seoKeywords,
  };
}

export async function generateStaticParams() {
  const products = await client.fetch(
    `*[_type == "product"]{ slug }`
  );
  return products.map((product: { slug: { current: string } }) => ({
    slug: product.slug.current,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await client.fetch(productBySlugQuery, { slug });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        {" / "}
        <Link href="/products" className="hover:text-gray-700">
          Products
        </Link>
        {" / "}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {product.mainImage && (
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.mainImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {product.gallery?.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {product.gallery.map((url: string, i: number) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={url}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          {product.ribbons?.length > 0 && (
            <div className="flex gap-2 mb-4">
              {product.ribbons.map((ribbon: string) => (
                <span
                  key={ribbon}
                  className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                >
                  {ribbon}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product.collection && (
            <p className="mt-2 text-gray-500">{product.collection.name}</p>
          )}

          {/* Specs */}
          <div className="mt-8 space-y-4 border-t pt-6">
            {product.size && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Size</dt>
                <dd className="mt-1 text-gray-900">{product.size}</dd>
              </div>
            )}
            {product.finishes?.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Available Finishes
                </dt>
                <dd className="mt-1 flex gap-2 flex-wrap">
                  {product.finishes.map((f: string) => (
                    <span
                      key={f}
                      className="rounded-full border px-3 py-1 text-sm capitalize"
                    >
                      {f}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {product.thickness?.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Thickness
                </dt>
                <dd className="mt-1 text-gray-900">
                  {product.thickness.join(", ")}
                </dd>
              </div>
            )}
            {product.application?.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Application
                </dt>
                <dd className="mt-1 flex gap-2 flex-wrap">
                  {product.application.map((a: string) => (
                    <span
                      key={a}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize"
                    >
                      {a.replace("-", " ")}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map(
              (rp: { _id: string; name: string; slug: { current: string }; mainImage: string }) => (
                <Link
                  key={rp._id}
                  href={`/products/${rp.slug.current}`}
                  className="group"
                >
                  {rp.mainImage && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={rp.mainImage}
                        alt={rp.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {rp.name}
                  </p>
                </Link>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
