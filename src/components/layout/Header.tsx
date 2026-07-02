"use client";

import { useState, useEffect, useRef } from "react";
import { preload as reactPreload } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/ui/search-overlay";

// PRODUCTS_CATEGORIES drives the Products mega-menu — five cards
// matching the Sidharth UI/UX deck exactly:
//   1) Quartz · 2) Beyond Finish · 3) Vision ·
//   4) Granites · 5) Semi-Precious Stones
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
  /** Optional thumbnail rendered inside the dropdown card (full-bleed,
   *  object-cover). When set, replaces the gradient placeholder.
   *  Currently used for the Spaces cards. */
  imageUrl?: string;
  /** When true, the card renders as a button that opens a "Coming
   *  Soon" modal instead of navigating. Used for routes that aren't
   *  built yet (e.g. 3D Showroom). coloursHref is ignored. */
  comingSoon?: boolean;
  /** Optional "branded" image - a stylised mark that sits underneath
   *  the regular photo with `mix-blend-multiply` so it integrates
   *  with the dark navy panel. Visible at rest; the regular photo
   *  fades in on hover on top of it. */
  brandedImageUrl?: string;
  /** Optional list of curated design picks for this category. Renders
   *  inside the Products mega's expanded sub-panel as a "Top Picks"
   *  column. Each entry routes to the picked design; the column ends
   *  with a "See more <name>" link back to the category page. */
  topPicks?: { name: string; href: string }[];
};

const PRODUCTS_CATEGORIES: MegaCategory[] = [
  {
    slug: "quartz",
    name: "Mineral infused low silica surface",
    tagline: "Engineered stone for everyday surfaces.",
    imageUrl: "/images/products/quartz.jpg",
    brandedImageUrl: "/images/products/branded/quartz.svg",
    topPicks: [
      { name: "Ruskin", href: "/products/ruskin-5028" },
      { name: "Adonis", href: "/products/adonis-5060" },
      { name: "Stellar Ember", href: "/products/stellar-ember-5031" },
      { name: "Galactic Halo", href: "/products/galactic-halo-5012" },
    ],
  },
  {
    slug: "facades-and-finishes",
    name: "Beyond Finish",
    tagline: "Large-format facade and feature surfaces.",
    imageUrl: "/images/products/facades.png",
    brandedImageUrl: "/images/products/branded/facades-and-finishes.svg",
    topPicks: [
      { name: "Lineal Design", href: "/products/lineal-design" },
      { name: "Cotton Design", href: "/products/cotton-design" },
      { name: "Velvet Design", href: "/products/velvet-design" },
      { name: "Rock Design", href: "/products/rock-design" },
    ],
  },
  {
    // Eclipse removed as a separate category (it is part of Quartz).
    // Cut to Size links to the existing Fab Creations collection page.
    slug: "fab-creations",
    name: "Cut to Size",
    tagline: "Bespoke cut-to-size surfaces, made to spec.",
  },
  {
    slug: "granites",
    name: "Granites",
    tagline: "Natural stone for every space and surface.",
    imageUrl: "/images/products/granites.png",
    brandedImageUrl: "/images/products/branded/granites.svg",
    topPicks: [
      { name: "Absolute Black", href: "/products/absolute-black" },
      { name: "Black Galaxy", href: "/products/black-galaxy" },
      { name: "Bianco Antico", href: "/products/bianco-antico" },
      { name: "Coffee Brown", href: "/products/coffee-brown" },
    ],
  },
  {
    slug: "semi-precious",
    name: "Semi-Precious Stones",
    tagline: "Hand-selected gemstone surfaces.",
    imageUrl: "/images/products/semi-precious.png",
    brandedImageUrl: "/images/products/branded/semi-precious.svg",
    topPicks: [
      { name: "Amethyst", href: "/products/amethyst" },
      { name: "Rose Quartz", href: "/products/rose-quartz" },
      { name: "Tigers Eye", href: "/products/tigers-eye" },
      { name: "Mother of Pearl", href: "/products/mother-of-pearl" },
    ],
  },
];

// SPACES_CATEGORIES — four rooms / environments where Pacific
// surfaces live. Cards in the Spaces mega-menu are direct links
// (NOT click-to-expand toggles like Products) — each navigates
// straight to its dedicated /spaces/<slug> landing page, which
// pairs four Pacific product callouts with image placeholders.
const SPACES_CATEGORIES: MegaCategory[] = [
  {
    slug: "kitchens",
    name: "Kitchens",
    tagline: "Worktops, islands, and splashbacks.",
    coloursHref: "/spaces/kitchens",
    imageUrl: "/images/spaces/kitchens.png",
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    tagline: "Vanity tops, sinks, and shower trays.",
    coloursHref: "/spaces/bathrooms",
    imageUrl: "/images/spaces/bathrooms.jpg",
  },
  {
    slug: "architecture",
    name: "Outdoors",
    tagline: "Facades, cladding, and feature walls.",
    coloursHref: "/spaces/outdoor",
    imageUrl: "/images/spaces/architecture.png",
  },
  {
    slug: "commercial",
    name: "Interior",
    tagline: "Hospitality, retail, and workspaces.",
    coloursHref: "/spaces/hospitality",
    imageUrl: "/images/spaces/commercial.jpg",
  },
];

