"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const TOTAL_FRAMES = 520;
const pad = (n: number) => String(n).padStart(4, "0");

/* The lump sequence (a 206-frame slab cross-section reveal that used
   to play after the kitchen scrub) was removed. The kitchen frames
   now scrub through the entire scroll length end to end. If the
   lump experience is ever wanted back: restore /public/lump-frames/,
   re-add the LUMP_FRAMES_TOTAL constant + drawLumpFrame helper +
   crossfade branch in the tick loop. The frame folder is deleted
   intentionally — `git log --diff-filter=D -- public/lump-frames/`
   if you need to recover it from history. */

// `nowrapLastLine` only flips on for the "homes globally" headline —
// that one specifically wanted "homes" + "globally" kept on the same
// line. Every other headline lets the browser wrap naturally so a
// long one (like "Creating seamless experiences in every space.")
// doesn't blow past the viewport edge and chop the right side off.
const headlines: {
  range: [number, number];
  kicker: string;
  lines: string[];
  nowrapLastLine?: boolean;
}[] = [
  {
    range: [0.08, 0.22],
    kicker: "",
    lines: ["Where every space", "finds its surface."],
  },
  {
    range: [0.24, 0.38],
    kicker: "",
    // Dimensions ("79 inches wide / 137 inches long") removed per
    // editorial direction — kept only the experiential line so the
    // hero reads less spec-sheet, more brand.
    lines: ["Creating seamless experiences in every space."],
  },
  {
    range: [0.42, 0.56],
    kicker: "",
    lines: ["Where every detail reflects", "our zero compromise approach"],
  },
  {
    range: [0.6, 0.72],
    kicker: "",
    lines: ["Engineered in India.", "Installed in 10M+ homes globally."],
    nowrapLastLine: true,
  },
];

// Dark-overlay opacity for a given progress. Evaluated inside the rAF
// and written imperatively to the overlay div — same formula the
// render path used before, just no longer routed through React state.
const overlayOpacityFor = (progress: number) => {
  const baseOpacity =
    progress < 0.06
      ? 0.25
      : progress < 0.18
        ? 0.15
        : progress < 0.72
          ? 0.55
          : 0.45;

  // End-of-parallax fade-out. The last 8% of progress ramps the
  // dark overlay to full opacity so the kitchen final frame
  // dissolves into black BEFORE the sticky-unstick begins, giving
  // the next section a clean dark seam to rise out of.
  const FADE_START = 0.92;
  if (progress > FADE_START) {
    const fadeT = Math.min(1, (progress - FADE_START) / (1 - FADE_START));
    return baseOpacity + (1 - baseOpacity) * fadeT;
  }
  return baseOpacity;
};

