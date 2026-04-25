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
 * Render a slab's texture to an offscreen canvas at the requested size.
 *
 * Two paths:
 *   - Sanity-managed slabs ship a real product photo (`photoUrl`); we use
 *     that directly so the visualizer shows the actual stone, not a fake
 *     gradient.
 *   - Hardcoded local slabs only have a CSS gradient `swatch` (+ optional
 *     overlay). We render those through an offscreen SVG foreignObject.
 *
 * Output is a self-contained tileable image reused across multiple regions
 * of the same photo.
 */
export async function renderSlabTile(
  slab: Slab,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  // ----- Real product photo path (Sanity slabs) -----
  if (slab.photoUrl) {
    try {
      const img = await loadImage(slab.photoUrl);
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("canvas ctx unavailable");
      // object-fit: cover — fill the canvas without distortion
      const scale = Math.max(
        width / img.naturalWidth,
        height / img.naturalHeight
      );
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = (width - sw) / 2;
      const sy = (height - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
      return c;
    } catch {
      // CORS / load failure → fall through to gradient swatch below
    }
  }

  // ----- CSS-gradient fallback (local slabs) -----
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

/**
 * Load an image into an HTMLImageElement.
 *
 * Two-stage attempt:
 *   1. Try with `crossOrigin="anonymous"` — this gives us an untainted
 *      canvas, so subsequent `toDataURL` / `getImageData` calls work
 *      (needed for the Export PNG feature).
 *   2. If that errors (CDN doesn't return `Access-Control-Allow-Origin`,
 *      which Sanity's image CDN sometimes doesn't on first hit), retry
 *      WITHOUT `crossOrigin`. The image still displays correctly via
 *      drawImage, but the resulting canvas is "tainted" — meaning
 *      Export PNG will fail for this slab. Visualisation > export, so
 *      we accept that trade-off rather than silently falling back to
 *      a grey gradient like before.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const tryLoad = (useCors: boolean) => {
      const img = new Image();
      if (useCors) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (useCors) {
          // CORS rejected — retry as a plain image so display still works.
          tryLoad(false);
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      img.src = src;
    };
    tryLoad(true);
  });
}

/**
 * Composite a slab tile onto a destination canvas inside the masked region.
 *
 * Earlier versions used canvas's `luminosity` blend mode to take the LIGHTNESS
 * channel from the room photo and combine it with the slab's hue + saturation.
 * In theory that preserves the room's lighting on top of the slab — but in
 * practice it destroys neutral slabs (Alabaster Noir, Graphite Matter, etc.)
 * because they have near-zero saturation, so the result becomes whatever
 * lightness the room area happened to have. A black slab on a brightly-lit
 * desk panel looked cream-coloured.
 *
 * Switched to a simpler over-blend:
 *   1. Draw the room photo as a base.
 *   2. Tile the slab on top at 90% opacity → slab character dominates,
 *      room lighting bleeds through ~10%.
 *   3. Cut to mask shape.
 *   4. Paint the result onto dst.
 */
export function applySlabToRegion(
  dst: CanvasRenderingContext2D,
  room: HTMLImageElement | HTMLCanvasElement,
  mask: ImageData,
  tile: HTMLCanvasElement,
  opts: { opacity?: number } = {}
) {
  const { opacity = 1 } = opts;
  const w = dst.canvas.width;
  const h = dst.canvas.height;

  // 1) build masked slab on an offscreen canvas.
  // The mask is created at the image's *natural* dimensions (4160×3120
  // for a typical phone photo) but the dst canvas is downsampled to
  // ≤1600px on the long side. If we putImageData the mask directly the
  // bottom-right of the mask gets clipped and the slab only paints in
  // a corner. Bridge the two resolutions via an intermediate canvas
  // so drawImage can scale the mask to fit.
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mctx = maskCanvas.getContext("2d")!;
  if (mask.width === w && mask.height === h) {
    mctx.putImageData(mask, 0, 0);
  } else {
    const tmp = document.createElement("canvas");
    tmp.width = mask.width;
    tmp.height = mask.height;
    tmp.getContext("2d")!.putImageData(mask, 0, 0);
    mctx.drawImage(tmp, 0, 0, w, h);
  }

  const compose = document.createElement("canvas");
  compose.width = w;
  compose.height = h;
  const cctx = compose.getContext("2d")!;

  // 1) Draw the slab as ONE continuous image covering the whole canvas
  //    (object-fit: cover). Real stone is a single non-repeating pattern
  //    — tiling produces visible seams every ~768px where the veining
  //    doesn't line up. Cover-fit keeps the slab continuous; each
  //    selected surface ends up showing a different region of the same
  //    slab, which reads naturally (like the slab were genuinely
  //    installed across the entire room).
  const scaleCover = Math.max(w / tile.width, h / tile.height);
  const drawW = tile.width * scaleCover;
  const drawH = tile.height * scaleCover;
  const drawX = (w - drawW) / 2;
  const drawY = (h - drawH) / 2;
  cctx.drawImage(tile, drawX, drawY, drawW, drawH);

  // 4) Clip to the mask shape.
  cctx.globalCompositeOperation = "destination-in";
  cctx.drawImage(maskCanvas, 0, 0);
  cctx.globalCompositeOperation = "source-over";

  // 5) Paint onto dst.
  dst.globalAlpha = opacity;
  dst.drawImage(compose, 0, 0);
  dst.globalAlpha = 1;
}
