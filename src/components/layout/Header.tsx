"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/ui/search-overlay";

const navigation = [
  { name: "About", href: "/about" },
  {
    name: "Products",
    href: "/products",
    children: [
      { name: "Quartz Surfaces", href: "/products" },
      { name: "Exotic Collection", href: "/collections" },
      { name: "Semi-Precious Stones", href: "/semi-precious" },
      { name: "Kosmic Collection", href: "/collections/kosmic-collection" },
      { name: "Nebula Collection", href: "/collections/nebula-collection" },
      { name: "Centrepiece Couture", href: "/collections/centrepiece-couture" },
      { name: "Integra (Sinks)", href: "/sinks" },
      { name: "Fab Creations", href: "/products" },
      { name: "Ecosurfaces", href: "/ecosurfaces" },
      { name: "Granites", href: "/granites" },
      { name: "Natural Stone Finishes", href: "/granites" },
      { name: "All Products", href: "/products" },
    ],
  },
  { name: "Resources", href: "/resources" },
  { name: "Blog", href: "/blog" },
  { name: "Sustainability", href: "/sustainability" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

interface NavItem {
  name: string;
  href: string;
  children?: Array<{ name: string; href: string }>;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-stone-100 shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span
                className={cn(
                  "text-lg font-semibold tracking-[0.15em] transition-colors duration-300",
                  scrolled ? "text-stone-900" : "text-white"
                )}
              >
                PACIFIC
              </span>
              <span
                className={cn(
                  "text-lg font-light tracking-[0.15em] transition-colors duration-300",
                  scrolled ? "text-stone-400" : "text-stone-300"
                )}
              >
                SURFACES
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex md:items-center md:gap-x-10">
              {navigation.map((item: NavItem) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 py-2",
                      scrolled
                        ? "text-stone-500 hover:text-stone-900"
                        : "text-stone-300 hover:text-white"
                    )}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
                  </Link>

                  {/* Dropdown menu for Products */}
                  {item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full pt-4 invisible group-hover:visible"
                    >
                      <div
                        className={cn(
                          "bg-white rounded-2xl shadow-lg overflow-hidden min-w-max border border-stone-100",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        )}
                      >
                        {item.children.map((child, idx) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "block px-6 py-3.5 text-sm font-light tracking-wide text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-200",
                              "border-b border-stone-100 last:border-b-0",
                              scrolled ? "" : ""
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA + Search + Mobile toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "hidden sm:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                  scrolled
                    ? "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                    : "text-stone-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <Link
                href="/contact"
                className={cn(
                  "hidden sm:inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium tracking-[0.1em] uppercase transition-all duration-300",
                  scrolled
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
                )}
              >
                Get a Quote
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  scrolled ? "text-stone-900" : "text-white"
                )}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-stone-950/95 backdrop-blur-xl md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8 px-6"
            >
              {navigation.map((item: NavItem, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-3xl font-light tracking-tight text-white hover:text-stone-300 transition-colors"
                  >
                    {item.name}
                  </Link>

                  {/* Mobile submenu for Products */}
                  {item.children && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.22 + i * 0.06 }}
                      className="flex flex-col items-center gap-3 mt-4"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm font-light tracking-wide text-stone-300 hover:text-white transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => {
                  setSearchOpen(true);
                  setMobileOpen(false);
                }}
                className="md:hidden text-stone-300 hover:text-white transition-colors mt-4"
              >
                <Search className="w-6 h-6" />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wider uppercase bg-white text-stone-900"
                >
                  Get a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
