import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { GranitesContent } from "@/components/sections/GranitesContent";
import { groq } from "next-sanity";

export const metadata: Metadata = {
  title: "Premium Natural Granite Collection | Pacific Surfaces",
  description:
    "Explore our premium natural granite slabs and finishes. Each piece displays legendary stories and timeless textures of nature.",
};

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
  finishes?: string[];
}

export default async function GranitesPage() {
  const granitesQuery = groq`
    *[_type == "product" && productType in ["granite-slab", "granite-finish"]] | order(name asc) {
      _id,
      name,
      slug,
      "mainImage": mainImage.asset->url,
      ribbons,
      collection->{name, slug},
      finishes
    }
  `;

  const products = await client.fetch<Product[]>(granitesQuery);

  return <GranitesContent products={products} />;
}
