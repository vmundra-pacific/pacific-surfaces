import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload as reactPreload } from "react-dom";
import { client } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { ProductDetail } from "@/components/sections/ProductDetail";
import { zoomImageUrl } from "@/lib/zoom-image";

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
  const products = await client.fetch(`*[_type == "product"]{ slug }`);
  return products.map((product: { slug: { current: string } }) => ({
    slug: product.slug.current,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await client.fetch(productBySlugQuery, { slug });

  if (!product) notFound();

  // INITIAL-LOAD ZOOM: emit a high-priority <link rel="preload"
  // as="image"> for the slab image during SSR. The slab is the
  // image the page lands on, and it's the only one the magnifier
  // pans, so we want the browser fetching it the instant the HTML
  // hits — in parallel with the JS bundle. By the time React
  // hydrates and the user can hover, the slab is in cache.
  // Other images (close-ups, room scenes) lazy-load on demand.
  if (product.mainImage) {
    reactPreload(zoomImageUrl(product.mainImage), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return <ProductDetail product={product} />;
}
