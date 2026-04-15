import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/lib/queries";
import { EcosurfacesContent } from "@/components/sections/EcosurfacesContent";

export const metadata: Metadata = {
  title: "Ecosurfaces — Safe, Sustainable & Stunning | Pacific Surfaces",
  description:
    "Discover our revolutionary low and zero silica engineered quartz surfaces. Safe, sustainable, and beautifully crafted.",
};

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

export default async function EcosurfacesPage() {
  const products = await client.fetch<Product[]>(allProductsQuery);

  // Filter products with "Eco Surface" ribbon client-side
  const ecoProducts = products.filter(
    (product) => product.ribbons && product.ribbons.includes("Eco Surface")
  );

  return <EcosurfacesContent products={ecoProducts} />;
}
