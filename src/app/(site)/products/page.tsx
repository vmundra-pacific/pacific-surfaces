import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { ProductGrid } from "@/components/sections/ProductGrid";

export const metadata: Metadata = {
  title: "Products — Pacific Surfaces",
  description:
    "Browse our complete range of 273+ premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, and wall cladding.",
};

export default async function ProductsPage() {
  const products = await client.fetch(allProductsQuery);

  return (
    <>
      <PageHeader
        badge="Our Surfaces"
        title="Explore the Collection"
        description="273+ premium surfaces engineered for beauty, crafted for durability. Find the perfect slab for your space."
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <ProductGrid products={products} />
      </section>
    </>
  );
}
