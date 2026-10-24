import { Metadata } from "next";
import { freshClient } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/lib/queries";
import { EcosurfacesContent } from "@/components/sections/EcosurfacesContent";

export const metadata: Metadata = {
  title: "Ecosurfaces — Safe, Sustainable & Stunning | Pacific Surfaces",
  description:
    "Ecosurfaces: low silica engineered surfaces from Pacific Surfaces, for safer fabrication and installation.",
  alternates: { canonical: "/ecosurfaces" },
};

// Served from the cache and rebuilt at most once a minute, so Sanity
// edits show within 60 s (2026-10-22: with revalidate = 0 every visit
// waited ~1.3 s for a fresh render, failing the phone Core Web Vitals).
export const revalidate = 60;

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
