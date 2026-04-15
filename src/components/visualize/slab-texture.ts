/**
 * Render a slab swatch (which is stored as a CSS gradient string) into a
 * canvas-backed pattern we can composite onto a photo.
 *
 * Because CSS gradient syntax isn't natively available inside a canvas, we
 * go through an offscreen SVG that embeds the gradients as foreignObject →
 * drawImage → pattern. This works in every modern evergreen browser.
 */

import type { Slab } from "@/data/slabs";

/**
 * Render a slab's swatch + overlay to an offscreen canvas at the requested
 * size. The output is a self-contained tileable image we can reuse across
 * multiple regions of the same photo.
 */
export async function renderSlabTile(
  slab: Slab,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          width:${width}px;
          height:${height}px;
          background-image:${slab.overlay ? `${slab.overlay},` : ""}${slab.swatch};
          background-size: cover;
          background-position: center;
        "></div>
      </foreignObject>
    </svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas ctx unavailable");
    ctx.drawImage(img, 0, 0, width, height);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Composite a slab tile onto a destination canvas, preserving the luminance
 * of the original room photo inside the masked region.
 *
 * Steps inside the masked region only (alpha of `mask`):
 *   1. Draw the slab tile.
 *   2. Blend the original photo's luminance on top via 'luminosity' blend,
 *      so shadows, highlights, and reflections carry through.
 *   3. Cut back to mask shape.
 */
export function applySlabToRegion(
  dst: CanvasRenderingContext2D,
  room: HTMLImageElement | HTMLCanvasElement,
  mask: ImageData,
  tile: HTMLCanvasElement,
  opts: { opacity?: number } = {},
) {
  const { opacity = 1 } = opts;
  const w = dst.canvas.width;
  const h = dst.canvas.height;

  // 1) build masked slab on an offscreen canvas
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mctx = maskCanvas.getContext("2d")!;
  mctx.putImageData(mask, 0, 0);

  const compose = document.createElement("canvas");
  compose.width = w;
  compose.height = h;
  const cctx = compose.getContext("2d")!;

  // draw slab covering the full canvas (scaled), respecting the tile's natural size.
  // We scale tile to maintain a believable slab grain (~40% of canvas width).
  const tileScale = (w * 0.6) / tile.width;
  const tW = tile.width * tileScale;
  const tH = tile.height * tileScale;
  // Tile it across the full canvas so that the masked portion always has coverage
  for (let ty = 0; ty < h; ty += tH) {
    for (let tx = 0; tx < w; tx += tW) {
      cctx.drawImage(tile, tx, ty, tW, tH);
    }
  }

  // 2) mix the original photo's luminance on top → lighting carries through
  cctx.globalCompositeOperation = "luminosity";
  cctx.drawImage(room, 0, 0, w, h);
  cctx.globalCompositeOperation = "source-over";

  // 3) clip to the mask (destination-in with the mask alpha)
  cctx.globalCompositeOperation = "destination-in";
  cctx.drawImage(maskCanvas, 0, 0);
  cctx.globalCompositeOperation = "source-over";

  // 4) paint onto dst
  dst.globalAlpha = opacity;
  dst.drawImage(compose, 0, 0);
  dst.globalAlpha = 1;
}
