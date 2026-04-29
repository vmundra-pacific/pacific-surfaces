"use client";

/**
 * NaturalStoneFinishesContent — full experience for
 * /products/natural-stone-finishes.
 *
 * Sections (top → bottom):
 *   1. Hero — full-screen video/image background, eyebrow +
 *      headline centred horizontally and vertically.
 *   2. Intro split — left tall image, right column with image on
 *      top + heading + body underneath.
 *   3. Features — centred "Transform Stones Into Art" eyebrow +
 *      headline + 3 numbered cards.
 *   4. Finish grid — every product tagged to the
 *      "Natural Stone Finishes" Sanity Collection. Tap → lightbox
 *      with mouse-wheel zoom.
 *
 * Lightbox
 * --------
 * Click a tile → fullscreen overlay; mouse wheel zooms 1× → 4×;
 * Reset button appears past 1.05×; outside-click / X / Escape
 * dismisses; body scroll is locked while open.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, ZoomIn, RotateCcw } from "lucide-react";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

/* ---------- types ----------------------------------------------- */

interface FinishProduct {
  _id: string;
  name: string;
  slug: string | null;
  mainImage: string | null;
  fullImage: string | null;
  finishes: string[] | null;
  description?: string | null;
}

interface FeatureCard {
  title: string;
  body: string;
}

interface PageData {
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroDescription?: string | null;
  heroImage?: string | null;
  heroVideoUrl?: string | null;
  introLeftImage?: string | null;
  introLeftVideoUrl?: string | null;
  introRightImage?: string | null;
  introRightImageUrl?: string | null;
  introRightVideoUrl?: string | null;
  introSubheading?: string | null;
  introBody?: string | null;
  featuresEyebrow?: string | null;
  featuresHeadline?: string | null;
  features?: FeatureCard[] | null;
  gridEyebrow?: string | null;
  gridHeadline?: string | null;
  gridDescription?: string | null;
  collectionSlug?: string | null;
}

/* ---------- defaults -------------------------------------------- */

const DEFAULTS = {
  heroEyebrow: "Fusion of Aesthetics, Functionality & Innovation",
  heroHeadline: "Stone Finishes Beyond Imagination",
  heroVideoUrl: "/videos/natural-stone-finishes.mp4",
  introSubheading: "From Smooth Satin to Rugged Splendor",
  introBody:
    "Explore a world of special textures and modern finishing where each piece is crafted to elevate your living experience. Welcome to a world where every surface is a canvas for your dreams.",
  featuresEyebrow: "Transform Stones Into Art",
  featuresHeadline:
    "Discover the transformative power of precision stone finishes that blend art and nature seamlessly.",
  features: [
    {
      title: "Your Creative Partner",
      body: "Architecture and design evolve constantly. We serve as your reliable partner — the go-to choice for architects and designers seeking groundbreaking building materials.",
    },
    {
      title: "Texture Matters",
      body: "Texture isn't just touch — it's visual depth and character. Our finishes add intrigue and personality, from stone-inspired patterns to geometric marvels.",
    },
    {
      title: "Quality Craftsmanship",
      body: "Crafted with precision, our surfaces are a testament to quality and durability — built for the demands of modern living, designed to last.",
    },
  ] satisfies FeatureCard[],
  gridEyebrow: "All Finishes",
  gridHeadline: "Choose your finish.",
  gridDescription:
    "Tap any tile to open a high-resolution view. Scroll to zoom in on the texture.",
};

/* ================================================================== *
 *  Main component                                                     *
 * ================================================================== */
