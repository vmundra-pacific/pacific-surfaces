"use client";

import { useEffect, useRef, useState } from "react";
import { applySlabToRegion } from "@/components/visualize/slab-texture";

/**
 * Live basin preview — the visualizer's compositing pipeline, applied to a
 * store product instead of a room.
 *
 * The layers are the same ones the demo rooms use, authored per product:
 *   base.png        the basin photograph
 *   mask.png        white where the stone shows, black elsewhere
 *   shadows.png     multiplied over the stone, so the bowl keeps its depth
 *   highlights.png  screened over it, so the sheen survives the swap
 *
 * Without the shadow and highlight passes a swapped colour reads as a flat
 * sticker; with them the basin keeps its form and the stone looks like it
 * was cut for it.
 *
 * Kept quick on a change of colour (owner, 2026-10-10: "it is delayed"):
 * the layers and the rasterised mask are loaded once and cached for the
 * page; the slab photograph is fetched at the size it is drawn (Sanity's
 * own resize at q=100, so nothing finer than the canvas is thrown away
 * after a full-size download), cached, and fetched ahead when a colour is
 * hovered (prefetchSlab); and the new composite is built off screen and
 * swapped in whole, so the old colour stays up until the new one is ready
 * instead of the bare photograph flashing between them.
 */

export interface BasinAssets {
  base: string;
  mask: string;
  shadows?: string;
  highlights?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

const images = new Map<string, Promise<HTMLImageElement>>();
const masks = new Map<string, Promise<ImageData>>();

/** One load per address for the life of the page. */
function cachedImage(src: string): Promise<HTMLImageElement> {
  let p = images.get(src);
  if (!p) {
    p = loadImage(src);
    images.set(src, p);
    p.catch(() => images.delete(src));
  }
  return p;
}

/** The scenes are drawn at most this wide on the product page. */
const PAGE_WIDTH = 2944;

/** A slab photograph as the compositor draws it: through our own proxy
 *  (first-party, CORS-clean), resized by Sanity to the canvas width at full
 *  quality. Local files are used as they are. */
function slabUrl(src: string, width: number): string {
  const m = src.match(/^https?:\/\/cdn\.sanity\.io\/(images\/[^?]+)(\?.*)?$/);
  if (!m) return src;
  const q = new URLSearchParams(m[2]?.slice(1) ?? "");
  if (!q.has("w")) {
    q.set("w", String(Math.round(width)));
    q.set("fit", "max");
    q.set("q", "100");
  }
  return `/api/cdn/${m[1]}?${q.toString()}`;
}

/** Fetch a colour's slab ahead of a click (hover, focus), so the swap
 *  only has to composite. */
export function prefetchSlab(src: string | null | undefined, width = PAGE_WIDTH) {
  if (src) void cachedImage(slabUrl(src, width)).catch(() => undefined);
}

/** The mask as ImageData at one size, rasterised once. */
function cachedMask(src: string, w: number, h: number): Promise<ImageData> {
  const key = `${src}@${w}x${h}`;
  let p = masks.get(key);
  if (!p) {
    p = cachedImage(src).then((img) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("canvas ctx unavailable");
      ctx.drawImage(img, 0, 0, w, h);
      return ctx.getImageData(0, 0, w, h);
    });
    masks.set(key, p);
    p.catch(() => masks.delete(key));
  }
  return p;
}

export function BasinPreview({
  assets,
  colourName,
  colourImage,
  alt,
  maxWidth,
  lazy = false,
}: {
  assets: BasinAssets;
  colourName: string;
  /** The chosen design's slab photograph. */
  colourImage: string | null;
  alt: string;
  /** Composite at most this wide (a grid card needs a fraction of the
   *  photograph's pixels, and compositing cost grows with them). */
  maxWidth?: number;
  /** Wait until the preview scrolls near the screen before compositing. */
  lazy?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(!lazy);

  useEffect(() => {
    if (inView) return;
    const el = canvasRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const [base, shadows, highlights] = await Promise.all([
          cachedImage(assets.base),
          assets.shadows ? cachedImage(assets.shadows) : Promise.resolve(null),
          assets.highlights ? cachedImage(assets.highlights) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const scale = maxWidth ? Math.min(1, maxWidth / base.naturalWidth) : 1;
        const w = Math.round(base.naturalWidth * scale);
        const h = Math.round(base.naturalHeight * scale);

        // No colour picked yet, or the design has no photograph: leave the
        // basin as shot rather than compositing nothing over it.
        if (!colourImage) {
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")?.drawImage(base, 0, 0, w, h);
          setReady(true);
          return;
        }

        const [mask, slab] = await Promise.all([cachedMask(assets.mask, w, h), cachedImage(slabUrl(colourImage, w))]);
        if (cancelled) return;

        // The slab cover-fitted to the frame, as the visualizer's tile.
        const tile = document.createElement("canvas");
        tile.width = w;
        tile.height = h;
        const tctx = tile.getContext("2d");
        if (!tctx) return;
        const k = Math.max(w / slab.naturalWidth, h / slab.naturalHeight);
        tctx.drawImage(slab, (w - slab.naturalWidth * k) / 2, (h - slab.naturalHeight * k) / 2, slab.naturalWidth * k, slab.naturalHeight * k);

        // Built off screen, then swapped in whole.
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h;
        const octx = out.getContext("2d");
        if (!octx) return;
        octx.drawImage(base, 0, 0, w, h);
        applySlabToRegion(octx, base, mask, tile, {
          precise: true,
          shadow: shadows ?? undefined,
          highlights: highlights ?? undefined,
          // The bowl is a small part of the frame, so let the stone sit at
          // a zoom where its veining still reads rather than showing one
          // enlarged slice of the slab.
          slabZoom: 0.9,
        });
        if (cancelled) return;

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(out, 0, 0);
        setReady(true);
      } catch {
        // A missing or cross-origin-blocked layer should degrade to the
        // photograph, never to an empty box.
        if (!cancelled) setFailed(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [assets, colourImage, colourName, inView, maxWidth]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={assets.base} alt={alt} className="h-full w-full object-cover" />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={`${alt} in ${colourName}`}
      className="h-full w-full object-cover"
      style={{ opacity: ready ? 1 : 0, transition: "opacity .35s ease" }}
    />
  );
}
