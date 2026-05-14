"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Project showcase — full-bleed slideshow.
 *
 * Lazy-loaded: media doesn't fetch until the section enters the
 * viewport, and the auto-advance timer doesn't start cycling until
 * the user can actually see the section. So a viewer arriving at
 * the section always sees slide 0 first, never a mid-cycle frame
 * the timer landed on while the section was off-screen.
 *
 * Image slides advance every 5s; the video (last slide) plays through
 * to its native end via onEnded then loops back to slide 0.
 */
type Slide =
  | { kind: "image"; src: string; name: string }
  | { kind: "video"; src: string; poster: string; name: string };

const SLIDES: Slide[] = [
  {
    kind: "image",
    src: "/projects/ruskin-kitchen-counter.jpg",
    name: "Ruskin · Kitchen Counter",
  },
  {
    kind: "image",
    src: "/projects/latte-luxe.jpg",
    name: "Latte Luxe · Installed",
  },
  {
    kind: "image",
    src: "/projects/cappuccino-1.jpg",
    name: "Cappuccino · Detail",
  },
  {
    kind: "image",
    src: "/projects/cappuccino-3.jpg",
    name: "Cappuccino · Vignette",
  },
  {
    kind: "video",
    src: "/projects/cappuccino-installed.mp4",
    poster: "/projects/cappuccino-installed-poster.jpg",
    name: "Cappuccino · Installed",
  },
];

const IMAGE_DURATION_MS = 5000;

interface SanityInspiration {
  _id: string;
  name: string;
  category: string;
  image: string | null;
  productSlug: string | null;
}

export function InspirationGrid(_props: {
  inspirations?: SanityInspiration[];
} = {}) {
  // The Sanity inspirations prop is currently unused — the grid
  // renders a fixed set of curated SLIDES below. Accepting the prop
  // keeps the section's call sites stable so we can re-enable
  // Sanity-driven content later without an API change.
  void _props;
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  // Phone detection — drops the video slide entirely on touch
  // devices with narrow viewports. The video was costing too much to
  // load on phones; the 4 images alone tell the same story.
  const [isPhone, setIsPhone] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setIsPhone(
        window.matchMedia("(pointer: coarse)").matches &&
          window.innerWidth < 1024
      );
    } catch {
      /* ignore */
    }
  }, []);

  // Filter slides: phones never see the video slide. Memoized so the
  // array reference is stable across renders — without that, the
  // auto-advance useEffect (which depends on `slides`) would tear
  // down and re-create its timer on every render.
  const slides = useMemo(
    () => (isPhone ? SLIDES.filter((s) => s.kind !== "video") : SLIDES),
    [isPhone]
  );

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // IntersectionObserver: flip `inView` true the first time any part
  // of the section enters the viewport. We never reset it back to
  // false — once the user has seen the section, the slideshow stays
  // mounted so re-entering doesn't reset to slide 0.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // Old browsers: render eagerly.
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // Auto-advance: timer for image slides, native onEnded for the
  // video slide. Both gated on `inView` so the carousel stays paused
  // (and slide 0 stays visible) until the user reaches the section.
  useEffect(() => {
    if (!inView) return;
    const slide = slides[active];
    if (slide.kind === "image") {
      const t = setTimeout(advance, IMAGE_DURATION_MS);
      return () => clearTimeout(t);
    }
    // Video slide: reset its currentTime on entry so re-visits show
    // the full clip from the start, then attempt play().
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        /* autoplay restrictions — poster keeps painting */
      });
    }
  }, [active, advance, inView, slides]);

  // Reset videoLoaded whenever the active slide changes — so when we
  // switch to the video slide, we start in poster-fallback mode and
  // wait for onCanPlay before swapping in the live <video>.
  useEffect(() => {
    setVideoLoaded(false);
  }, [active]);

  // Guard for empty filter result (shouldn't happen — SLIDES has
  // 4 images even after filtering).
  const slide = slides[active] ?? slides[0];
  const textShadow = "0 2px 8px rgba(0,0,0,.65), 0 6px 28px rgba(0,0,0,.55)";

  return (
    <section
      ref={sectionRef}
      id="sec-projects"
      className="relative w-full h-screen overflow-hidden bg-stone-950 scroll-mt-20"
    >
      {/* Until the section is in view, render slide 0's image as a
          static placeholder so the section reserves height and the
          eyebrow/heading sit on real imagery. As soon as the user
          scrolls in, swap to the live AnimatePresence stack. */}
      {!inView ? (
        <Image unoptimized={false}
          src={
            slides[0].kind === "image"
              ? slides[0].src
              : slides[0].poster
          }
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      ) : (
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
              <Image unoptimized={false}
                src={slide.src}
                alt={slide.name}
                fill
                priority={active === 0}
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <>
                {/* Poster stays at full opacity. The video fades in
                    on top once it can play; once it reaches 100% it
                    opaquely covers the poster (same content). The
                    poster used to crossfade out simultaneously with
                    the video fading in, but at the midpoint both
                    layers were ~50% which let the section background
                    bleed through and read as a one-shot dark flash.
                    Keeping the poster solid eliminates the alpha gap.
                    Bonus: if the video stalls or never finishes
                    loading, the poster stays visible — far better
                    than black. */}
                <Image unoptimized={false}
                  src={slide.poster}
                  alt={slide.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <video
                  ref={videoRef}
                  src={slide.src}
                  poster={slide.poster}
                  muted
                  playsInline
                  preload="auto"
                  autoPlay
                  onCanPlay={() => setVideoLoaded(true)}
                  onEnded={advance}
                  aria-hidden="true"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    videoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

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
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show ${s.name}`}
            onClick={() => setActive(i)}
            className="grid place-items-center h-6 w-6"
          >
            <span
              aria-hidden="true"
              className={`block h-2 rounded-full transition-all ${
                i === active
                  ? "w-6 bg-white"
                  : "w-2 bg-white/45 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
