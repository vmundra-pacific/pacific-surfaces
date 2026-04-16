"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const EASE = [0.25, 0.4, 0.25, 1] as const;
const TOTAL_FRAMES = 298;

function framePath(i: number) {
  return `/hero-frames/frame-${String(i + 1).padStart(3, "0")}.jpg`;
}

/* ── Main component ── */
export function HeroTerminalIndustries() {
  const containerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* Single scroll context drives EVERYTHING — video + headlines */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* Draw a frame to canvas — cover-fit, GPU-optimized */
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasSized = useRef(false);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    // Lazy-init context once
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Size canvas once (not every frame)
    if (!canvasSized.current) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      canvasSized.current = true;
    }

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const imgR = img.naturalWidth / img.naturalHeight;
    const canR = w / h;
    let dW: number, dH: number, dX: number, dY: number;

    if (imgR > canR) {
      dH = h;
      dW = h * imgR;
      dX = (w - dW) / 2;
      dY = 0;
    } else {
      dW = w;
      dH = w / imgR;
      dX = 0;
      dY = (h - dH) / 2;
    }

    ctx.drawImage(img, dX, dY, dW, dH);
  }, []);

  /* Preload frames with progress */
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let count = 0;
    const BATCH = 20;
    let nextIdx = 0;

    function loadNext() {
      const end = Math.min(nextIdx + BATCH, TOTAL_FRAMES);
      for (let i = nextIdx; i < end; i++) {
        const img = new Image();
        img.src = framePath(i);
        img.onload = img.onerror = () => {
          count++;
          if (mounted)
            setLoadProgress(Math.round((count / TOTAL_FRAMES) * 100));
          if (count === TOTAL_FRAMES && mounted) {
            imagesRef.current = images;
            setReady(true);
            drawFrame(0);
          }
        };
        images[i] = img;
      }
      nextIdx = end;
      if (nextIdx < TOTAL_FRAMES) setTimeout(loadNext, 0);
    }

    loadNext();
    return () => {
      mounted = false;
    };
  }, [drawFrame]);

  /* Scroll-driven frame update */
  const lastFrameRef = useRef(0);
  const rafRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!ready) return;
    const idx = Math.min(Math.floor(v * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    if (idx !== lastFrameRef.current) {
      lastFrameRef.current = idx;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(idx));
    }
  });

  /*
   * SCROLL TIMELINE (across 900vh):
   *
   * 0.00 – 0.06  "We craft surfaces" visible → shrinks dramatically
   * 0.06 – 0.20  Video plays, no text (breathing room)
   * 0.20 – 0.35  Headline 1: "We have reinvented…"
   * 0.38 – 0.53  Headline 2: "Precision-engineered…"
   * 0.56 – 0.71  Headline 3: "Moving design forward."
   * 0.75 – 0.90  CTAs fade in
   * 0.90 – 1.00  Hold on last frame
   */

  // "We craft surfaces" — fully gone by 4%
  const h0Opacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const h0Scale = useTransform(scrollYProgress, [0, 0.04], [1, 0.25]);
  const h0Y = useTransform(scrollYProgress, [0, 0.04], [0, 150]);

  // Headline 1
  const h1Opacity = useTransform(
    scrollYProgress,
    [0.18, 0.22, 0.32, 0.36],
    [0, 1, 1, 0]
  );
  const h1Y = useTransform(
    scrollYProgress,
    [0.18, 0.22, 0.32, 0.36],
    [60, 0, 0, -40]
  );

  // Headline 2
  const h2Opacity = useTransform(
    scrollYProgress,
    [0.36, 0.4, 0.5, 0.54],
    [0, 1, 1, 0]
  );
  const h2Y = useTransform(
    scrollYProgress,
    [0.36, 0.4, 0.5, 0.54],
    [60, 0, 0, -40]
  );

  // Headline 3
  const h3Opacity = useTransform(
    scrollYProgress,
    [0.54, 0.58, 0.68, 0.72],
    [0, 1, 1, 0]
  );
  const h3Y = useTransform(
    scrollYProgress,
    [0.54, 0.58, 0.68, 0.72],
    [60, 0, 0, -40]
  );

  // CTAs
  const ctaScrollOpacity = useTransform(scrollYProgress, [0.74, 0.8], [0, 1]);
  const ctaScrollY = useTransform(scrollYProgress, [0.74, 0.8], [40, 0]);

  // Dark overlay strengthens when text is on screen
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.18, 0.22, 0.72, 0.74, 0.9, 1],
    [0.3, 0.15, 0.15, 0.55, 0.55, 0.4, 0.4, 0.5]
  );

  // Scroll indicator — gone by 1.5%
  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.015],
    [1, 0]
  );

  // Progress bar
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="relative">
      {/* ── Loading screen ── */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center gap-8"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-[clamp(32px,6vw,72px)] font-light tracking-tight text-white"
            >
              Pacific Surfaces
            </motion.span>
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/70 rounded-full"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/40">
              {loadProgress}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── One unified scroll section — video + headlines together ── */}
      <section ref={containerRef} className="relative h-[500vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-stone-950">
          {/* Canvas — video frames as background for everything */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Adaptive dark overlay — stronger when text is showing */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 z-[1] bg-stone-950"
          />

          {/* Grain */}
          <div className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4=')]" />

          {/* ── All text lives inside the sticky viewport over the video ── */}
          <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none">
            <div className="max-w-7xl w-full px-6 lg:px-8">
              {/* "We craft surfaces" — first thing you see */}
              <motion.h1
                style={{ opacity: h0Opacity, scale: h0Scale, y: h0Y }}
                className="text-[clamp(48px,10vw,140px)] font-medium tracking-tight text-white leading-none text-center drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)] absolute inset-0 flex items-center justify-center"
              >
                We craft surfaces
              </motion.h1>

              {/* Headline 1 */}
              <motion.h2
                style={{ opacity: h1Opacity, y: h1Y }}
                className="text-[clamp(40px,7vw,96px)] font-light tracking-tight leading-[1.05] text-white absolute inset-0 flex items-center px-6 lg:px-8"
              >
                <span className="max-w-[900px]">
                  We have reinvented the premium surfaces experience
                  <br />
                  <span className="text-white/40 italic">
                    through every slab.
                  </span>
                </span>
              </motion.h2>

              {/* Headline 2 */}
              <motion.h2
                style={{ opacity: h2Opacity, y: h2Y }}
                className="text-[clamp(40px,7vw,96px)] font-light tracking-tight leading-[1.05] text-white absolute inset-0 flex items-center px-6 lg:px-8"
              >
                <span className="max-w-[1000px]">
                  Precision-engineered quartz, granite &amp; eco surfaces{" "}
                  <span className="text-white/40 italic">
                    built for the extraordinary.
                  </span>
                </span>
              </motion.h2>

              {/* Headline 3 */}
              <motion.h2
                style={{ opacity: h3Opacity, y: h3Y }}
                className="text-[clamp(48px,8vw,120px)] font-light tracking-tight leading-[1.05] text-white absolute inset-0 flex items-center justify-center text-center"
              >
                Moving design forward.
              </motion.h2>

              {/* CTAs */}
              <motion.div
                style={{ opacity: ctaScrollOpacity, y: ctaScrollY }}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <MagneticButton
                    href="/products"
                    variant="primary"
                    size="lg"
                    className="bg-white text-stone-900 border-white hover:bg-stone-100"
                  >
                    Explore Collection
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>
                  <MagneticButton
                    href="/contact"
                    variant="outline"
                    size="lg"
                    className="text-white border-stone-400/40 hover:border-white hover:bg-white/5"
                  >
                    Request a Quote
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] z-[4] bg-white/10">
            <motion.div
              style={{ width: progressWidth }}
              className="h-full bg-white/50"
            />
          </div>

          {/* Scroll indicator */}
          <motion.div
            style={{ opacity: scrollIndicatorOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-4"
          >
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Rest of page continues normally after the scroll video ── */}
    </div>
  );
}