// CORPORATE_CATEGORIES — four company-level destinations rendered as
// the Corporate mega-menu. Cards behave like the Spaces cards
// (direct Link on click, no sub-panel). imageUrl is intentionally
// undefined for now so each card renders with a gradient placeholder;
// drop a real /images/corporate/<slug>.jpg in and set the field to
// activate the photo.
const CORPORATE_CATEGORIES: MegaCategory[] = [
  {
    slug: "sustainability",
    name: "Sustainability",
    tagline: "Quarry-to-kitchen responsibility.",
    coloursHref: "/sustainability",
    imageUrl: "/images/corporate/sustainability.jpg",
  },
  {
    slug: "careers",
    name: "Work with Us",
    tagline: "Roles, locations, and what we look for.",
    coloursHref: "/careers",
    imageUrl: "/images/corporate/careers.jpg",
  },
  {
    slug: "blog",
    name: "News",
    tagline: "Editorial, projects, and updates.",
    coloursHref: "/blog",
    imageUrl: "/images/corporate/blog.jpg",
  },
];

// PROFESSIONS_CATEGORIES — services + supporting docs for architects,
// designers, fabricators, and trade partners. Each card routes to its
// dedicated /professionals/<slug> landing page.
const PROFESSIONS_CATEGORIES: MegaCategory[] = [
  {
    slug: "services",
    name: "Services",
    tagline: "Specification, fabrication, and project support.",
    coloursHref: "/professionals/services",
    imageUrl: "/images/professions/services.jpg",
  },
  {
    slug: "collaboration",
    name: "Collaboration",
    tagline: "Architect, designer, and developer partnerships.",
    coloursHref: "/professionals/collaboration",
    imageUrl: "/images/professions/collaboration.jpg",
  },
  {
    slug: "applications",
    name: "Applications",
    tagline: "Where Pacific surfaces install best.",
    coloursHref: "/professionals/applications",
    imageUrl: "/images/professions/applications.jpg",
  },
  {
    slug: "programs",
    name: "Programs",
    tagline: "Trade incentives and training.",
    coloursHref: "/professionals/programs",
    imageUrl: "/images/professions/programs.jpg",
  },
];

// INSPIRATIONS_CATEGORIES — editorial and design-tool destinations.
// Inspiration Gallery is the live photography landing at
// /inspirations/inspiration-gallery. Visualizer is live at /visualize.
// 3D Showroom is marked comingSoon — its card renders as a button
// that opens a "Coming Soon" modal instead of navigating.
const INSPIRATIONS_CATEGORIES: MegaCategory[] = [
  {
    slug: "inspiration-gallery",
    name: "Inspiration Gallery",
    tagline: "Project photography, room by room.",
    coloursHref: "/inspirations/inspiration-gallery",
    imageUrl: "/images/inspirations/inspiration-gallery.png",
  },
  {
    slug: "visualize",
    name: "Visualizer",
    tagline: "Swap surfaces into real room photography.",
    coloursHref: "/visualize",
    imageUrl: "/images/inspirations/visualizer.png",
  },
  {
    slug: "showroom-3d",
    name: "3D Showroom",
    tagline: "Walk a virtual Pacific showroom — coming soon.",
    comingSoon: true,
    imageUrl: "/images/inspirations/3d-showroom.jpg",
  },
];

const navigation = [
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
        name: "Beyond Finish",
        href: "/products/facades-and-finishes",
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
      { name: "Outdoors", href: "/spaces/outdoor" },
      { name: "Interior", href: "/spaces/hospitality" },
    ],
  },
  {
    name: "Professionals",
    href: "/contact",
    mega: true,
    children: [
      { name: "Services", href: "/contact" },
      { name: "Collaboration", href: "/contact" },
      { name: "Applications", href: "/contact" },
      { name: "Programs", href: "/contact" },
    ],
  },
  // Resources - plain top-level Link. Used to live as a card inside
  // the Professions mega ("Technical Documentation"); promoted out
  // per editorial direction so the docs library is one click from
  // anywhere on the site.
  { name: "Resources", href: "/resources" },
  {
    name: "Inspirations",
    href: "/visualize",
    mega: true,
    children: [
      { name: "Inspiration Gallery", href: "/contact" },
      { name: "Visualizer", href: "/visualize" },
      { name: "3D Showroom", href: "#coming-soon" },
    ],
  },
  // Our Story - top-level shortcut to the About page. Plain Link
  // (no mega, no children) so it just navigates on click. Sits
  // next to Corporate; the About content used to live as a card
  // inside Corporate and was promoted out per editorial direction.
  { name: "Our Story", href: "/about" },
  // Corporate - umbrella for everything company-level (About,
  // sustainability story, hiring, editorial). Top-level link points
  // at /about so clicking the label itself still goes somewhere
  // sensible if the dropdown is missed (keyboard nav, etc.).
  {
    name: "Corporate",
    // Corporate's top-level href points at /sustainability (the first
    // remaining child) so keyboard / no-hover users still land
    // somewhere if they click the label. About us has moved out of
    // Corporate to its own top-level "Our Story" tab next door.
    href: "/sustainability",
    mega: true,
    children: [
      { name: "Sustainability", href: "/sustainability" },
      { name: "Work with Us", href: "/careers" },
      { name: "News", href: "/blog" },
    ],
  },
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

