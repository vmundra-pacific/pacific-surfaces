"use client";

/**
 * CollectionsShowcaseGrid — pinned horizontal carousel.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatCollection } from "@/components/catalogue/labels";

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

const VH_PER_CARD = 65;

const CATEGORY_RULES: Array<{
  matches: string[];
  category: string;
  forceRoot?: boolean;
}> = [
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
  { category: "exotic", matches: ["exotic"] },
  { category: "semi-precious", matches: ["semi"] },
  { category: "integra", matches: ["integra"] },
  { category: "vanity", matches: ["vanity"] },
  { category: "centrepiece-couture", matches: ["centrepiece"] },
  // Stone Finishes (rebranded "Beyond Finish") routes to
  // /products/facades-and-finishes. Matches both Sanity's current
  // collection name and the new brand alias in case the underlying
  // Sanity doc is renamed later.
  {
    category: "facades-and-finishes",
    matches: ["stone finish", "beyond finish"],
    // forceRoot: always link to /products/facades-and-finishes,
    // never to a nested /products/facades-and-finishes/<slug>.
    // The Sanity "Stone Finishes" collection has slug "stone-
    // finishes" which doesn't equal the category slug, so the
    // generic isCategoryRoot detection misses it and would build
    // a nested URL that doesn't exist as a route.
    forceRoot: true,
  },
];

const VALID_CATEGORY_SLUGS = new Set([
  "quartz",
  "granites",
  "semi-precious",
  "exotic",
  "centrepiece-couture",
  "integra",
  "facades-and-finishes",
  "vanity",
]);

function urlForCollection(name: string, slug: string): string {
  const n = name.toLowerCase();
  const s = slug.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.matches.some((m) => n.startsWith(m))) {
      const isCategoryRoot =
        s === rule.category ||
        rule.category.startsWith(s) ||
        s.startsWith(rule.category);
      if (rule.forceRoot || isCategoryRoot) return `/products/${rule.category}`;
      return `/products/${rule.category}/${slug}`;
    }
  }
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

  // Hand-picked carousel order. Each entry is a prefix matched
  // case-insensitively against the Sanity collection's `name`.
  const CURATED_NAMES = [
    "Quartz",
    "Vision",
    "Granite",
    "Exotic",
    "Semi-Precious Stones",
    "Integra",
    "Centrepiece Couture",
    "Vanity",
    // Stone Finishes renders as "Beyond Finish" via the
    // COLLECTION_LABELS rename map in labels.ts.
    "Stone Finish",
  ];
  const items = CURATED_NAMES.map((target) =>
    allItems.find((c) => c.name.toLowerCase().startsWith(target.toLowerCase()))
  ).filter(Boolean) as typeof allItems;

  const numCards = items.length;
  const sectionHeightVh = 100 + numCards * VH_PER_CARD;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travelPx, setTravelPx] = useState(0);

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
                Curated to define spaces that endure a lifetime.
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
                Eight signature collections. Over 200 designs. Each one
                engineered to pass a fabricator&apos;s precision test and an
                architect&apos;s critical eye.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex items-center">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-4 lg:gap-5 px-6 lg:px-8 will-change-transform"
          >
            {items.map((col, i) => {
              const isSanity = "slug" in col && typeof col.slug === "object";
              const slug = isSanity
                ? (col as SanityCollection).slug.current
                : (col as (typeof fallbackCollections)[number]).slug;
              const isWide = isSanity
                ? (col as SanityCollection).showcaseLayout === "wide"
                : (col as (typeof fallbackCollections)[number]).wide;
              const image = isSanity ? (col as SanityCollection).image : null;
              const tag = col.tag;
              // Display names go through formatCollection() so the
              // homepage carousel respects the COLLECTION_LABELS rename
              // map ("Stone Finishes" -> "Beyond Finish",
              // "Vision Series" -> "Eclipse"). Sanity data stays
              // untouched.
              const rawName = col.name;
              const name = formatCollection(rawName);
              const finishCount = isSanity
                ? (col as SanityCollection).finishCount ||
                  `${(col as SanityCollection).productCount} Products`
                : (col as (typeof fallbackCollections)[number]).finishCount;
              const rawHeadline = isSanity
                ? (col as SanityCollection).headline ||
                  (col as SanityCollection).name
                : (col as (typeof fallbackCollections)[number]).headline;
              // Only rename the headline if it matches the raw
              // collection name (i.e. an editor hasn't already set a
              // custom headline). Custom headlines render verbatim.
              const headline =
                rawHeadline === rawName
                  ? formatCollection(rawHeadline)
                  : rawHeadline;
              const bg = isSanity
                ? gradientFallbacks[i % gradientFallbacks.length]
                : (col as (typeof fallbackCollections)[number]).bg;
              const key = isSanity
                ? (col as SanityCollection)._id
                : (col as (typeof fallbackCollections)[number]).slug;

              const widthClass = isWide
                ? "w-[80vw] sm:w-[60vw] md:w-[44vw] lg:w-[40vw]"
                : "w-[72vw] sm:w-[44vw] md:w-[32vw] lg:w-[26vw]";

              return (
                <Link
                  key={key}
                  href={urlForCollection(rawName, slug)}
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
