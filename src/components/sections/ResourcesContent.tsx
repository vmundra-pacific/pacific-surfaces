"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
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
      "Natural Stone Finishes",
      "Cut-to-Size Catalog",
      "Window Sills & Thresholds Flyer",
      "Monument Catalog",
      "Landscape Edition Catalog",
    ],
  },
  semiprecious: {
    title: "Semi-Precious & Exotic",
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

function ResourceCard({ resource }: { resource: SanityResource }) {
  const isReal = Boolean(resource.pdfUrl);
  const hasThumbnail = Boolean(resource.thumbnail);

  return (
    <StaggerItem>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0a1620] border border-white/10 hover:border-white/25 transition-all duration-500">
        {/* Thumbnail layer — fills the card. Real Sanity image when
            available; soft gradient + file watermark for fallback
            stubs so the card never looks broken. */}
        {hasThumbnail ? (
          <Image
            src={resource.thumbnail!}
            alt={resource.title}
            fill
            // Always zoomed to 110% so the thumbnail crops in tighter
            // and reads as a "subject-forward" composition. Container
            // is overflow-hidden so the extra 10% just gets cropped
            // off the edges.
            className="object-cover scale-110 transition-transform duration-700 group-hover:scale-[1.14]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-[#1a2c3a] via-[#0e2030] to-[#0a1620]"
            />
            {/* Faint file-icon watermark, centred */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText
                className="w-20 h-20 text-white/8"
                strokeWidth={1}
                aria-hidden="true"
              />
            </div>
          </>
        )}

        {/* Bottom gradient — keeps the title and download button
            readable against any thumbnail. Top fades fully transparent
            so the artwork dominates the upper two-thirds of the card. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none"
        />

        {/* Footer — title on the left, download pill on the right.
            The pill uses a frosted-glass treatment (translucent white
            + backdrop-blur) so it reads well over both light and dark
            thumbnail regions. */}
        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-light text-white leading-tight">
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
            <a
              href={resource.pdfUrl}
              target="_blank"
              rel="noreferrer noopener"
              download={resource.pdfName ?? `${resource.title}.pdf`}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-[0.08em] uppercase text-white bg-white/15 backdrop-blur-md border border-white/35 rounded-full hover:bg-white/25 hover:border-white/55 transition-all duration-300"
            >
              Download
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium tracking-[0.08em] uppercase text-white/45 bg-white/5 border border-white/15 rounded-full cursor-not-allowed"
            >
              Download
            </span>
          )}
        </div>
      </div>
    </StaggerItem>
  );
}

/* ─── Section renderer ─────────────────────────────────────────────
   Renders one category section. Uses Sanity entries when present,
   falls back to placeholder stubs when configured. */

function ResourceSection({
  meta,
  bgClass,
  category,
  resources,
}: {
  meta: CategoryMeta;
  bgClass: string;
  category: string;
  resources: SanityResource[];
}) {
  const fromSanity = resources.filter((r) => r.category === category);
  const cards: SanityResource[] =
    fromSanity.length > 0
      ? fromSanity
      : (meta.fallback ?? []).map((title, i) => ({
          _id: `fallback-${category}-${i}`,
          title,
          category,
        }));

  if (cards.length === 0) return null;

  return (
    <section className={`${bgClass} border-b border-white/10`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <AnimatedSection className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            {meta.title}
          </h2>
          <p className="mt-2 text-pacific-mid font-light">{meta.blurb}</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((c) => (
            <ResourceCard key={c._id} resource={c} />
          ))}
        </StaggerContainer>
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

export function ResourcesContent({
  resources = [],
}: {
  resources?: SanityResource[];
}) {
  // Collect any unique categories from Sanity that aren't in our
  // canonical order (just in case we missed registering one) — they
  // render at the end.
  const knownCategories = new Set(CATEGORY_ORDER);
  const trailingCategories = Array.from(
    new Set(resources.map((r) => r.category))
  ).filter((c) => !knownCategories.has(c) && CATEGORY_META[c]);

  const allCategories = [...CATEGORY_ORDER, ...trailingCategories];

  return (
    <>
      <PageHeader
        badge="Resources"
        title="Explore Our Premium Stone Catalogs"
        description="Browse comprehensive design collections, technical documentation, and specifications for all our quartz, granite, and ecosurface products."
      />

      {allCategories.map((cat, idx) => {
        const meta = CATEGORY_META[cat];
        if (!meta) return null;
        // Alternate background per section for visual rhythm.
        const bgClass = idx % 2 === 0 ? "bg-[#112732]" : "bg-[#0e2030]";
        return (
          <ResourceSection
            key={cat}
            meta={meta}
            bgClass={bgClass}
            category={cat}
            resources={resources}
          />
        );
      })}

      {/* CTA Section */}
      <section className="bg-stone-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-stone-400 font-light mb-8">
              Reach out to our team for specialized catalogs, custom
              specifications, or technical consultations.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-stone-950 rounded-xl font-light tracking-wide hover:bg-stone-100 transition-colors duration-300"
            >
              Contact Us
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
