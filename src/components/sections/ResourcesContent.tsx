"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// The reader pulls in pdf.js, so it is loaded only when someone opens a
// catalogue rather than on every visit to /resources.
const Flipbook = dynamic(
  () => import("@/components/catalogue/Flipbook").then((m) => m.Flipbook),
  { ssr: false }
);
import { BookOpen, Check, Download, FileText, Share2 } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { PageHeader } from "@/components/ui/page-header";

/**
 * Sanity Resource document shape — mirrors src/sanity/schemas/resource.ts.
 */
export interface SanityResource {
  _id: string;
  title: string;
  category: string; // see CATEGORY_META keys below
  description?: string;
  thumbnail?: string;
  pdfUrl?: string;
  pdfName?: string;
  order?: number;
}

/* ─── Category metadata ────────────────────────────────────────────
   Single source of truth for how each category renders: human-
   readable title, blurb, alternating background, and an optional
   fallback list of placeholder card titles. The page renders ONE
   section per category, in the order defined here, but only if
   that category has at least one published resource OR a fallback
   list. Any category not listed here is ignored — add it here if
   you want it to render. */

interface CategoryMeta {
  title: string;
  blurb: string;
  /**
   * Optional placeholder titles shown when Sanity has no resources
   * for this category yet. Each fallback renders with a disabled
   * "Download" button and a hint to upload via Sanity Studio. Once
   * a real resource is published for this category, the fallbacks
   * are replaced.
   */
  fallback?: string[];
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  quartz: {
    title: "Quartz Curations",
    blurb:
      "Discover our signature engineered quartz collections with curated color palettes and comprehensive design guides.",
    fallback: [
      "Quartz Color Palette",
      "Kosmic Color Palette",
      "Integrated Sink Collection",
      "Quartz Cut-to-Size Guide",
    ],
  },
  indian: {
    title: "Indian Edition",
    blurb:
      "Specially curated collections designed for the Indian market and regional preferences.",
    fallback: ["Indian Color Palette", "Chromia Vision Series"],
  },
  granite: {
    title: "Granite Curations",
    blurb:
      "Natural stone collections with comprehensive catalogs, finishes, and specifications for every application.",
    fallback: [
      "Natural Stone Catalog",
      "Beyond Stone",
      "Cut-to-Size Catalog",
      "Window Sills & Thresholds Flyer",
      "Monument Catalog",
      "Landscape Edition Catalog",
    ],
  },
  semiprecious: {
    title: "Semi-Precious Stones & Exotic",
    blurb:
      "Rare semi-precious stones and exotic surfaces, hand-picked for statement installations.",
  },
  sinks: {
    title: "Sinks (Integra)",
    blurb:
      "Specifications, installation guides, and finish options for the Integra integrated sink collection.",
  },
  ecosurfaces: {
    title: "Ecosurfaces",
    blurb:
      "Sustainable surface specifications, environmental certifications, and life-cycle documentation.",
  },
  cuttosize: {
    title: "Cut-to-Size & Architectural",
    blurb:
      "Architectural cut-to-size specifications, format catalogs, and project planning resources.",
  },
  technical: {
    title: "Technical Details",
    blurb:
      "Comprehensive technical specifications, structural data, and product test reports for architects, designers, and fabricators.",
    fallback: [
      "Quality Parameters",
      "Technical Data Sheet",
      "Life Cycle Assessment (LCA)",
      "Ecosurface Test Reports",
    ],
  },
  care: {
    title: "Care & Maintenance",
    blurb:
      "Daily care guidelines, stain-removal tips, and long-term maintenance schedules.",
    fallback: ["Care & Maintenance Sheet"],
  },
  sustainability: {
    title: "Sustainability",
    blurb: "Environmental policies, recycled-content data, and certifications.",
    fallback: ["Sustainability Blueprint"],
  },
  hospitality: {
    title: "Hospitality",
    blurb:
      "Surfaces specified for hotels, restaurants and resorts — applications, finishes and project references for the contract market.",
    fallback: ["Pacific Hospitality Collection"],
  },
  brand: {
    title: "Brand & Marketing",
    blurb:
      "Brand assets, logo guidelines, and marketing material for partners and dealers.",
    fallback: ["Brand Manual"],
  },
  fabrication: {
    title: "Fabrication Guides",
    blurb:
      "Cutting, edging, and installation instructions for fabricators and installers.",
    fallback: ["Fabrication Manual"],
  },
};

