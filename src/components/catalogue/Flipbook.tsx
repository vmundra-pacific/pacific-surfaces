"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";

/**
 * Flipbook — read a catalogue in the browser instead of downloading it.
 *
 * Modelled on the Kohler retail book: the spread fills the screen, arrows
 * sit either side, and turning a page curls it.
 *
 * Rendering is PDF.js against the original file rather than a pre-rendered
 * image set. That matters here because the catalogues live in Sanity and
 * run from 0.8 MB to 458 MB; the CDN answers range requests (verified: 206
 * Partial Content), so `disableAutoFetch` lets someone open the 458 MB
 * palette and pull only the spreads they actually look at. Pre-rendering
 * all nineteen would have meant ~600 images to generate, host, and
 * regenerate every time an editor swaps a file.
 *
 * Most of these PDFs are already laid out as two-page spreads, so one PDF
 * page is one spread on screen and no pairing logic is needed.
 */

interface PdfPage {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: Record<string, unknown>) => {
    promise: Promise<void>;
    cancel: () => void;
  };
}
interface PdfDoc {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  destroy: () => void;
}

export function Flipbook({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const taskRef = useRef<{ cancel: () => void } | null>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- open the document ---------- */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // The worker ships with the package. Resolving it against
        // import.meta.url keeps the bundler from trying to inline it.
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        const task = pdfjs.getDocument({
          url,
          disableAutoFetch: true, // stream spreads on demand
          disableStream: false,
        });
        const doc = (await task.promise) as unknown as PdfDoc;
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setPages(doc.numPages);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("This catalogue could not be opened. Try downloading it.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      docRef.current?.destroy();
      docRef.current = null;
    };
  }, [url]);

  /* ---------- draw the current spread ---------- */
  const draw = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    taskRef.current?.cancel();

    const pg = await doc.getPage(page);
    const base = pg.getViewport({ scale: 1 });
    // Measured from the stage element, not canvas.parentElement: on the
    // first draw the canvas has no size yet, the flex row collapses around
    // it, and the spread was rendering at a fifth of the stage.
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage || stage.width < 2 || stage.height < 2) return;

    // Fit the spread to the stage, then apply the reader's zoom. DPR is
    // capped at 2: a 3x phone rendering a full spread at native density
    // produces a canvas large enough for the browser to refuse it.
    const fit = Math.min(stage.width / base.width, stage.height / base.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vp = pg.getViewport({ scale: fit * zoom * dpr });

    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    canvas.style.width = `${Math.floor(vp.width / dpr)}px`;
    canvas.style.height = `${Math.floor(vp.height / dpr)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const task = pg.render({ canvasContext: ctx, viewport: vp, canvas });
    taskRef.current = task;
    try {
      await task.promise;
    } catch {
      /* superseded by a newer page — expected */
    }
  }, [page, zoom]);

  useEffect(() => {
    if (!loading && !error) void draw();
  }, [draw, loading, error]);

  // Redraw whenever the stage resizes — the window changing, entering
  // full screen, or simply the first layout pass settling after the
  // loading state clears.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => void draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  /* ---------- navigation ---------- */
  const go = useCallback(
    (dir: "next" | "prev") => {
      setPage((p) => {
        const next = dir === "next" ? p + 1 : p - 1;
        if (next < 1 || next > pages) return p;
        setTurning(dir);
        window.setTimeout(() => setTurning(null), 420);
        return next;
      });
    },
    [pages]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      else if (e.key === "ArrowLeft") go("prev");
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const toggleFullscreen = () => {
    const el = document.getElementById("flipbook-root");
    if (!document.fullscreenElement) void el?.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  const iconBtn =
    "rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white";

  // Rendered into <body>, not in place. The cards animate in through a
  // framer-motion wrapper, and a transformed ancestor makes `position:
  // fixed` resolve against that ancestor instead of the viewport — the
  // reader was opening at the size of the card that launched it.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="flipbook-root"
      className="fixed inset-0 z-[200] flex flex-col bg-[#0d0d0f]"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — catalogue reader`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            aria-label="Zoom out"
            className={iconBtn}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-11 text-center text-[11px] tabular-nums text-white/55">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
            aria-label="Zoom in"
            className={iconBtn}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Full screen"
            className={iconBtn}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <a href={url} download aria-label="Download PDF" className={iconBtn}>
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader"
            className={`ml-1 ${iconBtn}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-6"
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-[11px] uppercase tracking-[0.2em]">
              Opening {title}
            </span>
          </div>
        )}

        {error && (
          <p className="max-w-sm text-center text-sm text-white/70">{error}</p>
        )}

        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className={[
              "max-h-full origin-center bg-white shadow-[0_24px_80px_rgba(0,0,0,.6)]",
              "transition-transform duration-[420ms] ease-[cubic-bezier(.2,.9,.3,1)]",
              turning === "next"
                ? "[transform:perspective(2200px)_rotateY(-12deg)]"
                : "",
              turning === "prev"
                ? "[transform:perspective(2200px)_rotateY(12deg)]"
                : "",
            ].join(" ")}
          />
        )}

        {!loading && !error && page > 1 && (
          <button
            type="button"
            onClick={() => go("prev")}
            aria-label="Previous page"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-3 text-white/80 backdrop-blur transition-colors hover:bg-black/70 hover:text-white sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {!loading && !error && page < pages && (
          <button
            type="button"
            onClick={() => go("next")}
            aria-label="Next page"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-3 text-white/80 backdrop-blur transition-colors hover:bg-black/70 hover:text-white sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {!loading && !error && pages > 0 && (
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-white/10 px-4 py-3 sm:px-6">
          <input
            type="range"
            min={1}
            max={pages}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            aria-label="Jump to page"
            className="h-1 w-full max-w-md cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
          />
          <span className="shrink-0 text-[11px] tabular-nums text-white/55">
            {page} / {pages}
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}
