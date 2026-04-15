"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  ribbons: string[];
  collection: { name: string; slug: { current: string } };
}

export function CollectionProducts({
  products,
  collectionName,
}: {
  products: Product[];
  collectionName: string;
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 text-xs tracking-wide mb-10"
      >
        <Link
          href="/"
          className="text-stone-400 hover:text-stone-600 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <Link
          href="/collections"
          className="text-stone-400 hover:text-stone-600 transition-colors"
        >
          Collections
        </Link>
        <ChevronRight className="w-3 h-3 text-stone-300" />
        <span className="text-stone-900 font-medium">{collectionName}</span>
      </motion.nav>

      {/* Grid */}
      {products.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-stone-400 py-24 text-center text-lg font-light"
        >
          Products for this collection are being added.
        </motion.p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
