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
  location: string;
  category: Exclude<Category, "all">;
  surface: string;
  image: string;
  span?: "tall" | "wide";
}

const PROJECTS: Project[] = [
  // Cards using /images/spaces/* — actual installed-project photography.
  // Title describes what the photograph shows so the caption stays
  // anchored to the image rather than a poetic project codename.
  {
    id: "k01",
    title: "Open-plan kitchen with marble island",
    location: "Mumbai, IN",
    category: "kitchens",
    surface: "Eclipse · Calacatta",
    image: "/images/spaces/kitchens.png",
    span: "wide",
  },
  {
    id: "b01",
    title: "Twin-basin vanity in soft-grey quartz",
    location: "Bengaluru, IN",
    category: "bathrooms",
    surface: "Beyond Finish · Mist",
    image: "/images/spaces/bathrooms.jpg",
  },
  {
    id: "c01",
    title: "Polished marble reception counter",
    location: "Hyderabad, IN",
    category: "commercial",
    surface: "Granite · Volcano",
    image: "/images/spaces/commercial.jpg",
    span: "tall",
  },
  {
    id: "a01",
    title: "Textured stoneface facade panels",
    location: "Pune, IN",
    category: "outdoor",
    surface: "Beyond Finish · Stoneface",
    image: "/images/spaces/architecture.png",
  },
  // Cards using /images/products/* — material studies / slab close-ups.
  // Location reads "Sample" rather than a city so it doesn't pretend
  // to be a project shot when it's a material reference.
  {
    id: "k02",
    title: "Pure white quartz — material study",
    location: "Sample · India",
    category: "kitchens",
    surface: "Quartz · Pure White, Polished",
    image: "/images/products/quartz.jpg",
  },
  {
    id: "l01",
    title: "Hand-laid agate, backlit panel",
    location: "Sample · India",
    category: "living",
    surface: "Semi-Precious · Agate",
    image: "/images/products/semi-precious.png",
    span: "wide",
  },
  {
    id: "c02",
    title: "Eclipse marble — veined detail",
    location: "Sample · India",
    category: "commercial",
    surface: "Eclipse · Pietra Grey",
    image: "/images/products/vision.png",
  },
  {
    id: "b02",
    title: "Forest-green granite, polished finish",
    location: "Sample · India",
    category: "bathrooms",
    surface: "Granite · Forest",
    image: "/images/products/granites.png",
  },
  {
    id: "l02",
    title: "Travertine surface, large-format",
    location: "Sample · India",
    category: "living",
    surface: "Beyond Finish · Travertine",
    image: "/images/products/facades.png",
  },
  // Back to /images/spaces/*
  {
    id: "a02",
    title: "Architectural elevation, large-format cladding",
    location: "Alibaug, IN",
    category: "outdoor",
    surface: "Quartz · Carrara",
    image: "/images/spaces/architecture.png",
    span: "tall",
  },
  {
    id: "k03",
    title: "Kitchen with full-height bookmatched backsplash",
    location: "Ahmedabad, IN",
    category: "kitchens",
    surface: "Exotic · Calacatta Viola",
    image: "/images/spaces/kitchens.png",
  },
  {
    id: "c03",
    title: "Marble counter in a co-working lounge",
    location: "Bengaluru, IN",
    category: "commercial",
    surface: "Eclipse · Statuario",
    image: "/images/spaces/commercial.jpg",
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
          <StaggerContainer
            key={filter} /* re-runs stagger on filter change */
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          >
            {filtered.map((p) => (
              <StaggerItem
                key={p.id}
                className={`h-full ${
                  p.span === "wide"
                    ? "sm:col-span-2"
                    : p.span === "tall"
                      ? "row-span-2"
                      : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(p)}
                  className="group block w-full h-full text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div
                    className={`relative overflow-hidden ${
                      p.span === "tall" ? "aspect-[3/5]" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-3">
                      <div className="text-white">
                        <div className="text-[10px] tracking-[0.25em] uppercase text-white/70 font-medium">
                          {p.surface}
                        </div>
                        <h3 className="mt-2 text-lg sm:text-xl font-light tracking-tight">
                          {p.title}
                        </h3>
                        <div className="mt-1 text-[11px] font-light text-white/65">
                          {p.location}
                        </div>
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
                  <div className="mt-1 text-sm font-light text-white/70">
                    {lightbox.location}
                  </div>
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
