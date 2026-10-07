"use client";

import { useState, useEffect, useRef } from "react";
import { preload as reactPreload } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  Search,
  ChevronDown,
  Heart,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { SearchOverlay } from "@/components/ui/search-overlay";
import { PacificLogoMark } from "@/components/ui/pacific-logo-mark";
import { ProductsMega } from "@/components/layout/ProductsMega";

// PRODUCTS_CATEGORIES drives the Products mega-menu — five cards
// matching the Sidharth UI/UX deck exactly:
//   1) Quartz · 2) Beyond Stone · 3) Vision ·
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
  /** Short label for the mega-menu card face only. `name` is the full
   *  editorial name and is what the nav list, prefetch keys and the
   *  sub-panel use; a couple of those run long enough to wrap to three
   *  lines on a card that sits beside one-word siblings. Set this to
   *  whatever the card should actually read. Falls back to `name`. */
  cardLabel?: string;
  /** Optional thumbnail rendered inside the dropdown card (full-bleed,
   *  object-cover). When set, replaces the gradient placeholder.
   *  Currently used for the Spaces cards. */
  imageUrl?: string;
  /** CSS object-position for imageUrl, when the subject is not centred. */
  imagePosition?: string;
  /** Products only: the card goes straight to this page instead of
   *  opening a detail row (Liminal, the window sills). */
  href?: string;
  /** When true, the card renders as a button that opens a "Coming
   *  Soon" modal instead of navigating. Used for routes that aren't
   *  built yet (e.g. 3D Showroom). coloursHref is ignored. */
  comingSoon?: boolean;
  /** Optional "branded" image - a stylised mark that sits underneath
   *  the regular photo with `mix-blend-multiply` so it integrates
   *  with the dark navy panel. Visible at rest; the regular photo
   *  fades in on hover on top of it. */
  brandedImageUrl?: string;
};

const PRODUCTS_CATEGORIES: MegaCategory[] = [
  {
    slug: "quartz",
    name: "Mineral infused zero silica surface",
    cardLabel: "Zero Silica Surfaces",
    tagline: "Engineered everyday surfaces",
    imageUrl: "/images/products/quartz.jpg",
    brandedImageUrl: "/images/products/branded/quartz.png",
  },
  {
    slug: "facades-and-finishes",
    name: "Beyond Stone",
    tagline: "Large-format facade panels",
    imageUrl: "/images/products/facades.png",
    brandedImageUrl: "/images/products/branded/facades-and-finishes.png",
  },
  {
    slug: "vision",
    name: "Eclipse",
    tagline: "Inlayered design quartz",
    coloursHref: "/products/quartz/chromia",
    imageUrl: "/images/products/vision.png",
    brandedImageUrl: "/images/products/branded/vision.png",
  },
  {
    // Cut to Size links to the existing Fab Creations collection page.
    // Per the Aug-2026 UX audit, the visible label is "Fab Creations"
    // (not "Cut to Size") — slug stays fab-creations for routing.
    slug: "fab-creations",
    name: "Fab Creations",
    tagline: "Bespoke, cut to size",
    // Hover image (fades in on hover). "At rest" slot below is
    // optional — drop a file at that path and it'll show dimly at
    // rest, same as Quartz/Granites/etc.
    imageUrl: "/images/products/fab-creations.jpeg",
    brandedImageUrl: "/images/products/branded/fab-creations.png",
  },
  {
    // Translucent is a standalone card now (was briefly a hover-
    // reveal split inside the Fab Creations tile — reverted per
    // request back to a normal card that behaves exactly like every
    // other Products card: hover reveals its photo, click opens the
    // usual About/Pacific Applications sub-panel).
    //
    // /products/translucent is a real CATEGORY_PAGES entry now
    // (see ../../app/(site)/products/_lib/category.ts) — same
    // coloursHref-less default as Fab Creations, Quartz, etc., so
    // this falls through to `/products/${slug}`. That route 404s
    // until an editor creates a "Translucent" collection in Sanity
    // and tags a product into it; no further code change needed
    // once that happens.
    slug: "translucent",
    name: "Translucent",
    tagline: "Stone that glows",
    // Hover image (fades in on hover). "At rest" slot below is
    // optional — drop a file at that path and it'll show dimly at
    // rest, same as Quartz/Granites/etc.
    imageUrl: "/images/products/translucent.jpeg",
    brandedImageUrl: "/images/products/branded/translucent.png",
  },
  {
    slug: "granites",
    name: "Granites",
    tagline: "Natural stone, every space",
    imageUrl: "/images/products/granites.png",
    brandedImageUrl: "/images/products/branded/granites.png",
  },
  {
    slug: "semi-precious",
    name: "Semi-Precious Stones",
    cardLabel: "Semi-Precious",
    tagline: "Hand-selected gemstone",
    imageUrl: "/images/products/semi-precious.png",
    brandedImageUrl: "/images/products/branded/semi-precious.png",
  },
  {
    // Window sills and thresholds, a card of its own (owner, 2026-10-07:
    // "a separate card ... name something unique and classy"): Liminal,
    // from the Latin limen, the threshold. It opens the collection page
    // directly, on phones too (coloursHref); there is no detail row.
    slug: "window-sills-and-thresholds",
    name: "Liminal",
    tagline: "Window sills & thresholds",
    href: "/products/pacific-european-window-sill-threshold-collection",
    coloursHref: "/products/pacific-european-window-sill-threshold-collection",
    imageUrl: "/images/thresholds-and-sills/hero-charcoal-sill.webp",
  },
];

