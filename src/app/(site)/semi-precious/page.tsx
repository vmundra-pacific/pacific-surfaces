import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { SemiPreciousContent } from "@/components/sections/SemiPreciousContent";

export const metadata: Metadata = {
  title: "Semi-Precious Stone Surfaces | Pacific Group",
  description:
    "Discover the rarest semi-precious stone surfaces. True jewels of nature that transform interiors with unparalleled elegance and beauty.",
};

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

export default async function SemiPreciousPage() {
  const products = await client.fetch<Product[]>(
    `*[_type == "product" && productType == "semi-precious"] | order(name asc) {
      _id,
      name,
      slug,
      "mainImage": mainImage.asset->url,
      ribbons,
      collection->{name, slug}
    }`
  );

  return <SemiPreciousContent products={products} />;
}
