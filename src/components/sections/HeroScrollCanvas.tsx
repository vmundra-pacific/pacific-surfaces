"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const TOTAL_FRAMES = 606;
const pad = (n: number) => String(n).padStart(3, "0");

interface Chapter {
  label: string;
  range: [number, number]; // scroll progress range
}

const chapters: Chapter[] = [
  { label: "01 · The Space", range: [0, 0.22] },
  { label: "02 · The Slab", range: [0.22, 0.45] },
  { label: "03 · The Matter", range: [0.45, 0.7] },
  { label: "04 · The Promise", range: [0.7, 1] },
];

const headlines = [
  {
    range: [0.08, 0.22] as [number, number],
    kicker: "Pacific Surfaces — 2026",
    lines: ["Surfaces that hold", "entire rooms in tension."],
  },
  {
    range: [0.24, 0.38] as [number, number],
    kicker: "",
    lines: [
      "Sixty-five inches wide.",
      "One hundred and thirty-one long.",
      "One hundred percent considered.",
    ],
  },
  {
    range: [0.42, 0.56] as [number, number],
    kicker: "",
    lines: ["93% crushed quartz.", "7% binder.", "Zero compromise."],
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
  // Phase 1: Load first INITIAL_BATCH frames → dismiss loading screen
  // Phase 2: Continue loading remaining frames in background
  useEffect(() => {
    const INITIAL_BATCH = 60; // enough for first ~10% scroll
    let count = 0;
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = imgs;

    // Load a single frame, returns a promise
    const loadFrame = (i: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.src = `/hero/frame-${pad(i)}.jpg`;
        img.onload = img.onerror = () => {
          imgs[i] = img;
          if (!cancelled) {
            count++;
            setLoaded(count);
          }
          resolve();
        };
      });

    // Phase 1 — load initial batch in parallel
    const phase1 = Array.from({ length: INITIAL_BATCH }, (_, i) =>
      loadFrame(i)
    );
    Promise.all(phase1).then(() => {
      if (cancelled) return;
      setTimeout(() => setReady(true), 200);

      // Phase 2 — load remaining frames in small batches to avoid choking the network
      const BATCH = 20;
      let cursor = INITIAL_BATCH;

      const loadNextBatch = () => {
        if (cancelled || cursor >= TOTAL_FRAMES) return;
        const end = Math.min(cursor + BATCH, TOTAL_FRAMES);
        const batch = [];
        for (let i = cursor; i < end; i++) batch.push(loadFrame(i));
        cursor = end;
        Promise.all(batch).then(loadNextBatch);
      };
      loadNextBatch();
    });

    return () => {
      cancelled = true;
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
        // Search backwards for nearest loaded frame
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

  // Scroll controller with lerp smoothing
  useEffect(() => {
    let raf: number;
    const LERP_SPEED = 0.12; // 0–1, higher = snappier, lower = smoother

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
      // Snap if very close (avoid infinite micro-lerp)
      const p =
        Math.abs(diff) < 0.0005
          ? targetProgressRef.current
          : prev + diff * LERP_SPEED;
      smoothedProgressRef.current = p;

      setProgress(p);

      const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
      if (ready && idx !== lastIdxRef.current) {
        drawFrame(idx);
        lastIdxRef.current = idx;
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

  // Derived state
  const activeChapter = chapters.findIndex(
    (c) => progress >= c.range[0] && progress < c.range[1]
  );
  const showScrollHint = progress < 0.02;
  const showCta = progress >= 0.78;
  const overlayOpacity =
    progress < 0.06
      ? 0.25
      : progress < 0.18
        ? 0.15
        : progress < 0.72
          ? 0.55
          : 0.45;

  // Loading screen shows progress of the initial batch (60 frames),
  // not all 606 — so it dismisses quickly while the rest loads in background
  const INITIAL_BATCH = 60;
  const loadPct = ready
    ? 100
    : Math.round((Math.min(loaded, INITIAL_BATCH) / INITIAL_BATCH) * 100);

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

      {/* Scroll track — 500vh for 606 frames ≈ 5-8 frames per wheel tick */}
      <section ref={trackRef} className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />

          {/* Chapter rail — bottom-left */}
          <div className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col gap-3">
            {chapters.map((ch, i) => (
              <div
                key={ch.label}
                className={`flex items-center gap-2.5 text-[10px] tracking-[0.18em] uppercase transition-all duration-500 ${
                  i === activeChapter
                    ? "text-white opacity-100"
                    : "text-white/30 opacity-60"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    i === activeChapter ? "bg-white scale-125" : "bg-white/30"
                  }`}
                />
                {ch.label}
              </div>
            ))}
            <div className="mt-4 text-[10px] tracking-[0.2em] text-white/30 font-mono">
              PACIFIC · EST 2011 · INDIA
            </div>
          </div>

          {/* Headlines */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {headlines.map((hl, i) => {
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
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05]">
                    {hl.lines.map((line, j) => (
                      <span key={j}>
                        {j === hl.lines.length - 1 ? (
                          <em className="text-[#9AA8B6] not-italic block">
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
