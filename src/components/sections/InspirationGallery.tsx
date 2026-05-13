"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

/**
 * InspirationGallery — client-side filterable photo grid for
 * /inspirations/inspiration-gallery.
 *
 * Sections:
 *   1. Editorial hero
 *   2. Filter chips (All / Kitchens / Bathrooms / Living / Commercial / Outdoor)
 *   3. Card grid (animated filter transitions)
 *   4. Lightbox view (click to expand)
 *   5. Statement break
 *   6. Submit-your-project CTA
 *
 * Project list lives inline — easy to extend or swap for a Sanity
 * fetch later. Image paths point at existing /public assets so the
 * page works out of the box; real installation photography drops in
 * by replacing the `image` field on each entry.
 */

type Category =
  | "all"
  | "kitchens"
  | "bathrooms"
  | "living"
  | "commercial"
  | "outdoor";

interface Project {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  surface: string;
  image: string;
}

const PROJECTS: Project[] = [
  // Every entry below was written after looking at the actual image
  // file — title, surface and category match what the
  // photograph shows, not the filename.
  {
    id: "k01",
    title: "Travertine waterfall island in a walnut kitchen",
    category: "kitchens",
    surface: "Quartz · Travertine",
    image: "/images/spaces/kitchens.png",
  },
  {
    id: "b01",
    title: "Travertine bathroom with a freestanding stone tub",
    category: "bathrooms",
    surface: "Quartz · Travertine Honed",
    image: "/images/spaces/bathrooms.jpg",
  },
  {
    id: "c01",
    title: "Textured stoneface wall above a polished counter",
    category: "commercial",
    surface: "Beyond Finish · Stoneface",
    image: "/images/spaces/commercial.jpg",
  },
  {
    id: "a01",
    title: "A moody stone feature wall, framed in timber",
    category: "living",
    surface: "Quartz · Ruskin",
    image: "/images/spaces/architecture.png",
  },
  {
    id: "b02",
    title: "Beige-veined marble bath with a cocoon-shaped tub",
    category: "bathrooms",
    surface: "Eclipse · Pietra Light",
    image: "/images/products/quartz.jpg",
  },
  {
    id: "k02",
    title: "Backlit Cristallo island, city skyline beyond",
    category: "kitchens",
    surface: "Exotic · Cristallo, Backlit",
    image: "/images/products/semi-precious.png",
  },
  {
    id: "l01",
    title: "Pale marble fireplace wall in an open living room",
    category: "living",
    surface: "Eclipse · Taj Vein",
    image: "/images/products/vision.png",
  },
  {
    id: "k03",
    title: "Warm-veined granite counter with a brass mixer",
    category: "kitchens",
    surface: "Granite · Saffron",
    image: "/images/products/granites.png",
  },
  {
    id: "o01",
    title: "Dark slab cladding on a modern home at dusk",
    category: "outdoor",
    surface: "Beyond Finish · Carbon",
    image: "/images/products/facades.png",
  },
];

const FILTERS: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "kitchens", label: "Kitchens" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "living", label: "Living" },
  { id: "commercial", label: "Commercial" },
  { id: "outdoor", label: "Outdoor" },
];

export function InspirationGallery() {
  const [filter, setFilter] = useState<Category>("all");
  const [lightbox, setLightbox] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <main className="bg-[#0a1620] text-pacific-light">
      {/* ── 1. Hero ── */}
      <section className="relative min-h-[78vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src="/images/inspirations/inspiration-gallery.png"
          alt="Pacific Surfaces inspiration gallery"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/10" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 w-full">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-pacific-mid/80 font-medium">
              Inspirations · Gallery
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] max-w-4xl">
              Where surfaces become{" "}
              <em className="italic font-light">stories.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-pacific-light/85 leading-relaxed">
              Installed Pacific projects, room by room — kitchens, bathrooms,
              living spaces, commercial interiors, and outdoor settings. Browse
              by category, click any frame to open it large.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 2. Filter chips ── */}
      <section className="bg-[#0a1620] border-b border-white/5 sticky top-20 z-20 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`relative shrink-0 px-4 py-2 rounded-full text-[11px] sm:text-xs font-medium tracking-[0.15em] uppercase transition-colors ${
                    active
                      ? "bg-white text-stone-900"
                      : "border border-white/15 text-pacific-mid hover:text-white hover:border-white/30"
                  }`}
                >
                  {f.label}
                  <span className="ml-2 text-white/50">
                    {f.id === "all"
                      ? PROJECTS.length
                      : PROJECTS.filter((p) => p.category === f.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Grid ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          {/* Masonry layout — CSS columns let each card take its image's
              natural aspect ratio. No forced 4:3 crop, no letterboxing,
              no gaps. break-inside-avoid keeps a card on one column. */}
          <StaggerContainer
            key={filter}
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6"
          >
            {filtered.map((p) => (
              <StaggerItem
                key={p.id}
                className="mb-5 lg:mb-6 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(p)}
                  className="group block w-full text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="relative overflow-hidden">
                    {/* Plain <img> with w-full h-auto so the card's
                        height is whatever the image's intrinsic
                        aspect dictates — no cropping. */}
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="block w-full h-auto transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-3">
                      <div className="text-white">
                        <div className="text-[10px] tracking-[0.25em] uppercase text-white/70 font-medium">
                          {p.surface}
                        </div>
                        <h3 className="mt-2 text-lg sm:text-xl font-light tracking-tight">
                          {p.title}
                        </h3>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filtered.length === 0 && (
            <div className="py-24 text-center text-pacific-mid font-light">
              Nothing in this category yet — check back soon.
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-900">
                <Image
                  src={lightbox.image}
                  alt={lightbox.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-white">
                <div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-white/65 font-medium">
                    {lightbox.surface}
                  </div>
                  <h3 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight">
                    {lightbox.title}
                  </h3>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.1em] uppercase text-white/85 hover:text-white"
                  onClick={() => setLightbox(null)}
                >
                  Request a similar quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. Statement break ── */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              On photography
            </span>
            <p className="mt-6 text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white leading-[1.2]">
              The slab does most of the work. The camera just has to keep up.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 text-pacific-mid/70">
              <span className="block w-6 h-px bg-pacific-mid/40" />
              <span className="text-[11px] tracking-[0.3em] uppercase font-medium">
                Pacific Surfaces
              </span>
              <span className="block w-6 h-px bg-pacific-mid/40" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 6. Submit-a-project CTA ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Built with Pacific?
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Submit your project.
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Architects, designers, and homeowners can submit installations for
              feature in the gallery — credited, of course.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Submit a project
              </MagneticButton>
              <Link
                href="/visualize"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
              >
                Try the visualizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