/** Order in which categories render on the page. Categories not in
 *  this list still render (in CATEGORY_META insertion order) — this
 *  array just guarantees the canonical order for the four sections
 *  that pre-existed. */
const CATEGORY_ORDER: string[] = [
  "quartz",
  "indian",
  "granite",
  "semiprecious",
  "sinks",
  "ecosurfaces",
  "cuttosize",
  "hospitality",
  "technical",
  "care",
  "sustainability",
  "brand",
  "fabrication",
];

/* ─── Card renderer ────────────────────────────────────────────────
   Thumbnail-dominant card. The cover image fills the full card; a
   bottom gradient + title + download button sit overlaid on top.
   Cards without a Sanity-uploaded thumbnail fall back to a dark
   gradient backdrop with a faint file-icon watermark, so the card
   shape is consistent whether or not artwork has been provided. */

/**
 * The key a shared link carries. Derived from the title rather than the
 * Sanity _id so the URL reads as something, and so a catalogue that is
 * later re-uploaded as a new document keeps its old links working.
 */
export function resourceKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ResourceCard({ resource }: { resource: SanityResource }) {
  const isReal = Boolean(resource.pdfUrl);
  const hasThumbnail = Boolean(resource.thumbnail);
  const [reading, setReading] = useState(false);
  const [shared, setShared] = useState(false);
  const key = resourceKey(resource.title);
  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/resources?read=${key}`;

  // A shared link opens straight into the booklet rather than dropping the
  // reader on the page and making them hunt for the card. Read from
  // window rather than useSearchParams: this sits inside a dynamic page,
  // and useSearchParams would force a Suspense boundary for no gain.
  useEffect(() => {
    if (!resource.pdfUrl) return;
    const wanted = new URLSearchParams(window.location.search).get("read");
    if (wanted === key) setReading(true);
  }, [key, resource.pdfUrl]);

  const share = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = {
      title: resource.title,
      text: `${resource.title} — Pacific Surfaces`,
      url: shareUrl,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      /* dismissed the sheet, or the clipboard was refused */
    }
  };

  // Pull the reader's chunk — pdf.js and its worker, ~440ms of the open —
  // while the pointer is still on the card, so the click only has to fetch
  // the document itself.
  const warm = () => {
    void import("@/components/catalogue/Flipbook");
  };

  return (
    <StaggerItem>
      {/* The whole card opens the reader, not just the Read button. Kept
          as a div with an explicit role rather than a <button>, because a
          button cannot legally contain the Download anchor. */}
      <div
        role={isReal ? "button" : undefined}
        tabIndex={isReal ? 0 : undefined}
        aria-label={isReal ? `Read ${resource.title}` : undefined}
        onClick={isReal ? () => setReading(true) : undefined}
        onMouseEnter={isReal ? warm : undefined}
        onFocus={isReal ? warm : undefined}
        onKeyDown={
          isReal
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setReading(true);
                }
              }
            : undefined
        }
        data-over-media
        className={`group flex h-full flex-col overflow-hidden rounded-none bg-[#0a1620] border border-white/10 hover:border-white/25 transition-colors duration-500 ${
          isReal
            ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            : ""
        }`}
      >
        {/* Cover. Real Sanity image when available; soft gradient + file
            watermark for fallback stubs so the card never looks broken. */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {hasThumbnail ? (
            <Image
              src={resource.thumbnail!}
              alt={resource.title}
              fill
              // Zoomed to 110% so the thumbnail crops in tighter and reads
              // as a "subject-forward" composition. The container is
              // overflow-hidden so the extra 10% just gets cropped off.
              className="object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.14]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-[#1a2c3a] via-[#0e2030] to-[#0a1620]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText
                  className="w-16 h-16 text-white/8"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer, under the cover (2026-10-29): the title above, the Read
            button and the share and download icons in a row beneath it, so
            a long title never runs under the buttons, in two columns on a
            phone as in four on a desktop. */}
        <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-light uppercase leading-snug tracking-[0.04em] text-white sm:text-sm">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="mt-1 text-xs text-white/75 font-light leading-relaxed line-clamp-2">
                {resource.description}
              </p>
            )}
            {!isReal && (
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Upload via Sanity to enable
              </p>
            )}
          </div>

          {isReal ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* Read opens the catalogue in the flipbook; Download keeps
                  the original behaviour for anyone who wants the file. */}
              <button
                type="button"
                onClick={() => setReading(true)}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/45 bg-white/15 px-3 sm:w-auto sm:flex-1 text-xs font-medium uppercase tracking-[0.08em] text-white transition-all duration-300 hover:bg-white/30 hover:border-white/70"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Read
              </button>
              <button
                type="button"
                onClick={share}
                aria-label={`Share ${resource.title}`}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition-all duration-300 hover:bg-white/25 hover:border-white/55 sm:w-9 sm:flex-none"
              >
                {shared ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
              <a
                href={resource.pdfUrl}
                target="_blank"
                rel="noreferrer noopener"
                download={resource.pdfName ?? `${resource.title}.pdf`}
                aria-label={`Download ${resource.title}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition-all duration-300 hover:bg-white/25 hover:border-white/55 sm:w-9 sm:flex-none"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-9 items-center justify-center gap-1.5 px-4 text-xs font-medium tracking-[0.08em] uppercase text-white/45 bg-white/5 border border-white/15 rounded-full cursor-not-allowed"
            >
              Download
            </span>
          )}
        </div>
      </div>

      {reading && resource.pdfUrl && (
        <Flipbook
          url={resource.pdfUrl}
          title={resource.title}
          poster={resource.thumbnail}
          shareUrl={shareUrl}
          onClose={() => setReading(false)}
        />
      )}
    </StaggerItem>
  );
}

