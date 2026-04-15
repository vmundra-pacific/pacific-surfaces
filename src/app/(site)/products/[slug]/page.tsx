import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { ProductDetail } from "@/components/sections/ProductDetail";

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

  return <ProductDetail product={product} />;
}
