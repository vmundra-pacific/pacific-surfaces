"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/ui/search-overlay";

// PRODUCTS_CATEGORIES drives the Products mega-menu — five cards
// matching the Sidharth UI/UX deck exactly:
//   1) Quartz · 2) Natural Stone Finishes · 3) Vision ·
//   4) Granites · 5) Semi-Precious
//
// Vision is a sub-line of Quartz that lives at /products/quartz/chromia
// (the Chromia collection landing) — it has no top-level /products/vision
// route, so we thread `coloursHref` + `whatIsSlug` overrides through so
// the "<Vision> Colours" CTA lands on the Chromia page and "What is
// Vision" routes to /learn/what-is-vision (TOPIC_COPY entry exists).
type MegaCategory = {
  slug: string;
  name: string;
  tagline: string;
  /** Override — "<Cat> Colours" CTA target. Default `/products/[slug]`. */
  coloursHref?: string;
  /** Override — slug used to compose `/learn/what-is-[X]`. Default = slug. */
  whatIsSlug?: string;
};

const PRODUCTS_CATEGORIES: MegaCategory[] = [
  {
    slug: "quartz",
    name: "Quartz",
    tagline: "Engineered stone for everyday surfaces.",
  },
  {
    slug: "natural-stone-finishes",
    name: "Natural Stone Finishes",
    tagline: "Large-format facade and feature surfaces.",
  },
  {
    slug: "vision",
    name: "Vision",
    tagline: "Inlayered design quartz surfaces.",
    coloursHref: "/products/quartz/chromia",
  },
  {
    slug: "granites",
    name: "Granites",
    tagline: "Quarry-to-kitchen natural stone.",
  },
  {
    slug: "semi-precious",
    name: "Semi-Precious",
    tagline: "Hand-selected gemstone surfaces.",
  },
];

// PRODUCTS_APPLICATIONS — list of where each surface gets used, shown
// in the right-hand column of the Products mega sub-panel. Same list
// for every category (per editorial direction). All routes go to the
// /learn/[topic] dynamic stub which gracefully falls back for slugs
// that don't have explicit TOPIC_COPY entries yet.
const PRODUCTS_APPLICATIONS: { slug: string; label: string }[] = [
  { slug: "kitchen-countertops", label: "Kitchen Countertops" },
  { slug: "kitchen-sinks", label: "Kitchen Sinks" },
  { slug: "kitchen-cladding", label: "Kitchen Cladding" },
  { slug: "furniture", label: "Furniture" },
  { slug: "bathroom-countertops", label: "Bathroom Countertops" },
  { slug: "bathroom-sinks", label: "Bathroom Sinks" },
  { slug: "bathroom-cladding", label: "Bathroom Cladding" },
  { slug: "shower-trays", label: "Shower Trays" },
  { slug: "interior-cladding", label: "Interior Cladding" },
  { slug: "facades", label: "Facades" },
];

// SPACES_CATEGORIES — five rooms / environments where Pacific surfaces
// live. Mirrors the Products mega's structure: card click expands a
// sub-panel showing what's inside that space. Each "Browse <Space>"
// CTA routes to /learn/browse-<slug> — a stub page in the standard
// /learn/[topic] dynamic route with TOPIC_COPY copy. When proper
// per-space landing pages get built (likely /spaces/<slug>), update
// `coloursHref` to point at them and the rest of the mega keeps
// working unchanged.
const SPACES_CATEGORIES: MegaCategory[] = [
  {
    slug: "kitchens",
    name: "Kitchens",
    tagline: "Worktops, islands, and splashbacks.",
    coloursHref: "/learn/browse-kitchens",
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    tagline: "Vanity tops, sinks, and shower trays.",
    coloursHref: "/learn/browse-bathrooms",
  },
  {
    slug: "architecture",
    name: "Architecture",
    tagline: "Facades, cladding, and feature walls.",
    coloursHref: "/learn/browse-architecture",
  },
  {
    slug: "commercial",
    name: "Commercial",
    tagline: "Hospitality, retail, and workspaces.",
    coloursHref: "/learn/browse-commercial",
  },
  {
    slug: "outdoor",
    name: "Outdoor",
    tagline: "Pool surrounds, pavers, and outdoor kitchens.",
    coloursHref: "/learn/browse-outdoor",
  },
];