/* ─── Section renderer ─────────────────────────────────────────────
   A category is its Sanity entries when it has any, else its placeholder
   stubs. A category with one or two cards would leave most of a wide row
   empty, so two such categories that follow each other share a row from lg
   (2026-10-29); the rest take the full row, title and blurb on the left and
   the cards beside them. */

interface Block {
  category: string;
  meta: CategoryMeta;
  cards: SanityResource[];
}

function Heading({ meta }: { meta: CategoryMeta }) {
  return (
    <AnimatedSection className="mb-5 sm:mb-6 lg:mb-0">
      <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
        {meta.title}
      </h2>
      <p className="mt-2 text-sm text-pacific-mid font-light leading-relaxed sm:text-base">
        {meta.blurb}
      </p>
    </AnimatedSection>
  );
}

const GRID = "grid grid-cols-2 gap-3 sm:gap-5";

function ResourceSection({
  bgClass,
  blocks,
}: {
  bgClass: string;
  blocks: Block[];
}) {
  const paired = blocks.length > 1;
  return (
    <section className={`${bgClass} border-b border-white/10`}>
      <div
        className={
          paired
            ? "mx-auto max-w-7xl px-6 lg:px-8 py-8 sm:py-10 lg:grid lg:grid-cols-2 lg:gap-14 lg:py-12"
            : "mx-auto max-w-7xl px-6 lg:px-8 py-8 sm:py-10 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10 lg:py-12"
        }
      >
        {blocks.map((blk, i) => (
          <div
            key={blk.category}
            // Stacked on a phone, so the second category is set off from the
            // first by space, not run on.
            className={
              paired ? "lg:mt-0 " + (i > 0 ? "mt-10" : "") : "contents"
            }
          >
            {paired ? (
              <>
                <Heading meta={blk.meta} />
                <StaggerContainer className={`${GRID} lg:mt-6`}>
                  {blk.cards.map((c) => (
                    <ResourceCard key={c._id} resource={c} />
                  ))}
                </StaggerContainer>
              </>
            ) : (
              <>
                <Heading meta={blk.meta} />
                <StaggerContainer
                  className={`${GRID} md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4`}
                >
                  {blk.cards.map((c) => (
                    <ResourceCard key={c._id} resource={c} />
                  ))}
                </StaggerContainer>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Top-level page content ───────────────────────────────────────
   Renders one section per category in CATEGORY_ORDER. Sections are
   skipped automatically if they have neither published resources nor
   fallback stubs. Categories that exist in Sanity data but aren't in
   CATEGORY_META are silently ignored — add them to CATEGORY_META to
   surface them. */

/* ─── Catalogues held in the repo ──────────────────────────────────
   Everything else on this page comes from Sanity. This one is served
   from /public because there is no write token to upload it with; move
   it into Sanity and delete the entry here and nothing else changes,
   since both shapes are the same SanityResource. */
const LOCAL_RESOURCES: SanityResource[] = [
  {
    _id: "local-hospitality-collection",
    title: "PACIFIC HOSPITALITY COLLECTION",
    category: "hospitality",
    description:
      "Surfaces specified for hotels, restaurants and resorts — 34 pages of applications, finishes and project references.",
    thumbnail: "/catalogues/pacific-hospitality-collection-cover.webp",
    pdfUrl: "/catalogues/pacific-hospitality-collection.pdf",
    pdfName: "Pacific Hospitality Collection.pdf",
    order: -1,
  },
];

export function ResourcesContent({
  resources: sanityResources = [],
}: {
  resources?: SanityResource[];
}) {
  const resources = [...LOCAL_RESOURCES, ...sanityResources];

  // Collect any unique categories from Sanity that aren't in our
  // canonical order (just in case we missed registering one) — they
  // render at the end.
  const knownCategories = new Set(CATEGORY_ORDER);
  const trailingCategories = Array.from(
    new Set(resources.map((r) => r.category))
  ).filter((c) => !knownCategories.has(c) && CATEGORY_META[c]);

  const allCategories = [...CATEGORY_ORDER, ...trailingCategories];

  const blocks: Block[] = allCategories.flatMap((category) => {
    const meta = CATEGORY_META[category];
    if (!meta) return [];
    const fromSanity = resources.filter((r) => r.category === category);
    const cards: SanityResource[] =
      fromSanity.length > 0
        ? fromSanity
        : (meta.fallback ?? []).map((title, i) => ({
            _id: `fallback-${category}-${i}`,
            title,
            category,
          }));
    return cards.length > 0 ? [{ category, meta, cards }] : [];
  });

  // Two small categories in a row share a band; the rest are a band each.
  const rows: Block[][] = [];
  for (let i = 0; i < blocks.length; i++) {
    const small = (b?: Block) => !!b && b.cards.length <= 2;
    if (small(blocks[i]) && small(blocks[i + 1])) {
      rows.push([blocks[i], blocks[i + 1]]);
      i++;
    } else {
      rows.push([blocks[i]]);
    }
  }

  return (
    <>
      <PageHeader
        badge="Resources"
        title="Explore Our Premium Stone Catalogs"
        description="Browse comprehensive design collections, technical documentation, and specifications for all our quartz, granite, and ecosurface products."
      />

      {rows.map((blocks, idx) => (
        <ResourceSection
          key={blocks.map((b) => b.category).join("+")}
          // Alternate background per section for visual rhythm.
          bgClass={idx % 2 === 0 ? "bg-[#112732]" : "bg-[#0e2030]"}
          blocks={blocks}
        />
      ))}

      {/* CTA Section */}
      <section className="bg-pacific-dark">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-pacific-mid font-light mb-8">
              Reach out to our team for specialized catalogs, custom
              specifications, or technical consultations.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-pacific-dark rounded-xl font-light tracking-wide hover:bg-pacific-light transition-colors duration-300"
            >
              Contact Us
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
