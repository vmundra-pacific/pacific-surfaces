"use client";

/**
 * CollectionsShowcaseGrid — pinned horizontal carousel.
 *
 * The section locks to the viewport while the user scrolls vertically;
 * that vertical scroll is translated into a horizontal slide of the
 * cards inside. Once the cards have travelled their full distance,
 * the pin releases and the rest of the page continues normally.
 *
 * Layout choices:
 *  - The section's height grows with the number of cards, so more
 *    collections = more scroll budget = same per-card pacing.
 *  - The header (eyebrow + title + paragraph) stays pinned at the
 *    top of the sticky child for the full duration of the scroll,
 *    keeping context while the cards pass through.
 *  - A scroll-progress bar sits at the bottom of the sticky child so
 *    the user knows how much of the carousel is left.
 *
 * Pace tuning: see `VH_PER_CARD` below.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface SanityCollection {
  _id: string;
  name: string;
  slug: { current: string };
  image: string | null;
  tag: string | null;
  headline: string | null;
  finishCount: string | null;
  showcaseLayout: "wide" | "narrow" | null;
  productCount: number;
}

// Fallback data when Sanity has no collections yet.
const fallbackCollections = [
  {
    name: "Calacatta Couture",
    finishCount: "24 Finishes",
    tag: "Signature",
    headline: "The Centrepiece.",
    slug: "centrepiece-couture",
    wide: true,
    bg: "bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50",
  },
  {
    name: "Nebula",
    finishCount: "12 Finishes",
    tag: "New",
    headline: "Nebula.",
    slug: "nebula-collection",
    wide: false,
    bg: "bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500",
  },
  {
    name: "Kosmic",
    finishCount: "18 Finishes",
    tag: null,
    headline: "Kosmic.",
    slug: "kosmic-collection",
    wide: false,
    bg: "bg-gradient-to-br from-amber-900/60 via-stone-700 to-stone-600",
  },
  {
    name: "Statuario",
    finishCount: "9 Finishes",
    tag: null,
    headline: "Statuario.",
    slug: "statuario",
    wide: false,
    bg: "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
  },
  {
    name: "Ecosurfaces",
    finishCount: "Recycled Content",
    tag: "Silica-Free",
    headline: "Ecosurfaces.",
    slug: "ecosurfaces",
    wide: true,
    bg: "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600",
  },
];

const gradientFallbacks = [
  "bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50",
  "bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500",
  "bg-gradient-to-br from-amber-900/60 via-stone-700 to-stone-600",
  "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
  "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600",
];

/** How much vertical-scroll budget (in vh) each card consumes. Lower
 *  = faster carousel, higher = lazier. 60–80 reads as cinematic. */
const VH_PER_CARD = 65;

/**
 * Map a collection name to its URL category, so cards link into the
 * /products/[category]/[slug] hierarchy instead of the old flat
 * /collections/[slug] one.
 *
 * Reference (per spec):
 *   quartz       → Vision, Chromia, Kosmic, Celestia, Aurora,
 *                  Nebula, Luminara, plus the top-level "Quartz" card
 *   granite      → Granite, granite-family collections
 *   semiprecious → Semi Precious Stones, Exotic
 *   sinks        → Integra
 *   (default)    → anything else falls back to "products"
 *
 * Match is case-insensitive prefix on the collection's name. Edit
 * CATEGORY_RULES below to add or move collections.
 */
const CATEGORY_RULES: Array<{ matches: string[]; category: string }> = [
  {
    category: "quartz",
    matches: [
      "quartz",
      "vision",
      "chromia",
      "kosmic",
      "celestia",
      "aurora",
      "nebula",
      "luminara",
    ],
  },
  { category: "granites", matches: ["granite"] },
  // Exotic gets its own top-level category route, NOT lumped under
  // semi-precious. Both have their own hero video + landing page;
  // routing Exotic into semi-precious played the wrong clip and
  // produced a misleading URL like /products/semi-precious/exotic-
  // collection. Listing exotic before semi here so the prefix match
  // resolves to "exotic" first when both could match.
  { category: "exotic", matches: ["exotic"] },
  { category: "semi-precious", matches: ["semi"] },
  { category: "integra", matches: ["integra"] },
  // Vanity is its own top-level category at /products/vanity. Match
  // is a prefix on the Sanity collection name so any "Vanity *"
  // collection routes there. The standalone "centrepiece" rule below
  // catches the parent Centrepiece Couture collection.
  { category: "vanity", matches: ["vanity"] },
  { category: "centrepiece-couture", matches: ["centrepiece"] },
];

// Category slugs that resolve to real top-level routes — used to
// validate the rule output and the bare-slug fallback. If a fallback
// produces a slug that ISN'T in this set, we redirect the link to the
// /products catalogue index rather than 404.
const VALID_CATEGORY_SLUGS = new Set([
  "quartz",
  "granites",
  "semi-precious",
  "exotic",
  "centrepiece-couture",
  "integra",
  "natural-stone-finishes",
  "vanity",
]);

function urlForCollection(name: string, slug: string): string {
  const n = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.matches.some((m) => n.startsWith(m))) {
      return `/products/${rule.category}/${slug}`;
    }
  }
  // No category rule matched. If the slug itself is a known top-level
  // category (rare but happens with seed data), use it directly.
  // Otherwise route to the products catalogue index — clicking the
  // card still lands users on a real page instead of a 404.
  if (VALID_CATEGORY_SLUGS.has(slug)) return `/products/${slug}`;
  return `/products`;
}

