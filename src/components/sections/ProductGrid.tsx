"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage: string;
  price: { amount: number; currency: string };
  ribbons: string[];
  collection: { name: string; slug: { current: string } };
  finishes: string[];
  application: string[];
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedRibbon, setSelectedRibbon] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique collections and ribbons
  const collections = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      if (p.collection?.name) names.add(p.collection.name);
    });
    return Array.from(names).sort();
  }, [products]);

  const ribbons = useMemo(() => {
    const names = new Set<string>();
    products.forEach((p) => {
      p.ribbons?.forEach((r) => names.add(r));
    });
    return Array.from(names).sort();
  }, [products]);

  // Filter products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCollection =
        selectedCollection === "all" ||
        p.collection?.name === selectedCollection;
      const matchesRibbon =
        selectedRibbon === "all" ||
        p.ribbons?.includes(selectedRibbon);
      return matchesSearch && matchesCollection && matchesRibbon;
    });
  }, [products, search, selectedCollection, selectedRibbon]);

  const hasActiveFilters =
    search || selectedCollection !== "all" || selectedRibbon !== "all";

  return (
    <div>
      {/* Search + Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search surfaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all ${
              showFilters || hasActiveFilters
                ? "bg-stone-900 text-white"
                : "bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-100">
                {/* Collection Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCollection("all")}
                    className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                      selectedCollection === "all"
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    All Collections
                  </button>
                  {collections.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCollection(c)}
                      className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                        selectedCollection === c
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Ribbon Filter */}
                {ribbons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 w-full">
                    <button
                      onClick={() => setSelectedRibbon("all")}
                      className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                        selectedRibbon === "all"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      All Types
                    </button>
                    {ribbons.map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRibbon(r)}
                        className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                          selectedRibbon === r
                            ? "bg-stone-900 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCollection("all");
                      setSelectedRibbon("all");
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium tracking-wide text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-stone-400 tracking-wide uppercase mb-6"
      >
        {filtered.length} {filtered.length === 1 ? "surface" : "surfaces"} found
      </motion.p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center"
        >
          <p className="text-stone-400 text-lg font-light">
            No surfaces match your criteria.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCollection("all");
              setSelectedRibbon("all");
            }}
            className="mt-4 text-sm text-stone-600 underline hover:text-stone-900 transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