// SPACES_CATEGORIES — the four spaces Pacific surfaces are sold for:
// kitchen, bathroom, hotels and flooring. Cards in the Spaces
// mega-menu are direct links (NOT click-to-expand toggles like
// Products) — each navigates straight to its landing page. Flooring
// goes to /applications/flooring, which already carries the granite-
// and Beyond Stone-only rule (quartz is not rated underfoot).
const SPACES_CATEGORIES: MegaCategory[] = [
  {
    slug: "kitchens",
    name: "Kitchens by Pacific Surfaces",
    tagline: "Worktops, islands, and backsplashes.",
    coloursHref: "/spaces/kitchens",
    // A whole kitchen: island, worktop and full-height backsplash.
    imageUrl: "/projects/islands/orenda-application.webp",
  },
  {
    slug: "bathrooms",
    name: "Bathrooms by Pacific Surfaces",
    tagline: "Vanity tops, sinks, and shower trays.",
    coloursHref: "/spaces/bathrooms",
    // A stone-clad shower and bath.
    imageUrl: "/projects/bathrooms/bathtub.webp",
  },
  {
    slug: "hospitality",
    name: "Hotels by Pacific Surfaces",
    tagline: "Lobbies, suites, bars and restaurants.",
    coloursHref: "/spaces/hospitality",
    // A restaurant booth against a stone feature wall; the old picture
    // was a close-up of a textured wall with power sockets.
    imageUrl: "/projects/cladding/tiffany.webp",
  },
  {
    slug: "flooring",
    name: "Flooring by Pacific Surfaces",
    tagline: "Large-format granite floors and stairs.",
    coloursHref: "/applications/flooring",
    imageUrl: "/images/flooring/card-courtyard.webp",
    // Crop to the large-format floor rather than the wall above it.
    imagePosition: "50% 85%",
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
      { name: "Eclipse", href: "/products/quartz/chromia" },
      { name: "Granites", href: "/products/granites" },
      { name: "Semi-Precious Stones", href: "/products/semi-precious" },
      { name: "Exotic Collection", href: "/products/exotic" },
      { name: "Centrepiece Couture", href: "/products/centrepiece-couture" },
      { name: "Integra (Sinks)", href: "/products/integra" },
      {
        name: "Beyond Stone",
        href: "/products/facades-and-finishes",
      },
      { name: "Vanity", href: "/products/vanity" },
      { name: "Window Sills & Thresholds", href: "/products/pacific-european-window-sill-threshold-collection" },
      { name: "All Products", href: "/products" },
    ],
  },
  {
    name: "Spaces",
    href: "/spaces",
    // Spaces gets the same mega-menu treatment as Products — hover
    // opens a 4-card panel with the major room/environment types.
    // Click on the nav label still routes to /spaces (top-level
    // overview page), so keyboard users + folks with hover disabled
    // still reach the destination.
    mega: true,
    children: [
      { name: "Kitchens by Pacific Surfaces", href: "/spaces/kitchens" },
      { name: "Bathrooms by Pacific Surfaces", href: "/spaces/bathrooms" },
      { name: "Hotels by Pacific Surfaces", href: "/spaces/hospitality" },
      { name: "Flooring by Pacific Surfaces", href: "/applications/flooring" },
    ],
  },
  {
    // Every href here used to be /contact — a placeholder from before
    // the four Professionals pages existed. They all exist now, so the
    // top-level click lands on Collaboration and each child goes to its
    // own page (same destinations as PROFESSIONS_CATEGORIES above).
    name: "Professionals",
    href: "/professionals/collaboration",
    mega: true,
    children: [
      { name: "Services", href: "/professionals/services" },
      { name: "Collaboration", href: "/professionals/collaboration" },
      { name: "Applications", href: "/professionals/applications" },
      { name: "Programs", href: "/professionals/programs" },
    ],
  },
  // Resources - plain top-level Link. Used to live as a card inside
  // the Professions mega ("Technical Documentation"); promoted out
  // per editorial direction so the docs library is one click from
  // anywhere on the site.
  // Store — the ordering flow (/shop → /cart). Deliberately its own
  // top-level entry rather than a child of Products: buying is a
  // different intent from browsing the catalogue.
  { name: "Store", href: "/shop" },
  { name: "Resources", href: "/resources" },
  {
    // Clicking the top-level item lands on the Inspiration Gallery,
    // which is the section's own landing page. It used to point at
    // /visualize — the Visualizer is one of the three cards in this
    // mega, not the section itself, so a click skipped past the
    // gallery entirely.
    name: "Inspirations",
    href: "/inspirations/inspiration-gallery",
    mega: true,
    children: [
      {
        name: "Inspiration Gallery",
        href: "/inspirations/inspiration-gallery",
      },
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

/* Navbar palette, lifted from cosentino.com's own `--bg-*` / `--btn-*` /
   `--overlay-bg` custom properties rather than sampled off a screenshot.
   The whole bar is themed from this one object so a future re-skin is a
   single edit rather than a sweep through fifteen ternaries. */
const NAV = {
  /** Mega open. White, not the old #3C3C3B grey — the panel and the bar
   *  above it read as one sheet of paper, and every ink inside the panel
   *  is dark as a result. Renamed from `bgDark` when it stopped being
   *  dark, so the name can't drift from the value. */
  bgMega: "#FFFFFF",
  /** Hairline rules on the white mega ground. */
  megaRule: "rgba(60,60,59,0.14)",
  /** Scrolled, or hovering the bar at the top of the page. */
  bgLight: "#F8F8F8",
  inkOnDark: "#FFFFFF",
  inkOnLight: "#3C3C3B",
  /** Primary CTA pill, one per bar state. */
  btnDark: "#1D1D1C",
  btnLight: "#ECECE8",
  btnRegular: "rgba(248,248,248,0.24)",
  /** Full-viewport veil behind an open mega. Pale rather than the old
   *  rgba(60,60,59,0.7) charcoal: the panel above it is white now, and a
   *  dark dim under a white sheet read as a hole in the page. Paired with
   *  `overlayFilter` below — the veil lightens, the filter drains the
   *  colour, and between them the page recedes to a grey wash while the
   *  cards keep theirs. */
  overlay: "rgba(255,255,255,0.42)",
  /** Backdrop filter applied with it. Desaturating rather than blurring:
   *  a blur turns the page to mush and costs a full-screen repaint on
   *  every frame of the fade, whereas draining saturation keeps the
   *  layout legible underneath and reads as "inactive" rather than
   *  "broken". Not pure grayscale(1) — a trace of colour left in stops
   *  photography behind it looking like a printing error. */
  overlayFilter: "grayscale(0.9) saturate(0.15) brightness(1.04)",
  /* Idle state over a hero: a soft grey wash, not the near-black scrim
     that was here before. It is a background-IMAGE, so it cannot cross-
     fade to a flat colour - the reference snaps it off and fades the
     colour up underneath, and so does this. */
  scrim:
    "linear-gradient(180deg, rgba(102,102,102,0.25) 0%, rgba(0,0,0,0) 100%)",
  shadow: "0 4px 54px 0 rgba(0,0,0,0.2)",
  /** Bar colour change. */
  fast: "0.2s",
  /** Overlay fade - deliberately three times slower than the bar. */
  base: "0.6s",
} as const;

type NavTheme = "regular" | "light" | "dark";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  /* Cursor is somewhere over the bar. This is the whole trick: the bar
     is one hover target, and the nav items inside it have no hover
     colour of their own - they just inherit. */
  const [barHover, setBarHover] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which mega-section is expanded inside the mobile menu drawer.
  // null = none (top-level list view). Setting to a nav item name
  // (e.g. "Products") swaps that row into a sub-panel showing the
  // section's cards. Reset to null whenever the drawer closes.
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Which Pacific Applications row the cursor is on. Drives the
  // preview image beside the list; defaults to 0 so the panel is never
  // empty on open, and is reset whenever a different category card is
  // opened since each carries its own, shorter list.
  const [hoveredApp, setHoveredApp] = useState(0);
  // Store cart — badge only appears once localStorage has been read,
  // so it can't flash a stale or empty count on first paint.
  const { count: cartCount, ready: cartReady } = useCart();
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
    setHoveredApp(0);
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
  const [lightMarker, setLightMarker] = useState(false);
  useEffect(() => {
    setLightMarker(!!document.querySelector("[data-header-light]"));
  }, [pathname]);

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
    // Matches the nav's xl: breakpoint (was 1024/lg) — no point
    // warming the mega-menu thumbnail cache on viewports where
    // the mega menus themselves are hidden behind the hamburger.
    if (!canHover || window.innerWidth < 1280) return;

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

  // LOGO color rule — the mark (icon + wordmark) is one vector graphic
  // (PacificLogoMark, the full icon + wordmark graphic) recolored via
  // inherited text color, not separate image files. No background tile
  // ever renders behind it; the only navy that appears near the logo is
  // the header's own scroll-triggered navy background.
  //
  //   - Homepage top, unscrolled, over the bright marble hero: dark
  //     (pacific-dark) ink reads cleanly directly on the light marble,
  //     no box needed.
  //   - Everywhere else — scrolled (navy header bg), light-hero pages
  //     forced into the scrolled treatment, and other pages' dark
  //     image heroes (e.g. Contact): white.

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
    pathname.startsWith("/blog/") ||
    // Pacific Applications, the shop and the account pages open on the
    // same white PageHeader.
    pathname === "/applications" ||
    pathname.startsWith("/applications/") ||
    pathname === "/shop" ||
    // Store product pages open on a white breadcrumb and gallery too.
    pathname.startsWith("/shop/") ||
    pathname === "/cart" ||
    pathname === "/favorites" ||
    pathname === "/products/pacific-european-window-sill-threshold-collection" ||
    pathname === "/privacy" ||
    pathname === "/search" ||
    (pathname.startsWith("/products/") && pathname.endsWith("/about")) ||
    // Pages whose address can be anything (the not-found page) say so
    // themselves with a data-header-light element.
    lightMarker;
  const headerDark = scrolled || isLightHeroPath;

  /* The bar's three grounds, in priority order:
       dark    - a mega is open. Beats everything, including scroll.
       light   - scrolled, a light-hero page, or the cursor is on the bar.
                 Hover only reaches here when no mega is open, which is
                 what stops the bar flickering light as a panel opens.
       regular - top of a dark-hero page, untouched: transparent + wash.
     Every child then takes its ink from `currentColor`, so one value on
     the wrapper repaints the logo, the links and the icons together. */
  const navTheme: NavTheme = megaOpen
    ? "dark"
    : headerDark || barHover
      ? "light"
      : "regular";
  /* Only the transparent-over-hero state still wants white ink. Both
     settled states (scrolled/hover, and mega-open) are now light grounds,
     so they share the dark ink. */
  const navInk =
    navTheme === "regular" ? NAV.inkOnDark : NAV.inkOnLight;

  /* Primary CTA pills (Visualizer, Get a Quote) - `.menu-btn.is-primary`
     in the reference. Translucent glass at rest, solid in both settled
     states. */
  const primaryPill: React.CSSProperties = {
    backgroundColor:
      navTheme === "dark"
        ? NAV.btnDark
        : navTheme === "light"
          ? NAV.btnLight
          : NAV.btnRegular,
    /* btnDark and btnRegular both want a light label; btnLight wants a
       dark one. Keyed off the pill colour, not the bar. */
    color: navTheme === "light" ? NAV.inkOnLight : NAV.inkOnDark,
    backdropFilter: navTheme === "regular" ? "blur(6px)" : undefined,
    transition: "background-color " + NAV.fast + " ease, color " + NAV.fast + " ease",
  };

  // Logo is always white now, everywhere, no color switching — per
  // explicit request. The one place this needs help is the homepage
  // top (unscrolled, directly over the bright marble hero) where a
  // plain white mark can wash out against light parts of the photo.
  // A soft drop-shadow (not a hard-edged background box — that was
  // the earlier "tile" behind the logo that was explicitly removed)
  // keeps it legible there without reintroducing a visible patch.

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
              <p className="text-sm font-light text-pacific-light leading-relaxed">
                We&apos;re still building this experience. Check back shortly —
                or get in touch and we&apos;ll let you know the moment it
                launches.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/contact"
                  onClick={() => setComingSoonLabel(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-pacific-dark hover:bg-pacific-light transition-colors"
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

      {/* Dim behind an open mega. Sits under the header and the panel
          (both z-50) and over the page. Kept pointer-events-none on
          purpose: the open/close logic runs on a 150 ms hover grace
          (see handleMegaLeave) and an interactive overlay would race
          it. It is a scrim, not a click-catcher. */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            key="mega-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "linear" }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              backgroundColor: NAV.overlay,
              backdropFilter: NAV.overlayFilter,
              WebkitBackdropFilter: NAV.overlayFilter,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        /* Hover is on the bar itself, not on the nav list, so the flip
           fires anywhere along the full-bleed row - including the dead
           space either side of the links. */
        onMouseEnter={() => setBarHover(true)}
        onMouseLeave={() => setBarHover(false)}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor:
            navTheme === "dark"
              ? NAV.bgMega
              : navTheme === "light"
                ? NAV.bgLight
                : "transparent",
          backgroundImage: navTheme === "regular" ? NAV.scrim : "none",
          color: navInk,
          boxShadow: navTheme === "light" ? NAV.shadow : "none",
          transition: [
            "background-color " + NAV.fast + " ease",
            "color " + NAV.fast + " ease",
            "border-color " + NAV.fast + " ease",
            "box-shadow " + NAV.fast + " ease",
          ].join(", "),
        }}
      >
        <nav
          /* Asymmetric by design: the logo sits closer to the left edge
             than the CTAs do to the right. The inline paddings win over
             `px-8` — they exist to keep the row clear of the notch /
             rounded corners on landscape phones, so the safe-area inset
             is still the floor on the left, just with a smaller default
             behind it. */
          /* Full-bleed, not a centred 1760px column. The cap was adding
             ~80px of dead space either side on a 1920 viewport, which is
             what kept the logo floating in from the left edge instead of
             sitting at it. The row now spans the bar and the inline
             paddings are the only gutter. */
          className="w-full px-8"
          style={{
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          {/* Three columns, the outer two equal, so the nav sits on the
              centre of the page rather than the centre of whatever the
              logo and the CTAs leave over. A `1fr` column never shrinks
              below its content: if the CTAs outgrow their half, the nav
              gives way to the left instead of overlapping anything.
              Items are pinned to their columns because the nav is
              display:none below 1700px and would otherwise let the CTAs
              flow into the middle one. The CTAs' pl-8 is the least room
              the nav keeps from the search icon when it has to give way
              (1700-1900px). */}
          <div className="grid h-20 min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-x-4">
            {/* Logo — one PacificLogoMark graphic, always white. The
                drop-shadow is a soft glow (not a hard box) so the mark
                stays legible over the bright homepage marble hero
                without reintroducing the flat background tile that
                used to sit behind it. */}
            <Link href="/" className="col-start-1 justify-self-start flex items-center group">
              {/* The Pacific Surfaces lockup (mark + PACIFIC +
                  SURFACES) as one graphic from the official artwork,
                  rather than an icon plus HTML text. Same size at every
                  breakpoint; it is compact enough never to crowd the
                  nav. */}
              <PacificLogoMark
                className={cn(
                  // h-10, down from h-12: at the old size the lockup
                  // crowded the nav on the narrower desktop widths.
                  "h-10 w-auto text-current transition-[filter] duration-200",
                  // The glow exists to lift the mark off photography.
                  // On a settled light or dark bar there is no photo
                  // behind it, and the shadow reads as a smudge.
                  navTheme === "regular" &&
                    "drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
                )}
              />
            </Link>

            {/* Desktop nav.
                Breakpoint: was `lg:` (1024px) — at that width, 7 nav
                items + the full logo lockup + the Get-a-Quote pill
                don't actually fit on real laptop viewports (1024-
                1440 CSS px covers most 13-16" laptops), which is
                exactly the reported "cuts in laptop" / clipped
                Get-a-Quote button. Raised to `xl:` (1280px) so the
                cramped range falls back to the mobile hamburger menu
                instead of a squeezed row.
                Safety net: `min-w-0` + `overflow-x-auto` means that
                even if this row is still too wide for the space left
                over after the logo and CTAs, IT scrolls internally —
                the Get-a-Quote pill (a sibling, not inside this div)
                can never be pushed off-screen and clipped by it. */}
            <div className="col-start-2 hidden min-[1700px]:flex items-center justify-center gap-x-4">
              {desktopNavigation.map((item: NavItem) => {
                return (
                  <div
                    key={item.name}
                    className="relative group shrink-0"
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
                          // No per-item hover colour, by design - the
                          // whole bar flips instead. Ink is inherited
                          // from the header wrapper.
                          "text-current",
                          navTheme === "regular" &&
                            "drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
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
                          // No per-item hover colour, by design - the
                          // whole bar flips instead. Ink is inherited
                          // from the header wrapper.
                          "text-current",
                          navTheme === "regular" &&
                            "drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
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
                            /* The hover bridge lives on THIS element,
                               which never moves. The panel that slides
                               is nested one level down inside its own
                               clipping box - see the note there. */
                            className="fixed inset-x-0 top-20 z-50 before:content-[''] before:absolute before:inset-x-0 before:-top-4 before:h-4"
                          >
                            {/* Brand navy panel — same #112732 used in the
                          header (scrolled state) and the dark sections
                          of the homepage. Border removed so it reads
                          as one continuous navy block with the header
                          above; shadow stays for the panel's bottom
                          edge against page content beneath. */}
                            {/* Clipping box. The panel slides down from
                                behind the bar (translateY(-100%) -> 0),
                                which is only a reveal if something crops
                                the part still above the bar.

                                Why the slide is HERE and not on the
                                motion.div above: that element carries
                                the `before:` hover bridge, and the
                                earlier y:-10 -> 0 animation on it slid
                                the bridge out from under a stationary
                                cursor mid-open, firing mouseleave and
                                slamming the menu shut. Keeping the
                                bridge on a fixed parent and moving only
                                the panel gets the reference's motion
                                without reopening that bug. */}
                            <div className="overflow-hidden">
                              <motion.div
                                initial={{ y: "-100%" }}
                                animate={{
                                  y: 0,
                                  transition: {
                                    duration: 0.45,
                                    ease: [0.25, 0.4, 0.25, 1],
                                  },
                                }}
                                exit={{
                                  y: "-100%",
                                  transition: {
                                    duration: 0.4,
                                    ease: [0.4, 0, 0.2, 1],
                                  },
                                }}
                                style={{ backgroundColor: NAV.bgMega }}
                                className="shadow-[0_18px_48px_rgba(0,0,0,0.16)] max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain"
                              >
                              <div
                                /* Full-bleed, like the bar above it. The
                                   1400px cap left the seven cards huddled
                                   in the middle of a 1920 screen while the
                                   nav ran edge to edge, so the panel read
                                   as a smaller, separate thing. Padding
                                   matches the header row exactly. */
                                className={cn(
                                  "w-full px-8",
                                  item.name === "Products"
                                    ? "pb-8 pt-7"
                                    : "py-5 lg:py-6"
                                )}
                              >
                                {/* Products has its own panel: seven
                              collection plates on one grid with the
                              detail row, colour on the plate under
                              the cursor. See ProductsMega. */}
                                {item.name === "Products" ? (
                                  <ProductsMega
                                    categories={PRODUCTS_CATEGORIES}
                                    active={activeMega}
                                    onToggle={(slug) => {
                                      setActiveMega(
                                        activeMega === slug ? null : slug
                                      );
                                      setHoveredApp(0);
                                    }}
                                    hoveredApp={hoveredApp}
                                    onHoverApp={setHoveredApp}
                                  />
                                ) : (
                                /* Cards row for the other megas. Each
                              card is a direct Link — click =
                              navigate, no sub-panel, no toggle.
                              Spaces and Professionals: 4 cards;
                              Corporate and Inspirations: 3. */
                                <div
                                  className={`grid gap-3 ${
                                    item.name === "Corporate" ||
                                    item.name === "Inspirations"
                                      ? "grid-cols-3"
                                      : "grid-cols-4"
                                  }`}
                                >
                                  {(item.name === "Spaces"
                                    ? SPACES_CATEGORIES
                                    : item.name === "Corporate"
                                      ? CORPORATE_CATEGORIES
                                      : item.name === "Professionals"
                                        ? PROFESSIONS_CATEGORIES
                                        : INSPIRATIONS_CATEGORIES
                                  ).map((cat) => {
                                    // Spaces / Corporate / Professions /
                                    // Inspirations all use the same
                                    // direct-Link card layout (each card
                                    // is a destination, no sub-panel).
                                    // Products has its own panel above.
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
                                            <div data-over-media className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-pacific-light via-white to-pacific-mid">
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
                                            <p className="mt-2.5 px-1 text-xs font-light tracking-wide text-[#3C3C3B]/70 leading-snug">
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
                                          <div data-over-media className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-pacific-light via-white to-pacific-mid">
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
                                                style={
                                                  cat.imagePosition
                                                    ? { objectPosition: cat.imagePosition }
                                                    : undefined
                                                }
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
                                          <p className="mt-2.5 px-1 text-xs font-light tracking-wide text-[#3C3C3B]/70 leading-snug">
                                            {cat.tagline}
                                          </p>
                                        </Link>
                                      );
                                  })}
                                </div>
                                )}
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
                                <div className="border-t border-[#3C3C3B]/12 bg-[#F4F4F3]">
                                  <div className="mx-auto max-w-[1400px] px-6 lg:px-8 flex items-center justify-end py-3">
                                    <Link
                                      href="/products"
                                      className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#3C3C3B] inline-flex items-center gap-1.5 hover:gap-2 transition-all"
                                    >
                                      All Products
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>
                              )}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ) : (
                      item.children && (
                        <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                          <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden min-w-max border border-pacific-mid/20">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-6 py-3.5 text-sm font-light tracking-wide text-pacific-dark/80 hover:text-pacific-dark hover:bg-pacific-light transition-colors duration-200 border-b border-pacific-mid/20 last:border-b-0"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA + Search + Mobile toggle */}
            <div className="col-start-3 justify-self-end flex items-center gap-1 min-[1700px]:gap-0.5 min-[1700px]:pl-8 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(
                  // Visible at every breakpoint — on mobile this is
                  // the only entry point to search (the hamburger menu
                  // doesn't carry one), and the row has room since the
                  // Quote/Visualizer pills are hidden below sm/2xl.
                  "flex items-center justify-center w-9 h-9 min-[1700px]:w-8 min-[1700px]:h-8 rounded-full transition-all duration-300 shrink-0",
                  // Dark in both states — same hover treatment.
                  // Inherits the bar's ink; the hover wash is struck
                  // from that same colour so it works on both grounds.
                  "text-current hover:bg-current/10"
                )}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Favorites — per the 2026 UX audit, "option to
                  favorite is available but there is not place to view
                  just the ones that have been favorited." Kept 2xl+
                  only (same tier as the Visualizer pill) so it can't
                  contribute to the header crowding already flagged at
                  the lg/xl range (see Get-a-Quote clipping note) — the
                  mobile menu carries its own Favorites link for every
                  other breakpoint. */}
              {/* Market switcher (INT / IND). First in the utility row so
                  it sits furthest from the CTAs and reads as a setting
                  rather than an action — the same position the reference
                  gives it. Inherits the bar's ink via `text-current`, so
                  it repaints with all four header theme states. */}

              {/* Store cart — kept beside Favorites at the same
                  breakpoint; the mobile menu carries its own link. */}
              <Link
                href="/cart"
                aria-label={
                  cartReady && cartCount > 0
                    ? `View cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                    : "View cart"
                }
                className={cn(
                  "relative hidden 2xl:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shrink-0",
                  // Inherits the bar's ink; the hover wash is struck
                  // from that same colour so it works on both grounds.
                  "text-current hover:bg-current/10"
                )}
              >
                <ShoppingBag className="w-4 h-4" />
                {cartReady && cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] rounded-full px-1 text-[10px] font-medium leading-[1.15rem]"
                    /* Inverted against the bar rather than fixed white,
                       which vanished once the bar went light. */
                    style={{
                      backgroundColor: navInk,
                      color:
                        navTheme === "regular" ? NAV.inkOnLight : NAV.bgLight,
                    }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/favorites"
                aria-label="View favorites"
                className={cn(
                  "hidden 2xl:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shrink-0",
                  // Inherits the bar's ink; the hover wash is struck
                  // from that same colour so it works on both grounds.
                  "text-current hover:bg-current/10"
                )}
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Customer Login — the /customer/login page and its
                  grievance/dashboard flow. An icon beside Cart and
                  Favorites (it was a labelled pill, which pushed the nav
                  off the centre of the page). Same 2xl+ tier; the mobile
                  menu carries its own link for every other breakpoint. */}
              <Link
                href="/customer/login"
                aria-label="Customer login"
                title="Customer login"
                className={cn(
                  "hidden 2xl:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shrink-0",
                  // Inherits the bar's ink; the hover wash is struck
                  // from that same colour so it works on both grounds.
                  "text-current hover:bg-current/10"
                )}
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Visualizer pill — now shows from xl+ (≥1280px),
                  matching the main nav's breakpoint (was 2xl/1536px,
                  which meant it never appeared on most laptops). The
                  nav row's internal scroll (see the wrapper above)
                  is what makes this safe to surface sooner — if
                  there isn't quite enough room, the nav items scroll
                  instead of this pill or Get-a-Quote getting
                  clipped. Below xl it's still reachable via the
                  mobile menu and the homepage hero. */}
              <Link
                href="/visualize"
                style={primaryPill}
                className="hidden xl:inline-flex ml-2 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.1em] uppercase whitespace-nowrap border border-transparent"
              >
                Visualizer
                <ArrowRight className="w-3 h-3 min-[1700px]:hidden" />
              </Link>

              <Link
                href="/contact"
                style={primaryPill}
                className="hidden sm:inline-flex ml-1.5 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.1em] uppercase whitespace-nowrap border border-transparent"
              >
                Get a Quote
                <ArrowRight className="w-3 h-3 min-[1700px]:hidden" />
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
                  // Symmetric with the desktop nav's xl: breakpoint
                  // above — hamburger shows exactly while the full
                  // nav row is hidden, no gap where neither is visible.
                  "min-[1700px]:hidden p-2 rounded-lg transition-colors",
                  // Inherits the bar's ink like everything else.
                  "text-current"
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
            className="fixed inset-0 z-[60] bg-pacific-dark/95 backdrop-blur-xl min-[1700px]:hidden overflow-y-auto overscroll-contain"
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
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-pacific-dark flex-shrink-0">
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
                                    <div className="text-[11px] font-light text-pacific-light truncate">
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
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wider uppercase bg-white text-pacific-dark"
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

              {/* Cart — mobile's only entry point below 2xl, same as
                  Favorites below it. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex justify-center"
              >
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Cart
                  {cartReady && cartCount > 0 && (
                    <span className="rounded-full bg-white px-2 text-[10px] font-medium leading-5 text-pacific-dark">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>

              {/* Favorites — mobile's only entry point below 2xl (the
                  header icon is 2xl+ only, see above). Plain text link,
                  intentionally quieter than the two CTA pills since
                  it's a secondary action. */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-4 flex justify-center"
              >
                <Link
                  href="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  View Favorites
                </Link>
              </motion.div>

              {/* Customer Login — mobile's only entry point below 2xl
                  (the header icon is 2xl+ only, see above). */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 flex justify-center"
              >
                <Link
                  href="/customer/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Customer Login
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