export function HeroScrollCanvas() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastIdxRef = useRef(0);
  const sizedRef = useRef(false);
  const firstPaintedRef = useRef(false);

  // Lerp refs — smoothedProgress chases targetProgress every frame
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);

  // Continuous visual consumers (overlay opacity, progress bar) are
  // driven imperatively inside the rAF via these element refs — zero
  // React re-renders per frame during steady scrubbing. Discrete
  // consumers (active headline, CTA, scroll hint) live in state but
  // only update when their value actually flips.
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const trackHeightRef = useRef(0);

  const [activeHeadline, setActiveHeadline] = useState(-1);
  const [showCta, setShowCta] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // Progressive frame preloading:
  // Phase 1: Load first INITIAL_BATCH kitchen frames → dismiss loading
  // Phase 2: Wide-then-dense pyramid; tail passes drain via idle.
  useEffect(() => {
    const INITIAL_BATCH = 80; // enough for first ~15% scroll
    let count = 0;
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = imgs;

    // One-shot AVIF feature detection. Probes a single AVIF — if it
    // loads, all subsequent frames request `.avif` directly; if it
    // fails (browser doesn't support AVIF, or the conversion hasn't
    // run yet), we lock to `.jpg` for every remaining frame. This
    // avoids paying a round-trip-per-frame penalty for the
    // try-AVIF-then-retry-JPG approach we had before.
    const detectExt = (): Promise<"avif" | "jpg"> =>
      new Promise((resolve) => {
        const probe = new window.Image();
        const t = setTimeout(() => resolve("jpg"), 1500);
        probe.onload = () => {
          clearTimeout(t);
          resolve("avif");
        };
        probe.onerror = () => {
          clearTimeout(t);
          resolve("jpg");
        };
        probe.src = `/hero-frames/frame-${pad(1)}.avif`;
      });

    // Load a single kitchen frame, locked to the chosen extension.
    const loadFrame = (i: number, ext: "avif" | "jpg"): Promise<void> =>
      new Promise((resolve) => {
        const img = new window.Image();
        // Frames beyond the eager batch are background fill — hint
        // the browser to deprioritize their fetch and decode them
        // off the main thread. Must be set before src.
        if (i >= INITIAL_BATCH) {
          img.fetchPriority = "low";
          img.decoding = "async";
        }
        const done = () => {
          if (!cancelled) {
            count++;
            setLoaded(count);
          }
          resolve();
        };
        img.onload = () => {
          imgs[i] = img;
          // Kick off the (potentially expensive) AVIF decode now,
          // off the rAF draw path, so the first drawImage of this
          // frame doesn't pay a synchronous decode cost.
          img.decode().catch(() => {});
          done();
        };
        // On error, do NOT store the broken image — a 404'd frame has
        // `complete === true`, and drawImage on it throws inside the
        // rAF tick, permanently killing the hero loop.
        img.onerror = done;
        img.src = `/hero-frames/frame-${pad(i + 1)}.${ext}`;
      });

    // Hard safety timeout — if any frame stalls (network blip, CDN
    // miss), the user shouldn't sit on the loading screen forever.
    // 8s is long enough for any reasonable connection to load 80
    // frames at AVIF sizes (~30 KB each ≈ 2.4 MB).
    const safety = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 8000);

    // Detect, then kick off Phase 1 with the locked extension.
    let phase1: Promise<void>[];
    detectExt().then((ext) => {
      if (cancelled) return;
      phase1 = Array.from({ length: INITIAL_BATCH }, (_, i) =>
        loadFrame(i, ext)
      );
      Promise.all(phase1).then(() => {
        if (cancelled) return;
        clearTimeout(safety);
        setTimeout(() => {
          setReady(true);
          // Tell the site splash screen it can dismiss without
          // showing an empty canvas. Fire-and-forget; if no listener
          // exists (e.g. user navigated past the splash already),
          // this is a no-op.
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("pacific:hero-ready"));
          }
        }, 200);

        // Phase 2 — wide-then-dense pyramid with a slow tail.
        //
        // After eager 0..79 (Phase 1), spread coverage across the full
        // 520-frame range as fast as possible, then progressively
        // densify, then quietly fill in the gaps. Pass strides:
        //
        //   Pass A — stride 80 → ~6 frames spread over the whole range.
        //   Pass B — stride 40 → ~7 more, halving the worst-case gap.
        //   Pass C — stride 20 → ~13 more.
        //   Pass D — stride 10 → ~25 more.
        //   Pass E — stride 5  → ~50 more.
        //   --- aggressive phase ends; ~100 frames after eager ---
        //   Pass F — stride 2  → fills every-other gap (slow drain).
        //   Pass G — stride 1  → fills remaining (slow drain).
        //
        // Aggressive passes drain back-to-back in 20-frame batches so
        // the user gets full-range coverage in a few seconds. Tail
        // passes (stride <= 2) drain via requestIdleCallback / setTimeout
        // so they don't compete with scroll, paint, or other late-loading
        // assets. Total bytes loaded = same 520 frames, smarter order.
        const FAST_BATCH = 20;
        const SLOW_BATCH = 8;
        const FAST_STRIDES = [80, 40, 20, 10, 5];
        const SLOW_STRIDES = [2, 1];

        const loadedSet = new Set<number>();
        for (let i = 0; i < INITIAL_BATCH; i++) loadedSet.add(i);

        const buildQueue = (strides: number[]) => {
          const q: number[] = [];
          for (const stride of strides) {
            for (let i = 0; i < TOTAL_FRAMES; i += stride) {
              if (!loadedSet.has(i)) {
                loadedSet.add(i);
                q.push(i);
              }
            }
          }
          return q;
        };

        const fastQueue = buildQueue(FAST_STRIDES);
        const slowQueue = buildQueue(SLOW_STRIDES);

        const drainFast = (qIdx: number): Promise<void> => {
          if (cancelled || qIdx >= fastQueue.length) return Promise.resolve();
          const upTo = Math.min(qIdx + FAST_BATCH, fastQueue.length);
          const batch: Promise<void>[] = [];
          for (let i = qIdx; i < upTo; i++) {
            batch.push(loadFrame(fastQueue[i], ext));
          }
          return Promise.all(batch).then(() => drainFast(upTo));
        };

        const idle = (cb: () => void) => {
          const w = window as unknown as {
            requestIdleCallback?: (
              cb: () => void,
              opts?: { timeout: number }
            ) => number;
          };
          if (typeof w.requestIdleCallback === "function") {
            w.requestIdleCallback(cb, { timeout: 1500 });
          } else {
            setTimeout(cb, 100);
          }
        };

        const drainSlow = (qIdx: number) => {
          if (cancelled || qIdx >= slowQueue.length) return;
          const upTo = Math.min(qIdx + SLOW_BATCH, slowQueue.length);
          const batch: Promise<void>[] = [];
          for (let i = qIdx; i < upTo; i++) {
            batch.push(loadFrame(slowQueue[i], ext));
          }
          Promise.all(batch).then(() => idle(() => drainSlow(upTo)));
        };

        drainFast(0).then(() => {
          if (cancelled) return;
          idle(() => drainSlow(0));
        });
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  // Canvas drawing
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }, []);

  const drawFrame = useCallback(
    (idx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      if (!sizedRef.current) {
        sizeCanvas();
        sizedRef.current = true;
      }

      // Find the requested frame, or fall back to nearest loaded frame
      let img = imagesRef.current[idx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let j = idx - 1; j >= 0; j--) {
          const fallback = imagesRef.current[j];
          if (fallback && fallback.complete && fallback.naturalWidth > 0) {
            img = fallback;
            break;
          }
        }
        if (!img || !img.complete || img.naturalWidth === 0) return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const iR = img.naturalWidth / img.naturalHeight;
      const cR = w / h;
      let dw: number, dh: number, dx: number, dy: number;

      if (iR > cR) {
        dh = h;
        dw = h * iR;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        dw = w;
        dh = w / iR;
        dx = 0;
        dy = (h - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    },
    [sizeCanvas]
  );

  // Scroll controller with lerp smoothing.
  // Discrete UI flags are pushed to React state ONLY when they flip;
  // these refs mirror the last value pushed so steady scrubbing makes
  // zero setState calls per frame. (Without that, per-frame setState
  // churn can trip React 18's "Maximum update depth exceeded".)
  const activeHeadlineRef = useRef(-1);
  const showCtaRef = useRef(false);
  const showScrollHintRef = useRef(true);
  const lastOverlayRef = useRef(-1);
  const lastBarRef = useRef(-1);

  useEffect(() => {
    let raf = 0;
    let running = false;
    const LERP_SPEED = 0.12; // 0–1, higher = snappier, lower = smoother

    // Track height only changes on viewport resize (it's 700vh), so
    // cache it instead of reading offsetHeight (layout) every frame.
    const measureTrack = () => {
      trackHeightRef.current = trackRef.current?.offsetHeight ?? 0;
    };

    const tick = () => {
      const track = trackRef.current;
      if (!track) {
        if (running) raf = requestAnimationFrame(tick);
        return;
      }

      // Raw scroll position → target
      const r = track.getBoundingClientRect();
      if (trackHeightRef.current === 0) measureTrack();
      const total = trackHeightRef.current - window.innerHeight;
      const rawP = Math.max(0, Math.min(1, -r.top / total));
      targetProgressRef.current = rawP;

      // Lerp smoothedProgress toward target
      const prev = smoothedProgressRef.current;
      const diff = targetProgressRef.current - prev;
      const p =
        Math.abs(diff) < 0.0005
          ? targetProgressRef.current
          : prev + diff * LERP_SPEED;
      smoothedProgressRef.current = p;

      // Continuous consumers — written straight to the DOM, no React.
      if (barRef.current && p !== lastBarRef.current) {
        lastBarRef.current = p;
        barRef.current.style.transform = `scaleX(${p})`;
      }
      const overlayOpacity = overlayOpacityFor(p);
      if (overlayRef.current && overlayOpacity !== lastOverlayRef.current) {
        lastOverlayRef.current = overlayOpacity;
        overlayRef.current.style.opacity = String(overlayOpacity);
      }

      // Discrete consumers — setState only on actual flips.
      let active = -1;
      for (let i = 0; i < headlines.length; i++) {
        if (p >= headlines[i].range[0] && p <= headlines[i].range[1]) {
          active = i;
          break;
        }
      }
      if (active !== activeHeadlineRef.current) {
        activeHeadlineRef.current = active;
        setActiveHeadline(active);
      }
      const hint = p < 0.02;
      if (hint !== showScrollHintRef.current) {
        showScrollHintRef.current = hint;
        setShowScrollHint(hint);
      }
      const cta = p >= 0.78;
      if (cta !== showCtaRef.current) {
        showCtaRef.current = cta;
        setShowCta(cta);
      }

      // Kitchen scrub spans the entire scroll length now (the lump
      // phase + crossfade were removed). Map progress directly to a
      // frame index and only redraw when the index actually advances.
      if (ready) {
        const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
        if (idx !== lastIdxRef.current) {
          drawFrame(idx);
          lastIdxRef.current = idx;
        }
      }

      if (running) raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    measureTrack();
    // Start immediately (matches the old unconditional rAF); the
    // observer below pauses the loop once the track is confirmed
    // fully offscreen and restarts it (200px early, before any pixel
    // is visible) on approach. On restart, everything recomputes from
    // the live scroll position, so nothing visible ever stalls.
    startLoop();

    let io: IntersectionObserver | null = null;
    if (trackRef.current && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) startLoop();
            else stopLoop();
          }
        },
        { rootMargin: "200px" }
      );
      io.observe(trackRef.current);
    }

    const handleResize = () => {
      measureTrack();
      sizedRef.current = false;
      drawFrame(lastIdxRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      stopLoop();
      io?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [ready, drawFrame]);

  // Paint the first frame once BOTH the canvas has a real layout size
  // AND frame 0 has actually loaded. On mobile cold load either can be
  // false at the instant `ready` flips (0-height sticky canvas, or — on
  // slow connections that hit the 8s safety timeout before phase 1 ends
  // — frame 0 not yet decoded), so a single draw no-ops and the hero
  // stays grey until a scroll triggers handleResize. This re-runs on
  // every frame-load (`loaded`) and on canvas resize, draws EXACTLY once
  // when both conditions hold, then latches off. Not in the scroll loop,
  // no per-frame work — it cannot thrash the canvas or stress memory.
  useEffect(() => {
    if (!ready || firstPaintedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tryPaint = () => {
      if (firstPaintedRef.current) return true;
      const img0 = imagesRef.current[0];
      const sized = canvas.clientWidth > 0 && canvas.clientHeight > 0;
      const frame0Ready = !!img0 && img0.complete && img0.naturalWidth > 0;
      if (sized && frame0Ready) {
        firstPaintedRef.current = true;
        sizedRef.current = false; // force a correct (re)measure
        drawFrame(0);
        return true;
      }
      return false;
    };
    if (tryPaint()) return;
    const ro = new ResizeObserver(() => {
      if (tryPaint()) ro.disconnect();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ready, loaded, drawFrame]);

  // Derived state.
  // Headline window / CTA / scroll-hint flips and the continuous
  // overlay + progress-bar values are all computed inside the rAF
  // tick above (against the same smoothed progress) — discrete flags
  // land in state only when they change; continuous values are
  // written straight to the DOM via refs.

  // Loading screen shows progress of the initial batch (80 frames),
  // not all 520 — so it dismisses quickly while the rest loads in background
  const INITIAL_BATCH = 80;
  // Cap visible progress at 90% until `ready` (canvas drew its
  // first frame) so the bar never reads 100% while the user is
  // still staring at the loading screen waiting for paint.
  const rawPct = Math.round(
    (Math.min(loaded, INITIAL_BATCH) / INITIAL_BATCH) * 100
  );
  const loadPct = ready ? 100 : Math.min(rawPct, 90);

  return (
    <>
      {/* Loading screen */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#112732] transition-opacity duration-500 ${
          ready ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Image
          unoptimized={false}
          src="/logo-pacific-white.png"
          alt="Pacific Surfaces logo"
          width={160}
          height={40}
          style={{ height: "auto" }}
          className="mb-8 object-contain"
          priority
        />
        <div className="w-48 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${loadPct}%` }}
          />
        </div>
        <div className="mt-3 text-[10px] font-mono tracking-[0.2em] text-white/50">
          {loadPct}%
        </div>
      </div>

      {/* Scroll track — 700vh of kitchen scrub end-to-end.
          id="sec-hero" lets HomepageSectionNav detect "user is inside
          the parallax" and clear the active pill while the hero is
          on screen. The id is not in the nav's SECTIONS list — only
          the side-rail's separate hero observer cares about it. */}
      <section
        id="sec-hero"
        ref={trackRef}
        className="relative"
        style={{ height: "700vh" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Dark overlay — opacity driven imperatively from the rAF
              (initial value matches overlayOpacityFor(0) = 0.25). */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: 0.25 }}
          />

          {/* Brand footer — bottom-left. */}
          <div className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col gap-3">
            <div className="text-[10px] tracking-[0.2em] text-white/30 font-mono">
              PACIFIC · EST 2000 · INDIA
            </div>
          </div>

          {/* Headlines */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {headlines.map((hl, i) => {
              const visible = activeHeadline === i;
              return (
                <div
                  key={i}
                  // max-w bumped 4xl → 6xl so longer lines like
                  // "Installed in 10M+ homes globally." don't bleed
                  // off the right edge. Extra horizontal padding
                  // (px-8) gives the drop-shadow room so the descender
                  // on "g" in "globally" isn't visually clipped.
                  // overflow-visible ensures the multi-layer
                  // drop-shadow filter renders past the text bounding
                  // box without the parent box-clipping it.
                  className={`absolute max-w-6xl px-8 sm:px-10 text-center transition-all duration-700 overflow-visible ${
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  {hl.kicker && (
                    <div className="mb-4 text-[10px] font-medium tracking-[0.25em] uppercase text-white/50">
                      {hl.kicker}
                    </div>
                  )}
                  <h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(200,220,235,0.82) 48%, rgba(160,185,210,0.78) 60%, rgba(255,255,255,0.95) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter:
                        "drop-shadow(0 1px 0 rgba(255,255,255,0.45)) drop-shadow(0 4px 14px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(180,210,240,0.25))",
                      // paddingRight + paddingBottom extend the H1 box
                      // outside the tight line-height so descenders
                      // (g, y, p) fall INSIDE the element. Without
                      // these, `backgroundClip: text` + the drop-
                      // shadow filter clip at the line-box and the
                      // bottom of the "g" in "globally" disappears.
                      paddingRight: "0.15em",
                      paddingBottom: "0.2em",
                    }}
                  >
                    {hl.lines.map((line, j) => (
                      <span key={j}>
                        {j === hl.lines.length - 1 ? (
                          // Only the headline whose final line carries
                          // `nowrapLastLine: true` (currently just the
                          // "Installed in 10M+ homes globally." one)
                          // forces single-line at lg+. The others
                          // wrap naturally so a long single-line
                          // headline (e.g. "Creating seamless
                          // experiences in every space.") doesn't
                          // overflow the viewport and clip on the
                          // right edge.
                          <em
                            className={`not-italic block ${hl.nowrapLastLine ? "lg:whitespace-nowrap" : ""}`}
                          >
                            {line}
                          </em>
                        ) : (
                          <>
                            {line}
                            <br />
                          </>
                        )}
                      </span>
                    ))}
                  </h1>
                </div>
              );
            })}

            {/* Final CTA */}
            <div
              className={`absolute max-w-xl px-6 text-center transition-all duration-700 ${
                showCta
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-[1.1]">
                Moving design{" "}
                <em className="text-[#9AA8B6] not-italic">forward.</em>
              </h2>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#112732] text-xs font-medium tracking-[0.15em] uppercase rounded-full hover:bg-stone-100 transition-colors"
                >
                  Explore the Collection
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  href="/visualize"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white text-xs font-medium tracking-[0.15em] uppercase rounded-full hover:bg-white/10 transition-colors"
                >
                  Try the Visualizer
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 transition-opacity duration-500 ${
              showScrollHint ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
              Scroll to explore
            </span>
            <div className="w-px h-8 bg-white/30 animate-bounce-slow" />
          </div>

          {/* Progress bar — full-width inner bar scaled on X from the
              rAF via ref (no rounded corners, so scaleX is visually
              identical to the old width changes; the lerp already
              supplies the smoothing the removed width transition
              approximated). */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
            <div
              ref={barRef}
              className="h-full w-full bg-white/60 origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