export function CollectionsShowcaseGrid({
  collections,
}: {
  collections?: SanityCollection[];
}) {
  const hasSanityData = collections && collections.length > 0;
  const allItems = hasSanityData ? collections! : fallbackCollections;

  // Curate the carousel down to a hand-picked, ordered subset.
  // Match is case-insensitive prefix on the collection name (i.e.
  // the Sanity collection's name must START WITH the curated string).
  // Prefix matching prevents accidental hits — e.g. "Vanity" will
  // match "Vanity Couture" but NOT "Monolith Quartz Vanity". Edit
  // this array to retune the carousel.
  const CURATED_NAMES = [
    "Quartz",
    "Vision",
    "Granite",
    "Exotic",
    "Semi Precious",
    // "Fab Creations" — hidden from the homepage showcase until the
    // collection has at least one published product. Re-enable by
    // uncommenting the line above the matching entry in
    // src/components/layout/Header.tsx as well.
    "Integra",
    "Centrepiece Couture",
    "Vanity",
  ];
  const items = CURATED_NAMES.map((target) =>
    allItems.find((c) => c.name.toLowerCase().startsWith(target.toLowerCase()))
  ).filter(Boolean) as typeof allItems;

  const numCards = items.length;

  // Section height: a pin-entry buffer of 100vh + a per-card budget
  // for the horizontal travel. With 6 cards at 65vh each = 490vh
  // total — feels like a substantial set-piece without dragging.
  const sectionHeightVh = 100 + numCards * VH_PER_CARD;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travelPx, setTravelPx] = useState(0);

  // Measure the actual horizontal distance the track needs to slide,
  // re-measuring on resize. We use the track's real `scrollWidth` so
  // it always lines up regardless of card width / count / responsive
  // breakpoints.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const distance = track.scrollWidth - window.innerWidth;
      setTravelPx(Math.max(0, distance));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [numCards]);

  // Map the section's vertical scroll progress (0 → 1) onto a
  // horizontal pixel translation (0 → -travelPx). framer-motion's
  // useScroll on the section ref + offset = ["start start", "end end"]
  // means progress hits 1 exactly when the section's bottom touches
  // the viewport's bottom.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travelPx]);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="sec-collections"
      className="relative bg-[#112732] scroll-mt-20"
      style={{ height: `${sectionHeightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Header — stays fixed at the top of the sticky child while
            the cards slide past underneath. */}
        <div className="shrink-0 px-6 lg:px-8 pt-16 lg:pt-20 pb-6">
          <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="lg:max-w-lg">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-4"
              >
                01 · Collections
              </motion.div>
              <TextReveal
                as="h2"
                className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
              >
                Curated to define luxury that lasts a lifetime.
              </TextReveal>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:max-w-md lg:pt-8"
            >
              <p className="text-base font-light text-pacific-light leading-relaxed">
                Six signature collections. Over 140 finishes. Each one
                engineered to pass a fabricator&apos;s test and an
                architect&apos;s eye — then specified in homes, hotels, and
                hospitals around the world.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Horizontal track — the cards live in a flex row that gets
            translated along X based on scroll progress. items-center
            vertically centres them in the remaining space. */}
        <div className="flex-1 relative overflow-hidden flex items-center">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-4 lg:gap-5 px-6 lg:px-8 will-change-transform"
          >
            {items.map((col, i) => {
              // Normalise field access so Sanity and fallback data
              // share the same render path.
              const isSanity = "slug" in col && typeof col.slug === "object";
              const slug = isSanity
                ? (col as SanityCollection).slug.current
                : (col as (typeof fallbackCollections)[number]).slug;
              const isWide = isSanity
                ? (col as SanityCollection).showcaseLayout === "wide"
                : (col as (typeof fallbackCollections)[number]).wide;
              const image = isSanity ? (col as SanityCollection).image : null;
              const tag = col.tag;
              const name = col.name;
              const finishCount = isSanity
                ? (col as SanityCollection).finishCount ||
                  `${(col as SanityCollection).productCount} Products`
                : (col as (typeof fallbackCollections)[number]).finishCount;
              const headline = isSanity
                ? (col as SanityCollection).headline ||
                  (col as SanityCollection).name
                : (col as (typeof fallbackCollections)[number]).headline;
              const bg = isSanity
                ? gradientFallbacks[i % gradientFallbacks.length]
                : (col as (typeof fallbackCollections)[number]).bg;
              const key = isSanity
                ? (col as SanityCollection)._id
                : (col as (typeof fallbackCollections)[number]).slug;

              // Card sizing: wider cards for "showcase: wide", narrower
              // otherwise. Responsive — narrower viewports get bigger
              // cards relative to viewport so each one reads big on
              // mobile / tablet too.
              const widthClass = isWide
                ? "w-[80vw] sm:w-[60vw] md:w-[44vw] lg:w-[40vw]"
                : "w-[72vw] sm:w-[44vw] md:w-[32vw] lg:w-[26vw]";

              return (
                <Link
                  key={key}
                  href={urlForCollection(name, slug)}
                  className={`group relative shrink-0 rounded-2xl overflow-hidden block h-[60vh] max-h-[640px] ${widthClass}`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes={isWide ? "60vw" : "30vw"}
                    />
                  ) : (
                    <div className={`absolute inset-0 ${bg}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                  {tag && (
                    <span className="absolute top-5 left-5 z-10 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-[0.18em] uppercase text-white">
                      {tag}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] tracking-[0.12em] text-white/60 mb-1">
                        {name} · {finishCount}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                        {headline}
                      </h3>
                    </div>
                    <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* Progress bar — visualises how far the user is through the
            horizontal carousel, plus a small hint label so it's
            obvious the section is interactive. */}
        <div className="shrink-0 px-6 lg:px-8 pb-8">
          <div className="mx-auto max-w-7xl flex items-center gap-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-pacific-mid whitespace-nowrap">
              Scroll
            </span>
            <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/70 origin-left"
                style={{ scaleX: progressScale }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
