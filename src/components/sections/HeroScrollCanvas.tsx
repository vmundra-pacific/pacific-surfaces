"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

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

const headlines = [
  {
    range: [0.08, 0.22] as [number, number],
    kicker: "Pacific Surfaces — 2026",
    lines: ["Where every space", "finds its surface."],
  },
  {
    range: [0.24, 0.38] as [number, number],
    kicker: "",
    lines: [
      "79 inches wide.",
      "137 inches long.",
      "Creating seamless experiences in every space.",
    ],
  },
  {
    range: [0.42, 0.56] as [number, number],
    kicker: "",
    lines: ["Where every detail reflects", "our zero compromise approach"],
  },
  {
    range: [0.6, 0.72] as [number, number],
    kicker: "",
    lines: ["Engineered in India.", "Installed everywhere."],
  },
];

export function HeroScrollCanvas() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastIdxRef = useRef(0);
  const sizedRef = useRef(false);

  // Lerp refs — smoothedProgress chases targetProgress every frame
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // Progressive frame preloading:
  // Phase 1: Load first INITIAL_BATCH kitchen frames → dismiss loading
  // Phase 2: Continue loading remaining kitchen frames in background
  useEffect(() => {
    const INITIAL_BATCH = 60; // enough for first ~10% scroll
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
        img.src = `/hero-frames/frame-${pad(i + 1)}.${ext}`;
        img.onload = img.onerror = () => {
          imgs[i] = img;
          if (!cancelled) {
            count++;
            setLoaded(count);
          }
          resolve();
        };
      });

    // Hard safety timeout — if any frame stalls (network blip, CDN
    // miss), the user shouldn't sit on the loading screen forever.
    // 8s is long enough for any reasonable connection to load 60
    // frames at AVIF sizes (~30 KB each = ~1.8 MB).
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

        // Phase 2 — load remaining kitchen frames in small batches
        const BATCH = 20;
        let cursor = INITIAL_BATCH;

        const loadNextBatch = () => {
          if (cancelled || cursor >= TOTAL_FRAMES) return;
          const end = Math.min(cursor + BATCH, TOTAL_FRAMES);
          const batch = [];
          for (let i = cursor; i < end; i++) batch.push(loadFrame(i, ext));
          cursor = end;
          Promise.all(batch).then(loadNextBatch);
        };
        loadNextBatch();
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
      if (!img || !img.complete) {
        for (let j = idx - 1; j >= 0; j--) {
          const fallback = imagesRef.current[j];
          if (fallback && fallback.complete) {
            img = fallback;
            break;
          }
        }
        if (!img || !img.complete) return;
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
  // We track the last value we PUSHED to React state separately
  // from `smoothedProgressRef` so we can throttle setProgress to only
  // fire on meaningful changes — without the throttle, the lerp's
  // tiny per-frame float deltas trigger 60 setState calls/sec even
  // when the user has stopped scrolling, which React 18 can flag as
  // "Maximum update depth exceeded".
  const lastPushedProgressRef = useRef(-1);

  useEffect(() => {
    let raf: number;
    const LERP_SPEED = 0.12; // 0–1, higher = snappier, lower = smoother
    const PUSH_THRESHOLD = 0.001; // min |Δp| before we re-render

    const tick = () => {
      const track = trackRef.current;
      if (!track) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Raw scroll position → target
      const r = track.getBoundingClientRect();
      const total = track.offsetHeight - window.innerHeight;
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

      // Only push to React state when the change is large enough to
      // matter visually. Skipping sub-threshold updates eliminates
      // the per-frame setState churn while the lerp is converging
      // or the user is idle.
      if (Math.abs(p - lastPushedProgressRef.current) > PUSH_THRESHOLD) {
        lastPushedProgressRef.current = p;
        setProgress(p);
      }

      // Kitchen scrub spans the entire scroll length now (the lump
      // phase + crossfade were removed). Map progress directly to a
      // frame index and only redraw when the index actually advances.
      if (ready) {
        const idx = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(p * TOTAL_FRAMES)
        );
        if (idx !== lastIdxRef.current) {
          drawFrame(idx);
          lastIdxRef.current = idx;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const handleResize = () => {
      sizedRef.current = false;
      drawFrame(lastIdxRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [ready, drawFrame]);

  // Draw first frame once ready
  useEffect(() => {
    if (ready) drawFrame(0);
  }, [ready, drawFrame]);

  // Derived state.
  // Chapter / headline / CTA / overlay ranges below are evaluated
  // directly against `progress` now that the lump phase is gone and
  // the kitchen scrub spans the whole scroll. (Previously progress
  // was rescaled into a phase-1 local progress because only 0–0.8
  // of the scroll was kitchen.)
  const showScrollHint = progress < 0.02;
  // CTA appears at 78% of scroll and stays visible through to the
  // end so it's on screen when the section unsticks into the next
  // page section.
  const showCta = progress >= 0.78;
  const overlayOpacity = (() => {
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
  })();

  // Loading screen shows progress of the initial batch (60 frames),
  // not all 1039 — so it dismisses quickly while the rest loads in background
  const INITIAL_BATCH = 60;
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
          src="/logo-pacific-white.png"
          alt="Pacific Surfaces"
          width={160}
          height={40}
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

      {/* Scroll track — 700vh of kitchen scrub end-to-end. The lump
          phase + crossfade overlay were removed; scrub length per
          frame is now 700vh / 1039 frames ≈ 0.67vh per frame. To
          slow the scrub down further without lengthening the section,
          thin the contents of /public/hero-frames/ and update the
          TOTAL_FRAMES constant at the top of this file. */}
      <section ref={trackRef} className="relative" style={{ height: "700vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />

          {/* Brand footer — bottom-left. The chapter rail (01 · The
              Space / 02 · The Slab / 03 · The Matter / 04 · The
              Promise) was removed per request; the brand stamp stays
              for context. */}
          <div className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col gap-3">
            <div className="text-[10px] tracking-[0.2em] text-white/30 font-mono">
              PACIFIC · EST 2011 · INDIA
            </div>
          </div>

          {/* Headlines */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {headlines.map((hl, i) => {
              // Headline ranges evaluated directly against progress
              // (kitchen scrub now spans the whole scroll, so progress
              // and the previous phase1Progress are the same value).
              const visible =
                progress >= hl.range[0] && progress <= hl.range[1];
              return (
                <div
                  key={i}
                  className={`absolute max-w-4xl px-6 text-center transition-all duration-700 ${
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
                      // Liquid-glass text: vertical gradient fill that
                      // suggests reflective glass (bright white at top
                      // and bottom, cooler tint in the middle), clipped
                      // to the letterforms so each character looks like
                      // it's been carved from translucent glass. Layered
                      // drop-shadows give depth and a soft outer halo.
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(200,220,235,0.82) 48%, rgba(160,185,210,0.78) 60%, rgba(255,255,255,0.95) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter:
                        "drop-shadow(0 1px 0 rgba(255,255,255,0.45)) drop-shadow(0 4px 14px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(180,210,240,0.25))",
                    }}
                  >
                    {hl.lines.map((line, j) => (
                      <span key={j}>
                        {j === hl.lines.length - 1 ? (
                          <em className="not-italic block">{line}</em>
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
                <a
                  href="#collections"
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
                </a>
                <a
                  href="/visualize"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white text-xs font-medium tracking-[0.15em] uppercase rounded-full hover:bg-white/10 transition-colors"
                >
                  Try the Visualizer
                </a>
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

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
            <div
              className="h-full bg-white/60 transition-[width] duration-100"
              style={{ width: `${(progress * 100).toFixed(1)}%` }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
