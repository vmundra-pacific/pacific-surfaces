import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { SinksContent } from "@/components/sections/SinksContent";
import { groq } from "next-sanity";

export const metadata: Metadata = {
  title: "Integra Sinks — Pacific Quartz Sink Collection",
  description:
    "Discover seamless integrated sink designs from our premium Integra collection. Beautiful, durable quartz sinks for modern kitchens.",
  alternates: { canonical: "/sinks" },
};

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  price?: { amount: number; currency: string };
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

// Rebuilt at most once a minute, so Sanity edits show without a deploy.
export const revalidate = 60;

export default async function SinksPage() {
  const sinksQuery = groq`
    *[_type == "product" && productType == "quartz-sink"] | order(name asc) {
      _id,
      name,
      slug,
      "mainImage": mainImage.asset->url,
      price,
      ribbons,
      collection->{name, slug}
    }
  `;

  const products = await client.fetch<Product[]>(sinksQuery);

  return <SinksContent products={products} />;
}
