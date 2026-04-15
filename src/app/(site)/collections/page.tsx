import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allCollectionsQuery } from "@/sanity/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { CollectionGrid } from "@/components/sections/CollectionGrid";

export const metadata: Metadata = {
  title: "Collections — Pacific Surfaces",
  description:
    "Explore our curated collections of premium quartz, granite, and semi-precious surfaces.",
};

export default async function CollectionsPage() {
  const collections = await client.fetch(allCollectionsQuery);

  return (
    <>
      <PageHeader
        badge="Collections"
        title="Curated for Every Vision"
        description="From bold statements to subtle elegance — explore our curated families of premium surfaces."
        dark
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <CollectionGrid collections={collections} />
      </section>
    </>
  );
}
