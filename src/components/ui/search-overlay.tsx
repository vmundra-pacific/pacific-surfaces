"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { sanityImg } from "@/lib/sanity-img";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  _id: string;
  name: string;
  slug: { current: string } | string;
  mainImage?: string | null;
  collectionName?: string | null;
}

const quickLinks = [
  { name: "Products", href: "/products" },
  // "Collections" shortcut removed — the /collections URL space was
  // retired in favor of /products/[category]/[slug] (see redirects in
  // next.config.ts) and the shortcut was leading to the legacy bounce.
  // Canonical category URLs — the bare /ecosurfaces and /granites
  // paths are 301-redirected in next.config.ts; link direct instead.
  { name: "Ecosurfaces", href: "/products/ecosurfaces" },
  { name: "Granites", href: "/products/granites" },
  { name: "Contact", href: "/contact" },
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  /* Lock body scroll while the overlay is open — same pattern as the
     mobile menu — so the page underneath doesn't scroll behind it. */
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* Debounced search against the API route */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const slugStr = useCallback(
    (s: { current: string } | string) =>
      typeof s === "string" ? s : s.current,
    []
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-[#112732]/98 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center pt-[15vh] min-h-screen px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-pacific-mid hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Search input */}
            <div className="w-full max-w-2xl mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative"
              >
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 text-pacific-mid" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search surfaces, collections…"
                  className="w-full bg-transparent text-3xl font-light tracking-wide text-white placeholder-pacific-mid/50 border-b-2 border-white/15 pb-4 pl-10 outline-none transition-all duration-300 focus:border-white/40"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-pacific-mid hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            </div>

            {/* Search results */}
            {query.trim() && (
              <div className="w-full max-w-2xl mb-12">
                {loading && (
                  <div className="text-pacific-mid text-sm animate-pulse">
                    Searching…
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-pacific-mid mb-3">
                      {results.length} result{results.length !== 1 ? "s" : ""}
                    </div>
                    {results.slice(0, 8).map((r) => (
                      <Link
                        key={r._id}
                        href={`/products/${slugStr(r.slug)}`}
                        onClick={onClose}
                        className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-white/5"
                      >
                        {r.mainImage ? (
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            <Image
                              src={
                                sanityImg(r.mainImage, { w: 120 }) ??
                                r.mainImage
                              }
                              alt={r.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-base group-hover:text-white truncate">
                            {r.name}
                          </div>
                          {r.collectionName && (
                            <div className="text-xs text-pacific-mid mt-0.5">
                              {r.collectionName}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-pacific-mid opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    ))}

                    {results.length > 8 && (
                      <Link
                        href={`/products?q=${encodeURIComponent(query.trim())}`}
                        onClick={onClose}
                        className="mt-2 text-sm text-pacific-mid hover:text-white transition-colors text-center"
                      >
                        View all {results.length} results →
                      </Link>
                    )}
                  </div>
                )}

                {!loading &&
                  results.length === 0 &&
                  query.trim().length > 1 && (
                    <div className="text-center py-8">
                      <div className="text-pacific-mid text-sm">
                        No surfaces found for &ldquo;{query.trim()}&rdquo;
                      </div>
                      <Link
                        href="/products"
                        onClick={onClose}
                        className="mt-3 inline-block text-sm text-white/70 hover:text-white transition-colors"
                      >
                        Browse all products →
                      </Link>
                    </div>
                  )}
              </div>
            )}

            {/* Quick links — shown when no query */}
            {!query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 text-center"
              >
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="relative text-pacific-mid hover:text-white transition-colors duration-300 group text-sm font-light tracking-wide uppercase"
                    >
                      {link.name}
                      <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
