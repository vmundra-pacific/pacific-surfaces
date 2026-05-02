"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
      // Single-segment URLs under /products. Each maps to a config
      // entry in src/app/(site)/products/_lib/category.ts —
      // CATEGORY_PAGES — which controls the hero video, copy, and
      // which Sanity collection / productType to scope the catalogue
      // to. Order mirrors the footer: Quartz → Vision → Granite →
      // Semi-Precious → … → All Products at the bottom.
      { name: "Quartz Surfaces", href: "/products/quartz" },
      // Vision uses the existing Chromia collection page, which is
      // already wired with the Vision Series video via
      // COLLECTION_HERO in /products/[slug]/[item]/page.tsx.
      { name: "Vision", href: "/products/quartz/chromia" },
      { name: "Granites", href: "/products/granites" },
      { name: "Semi-Precious Stones", href: "/products/semi-precious" },
      { name: "Exotic Collection", href: "/products/exotic" },
      {
        name: "Centrepiece Couture",
        href: "/products/centrepiece-couture",
      },
      { name: "Integra (Sinks)", href: "/products/integra" },
      // Fab Creations + Ecosurfaces both hidden until each collection
      // has at least one published product. Re-enable by uncommenting
      // the matching line below.
      // { name: "Fab Creations", href: "/products/fab-creations" },
      // { name: "Ecosurfaces", href: "/products/ecosurfaces" },
      {
        name: "Natural Stone Finishes",
        href: "/products/natural-stone-finishes",
      },
      // Vanity is its own top-level category — not nested under
      // Centrepiece Couture. Sits right above the All Products
      // catch-all so it reads as a discrete category alongside
      // Quartz / Granites / Semi-Precious / etc.
      { name: "Vanity", href: "/products/vanity" },
      // All Products owns the bare /products path; lives at the
      // bottom as a catch-all for users browsing the full catalogue.
      { name: "All Products", href: "/products" },
    ],
  },
  { name: "Resources", href: "/resources" },
  { name: "Blog", href: "/blog" },
  { name: "Sustainability", href: "/sustainability" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

// Desktop nav drops "Contact" because the "Get a Quote" CTA already
// routes there — listing it twice was crowding the row. Mobile menu
// still uses the full `navigation` array.
const desktopNavigation = navigation;

interface NavItem {
  name: string;
  href: string;
  children?: Array<{ name: string; href: string }>;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open so the page
  // beneath doesn't scroll under the user's finger when they swipe
  // the menu list. Restored on close. Mobile-only; on desktop the
  // mobile panel is `md:hidden` so this effect runs but mobileOpen
  // never goes true.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Hide the global site header on the visualizer route — that page has
  // its own dedicated workspace toolbar and the floating site nav was
  // overlapping it. Same treatment applied to the Footer.
  if (pathname?.startsWith("/visualize")) return null;

  // LOGO swap rule — three layered variants picked by context.
  //
  //   1. monogram-dark.png  (Inverted — black tile + light mark)
  //      Shown when the header is TRANSPARENT and sitting over the
  //      homepage's light marble hero. Black tile pops on the bright
  //      marble where a white-on-transparent mark would disappear.
  //
  //   2. monogram-navy.png  (Dark Navy bg variant)
  //      Shown when the header has SCROLLED — i.e. its own dark navy
  //      background is active. This file is tuned specifically for
  //      that surface so the mark reads cleanly without feeling
  //      stamped or floating.
  //
  //   3. monogram-light.png  (White Logo on transparent)
  //      Shown on every other page at the top of scroll — pages whose
  //      heroes have darker imagery where a white mark contrasts.
  //
  // The three <Image>s below are stacked at the same coordinates;
  // only the matching opacity flips to 100. Crossfades are smooth.
  const isHomepage = pathname === "/";
  const monogramVariant: "dark" | "navy" | "light" = scrolled
    ? "navy"
    : isHomepage
      ? "dark"
      : "light";

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          // Scrolled state uses the same dark navy as the page
          // sections (#112732) so the header reads as a continuation
          // of the section underneath rather than a contrasting bar.
          // No bottom border or drop shadow — the seamless join is
          // the point; a divider would draw the eye to a fake edge.
          scrolled ? "bg-[#112732]/95 backdrop-blur-xl" : "bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-[1400px] px-6 lg:px-8" style={{ paddingLeft: "max(1.5rem, env(safe-area-inset-left))", paddingRight: "max(1.5rem, env(safe-area-inset-right))" }}>
          <div className="flex h-20 items-center justify-between">
            {/* Logo — monogram + wordmark.
                The monogram swaps based on header state so it always
                reads against whatever's behind it:
                  - scrolled (white bg)        → dark monogram
                  - not scrolled (dark hero)   → light/inverted monogram
                Cross-fade is handled by stacking both <Image>s in the
                same slot and toggling opacity, so neither flickers
                between renders. */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Monogram swaps on scroll:
                    - scrolled (white bg)        → dark/Inverted monogram
                    - not scrolled (dark hero)   → light/White Logo monogram
                    - homepage hero override     → always Inverted
                  Stacked <Image>s + opacity crossfade so neither flickers
                  between renders. */}
              <span className="relative w-9 h-9 shrink-0">
                <Image
                  src="/logos/monogram-dark.png"
                  alt="Pacific Surfaces logo"
                  fill
                  sizes="36px"
                  priority
                  className={cn(
                    "object-contain transition-opacity duration-300",
                    monogramVariant === "dark" ? "opacity-100" : "opacity-0"
                  )}
                />
                <Image
                  src="/logos/monogram-navy.png"
                  alt=""
                  fill
                  sizes="36px"
                  priority
                  aria-hidden="true"
                  className={cn(
                    "object-contain transition-opacity duration-300",
                    monogramVariant === "navy" ? "opacity-100" : "opacity-0"
                  )}
                />
                <Image
                  src="/logos/monogram-light.png"
                  alt=""
                  fill
                  sizes="36px"
                  priority
                  aria-hidden="true"
                  className={cn(
                    "object-contain transition-opacity duration-300",
                    monogramVariant === "light" ? "opacity-100" : "opacity-0"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-lg font-semibold tracking-[0.15em] transition-colors duration-300",
                  // Both states are now dark backgrounds (transparent
                  // over hero, dark navy when scrolled) — wordmark
                  // stays white throughout.
                  "text-white"
                )}
              >
                PACIFIC
              </span>
              {/* SURFACES wordmark only shows at 2xl+ (≥1536px). On
                  Mac viewports (1280–1535) it pushed the nav row into
                  truncation — "About" was clipped into "ABO…". Keep
                  the brand stamp on truly wide screens; the monogram
                  + PACIFIC alone reads as the brand at smaller sizes. */}
              <span
                className={cn(
                  "hidden 2xl:inline text-lg font-light tracking-[0.15em] transition-colors duration-300",
                  "text-stone-300"
                )}
              >
                SURFACES
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-6 xl:gap-x-9">
              {desktopNavigation.map((item: NavItem) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative text-[11px] lg:text-[12px] xl:text-[13px] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-colors duration-300 py-2",
                      // Same colour treatment in both states now —
                      // header bg is dark in both cases.
                      "text-stone-300 hover:text-white"
                    )}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
                  </Link>

                  {/* Dropdown menu for Products */}
                  {item.children && (
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                      <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden min-w-max border border-stone-100">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-6 py-3.5 text-sm font-light tracking-wide text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-200 border-b border-stone-100 last:border-b-0"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA + Search + Mobile toggle */}
            <div className="flex items-center gap-2 lg:gap-2.5 xl:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(
                  "hidden sm:flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shrink-0",
                  // Dark in both states — same hover treatment.
                  "text-stone-300 hover:text-white hover:bg-white/10"
                )}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Visualizer pill only shows at 2xl+ (≥1536px). Below
                  that — i.e. every Mac viewport up to 16" Pro at
                  default scaling — the row gets crowded by the 6 nav
                  items and the Get-a-Quote pill, so we drop the
                  secondary CTA and surface it in the mobile menu and
                  homepage hero instead. The Get-a-Quote pill stays
                  visible at all desktop widths because it's the
                  primary conversion path. */}
              <Link
                href="/visualize"
                className={cn(
                  "hidden 2xl:inline-flex items-center gap-1.5 rounded-full px-4 lg:px-5 xl:px-6 py-2 text-[11px] lg:text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
                  scrolled
                    ? "bg-white text-[#112732] border border-transparent hover:bg-stone-100"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
                )}
              >
                Visualizer
                <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
              </Link>

              <Link
                href="/contact"
                className={cn(
                  "hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 lg:px-5 xl:px-6 py-2 text-[11px] lg:text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
                  // Scrolled now uses a solid white pill for max
                  // contrast against the dark navy header. Top of
                  // page keeps the translucent glass-pill style.
                  scrolled
                    ? "bg-white text-[#112732] border border-transparent hover:bg-stone-100"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
                )}
              >
                Get a Quote
                <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  // Always white now since both states are dark.
                  "text-white"
                )}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
            className="fixed inset-0 z-[60] bg-stone-950/95 backdrop-blur-xl lg:hidden overflow-y-auto overscroll-contain"
            onClick={() => setMobileOpen(false)}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(false);
              }}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full border border-white/15 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center min-h-full gap-8 py-24 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {navigation.map((item: NavItem, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex flex-col items-center text-center"
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
              {/* Mobile / non-2xl CTA pair. Get a Quote is the primary
                  pill (filled white). Visualizer sits next to it as a
                  ghost pill — Visualizer was removed from the header
                  row at all widths below 2xl, so this is now the only
                  way users on Mac-class viewports reach it from the
                  menu. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row items-center gap-3"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wider uppercase bg-white text-stone-900"
                >
                  Get a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/visualize"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wider uppercase border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Try Visualizer
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
