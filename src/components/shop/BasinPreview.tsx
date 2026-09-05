"use client";

import { useEffect, useRef, useState } from "react";
import {
  applySlabToRegion,
  renderSlabTile,
} from "@/components/visualize/slab-texture";
import type { Slab } from "@/data/slabs";

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
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export function BasinPreview({
  assets,
  colourName,
  colourImage,
  alt,
}: {
  assets: BasinAssets;
  colourName: string;
  /** The chosen design's slab photograph. */
  colourImage: string | null;
  alt: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const [base, maskImg, shadows, highlights] = await Promise.all([
          loadImage(assets.base),
          loadImage(assets.mask),
          assets.shadows ? loadImage(assets.shadows) : Promise.resolve(null),
          assets.highlights
            ? loadImage(assets.highlights)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;

        canvas.width = base.naturalWidth;
        canvas.height = base.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(base, 0, 0);

        // No colour picked yet, or the design has no photograph: leave the
        // basin as shot rather than compositing nothing over it.
        if (!colourImage) {
          setReady(true);
          return;
        }

        // Rasterise the mask into ImageData, which is what the visualizer's
        // compositor expects.
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const mctx = maskCanvas.getContext("2d");
        if (!mctx) return;
        mctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        const mask = mctx.getImageData(0, 0, canvas.width, canvas.height);

        // The compositor takes a Slab; only the photo matters here.
        const slab = {
          id: colourName,
          name: colourName,
          slug: colourName,
          hues: [],
          collection: "",
          pattern: "",
          finishes: [],
          thicknesses: [],
          swatch: "#ffffff",
          photoUrl: colourImage,
        } as unknown as Slab;

        const tile = await renderSlabTile(slab, canvas.width, canvas.height);
        if (cancelled) return;

        applySlabToRegion(ctx, base, mask, tile, {
          precise: true,
          shadow: shadows ?? undefined,
          highlights: highlights ?? undefined,
          // The bowl is a small part of the frame, so let the stone sit at
          // a zoom where its veining still reads rather than showing one
          // enlarged slice of the slab.
          slabZoom: 0.9,
        });

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
  }, [assets, colourImage, colourName]);

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