export function NaturalStoneFinishesContent({
  pageData,
  finishes,
}: {
  pageData: PageData | null;
  finishes: FinishProduct[];
}) {
  const heroEyebrow = pageData?.heroEyebrow || DEFAULTS.heroEyebrow;
  const heroHeadline = pageData?.heroHeadline || DEFAULTS.heroHeadline;
  const heroDescription = pageData?.heroDescription || "";
  const heroImage = pageData?.heroImage ?? null;
  const heroVideoUrl = pageData?.heroVideoUrl ?? DEFAULTS.heroVideoUrl;

  const introLeftImage = pageData?.introLeftImage ?? null;
  // Intro left video defaults to /videos/stone-finishes-2.mp4 so
  // the moment that file lands in /public/videos it just plays.
  const introLeftVideoUrl =
    pageData?.introLeftVideoUrl ?? "/videos/stone-finishes-2.mp4";
  const introRightImage = pageData?.introRightImage ?? null;
  // Right slot image-URL fallback — points at /public root for the
  // existing slider asset. Lets editors swap the image without
  // re-uploading to Sanity.
  const introRightImageUrl =
    pageData?.introRightImageUrl ?? "/stone-finishes-slider-01.webp";
  const introRightVideoUrl = pageData?.introRightVideoUrl ?? null;
  const introSubheading = pageData?.introSubheading || DEFAULTS.introSubheading;
  const introBody = pageData?.introBody || DEFAULTS.introBody;

  const featuresEyebrow = pageData?.featuresEyebrow || DEFAULTS.featuresEyebrow;
  const featuresHeadline =
    pageData?.featuresHeadline || DEFAULTS.featuresHeadline;
  const features =
    pageData?.features && pageData.features.length > 0
      ? pageData.features
      : DEFAULTS.features;

  const gridEyebrow = pageData?.gridEyebrow || DEFAULTS.gridEyebrow;
  const gridHeadline = pageData?.gridHeadline || DEFAULTS.gridHeadline;
  const gridDescription = pageData?.gridDescription || DEFAULTS.gridDescription;

  const [activeFinish, setActiveFinish] = useState<FinishProduct | null>(null);

  return (
    <>
      {/* ─── 1. Hero — full-screen, centred copy ─────────── */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#112732] overflow-hidden">
        {/* Fallback dark surface (visible if media missing) */}
        <div className="absolute inset-0 z-0 bg-[#112732]" />
        {/* Background media */}
        <div className="absolute inset-0 z-0">
          {heroVideoUrl ? (
            <video
              key={heroVideoUrl}
              src={heroVideoUrl}
              poster={
                heroVideoUrl.startsWith("/videos/")
                  ? heroVideoUrl.replace(/\.mp4$/, "-poster.jpg")
                  : undefined
              }
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : null}
          {/* Even scrim — keeps the centred copy readable against
              any frame. Pacific navy at 40% blends rather than
              clashing if the video frame contains other tones. */}
          <div className="absolute inset-0 bg-[#0a1620]/45" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center"
        >
          <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-300 mb-7">
            {heroEyebrow}
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-white leading-[1.05]"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,.7), 0 8px 40px rgba(0,0,0,.4)",
            }}
          >
            {heroHeadline}
          </h1>
          {heroDescription && (
            <p
              className="mt-7 text-base md:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}
            >
              {heroDescription}
            </p>
          )}
        </motion.div>
      </section>

      {/* ─── 2. Intro split ─────────────────────────────── */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* LEFT — large tall slot. Priority: video → Sanity image → placeholder. */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="lg:col-span-7"
            >
              {introLeftVideoUrl ? (
                <video
                  key={introLeftVideoUrl}
                  src={introLeftVideoUrl}
                  poster={
                    introLeftVideoUrl.startsWith("/videos/")
                      ? introLeftVideoUrl.replace(/\.mp4$/, "-poster.jpg")
                      : undefined
                  }
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="w-full aspect-[4/5] object-cover"
                />
              ) : introLeftImage ? (
                <Image
                  src={introLeftImage}
                  alt={introSubheading}
                  width={1400}
                  height={1700}
                  className="w-full aspect-[4/5] object-cover"
                />
              ) : (
                <ImagePlaceholder
                  label="Intro left image"
                  className="aspect-[4/5]"
                />
              )}
            </motion.div>

            {/* RIGHT — smaller image on top + heading + body below */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                {/* RIGHT slot. Priority: video → Sanity image →
                    /public image URL → placeholder. The /public URL
                    fallback covers the case where the asset already
                    lives in the repo and there's no need to upload
                    it to Sanity. */}
                {introRightVideoUrl ? (
                  <video
                    key={introRightVideoUrl}
                    src={introRightVideoUrl}
                    poster={
                      introRightVideoUrl.startsWith("/videos/")
                        ? introRightVideoUrl.replace(/\.mp4$/, "-poster.jpg")
                        : undefined
                    }
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    className="w-full aspect-[3/2] object-cover"
                  />
                ) : introRightImage ? (
                  <Image
                    src={introRightImage}
                    alt={introSubheading}
                    width={1200}
                    height={800}
                    className="w-full aspect-[3/2] object-cover"
                  />
                ) : introRightImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={introRightImageUrl}
                    alt={introSubheading}
                    className="w-full aspect-[3/2] object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label="Intro right image"
                    className="aspect-[3/2]"
                  />
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className="text-center lg:text-left"
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.1] mb-5">
                  {introSubheading}
                </h2>
                <p className="text-base font-light text-stone-300 leading-relaxed">
                  {introBody}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Features — Transform Stones Into Art ────── */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20 md:pb-28">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-5">
              {featuresEyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.1]">
              {featuresHeadline}
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-stretch">
            {features.map((f, i) => (
              <StaggerItem key={`${f.title}-${i}`} className="h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-5 tabular-nums">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-medium text-white tracking-tight mb-5 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-base font-light text-stone-300 leading-relaxed max-w-sm mx-auto">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── 4. Finish grid ─────────────────────────────── */}
      <section className="bg-[#112732]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
          <AnimatedSection className="max-w-3xl mb-12 md:mb-16">
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-5">
              {gridEyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-5 leading-[1.1]">
              {gridHeadline}
            </h2>
            <p className="text-base font-light text-stone-300 leading-relaxed">
              {gridDescription}
            </p>
          </AnimatedSection>

          {finishes.length === 0 ? (
            <EmptyState />
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {finishes.map((finish, i) => (
                <StaggerItem key={finish._id}>
                  <FinishTile
                    finish={finish}
                    index={i}
                    onSelect={() => setActiveFinish(finish)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <AnimatePresence>
        {activeFinish && (
          <FinishLightbox
            key={activeFinish._id}
            finish={activeFinish}
            onClose={() => setActiveFinish(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- placeholder ----------------------------------------- */

function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full ${className ?? ""} bg-white/[0.04] border border-white/10 flex items-center justify-center overflow-hidden`}
    >
      <div className="text-center px-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.06] border border-white/10 mb-4">
          <ImageIcon className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
        </div>
        <p className="text-xs tracking-[0.25em] uppercase text-stone-400 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ---------- finish tile ---------------------------------------- */

function FinishTile({
  finish,
  index,
  onSelect,
}: {
  finish: FinishProduct;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 text-left w-full"
    >
      {finish.mainImage ? (
        <Image
          src={finish.mainImage}
          alt={finish.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="text-base lg:text-lg font-medium text-white tracking-tight">
          {finish.name}
        </div>
        {finish.finishes && finish.finishes.length > 0 && (
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/60 mt-1">
            {finish.finishes.join(" · ")}
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ZoomIn className="w-4 h-4 text-white" />
      </div>
    </motion.button>
  );
}

/* ---------- empty state ---------------------------------------- */

function EmptyState() {
  return (
    <div className="bg-white/[0.04] border border-white/10 p-10 md:p-14 text-center">
      <p className="text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
        No finishes are showing up. Make sure the existing{" "}
        <strong className="text-white">Stone Finishes</strong> collection in
        Studio has at least one published Product tagged to it, and that the
        collection slug matches the value set in{" "}
        <strong className="text-white">
          Natural Stone Finishes Page → Grid → Source Collection Slug
        </strong>
        .
      </p>
      <div className="mt-8">
        <MagneticButton href="/studio" variant="outline" size="sm">
          Open Studio
        </MagneticButton>
      </div>
    </div>
  );
}

/* ================================================================== *
 *  Lightbox with zoom-on-scroll                                       *
 * ================================================================== */

function FinishLightbox({
  finish,
  onClose,
}: {
  finish: FinishProduct;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0025;
      setScale((s) => Math.min(4, Math.max(1, s + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const imageSrc = finish.fullImage || finish.mainImage;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center cursor-zoom-out"
      role="dialog"
      aria-modal="true"
      aria-label={`${finish.name} — full-resolution view`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {scale > 1.05 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setScale(1);
          }}
          className="absolute top-6 right-20 z-10 h-11 px-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
        <div className="text-base lg:text-lg font-light text-white tracking-tight">
          {finish.name}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-white/50">
          {scale > 1.05
            ? `${(scale * 100).toFixed(0)}% — scroll to zoom`
            : "Scroll to zoom"}
        </div>
      </div>

      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={finish.name}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95 }}
          animate={{ scale }}
          transition={
            scale === 1
              ? { type: "spring", stiffness: 240, damping: 26 }
              : { duration: 0 }
          }
          className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl select-none cursor-default will-change-transform"
          draggable={false}
        />
      )}
    </motion.div>
  );
}
