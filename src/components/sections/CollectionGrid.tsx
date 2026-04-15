"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: string;
  productCount: number;
}

export function CollectionGrid({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-stone-400 py-24 text-center text-lg font-light"
      >
        Collections are being curated. Check back soon.
      </motion.p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection, index) => (
        <motion.div
          key={collection._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: (index % 3) * 0.1,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          <Link
            href={`/collections/${collection.slug.current}`}
            className="group block relative rounded-2xl overflow-hidden bg-stone-100"
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden">
              {collection.image ? (
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
              )}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-light text-white tracking-wide">
                    {collection.name}
                  </h2>
                  <p className="mt-1 text-xs text-white/60 tracking-wide">
                    {collection.productCount} surfaces
                  </p>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full group-hover:bg-white/20 transition-colors duration-300">
                  <ArrowRight className="w-4 h-4 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
