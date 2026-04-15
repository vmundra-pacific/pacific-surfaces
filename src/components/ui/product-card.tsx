"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage?: string;
    ribbons?: string[];
    collection?: { name: string; slug?: { current: string } };
  };
  index?: number;
}

const ribbonColors: Record<string, string> = {
  Patented: "bg-stone-900 text-white",
  "New Arrival": "bg-amber-600 text-white",
  "Eco Surface": "bg-emerald-700 text-white",
  "Luxury Drop": "bg-violet-800 text-white",
  "Top Color": "bg-rose-700 text-white",
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <Link
        href={`/products/${product.slug.current}`}
        className="group block"
      >
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-stone-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

          {/* View button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-medium tracking-wider uppercase px-5 py-2.5 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              View Details
            </span>
          </div>

          {/* Ribbons */}
          {product.ribbons && product.ribbons.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.ribbons.map((ribbon) => (
                <span
                  key={ribbon}
                  className={`inline-flex items-center px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full ${
                    ribbonColors[ribbon] || "bg-stone-800 text-white"
                  }`}
                >
                  {ribbon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors duration-300">
            {product.name}
          </h3>
          {product.collection && (
            <p className="text-xs text-stone-500 tracking-wide">
              {product.collection.name}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
