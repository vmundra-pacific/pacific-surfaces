import { Metadata } from "next";
import { freshClient } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/lib/queries";
import { EcosurfacesContent } from "@/components/sections/EcosurfacesContent";

export const metadata: Metadata = {
  title: "Ecosurfaces — Safe, Sustainable & Stunning | Pacific Surfaces",
  description:
    "Discover our revolutionary low and zero silica engineered quartz surfaces. Safe, sustainable, and beautifully crafted.",
  alternates: { canonical: "/ecosurfaces" },
};

// Bypass Next's data cache so toggling the Eco Surface ribbon in Sanity
// reflects on the page on the next request rather than after a deploy.
export const revalidate = 0;

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons?: string[];
  collection?: { name: string; slug: { current: string } };
}

export default async function EcosurfacesPage() {
  const products = await freshClient.fetch<Product[]>(allProductsQuery);

  // Filter products with the "Eco Surface" ribbon client-side. We
  // also tolerate "EcoSurface" / "Eco Surfaces" / "eco surface" in case
  // the editor toggles a slightly different label so a typo on the
  // Sanity side doesn't make the page silently empty.
  const isEco = (r: string) =>
    r.toLowerCase().replace(/\s+/g, "") === "ecosurface" ||
    r.toLowerCase().replace(/\s+/g, "") === "ecosurfaces";
  const ecoProducts = products.filter(
    (product) => product.ribbons && product.ribbons.some(isEco)
  );

  return <EcosurfacesContent products={ecoProducts} />;
}