// Mega-menu thumbnails live inside <AnimatePresence>, so they don't
// mount into the DOM until the user hovers — which means Next/Image's
// lazy-load fires at hover time and the first reveal has a noticeable
// fetch delay. Preloading them at page-load via React DOM injects
// <link rel="preload"> hints so the browser pulls them down on first
// paint; by the time the user hovers, they're already in cache.
//
// fetchPriority "low" so these warm-cache hints never compete with
// above-the-fold content (the LCP hero in particular) for bandwidth —
// the thumbnails only need to be in cache by the time the user hovers
// a nav trigger. Pair this with the `unoptimized` prop on the <Image>
// tags so the rendered URL EXACTLY matches the preloaded URL
// (Next/Image would otherwise rewrite the src into
// `/_next/image?url=...` and the preload would be cache-miss).
function preloadMegaThumbs() {
  if (typeof window === "undefined") return;
  const urls = [
    ...PRODUCTS_CATEGORIES.map((c) => c.imageUrl),
    ...PRODUCTS_CATEGORIES.map((c) => c.brandedImageUrl),
    ...SPACES_CATEGORIES.map((c) => c.imageUrl),
    ...CORPORATE_CATEGORIES.map((c) => c.imageUrl),
    ...PROFESSIONS_CATEGORIES.map((c) => c.imageUrl),
    ...INSPIRATIONS_CATEGORIES.map((c) => c.imageUrl),
  ].filter((u): u is string => Boolean(u));
  for (const url of urls) {
    reactPreload(url, { as: "image", fetchPriority: "low" });
  }
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which mega-section is expanded inside the mobile menu drawer.
  // null = none (top-level list view). Setting to a nav item name
  // (e.g. "Products") swaps that row into a sub-panel showing the
  // section's cards. Reset to null whenever the drawer closes.
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Coming Soon modal — set to a card label (e.g. "3D Showroom")
  // to display the modal; null when closed.
  const [comingSoonLabel, setComingSoonLabel] = useState<string | null>(null);
  // Mega-menu state.
  //  - `openMegaItem` — which top-level nav item's mega-menu is open
  //    ("Products" or "Spaces" or null). Drives header bg colour
  //    (navy whenever any mega is open) and which content renders
  //    inside the shared dropdown panel.
  //  - `activeMega` — which Products card the user has clicked to
  //    expand its sub-panel (What is X / Maintenance / Warranty /
  //    Colours CTA). Null when no card is expanded.
  const [openMegaItem, setOpenMegaItem] = useState<string | null>(null);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaOpen = openMegaItem !== null;

  const handleMegaEnter = (itemName: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    // When moving between Products and Spaces, drop any expanded
    // sub-panel so the new mega opens cleanly.
    if (openMegaItem !== itemName) setActiveMega(null);
    setOpenMegaItem(itemName);
  };
  const handleMegaLeave = () => {
    // 150 ms grace so moving the cursor across the small gap between
    // trigger Link and panel doesn't snap-close the menu. Anything
    // longer than that is a genuine exit and the menu collapses.
    //
    // CRITICAL: clear any existing timer BEFORE scheduling a new
    // one. Leaving a panel often fires two near-simultaneous
    // mouseleave events — one on the panel motion.div itself, and
    // one on the wrapping nav-item div (because the panel is a DOM
    // descendant of the nav-item, so leaving the panel also counts
    // as leaving the nav-item once the cursor exits both bounding
    // boxes). Without the clear, the second assignment overwrites
    // closeTimerRef.current and orphans the first timer. The next
    // handleMegaEnter (e.g. cursor lands on the Products trigger)
    // clears only the latest timer, leaving the orphaned one to
    // fire ~150 ms later and slam the newly-opened menu shut. That
    // was reproducible as "moving from a Spaces card to the
    // Products trigger never opens Products" — Products did open,
    // then got force-closed by the zombie timer almost immediately.
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenMegaItem(null);
      setActiveMega(null);
      closeTimerRef.current = null;
    }, 150);
  };

  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the Coming Soon modal on Escape.
  useEffect(() => {
    if (!comingSoonLabel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setComingSoonLabel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [comingSoonLabel]);

  // Preload the 9 mega-menu thumbnails on first mount so they're in
  // browser cache by the time the user hovers a dropdown trigger.
  // Without this, Next/Image lazy-loads each <Image> only when its
  // AnimatePresence parent mounts (i.e. on hover) and the first hover
  // shows a fetch delay. Low fetchPriority means these don't compete
  // with above-the-fold content for bandwidth.
  //
  // Gated to hover-capable desktop viewports: the mega-menu only
  // opens on hover at lg+ widths, so phones/tablets (where the
  // mobile drawer loads its own images on open) should never pay
  // the ~5MB warm-up cost. Deferred to idle so the preload hints
  // never compete with hydration / above-the-fold work.
  useEffect(() => {
    let canHover = false;
    try {
      canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
    } catch {
      /* ignore — older browsers without matchMedia */
    }
    if (!canHover || window.innerWidth < 1024) return;

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => preloadMegaThumbs());
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = setTimeout(() => preloadMegaThumbs(), 2500);
    return () => clearTimeout(timeoutId);
  }, []);

  // Clear any pending mega-menu close timer on unmount so it can't
  // fire setState against an unmounted Header.
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    []
  );

  // Escape closes any open mega-menu — keyboard parity with moving
  // the cursor away. Listener only attached while a mega is open.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMegaItem(null);
        setActiveMega(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [megaOpen]);

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
    setComingSoonLabel(null);
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

  // Some pages render a LIGHT/cream PageHeader directly under the
  // navbar (Spaces sub-pages, Learn sub-pages, etc.). The default
  // top-of-page gradient scrim only works over dark video heroes —
  // over cream it leaves the nav text invisible until the user
  // scrolls. For these paths, force the header into its "scrolled"
  // navy treatment from the start so links stay legible.
  const isLightHeroPath =
    pathname === "/spaces" ||
    pathname.startsWith("/spaces/") ||
    pathname.startsWith("/learn/") ||
    pathname === "/resources" ||
    pathname.startsWith("/resources/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  const headerDark = scrolled || isLightHeroPath;

  // Dark (black-tile) mark ONLY on the homepage top, where it pops
  // against the bright marble hero. Everywhere else — scrolled,
  // light-hero pages, AND other pages' dark image heroes like
  // Contact — use the navy (light-on-dark) mark so it stays visible
  // on dark backgrounds where the black tile used to vanish.
  const monogramVariant: "dark" | "navy" =
    !headerDark && pathname === "/" ? "dark" : "navy";

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Coming Soon modal — centred overlay shown when a comingSoon
          mega card is clicked (currently 3D Showroom). The label
          stored in state appears in the heading so a single modal
          serves every comingSoon card. Click backdrop / Escape / X
          all close. */}
      <AnimatePresence>
        {comingSoonLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setComingSoonLabel(null)}
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center px-6"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.4, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-2xl border border-white/10 bg-[#112732] p-8 sm:p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
            >
              <button
                type="button"
                onClick={() => setComingSoonLabel(null)}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="text-[11px] tracking-[0.3em] uppercase text-pacific-mid mb-3">
                Coming soon
              </div>
              <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-3">
                {comingSoonLabel}
              </h3>
              <p className="text-sm font-light text-stone-300 leading-relaxed">
                We&apos;re still building this experience. Check back shortly —
                or get in touch and we&apos;ll let you know the moment it
                launches.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/contact"
                  onClick={() => setComingSoonLabel(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-pacific-dark hover:bg-stone-100 transition-colors"
                >
                  Notify me
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setComingSoonLabel(null)}
                  className="text-[11px] tracking-[0.2em] uppercase text-pacific-mid hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            : headerDark
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
          <div className="flex h-20 items-center justify-between gap-x-4 xl:gap-x-8 2xl:gap-x-14">
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
            <div className="hidden lg:flex lg:items-center lg:gap-x-4 xl:gap-x-7">
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
                  {/* Spaces is intentionally non-clickable at the
                  top level — hover still opens the mega-menu, but
                  click should do nothing because navigation is
                  meant to flow through the four space cards in the
                  dropdown rather than a top-level /spaces overview
                  page. Render as a <span> so there's no link target
                  and no default browser behaviour to suppress. */}
                  {item.name === "Spaces" ? (
                    <span
                      aria-haspopup="true"
                      aria-expanded={openMegaItem === item.name}
                      className={cn(
                        "relative text-[11px] lg:text-[12px] xl:text-[13px] font-medium tracking-[0.08em] uppercase whitespace-nowrap transition-colors duration-300 py-2 cursor-default select-none",
                        "text-stone-300 hover:text-white"
                      )}
                    >
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      aria-haspopup={item.mega ? "true" : undefined}
                      aria-expanded={
                        item.mega ? openMegaItem === item.name : undefined
                      }
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
                  )}

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
                          // Animation is opacity-only, NOT translate-y.
                          // The earlier y: -10 → 0 slide caused the
                          // panel's hover-bridge pseudo to slide down
                          // past a stationary cursor on the trigger
                          // Link, firing mouseleave mid-animation and
                          // closing the menu. Pure opacity fade keeps
                          // the bridge locked in position throughout
                          // the open/close so hover never breaks.
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: {
                              duration: 0.32,
                              ease: [0.25, 0.4, 0.25, 1],
                            },
                          }}
                          exit={{
                            opacity: 0,
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
                          <div className="bg-[#112732] shadow-[0_18px_60px_rgba(0,0,0,0.4)] max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain">
                            <div className="mx-auto max-w-[1400px] px-6 lg:px-8 py-5 lg:py-6">
                              {/* Cards row. Both Products and Spaces
                              render as direct Links — click =
                              navigate, no sub-panel, no toggle.
                              Products: 5-card grid; Spaces: 4-card. */}
                              <div
                                className={`grid gap-3 ${
                                  item.name === "Corporate" ||
                                  item.name === "Inspirations"
                                    ? "grid-cols-3"
                                    : item.name === "Spaces" ||
                                        item.name === "Professionals"
                                      ? "grid-cols-4"
                                      : "grid-cols-5"
                                }`}
                              >
                                {(item.name === "Spaces"
                                  ? SPACES_CATEGORIES
                                  : item.name === "Corporate"
                                    ? CORPORATE_CATEGORIES
                                    : item.name === "Professionals"
                                      ? PROFESSIONS_CATEGORIES
                                      : item.name === "Inspirations"
                                        ? INSPIRATIONS_CATEGORIES
                                        : PRODUCTS_CATEGORIES
                                ).map((cat) => {
                                  // Spaces / Corporate / Professions /
                                  // Inspirations all use the same
                                  // direct-Link card layout (each card
                                  // is a destination, no sub-panel).
                                  // Only Products uses the expanding
                                  // button + sub-panel pattern.
                                  // Products now navigate on click too
                                  // (each category links straight to its
                                  // page) — the old click-to-expand Top
                                  // Picks sub-panel is retired.
                                  const isSpacesItem =
                                    item.name === "Spaces" ||
                                    item.name === "Corporate" ||
                                    item.name === "Professionals" ||
                                    item.name === "Inspirations" ||
                                    item.name === "Products";

                                  // Spaces cards — direct Link, no
                                  // toggle. Click navigates straight
                                  // to /spaces/<slug>. Name overlays
                                  // the image (centered) and the
                                  // tagline subscript sits below the
                                  // card as a small caption.
                                  if (isSpacesItem) {
                                    // comingSoon cards render as a
                                    // button that triggers the modal
                                    // instead of navigating. Same
                                    // visual treatment as the Link
                                    // variant otherwise.
                                    if (cat.comingSoon) {
                                      return (
                                        <button
                                          key={cat.slug}
                                          type="button"
                                          onClick={() =>
                                            setComingSoonLabel(cat.name)
                                          }
                                          className="group block w-full text-left transition-transform hover:scale-[1.02]"
                                        >
                                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-gradient-to-br from-stone-300 via-stone-200 to-stone-400">
                                            {cat.imageUrl ? (
                                              <Image
                                                src={cat.imageUrl}
                                                alt={cat.name}
                                                fill
                                                className="object-cover"
                                                sizes="(min-width: 1024px) 25vw, 50vw"
                                                priority={false}
                                                unoptimized
                                              />
                                            ) : null}
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center gap-2">
                                              <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white border border-white/25">
                                                Coming soon
                                              </span>
                                              <span className="text-sm lg:text-base font-medium text-white tracking-tight leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                                                {cat.name}
                                              </span>
                                            </div>
                                          </div>
                                          <p className="mt-2 px-1 text-xs font-light tracking-wide text-stone-400 leading-snug min-h-[2.25rem] line-clamp-2">
                                            {cat.tagline}
                                          </p>
                                        </button>
                                      );
                                    }
                                    return (
                                      <Link
                                        key={cat.slug}
                                        href={
                                          cat.coloursHref ??
                                          `/products/${cat.slug}`
                                        }
                                        className="group block transition-transform hover:scale-[1.02]"
                                      >
                                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-gradient-to-br from-stone-300 via-stone-200 to-stone-400">
                                          {cat.imageUrl ? (
                                            // Spaces cards keep their
                                            // thumbnail visible at
                                            // rest — only Products
                                            // cards use the hover-to-
                                            // reveal treatment.
                                            <Image
                                              src={cat.imageUrl}
                                              alt={cat.name}
                                              fill
                                              className="object-cover"
                                              sizes="(min-width: 1024px) 25vw, 50vw"
                                              priority={false}
                                              unoptimized
                                            />
                                          ) : null}
                                          {/* Dark scrim so the
                                              centered name stays
                                              legible over any photo. */}
                                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                                          {/* Centered, full-width name
                                              overlay. */}
                                          <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
                                            <span className="text-sm lg:text-base font-medium text-white tracking-tight leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
                                              {cat.name}
                                            </span>
                                          </div>
                                        </div>
                                        {/* Subscript tagline — sits
                                            below the card, kept from
                                            the pre-overlay layout. */}
                                        <p className="mt-2 px-1 text-xs font-light tracking-wide text-stone-400 leading-snug min-h-[2.25rem] line-clamp-2">
                                          {cat.tagline}
                                        </p>
                                      </Link>
                                    );
                                  }

                                  // Products cards — button that
                                  // toggles the About sub-panel below.
                                  // Name overlays the image centered;
                                  // chevron sits in the top-right
                                  // corner to indicate expanded state;
                                  // tagline subscript renders beneath
                                  // the card.
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
                                      // Named group `card` scopes the
                                      // hover to this specific card.
                                      // Without the name, the outer
                                      // nav-item wrapper's `group`
                                      // (used for the trigger
                                      // underline) would fire and
                                      // reveal every card image the
                                      // moment the Products trigger is
                                      // hovered.
                                      className={cn(
                                        "group/card block text-left transition-transform",
                                        isActive
                                          ? "scale-[1.02]"
                                          : "hover:scale-[1.02]"
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "relative aspect-[16/10] w-full overflow-hidden rounded-md bg-[#0d1f29] transition-all",
                                          isActive && "ring-2 ring-white/40"
                                        )}
                                      >
                                        {/* Branded mark layer - always
                                            visible at rest, blends with
                                            the navy panel via multiply.
                                            Painted BEFORE the photo so
                                            the photo fades in on top of
                                            it on hover. */}
                                        {cat.brandedImageUrl ? (
                                          <Image
                                            src={cat.brandedImageUrl}
                                            alt=""
                                            fill
                                            className={cn(
                                              "object-cover pointer-events-none transition-opacity duration-300 ease-out",
                                              isActive
                                                ? "opacity-0"
                                                : "opacity-100 group-hover/card:opacity-0"
                                            )}
                                            sizes="(min-width: 1024px) 20vw, 50vw"
                                            priority={false}
                                            unoptimized
                                            aria-hidden="true"
                                          />
                                        ) : null}
                                        {cat.imageUrl ? (
                                          // Image is hidden at rest
                                          // and fades in when the
                                          // cursor enters THIS card
                                          // (or when the card is
                                          // expanded — `isActive`).
                                          <Image
                                            src={cat.imageUrl}
                                            alt={cat.name}
                                            fill
                                            className={cn(
                                              "object-cover transition-opacity duration-300 ease-out",
                                              isActive
                                                ? "opacity-100"
                                                : "opacity-0 group-hover/card:opacity-100"
                                            )}
                                            sizes="(min-width: 1024px) 20vw, 50vw"
                                            priority={false}
                                            unoptimized
                                          />
                                        ) : null}
                                        {/* Dark scrim - only shown
                                            when the photo is visible
                                            (hover / expanded). At rest
                                            we want the branded SVG to
                                            read as fully white, not
                                            dimmed by 30-60% black. */}
                                        <div
                                          className={cn(
                                            "absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 transition-opacity duration-300",
                                            isActive
                                              ? "opacity-100"
                                              : "opacity-0 group-hover/card:opacity-100"
                                          )}
                                        />
                                        {/* Chevron in top-right —
                                            rotates 180° when this card
                                            is expanded. */}
                                        <ChevronDown
                                          className={cn(
                                            "absolute top-2 right-2 w-4 h-4 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-transform",
                                            isActive ? "rotate-180" : ""
                                          )}
                                        />
                                      </div>
                                      {/* Subscript tagline — sits
                                          below the card, restored from
                                          the pre-overlay layout. */}
                                      <p className="mt-2 px-1 text-xs font-light tracking-wide text-stone-400 leading-snug min-h-[2.25rem] line-clamp-2">
                                        {cat.tagline}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Expanded sub-panel — only for
                                  Products. Slides down when a card
                                  is clicked. Shows the About column
                                  (What is X / Maintenance / Warranty
                                  for Quartz only) and the right-
                                  aligned "<Cat> Colours" CTA pill. */}
                              <AnimatePresence initial={false}>
                                {item.name === "Products" &&
                                  activeMega &&
                                  (() => {
                                    const active = PRODUCTS_CATEGORIES.find(
                                      (c) => c.slug === activeMega
                                    );
                                    if (!active) return null;
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
                                        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-5">
                                          {/* About column — what the
                                              product is, how to keep it,
                                              warranty (Quartz only). */}
                                          <div className="lg:col-span-3">
                                            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-3">
                                              About {active.name}
                                            </h4>
                                            <ul className="space-y-2">
                                              <li>
                                                <Link
                                                  href={`/learn/what-is-${active.whatIsSlug ?? active.slug}`}
                                                  className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                >
                                                  What is {active.name}?
                                                </Link>
                                              </li>
                                              <li>
                                                <Link
                                                  href={`/learn/maintenance-${active.whatIsSlug ?? active.slug}`}
                                                  className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                >
                                                  Maintenance
                                                </Link>
                                              </li>
                                              {active.slug === "quartz" && (
                                                <li>
                                                  <Link
                                                    href="/learn/warranty-quartz"
                                                    className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                  >
                                                    Warranty
                                                  </Link>
                                                </li>
                                              )}
                                            </ul>
                                          </div>

                                          {/* Top Picks column —
                                              curated design picks per
                                              category. Falls back
                                              gracefully when topPicks
                                              isn't defined on a
                                              category. Final entry is
                                              a "See more" that routes
                                              to the category's main
                                              collection page. */}
                                          <div className="lg:col-span-4">
                                            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-3">
                                              Top Picks · Products
                                            </h4>
                                            <ul className="space-y-2">
                                              {(active.topPicks ?? []).map(
                                                (pick) => (
                                                  <li key={pick.name}>
                                                    <Link
                                                      href={pick.href}
                                                      className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                    >
                                                      {pick.name}
                                                    </Link>
                                                  </li>
                                                )
                                              )}
                                              <li className="pt-1">
                                                <Link
                                                  href={
                                                    active.coloursHref ??
                                                    `/products/${active.slug}`
                                                  }
                                                  className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.15em] uppercase text-white hover:text-stone-200 transition-colors"
                                                >
                                                  See more {active.name}
                                                  <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                              </li>
                                            </ul>
                                          </div>

                                          {/* Applications column —
                                              same set across every
                                              product card: kitchens,
                                              bathrooms, living, with
                                              a "See more applications"
                                              link to the dedicated
                                              applications page. */}
                                          <div className="lg:col-span-3">
                                            <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-stone-400 mb-3">
                                              Applications
                                            </h4>
                                            <ul className="space-y-2">
                                              <li>
                                                <Link
                                                  href="/spaces/kitchens"
                                                  className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                >
                                                  Kitchens
                                                </Link>
                                              </li>
                                              <li>
                                                <Link
                                                  href="/spaces/bathrooms"
                                                  className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                >
                                                  Bathrooms
                                                </Link>
                                              </li>
                                              <li>
                                                <Link
                                                  href="/inspirations/inspiration-gallery"
                                                  className="text-sm font-light text-stone-300 hover:text-white transition-colors"
                                                >
                                                  Living Rooms
                                                </Link>
                                              </li>
                                              <li className="pt-1">
                                                <Link
                                                  href="/professionals/applications"
                                                  className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.15em] uppercase text-white hover:text-stone-200 transition-colors"
                                                >
                                                  See more applications
                                                  <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                              </li>
                                            </ul>
                                          </div>

                                          {/* Right-aligned primary CTA
                                              pill — same target as the
                                              "See more" inside Top
                                              Picks, but visually
                                              elevated as the main
                                              action of the panel. */}
                                          <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-end">
                                            <Link
                                              href={
                                                active.coloursHref ??
                                                `/products/${active.slug}`
                                              }
                                              className="inline-flex items-center gap-2 rounded-full px-5 py-3 bg-white text-stone-900 text-[10px] font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
                                            >
                                              {active.slug ===
                                              "facades-and-finishes"
                                                ? "Explore"
                                                : "Browse"}
                                              <ArrowRight className="w-4 h-4" />
                                            </Link>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })()}
                              </AnimatePresence>
                            </div>
                            {/* Footer strip — Products-only. Only
                            surfaces the "All Products" CTA, right-
                            aligned. Earlier versions also listed
                            Exotic / Integra Sinks / Vanity on the
                            left; those were removed per editorial
                            direction — surfacing too many secondary
                            categories competed with the five hero
                            cards above. The "All Products" footer
                            CTA is scoped to the Products mega only;
                            Spaces / Corporate / Professions /
                            Inspirations don't get it because the
                            "All ..." link wouldn't make sense in
                            those contexts. */}
                            {item.name === "Products" && (
                              <div className="border-t border-white/10 bg-[#0d1f29]">
                                <div className="mx-auto max-w-[1400px] px-6 lg:px-8 flex items-center justify-end py-3">
                                  <Link
                                    href="/products"
                                    className="text-[12px] font-medium tracking-[0.2em] uppercase text-white inline-flex items-center gap-1.5 hover:gap-2 transition-all"
                                  >
                                    All Products
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
            <div className="flex items-center gap-2 lg:gap-2.5 xl:gap-3 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(
                  // Visible at every breakpoint — on mobile this is
                  // the only entry point to search (the hamburger menu
                  // doesn't carry one), and the row has room since the
                  // Quote/Visualizer pills are hidden below sm/2xl.
                  "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shrink-0",
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
                  "hidden 2xl:inline-flex items-center gap-1.5 rounded-full px-4 lg:px-4 xl:px-5 py-2 text-[11px] lg:text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
                  headerDark
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
                  "hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 lg:px-4 xl:px-5 py-2 text-[11px] lg:text-xs font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-300",
                  // Scrolled now uses a solid white pill for max
                  // contrast against the dark navy header. Top of
                  // page keeps the translucent glass-pill style.
                  headerDark
                    ? "bg-white text-[#112732] border border-transparent hover:bg-stone-100"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
                )}
              >
                Get a Quote
                <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setMobileOpen((open) => {
                    if (open) setMobileExpanded(null);
                    return !open;
                  });
                }}
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
              className="flex flex-col w-full max-w-md mx-auto min-h-full gap-2 py-24 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/*
                Mobile menu — two layered states:
                  1. Top-level list. Each row that has a mega is a
                     toggle button (chevron rotates on expand). Each
                     row WITHOUT a mega (Resources / Our Story /
                     Contact) is a plain Link that navigates straight
                     away on tap.
                  2. Expanded row inline-renders the matching cards
                     (PRODUCTS_CATEGORIES / SPACES_CATEGORIES /
                     PROFESSIONS_CATEGORIES / INSPIRATIONS_CATEGORIES
                     / CORPORATE_CATEGORIES). Tapping a card routes to
                     its coloursHref and closes the drawer.
              */}
              {navigation.map((item: NavItem, i) => {
                // Pick the right category list for this top-level
                // row. `cards === null` means it's a plain link row.
                const cards =
                  item.name === "Products"
                    ? PRODUCTS_CATEGORIES
                    : item.name === "Spaces"
                      ? SPACES_CATEGORIES
                      : item.name === "Professionals"
                        ? PROFESSIONS_CATEGORIES
                        : item.name === "Inspirations"
                          ? INSPIRATIONS_CATEGORIES
                          : item.name === "Corporate"
                            ? CORPORATE_CATEGORIES
                            : null;
                const isExpanded = mobileExpanded === item.name;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    className="w-full"
                  >
                    {cards ? (
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded((cur) =>
                            cur === item.name ? null : item.name
                          )
                        }
                        aria-expanded={isExpanded}
                        className="w-full flex items-center justify-between py-4 border-b border-white/10 text-left text-2xl font-light tracking-tight text-white"
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => {
                          setMobileExpanded(null);
                          setMobileOpen(false);
                        }}
                        className="block py-4 border-b border-white/10 text-2xl font-light tracking-tight text-white"
                      >
                        {item.name}
                      </Link>
                    )}

                    <AnimatePresence initial={false}>
                      {cards && isExpanded && (
                        <motion.div
                          key={`${item.name}-cards`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.28,
                            ease: [0.25, 0.4, 0.25, 1],
                          }}
                          style={{ overflow: "hidden" }}
                        >
                          <ul className="py-3 grid grid-cols-1 gap-2.5">
                            {cards.map((cat) => {
                              const inner = (
                                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-white/10 bg-white/5">
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-900 flex-shrink-0">
                                    {cat.imageUrl ? (
                                      <Image
                                        src={cat.imageUrl}
                                        alt={cat.name}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-white truncate">
                                      {cat.name}
                                    </div>
                                    <div className="text-[11px] font-light text-stone-300 truncate">
                                      {cat.tagline}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-white/50 flex-shrink-0" />
                                </div>
                              );
                              if (cat.comingSoon) {
                                return (
                                  <li key={cat.slug}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMobileOpen(false);
                                        setMobileExpanded(null);
                                        setComingSoonLabel(cat.name);
                                      }}
                                      className="w-full text-left"
                                    >
                                      {inner}
                                    </button>
                                  </li>
                                );
                              }
                              return (
                                <li key={cat.slug}>
                                  <Link
                                    href={
                                      cat.coloursHref ?? `/products/${cat.slug}`
                                    }
                                    onClick={() => {
                                      setMobileOpen(false);
                                      setMobileExpanded(null);
                                    }}
                                    className="block"
                                  >
                                    {inner}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
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
