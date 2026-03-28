import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pacific Surfaces — Premium Quartz & Granite Surfaces",
  description:
    "Discover premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, flooring, and wall cladding. Engineered for beauty and durability.",
  keywords: [
    "quartz slabs",
    "granite surfaces",
    "kitchen countertops",
    "bathroom vanities",
    "premium surfaces",
    "Pacific Surfaces",
  ],
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Surfaces That Define Luxury
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Premium quartz and granite surfaces crafted for modern living.
              From kitchen countertops to statement walls, discover the perfect
              surface for your space.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/products"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Explore Products
              </Link>
              <Link
                href="/collections"
                className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Preview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Our Collections
          </h2>
          <p className="mt-4 text-gray-600">
            Explore our curated collections of quartz, granite, and
            semi-precious surfaces.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Chromia Collection",
                desc: "Bold colors and striking patterns",
                href: "/collections/chromia",
              },
              {
                name: "Kosmic Collection",
                desc: "Inspired by celestial beauty",
                href: "/collections/kosmic",
              },
              {
                name: "Granite Finishes",
                desc: "Natural textures, engineered precision",
                href: "/collections/granite-finishes",
              },
            ].map((collection) => (
              <Link
                key={collection.name}
                href={collection.href}
                className="group relative overflow-hidden rounded-lg bg-gray-100 p-8 hover:bg-gray-200 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {collection.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {collection.desc}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-gray-900 group-hover:underline">
                  Browse Collection &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pacific */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
            Why Pacific Surfaces?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Premium Quality",
                desc: "Engineered with the finest materials for lasting beauty.",
              },
              {
                title: "273+ Designs",
                desc: "The widest range of quartz and granite surfaces in India.",
              },
              {
                title: "Patented Textures",
                desc: "Exclusive finishes you won't find anywhere else.",
              },
              {
                title: "Expert Support",
                desc: "From selection to installation, we're with you.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
