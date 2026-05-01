"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Project showcase — full-bleed slideshow.
 * Eyebrow + heading float OVER the image/video so the entire section
 * is filled by the media. Image slides advance every 5s; the video
 * (last slide) plays through to its native end via onEnded then loops
 * back to slide 0.
 */
type Slide =
  | { kind: "image"; src: string; name: string }
  | { kind: "video"; src: string; poster: string; name: string };

const SLIDES: Slide[] = [
  { kind: "image", src: "/projects/ruskin-kitchen-counter.jpg", name: "Ruskin · Kitchen Counter" },
  { kind: "image", src: "/projects/latte-luxe.jpg", name: "Latte Luxe · Installed" },
  { kind: "image", src: "/projects/cappuccino-1.jpg", name: "Cappuccino · Detail" },
  { kind: "image", src: "/projects/cappuccino-3.jpg", name: "Cappuccino · Vignette" },
  { kind: "video", src: "/projects/cappuccino-installed.mp4", poster: "/projects/cappuccino-installed-poster.jpg", name: "Cappuccino · Installed" },
];

const IMAGE_DURATION_MS = 5000;

interface SanityInspiration {
  _id: string;
  name: string;
  category: string;
  image: string | null;
  productSlug: string | null;
}

export function InspirationGrid({
  inspirations: _inspirations,
}: {
  inspirations?: SanityInspiration[];
} = {}) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const slide = SLIDES[active];
    if (slide.kind === "image") {
      const t = setTimeout(advance, IMAGE_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [active, advance]);

  const slide = SLIDES[active];
  const textShadow = "0 2px 8px rgba(0,0,0,.65), 0 6px 28px rgba(0,0,0,.55)";

  return (
    <section
      id="sec-projects"
      className="relative w-full h-screen overflow-hidden bg-stone-950 scroll-mt-20"
    >
      {/* Slide media (full-bleed) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {slide.kind === "image" ? (
            <Image
              src={slide.src}
              alt={slide.name}
              fill
              priority={active === 0}
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <video
              ref={videoRef}
              src={slide.src}
              poster={slide.poster}
              muted
              playsInline
              preload="metadata"
              autoPlay
              onEnded={advance}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top + bottom scrim — keeps eyebrow/heading + caption legible
          regardless of which frame the slide is on. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Eyebrow + heading — overlaid top-center */}
      <div className="absolute top-16 sm:top-24 left-1/2 -translate-x-1/2 z-10 px-6 text-center max-w-4xl w-full">
        <div
          className="text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase text-white/85 mb-3 sm:mb-4"
          style={{ textShadow }}
        >
          06 · Projects
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.08]"
          style={{ textShadow }}
        >
          How designers are using Pacific.
        </h2>
      </div>

      {/* Caption — bottom-left */}
      <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10">
        <div
          className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white/95 font-medium"
          style={{ textShadow }}
        >
          {slide.name}
        </div>
      </div>

      {/* Dots — bottom-right */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-10 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show ${s.name}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active
                ? "w-6 bg-white"
                : "w-2 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
