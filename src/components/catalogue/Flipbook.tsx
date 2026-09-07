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
  poster,
  onClose,
}: {
  url: string;
  title: string;
  /** The card's cover art. Shown instantly so the reader has something on
   *  screen while pdf.js loads and page one rasterises. */
  poster?: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const taskRef = useRef<{ cancel: () => void } | null>(null);
  // Guards the async draw: every await below can resolve after the reader
  // has closed, and touching a destroyed document throws inside a promise
  // that React surfaces to the nearest error boundary — closing the reader
  // was blanking the whole page.
  const aliveRef = useRef(true);
  const [pages, setPages] = useState(0);
  // True when the PDF holds one page per leaf and we must set two side by
  // side to read as a book. False when the file is already imposed as
  // spreads, where pairing would put four leaves on screen at once.
  const [paired, setPaired] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Flips once the first spread has actually been drawn, which is when the
  // cover placeholder can be faded out.
  const [painted, setPainted] = useState(false);

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
        if (cancelled || !aliveRef.current) {
          try {
            doc.destroy();
          } catch {
            /* nothing to tear down */
          }
          return;
        }
        docRef.current = doc;
        setPages(doc.numPages);

        // Judge from the first inside page, not the cover: covers are
        // portrait even in files whose interior is already imposed as
        // landscape spreads.
        const probe = await doc.getPage(Math.min(2, doc.numPages));
        const pv = probe.getViewport({ scale: 1 });
        setPaired(pv.height > pv.width);
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
      // Cancel the render before destroying what it is rendering from.
      try {
        taskRef.current?.cancel();
      } catch {
        /* already finished */
      }
      taskRef.current = null;
      try {
        docRef.current?.destroy();
      } catch {
        /* already torn down */
      }
      docRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  /* Pages in the current view. The cover always stands alone, as it does
     in print; after that, leaves are set in twos. */
  const view = (() => {
    if (!paired || page === 1) return [page];
    const right = page + 1;
    return right <= pages ? [page, right] : [page];
  })();

  /* ---------- draw the current spread ---------- */
  const draw = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    taskRef.current?.cancel();

    // Measured from the stage element, not canvas.parentElement: on the
    // first draw the canvas has no size, the flex row collapses around it,
    // and the spread rendered at a fifth of the stage.
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage || stage.width < 2 || stage.height < 2) return;

    const nums =
      !paired || page === 1
        ? [page]
        : [page, page + 1].filter((n) => n <= doc.numPages);
    const leaves = await Promise.all(nums.map((n) => doc.getPage(n)));
    if (!aliveRef.current) return;
    const bases = leaves.map((l) => l.getViewport({ scale: 1 }));

    // Fit the whole spread — both leaves together — into the stage.
    const totalW = bases.reduce((sum, v) => sum + v.width, 0);
    const maxH = Math.max(...bases.map((v) => v.height));
    const fit = Math.min(stage.width / totalW, stage.height / maxH);
    // DPR capped at 2: a 3x phone rendering two leaves at native density
    // makes a canvas large enough for the browser to refuse it.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = fit * zoom * dpr;

    const vps = leaves.map((l) => l.getViewport({ scale }));
    const w = Math.floor(vps.reduce((sum, v) => sum + v.width, 0));
    const h = Math.floor(Math.max(...vps.map((v) => v.height)));

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${Math.floor(w / dpr)}px`;
    canvas.style.height = `${Math.floor(h / dpr)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Render each leaf into its own offscreen canvas, then place them side
    // by side. pdf.js renders to the origin of whatever canvas it is given,
    // so it cannot draw the right-hand leaf at an offset directly.
    let x = 0;
    for (let i = 0; i < leaves.length; i++) {
      const off = document.createElement("canvas");
      off.width = Math.floor(vps[i].width);
      off.height = Math.floor(vps[i].height);
      const octx = off.getContext("2d");
      if (!octx) continue;
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, off.width, off.height);
      const task = leaves[i].render({
        canvasContext: octx,
        viewport: vps[i],
        canvas: off,
      });
      taskRef.current = task;
      try {
        await task.promise;
      } catch {
        return; /* superseded by a newer page, or the reader closed */
      }
      if (!aliveRef.current) return;
      ctx.drawImage(off, x, 0);
      x += off.width;
    }
    setPainted(true);

    // Gutter, so a paired spread reads as two leaves rather than one image.
    if (leaves.length === 2) {
      const seam = Math.floor(vps[0].width);
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(seam - 1, 0, 2, h);
    }
  }, [page, zoom, paired]);

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
        let next: number;
        if (!paired) next = dir === "next" ? p + 1 : p - 1;
        else if (dir === "next") next = p === 1 ? 2 : p + 2;
        else next = p === 2 ? 1 : p - 2;
        if (next < 1 || next > pages) return p;
        setTurning(dir);
        window.setTimeout(() => setTurning(null), 420);
        return next;
      });
    },
    [pages, paired]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      else if (e.key === "ArrowLeft") go("prev");
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Only `overflow: hidden`. The usual position:fixed lock loses the
    // offset and has to restore it by hand, and this site runs Lenis —
    // the two fight, and the reader closed 800px up the page. Hiding
    // overflow alone stops the scroll without moving it.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const toggleFullscreen = () => {
    const el = document.getElementById("flipbook-root");
    if (!document.fullscreenElement) void el?.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  const iconBtn =
    "rounded-full p-2 text-black/55 transition-colors hover:bg-black/[.06] hover:text-black";

  // Rendered into <body>, not in place. The cards animate in through a
  // framer-motion wrapper, and a transformed ancestor makes `position:
  // fixed` resolve against that ancestor instead of the viewport — the
  // reader was opening at the size of the card that launched it.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      id="flipbook-root"
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — catalogue reader`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 px-4 py-3 sm:px-6">
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-black/70">
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
          <span className="w-11 text-center text-[11px] tabular-nums text-black/45">
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
        {/* The cover, up instantly. pdf.js has to download, start a worker
            and rasterise page one before anything can be shown otherwise —
            about 800ms on a fast connection — and a blank screen for that
            long reads as a broken link. */}
        {!painted && !error && poster && (
          // Plain <img>, not next/image: the poster is already the exact
          // file the card just rendered, so it comes straight from cache.
          // Routing it through the optimizer would request a second,
          // differently-sized variant and defeat the point.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute max-h-full max-w-full object-contain shadow-[0_10px_44px_rgba(0,0,0,.18)] ring-1 ring-black/[.08]"
          />
        )}

        {loading && (
          <div className="absolute bottom-6 flex items-center gap-2.5 rounded-full bg-white/85 px-4 py-2 text-black/55 shadow-sm backdrop-blur">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.2em]">
              Opening {title}
            </span>
          </div>
        )}

        {error && (
          <p className="max-w-sm text-center text-sm text-black/60">{error}</p>
        )}

        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className={[
              "relative max-h-full origin-center bg-white shadow-[0_10px_44px_rgba(0,0,0,.18)] ring-1 ring-black/[.08]",
              "transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(.2,.9,.3,1)]",
              painted ? "opacity-100" : "opacity-0",
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
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/85 p-3 text-black/65 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-black sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {!loading && !error && page < pages && (
          <button
            type="button"
            onClick={() => go("next")}
            aria-label="Next page"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/85 p-3 text-black/65 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-black sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {!loading && !error && pages > 0 && (
        <div className="flex shrink-0 items-center justify-center gap-4 border-t border-black/10 px-4 py-3 sm:px-6">
          <input
            type="range"
            min={1}
            max={pages}
            value={page}
            onChange={(e) => {
              const n = Number(e.target.value);
              // Snap to a left-hand leaf so the slider cannot land
              // mid-spread and show the same page on both sides.
              setPage(paired && n > 1 && n % 2 === 1 ? n - 1 : n);
            }}
            aria-label="Jump to page"
            className="h-1 w-full max-w-md cursor-pointer appearance-none rounded-full bg-black/15 accent-black"
          />
          <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-black/45">
            {view.length === 2 ? `${view[0]}–${view[1]}` : view[0]} / {pages}
          </span>
        </div>
      )}
    </div>,
    document.body
  );
}