// SPACES_APPS_BY_SLUG — per-space application list. Routes go to the
// /learn/[topic] dynamic stub. The slugs picked here intentionally
// reuse PRODUCTS_APPLICATIONS where possible (kitchen-countertops,
// shower-trays, facades) so we don't fragment the topic copy.
const SPACES_APPS_BY_SLUG: Record<string, { slug: string; label: string }[]> = {
  kitchens: [
    { slug: "kitchen-countertops", label: "Kitchen Countertops" },
    { slug: "kitchen-sinks", label: "Kitchen Sinks" },
    { slug: "kitchen-islands", label: "Kitchen Islands" },
    { slug: "kitchen-cladding", label: "Kitchen Cladding" },
    { slug: "splashbacks", label: "Splashbacks" },
    { slug: "furniture", label: "Furniture" },
  ],
  bathrooms: [
    { slug: "bathroom-countertops", label: "Vanity Tops" },
    { slug: "bathroom-sinks", label: "Bathroom Sinks" },
    { slug: "shower-trays", label: "Shower Trays" },
    { slug: "bathroom-cladding", label: "Bathroom Cladding" },
    { slug: "bath-surrounds", label: "Bath Surrounds" },
  ],
  architecture: [
    { slug: "facades", label: "Facades" },
    { slug: "exterior-cladding", label: "Exterior Cladding" },
    { slug: "interior-cladding", label: "Interior Cladding" },
    { slug: "feature-walls", label: "Feature Walls" },
    { slug: "floor-panels", label: "Floor Panels" },
  ],
  commercial: [
    { slug: "reception-desks", label: "Reception Desks" },
    { slug: "bar-tops", label: "Bar Tops" },
    { slug: "tabletops", label: "Tabletops" },
    { slug: "commercial-cladding", label: "Wall Cladding" },
    { slug: "commercial-flooring", label: "Floor Tiles" },
  ],
  outdoor: [
    { slug: "outdoor-kitchens", label: "Outdoor Kitchens" },
    { slug: "pool-surrounds", label: "Pool Surrounds" },
    { slug: "pavers", label: "Pavers" },
    { slug: "garden-cladding", label: "Garden Cladding" },
  ],
};

const navigation = [
  { name: "About", href: "/about" },
  {
    name: "Products",
    href: "/products",
    // `mega: true` switches the desktop dropdown render from the
    // simple list to the full ProductsMegaMenu component. The legacy
    // children list is still used for the mobile menu (where a giant
    // grid wouldn't fit), so we keep the original entries below.
    mega: true,
    children: [
      { name: "Quartz Surfaces", href: "/products/quartz" },
      { name: "Vision", href: "/products/quartz/chromia" },
      { name: "Granites", href: "/products/granites" },
      { name: "Semi-Precious Stones", href: "/products/semi-precious" },
      { name: "Exotic Collection", href: "/products/exotic" },
      { name: "Centrepiece Couture", href: "/products/centrepiece-couture" },
      { name: "Integra (Sinks)", href: "/products/integra" },
      {
        name: "Natural Stone Finishes",
        href: "/products/natural-stone-finishes",
      },
      { name: "Vanity", href: "/products/vanity" },
      { name: "All Products", href: "/products" },
    ],
  },
  {
    name: "Spaces",
    href: "/spaces",
    // Spaces gets the same mega-menu treatment as Products — hover
    // opens a 5-card panel with the major room/environment types.
    // Click on the nav label still routes to /spaces (top-level
    // overview page), so keyboard users + folks with hover disabled
    // still reach the destination.
    mega: true,
    children: [
      { name: "Kitchens", href: "/spaces#kitchens" },
      { name: "Bathrooms", href: "/spaces#bathrooms" },
      { name: "Architecture", href: "/spaces#architecture" },
      { name: "Commercial", href: "/spaces#commercial" },
      { name: "Outdoor", href: "/spaces#outdoor" },
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
// still uses the full `navigation` array. Filtering here was the
// long-standing intent (per the original comment); without it, the
// row crowded enough that "PACIFIC SURFACES" was visually touching
// "ABOUT" once we added the Spaces nav item.
const desktopNavigation = navigation.filter((n) => n.name !== "Contact");

interface NavItem {
  name: string;
  href: string;
  mega?: boolean;
  children?: Array<{ name: string; href: string }>;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Mega-menu state.
  //  - `openMegaItem` — which top-level nav item's mega-menu is open
  //    ("Products" or "Spaces" or null). Drives header bg colour
  //    (navy whenever any mega is open) and which content renders
  //    inside the shared dropdown panel.
  //  - `activeMega` — which category card within the open mega has
  //    its sub-panel expanded.
  //  - `lastMegaItemRef` — last truthy `openMegaItem` value, used so
  //    the panel content stays correct while AnimatePresence runs
  //    its exit animation (during which `openMegaItem` is null).
  const [openMegaItem, setOpenMegaItem] = useState<string | null>(null);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMegaItemRef = useRef<string | null>(null);
  if (openMegaItem) lastMegaItemRef.current = openMegaItem;
  const renderMegaItem = openMegaItem ?? lastMegaItemRef.current;
  const megaOpen = openMegaItem !== null;

  const handleMegaEnter = (itemName: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // When user moves between two different mega triggers (Products
    // → Spaces or vice versa) the active card from the previous mega
    // is no longer relevant — reset so the new mega opens cleanly.
    if (openMegaItem !== itemName) {
      setActiveMega(null);
    }
    setOpenMegaItem(itemName);
  };
  const handleMegaLeave = () => {
    // 150 ms grace so moving the cursor across the small gap between
    // trigger Link and panel (or between cards in the panel) doesn't
    // snap-close the menu. Anything longer than that is a genuine
    // exit and the menu collapses + active card resets.
    closeTimerRef.current = setTimeout(() => {
      setOpenMegaItem(null);
      setActiveMega(null);
    }, 150);
  };

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

  // Auto-collapse the mega-menu on any route change. Without this,
  // clicking a sub-section link ("What is Quartz", "Maintenance",
  // a Cat Colours CTA, etc.) routes to the new page but leaves the
  // dropdown panel rendered over it because the cursor never left
  // the panel. Watching `pathname` is route-source-agnostic — covers
  // mega-menu links, footer-strip links, mobile menu, anywhere.
  useEffect(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenMegaItem(null);
    setActiveMega(null);
    setMobileOpen(false);
  }, [pathname]);

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          // Three states:
          //  - megaOpen: solid navy, no /95 — matches the dropdown
          //    below it so the two read as one continuous block.
          //  - scrolled (no menu): slightly translucent navy + blur
          //    so page content shows faintly through.
          //  - top of page (no menu, no scroll): gradient scrim that
          //    keeps the logo legible over both bright marble heroes
          //    and dark video heroes.
          megaOpen
            ? "bg-[#112732] backdrop-blur-xl"
            : scrolled
              ? "bg-[#112732]/95 backdrop-blur-xl"
              : "bg-gradient-to-b from-black/45 via-black/20 to-transparent backdrop-blur-[2px]"
        )}
      >
        <nav
          className="mx-auto max-w-[1400px] px-6 lg:px-8"
          style={{
            paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
            paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          {/* gap-x guarantees a minimum breathing room between logo,
              nav, and CTAs even when justify-between would otherwise
              squeeze them together (PACIFIC SURFACES + ABOUT were
              previously touching at wide viewports because the row
              filled fully). */}
          <div className="flex h-20 items-center justify-between gap-x-6 xl:gap-x-10 2xl:gap-x-14">
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
                <div
                  key={item.name}
                  className="relative group"
                  // Hover handlers fire for any mega item (Products
                  // or Spaces). The handler takes `item.name` so the
                  // shared mega-menu panel knows which content to
                  // render. Header bg flips to navy the moment the
                  // cursor enters either trigger.
                  onMouseEnter={
                    item.mega ? () => handleMegaEnter(item.name) : undefined
                  }
                  onMouseLeave={item.mega ? handleMegaLeave : undefined}
                >
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

                  {/* Dropdown menu for Products — mega-menu variant
                      (5 category cards with sub-section links inside
                      each card) when `mega: true`; falls back to the
                      legacy plain link list for any non-mega item with
                      children.

                      Positioning: `fixed inset-x-0 top-20` so the
                      panel spans edge-to-edge across the viewport
                      (per editorial direction — full-width mega-menu
                      like the major surface brands). The trigger
                      remains the per-item `.group:hover`, so the
                      hover state still flips the visibility classes
                      below even though the panel is rendered out of
                      the per-item box. Content is then constrained
                      to a max-w container inside the white panel. */}
                  {item.mega ? (
                    // Silestone-style mega-menu:
                    //  - Hover Products → 5 cards appear (image + name
                    //    + tagline only, no sub-section list).
                    //  - Click a card image → that card "expands" and
                    //    a sub-panel slides in below the card row.
                    //  - Click same card again → collapse.
                    //  - Click another card → switch.
                    //  - Move cursor away → 150 ms grace then close.
                    //
                    // Animation handled by Framer Motion AnimatePresence
                    // so open + close are independently tuned: open
                    // is a brisk drop, close is a slightly longer
                    // ease-out so the retract feels deliberate rather
                    // than snapped. before:* pseudo provides a hover
                    // bridge between the trigger Link and the panel.
                    <AnimatePresence>
                      {openMegaItem === item.name && (
                        <motion.div
                          key={`mega-panel-${item.name}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.32,
                              ease: [0.25, 0.4, 0.25, 1],
                            },
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                            transition: {
                              duration: 0.4,
                              ease: [0.4, 0, 0.2, 1],
                            },
                          }}
                          onMouseEnter={() => handleMegaEnter(item.name)}
                          onMouseLeave={handleMegaLeave}
                          className="fixed inset-x-0 top-20 z-50 bg-[#112732] before:content-[''] before:absolute before:inset-x-0 before:-top-4 before:h-4"
                        >
                          {/* Brand navy panel — same #112732 used in the
                          header (scrolled state) and the dark sections
                          of the homepage. Border removed so it reads
                          as one continuous navy block with the header
                          above; shadow stays for the panel's bottom
                          edge against page content beneath. */}
                          <div className="bg-[#112732] shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
                            <div className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8">
                              {/* Cards row — each card is a <button>
                              that toggles its sub-panel. Active card
                              gets a subtle highlight ring. */}
                              <div className="grid grid-cols-5 gap-4">
                                {(item.name === "Spaces"
                                  ? SPACES_CATEGORIES
                                  : PRODUCTS_CATEGORIES
                                ).map((cat) => {
                                  const isActive = activeMega === cat.slug;
                                  return (
                                    <button
                                      key={cat.slug}
                                      type="button"
                                      onClick={() =>
                                        setActiveMega(
                                          isActive ? null : cat.slug
                                        )
                                      }
                                      className={cn(
                                        "flex flex-col text-left rounded-lg p-3 transition-colors",
                                        isActive
                                          ? "bg-white/[0.06] ring-1 ring-white/15"
                                          : "hover:bg-white/[0.04]"
                                      )}
                                    >
                                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-stone-300 via-stone-200 to-stone-400">
                                        <div className="absolute inset-0 flex items-center justify-center text-stone-500">
                                          <span className="text-[10px] font-medium tracking-[0.3em] uppercase">
                                            [ {cat.name.toLowerCase()} ]
                                          </span>
                                        </div>
                                      </div>
                                      <div className="px-1 pt-4 pb-1">
                                        <div className="flex items-center justify-between gap-1.5">
                                          <span className="text-lg font-medium text-white tracking-tight">
                                            {cat.name}
                                          </span>
                                          <ChevronDown
                                            className={cn(
                                              "w-4 h-4 text-stone-400 transition-transform shrink-0",
                                              isActive ? "rotate-180" : ""
                                            )}
                                          />
                                        </div>
                                        <div className="text-sm font-light text-stone-400 leading-snug mt-1">
                                          {cat.tagline}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Expanded sub-panel — Framer Motion slide
                              + fade so opening / closing the panel
                              feels physical instead of snapping. Key
                              is constant ("mega-sub") so the wrapper
                              stays mounted and only height/opacity
                              animate; switching between cards swaps
                              content in place without re-running the
                              expand animation. */}
                              <AnimatePresence initial={false}>
                                {activeMega &&
                                  (() => {
                                    const isSpaces = item.name === "Spaces";
                                    const cats = isSpaces
                                      ? SPACES_CATEGORIES
                                      : PRODUCTS_CATEGORIES;
                                    const active = cats.find(
                                      (c) => c.slug === activeMega
                                    );
                                    if (!active) return null;
                                    const apps = isSpaces
                                      ? (SPACES_APPS_BY_SLUG[active.slug] ?? [])
                                      : PRODUCTS_APPLICATIONS;
                                    return (
                                      <motion.div
                                        key="mega-sub"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                          duration: 0.32,
                                          ease: [0.25, 0.4, 0.25, 1],
                                        }}
                                        style={{ overflow: "hidden" }}
                                      >
                                        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8">
                                          {/* About / Explore column —
                                          Products gets material 101
                                          links (What is / Maintenance /
                                          Warranty); Spaces gets
                                          inspiration / project / design
                                          notes. */}
                                          <div className="lg:col-span-3">
                                            <h4 className="text-[11px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-4">
                                              {isSpaces
                                                ? `Explore ${active.name}`
                                                : `About ${active.name}`}
                                            </h4>
                                            <ul className="space-y-2.5">
                                              {isSpaces ? (
                                                <>
                                                  <li>
                                                    <Link
                                                      href={`/learn/${active.slug}-inspiration`}
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      Inspiration
                                                    </Link>
                                                  </li>
                                                  <li>
                                                    <Link
                                                      href={`/learn/${active.slug}-projects`}
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      Project Gallery
                                                    </Link>
                                                  </li>
                                                  <li>
                                                    <Link
                                                      href="/learn/design-notes"
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      Design Notes
                                                    </Link>
                                                  </li>
                                                </>
                                              ) : (
                                                <>
                                                  <li>
                                                    <Link
                                                      href={`/learn/what-is-${active.whatIsSlug ?? active.slug}`}
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      What is {active.name}?
                                                    </Link>
                                                  </li>
                                                  <li>
                                                    <Link
                                                      href="/learn/maintenance"
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      Maintenance
                                                    </Link>
                                                  </li>
                                                  <li>
                                                    <Link
                                                      href="/learn/warranty"
                                                      className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      Warranty
                                                    </Link>
                                                  </li>
                                                </>
                                              )}
                                            </ul>
                                          </div>
                                          {/* Applications / Inside column */}
                                          <div className="lg:col-span-6">
                                            <h4 className="text-[11px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-4">
                                              {isSpaces
                                                ? `Inside ${active.name}`
                                                : `${active.name} Applications`}
                                            </h4>
                                            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                              {apps.map((app) => (
                                                <li key={app.slug}>
                                                  <Link
                                                    href={`/learn/${app.slug}`}
                                                    className="text-base font-light text-stone-300 hover:text-white transition-colors"
                                                  >
                                                    {app.label}
                                                  </Link>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                          {/* CTA — "<Cat> Colours" for
                                          Products (links to catalogue
                                          page); "Browse <Space>" for
                                          Spaces (links to the most
                                          relevant catalogue surface
                                          for that room type). */}
                                          <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-end">
                                            <Link
                                              href={
                                                active.coloursHref ??
                                                `/products/${active.slug}`
                                              }
                                              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-white text-stone-900 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
                                            >
                                              {isSpaces
                                                ? `Browse ${active.name}`
                                                : `${active.name} Colours`}
                                              <ArrowRight className="w-4 h-4" />
                                            </Link>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })()}
                              </AnimatePresence>
                            </div>
                            {/* Footer strip — Products-only secondary nav
                            for the categories not surfaced as hero
                            cards (Exotic, Integra, Vanity) plus the
                            "All Products" CTA. Hidden for the Spaces
                            mega since none of those slugs apply
                            there. */}
                            {item.name !== "Spaces" ? (
                              <div className="border-t border-white/10 bg-[#0d1f29]">
                                <div className="mx-auto max-w-[1400px] px-6 lg:px-8 flex items-center justify-between py-4">
                                  <div className="flex flex-wrap gap-x-7 gap-y-2">
                                    <Link
                                      href="/products/exotic"
                                      className="text-[12px] font-medium tracking-[0.2em] uppercase text-stone-300 hover:text-white"
                                    >
                                      Exotic
                                    </Link>
                                    <Link
                                      href="/products/integra"
                                      className="text-[12px] font-medium tracking-[0.2em] uppercase text-stone-300 hover:text-white"
                                    >
                                      Integra Sinks
                                    </Link>
                                    <Link
                                      href="/products/vanity"
                                      className="text-[12px] font-medium tracking-[0.2em] uppercase text-stone-300 hover:text-white"
                                    >
                                      Vanity
                                    </Link>
                                  </div>
                                  <Link
                                    href="/products"
                                    className="text-[12px] font-medium tracking-[0.2em] uppercase text-white inline-flex items-center gap-1.5 hover:gap-2 transition-all"
                                  >
                                    All Products
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              /* Spaces mega gets a parallel "All Spaces"
                             strip linking to the dedicated /spaces
                             page (which still exists per editorial
                             direction — dropdown supplements the
                             page rather than replacing it). */
                              <div className="border-t border-white/10 bg-[#0d1f29]">
                                <div className="mx-auto max-w-[1400px] px-6 lg:px-8 flex items-center justify-end py-4">
                                  <Link
                                    href="/spaces"
                                    className="text-[12px] font-medium tracking-[0.2em] uppercase text-white inline-flex items-center gap-1.5 hover:gap-2 transition-all"
                                  >
                                    Explore All Spaces
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    item.children && (
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
                    )
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
