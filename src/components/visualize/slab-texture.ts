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
 * Pipeline:
 *   0. Build a feathered mask (with modest dilation) so the slab edge
 *      softens into the surrounding original photo and reaches the
 *      true visible surface boundary.
 *   1. Cover-fit the slab to the whole canvas (continuous big-slab
 *      look — no tiling seams).
 *   2. Soft-light a HEAVILY BLURRED copy of the room onto the slab.
 *      The blur kills the original surface's pattern; soft-light
 *      blends in the scene's lighting variations so the slab feels
 *      grounded in the scene.
 *   3. Clip to the feathered mask.
 *   4. Paint onto dst.
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

  // 1) Build a masked slab on an offscreen canvas. Two goals:
  //    a) The mask is at the image's *natural* dimensions but dst is
  //       downsampled to ≤1600px. Bridge via an intermediate canvas so
  //       drawImage can scale the mask to fit.
  //    b) Soften the mask edge with a small feather. SAM-2 masks rarely
  //       hug the silhouette of foreground objects (faucets, sinks)
  //       perfectly — there's typically a 2-4 pixel gap where the mask
  //       says "countertop" but the underlying pixel is actually the
  //       faucet body. With a hard cut + soft-light blend, that gap
  //       reads as a dark halo around the obstruction. Feathering the
  //       mask edge means the slab fades out instead of cutting off, so
  //       the original photo bleeds through naturally at the obstruction
  //       boundary and the halo disappears.
  // Mask build: source → dilate → feather.
  // a) Source mask at dst dimensions.
  const sourceMask = document.createElement("canvas");
  sourceMask.width = w;
  sourceMask.height = h;
  const smCtx = sourceMask.getContext("2d")!;
  {
    const tmp = document.createElement("canvas");
    tmp.width = mask.width;
    tmp.height = mask.height;
    tmp.getContext("2d")!.putImageData(mask, 0, 0);
    if (mask.width === w && mask.height === h) {
      smCtx.drawImage(tmp, 0, 0);
    } else {
      smCtx.drawImage(tmp, 0, 0, w, h);
    }
  }
  // b) Modest dilation — covers SAM-2's typical few-pixel inset at the
  //    surface edge so the slab reaches the actual visible boundary.
  const dilatedMask = document.createElement("canvas");
  dilatedMask.width = w;
  dilatedMask.height = h;
  const dmCtx = dilatedMask.getContext("2d")!;
  const dilatePx = Math.max(
    4,
    Math.min(10, Math.round(Math.max(w, h) * 0.006))
  );
  const halfDilate = Math.round(dilatePx / 2);
  for (const [dx, dy] of [
    [0, 0],
    [-dilatePx, 0],
    [dilatePx, 0],
    [0, -dilatePx],
    [0, dilatePx],
    [-halfDilate, -halfDilate],
    [halfDilate, -halfDilate],
    [-halfDilate, halfDilate],
    [halfDilate, halfDilate],
  ]) {
    dmCtx.drawImage(sourceMask, dx, dy);
  }
  // c) Feather the dilated mask for a soft edge against the
  //    surrounding photo (no dark halos around obstructions).
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mctx = maskCanvas.getContext("2d")!;
  const featherPx = Math.max(
    2,
    Math.min(8, Math.round(Math.max(w, h) * 0.004))
  );
  mctx.filter = `blur(${featherPx}px)`;
  mctx.drawImage(dilatedMask, 0, 0);
  mctx.filter = "none";

  const compose = document.createElement("canvas");
  compose.width = w;
  compose.height = h;
  const cctx = compose.getContext("2d")!;

  // 1) Cover-fit the slab to the whole canvas. Each masked region
  //    samples a continuous chunk of one big slab — no tiling seams.
  //    (Tried perspective warp via mask-corner detection; the corners
  //    found by "x±y extremes" misfired on irregular mask shapes,
  //    distorting the slab pattern. Reverted to cover-fit. Real
  //    perspective will need depth-based corner refinement.)
  const scaleCover = Math.max(w / tile.width, h / tile.height);
  const drawW = tile.width * scaleCover;
  const drawH = tile.height * scaleCover;
  const drawX = (w - drawW) / 2;
  const drawY = (h - drawH) / 2;
  cctx.drawImage(tile, drawX, drawY, drawW, drawH);

  // 2) Soft-light a HEAVILY BLURRED copy of the room onto the slab.
  //    The blur kills the original surface's pattern (veining,
  //    texture) but preserves smooth lighting variations (object
  //    shadows, ambient gradients). Soft-light blends those onto the
  //    slab so it inherits the scene's lighting without the previous
  //    surface's pattern bleeding through.
  const blurPx = Math.max(8, Math.min(40, Math.round(Math.max(w, h) * 0.012)));
  const blurredRoom = document.createElement("canvas");
  blurredRoom.width = w;
  blurredRoom.height = h;
  const brCtx = blurredRoom.getContext("2d")!;
  brCtx.filter = `blur(${blurPx}px)`;
  brCtx.drawImage(room, 0, 0, w, h);
  brCtx.filter = "none";

  cctx.globalCompositeOperation = "soft-light";
  cctx.globalAlpha = 0.85;
  cctx.drawImage(blurredRoom, 0, 0);
  cctx.globalAlpha = 1;
  cctx.globalCompositeOperation = "source-over";

  // 3) Clip to the feathered mask.
  cctx.globalCompositeOperation = "destination-in";
  cctx.drawImage(maskCanvas, 0, 0);
  cctx.globalCompositeOperation = "source-over";

  // 3b) DARK INNER FEATHER for light slabs. White / cream / pale slabs
  //     blend visually into the surrounding photo without much
  //     definition, so the slab looks like it's floating. To fix:
  //     check the slab's average brightness; if it's a light slab,
  //     paint a soft dark gradient at the inside of the mask edge.
  //     The gradient is made by blurring the OUTSIDE of the mask in
  //     dark, then re-clipping to the mask — produces a dark vignette
  //     hugging the mask boundary.
  const slabBrightness = sampleTileBrightness(tile);
  if (slabBrightness > 175) {
    const innerShadow = document.createElement("canvas");
    innerShadow.width = w;
    innerShadow.height = h;
    const isCtx = innerShadow.getContext("2d")!;
    // Solid dark over the whole canvas...
    isCtx.fillStyle = "rgba(0, 0, 0, 0.55)";
    isCtx.fillRect(0, 0, w, h);
    // ...then knock out the mask area, leaving dark only outside.
    isCtx.globalCompositeOperation = "destination-out";
    isCtx.drawImage(maskCanvas, 0, 0);
    // Blur it: dark fades inward across the mask boundary.
    const shadowBlur = Math.max(
      6,
      Math.min(28, Math.round(Math.max(w, h) * 0.013))
    );
    const blurredShadow = document.createElement("canvas");
    blurredShadow.width = w;
    blurredShadow.height = h;
    const bsCtx = blurredShadow.getContext("2d")!;
    bsCtx.filter = `blur(${shadowBlur}px)`;
    bsCtx.drawImage(innerShadow, 0, 0);
    bsCtx.filter = "none";
    // Composite the dark vignette onto the slab, then re-clip to mask
    // so the part that bled outside doesn't show on the original photo.
    cctx.drawImage(blurredShadow, 0, 0);
    cctx.globalCompositeOperation = "destination-in";
    cctx.drawImage(maskCanvas, 0, 0);
    cctx.globalCompositeOperation = "source-over";
  }

  // 4) Paint onto dst.
  dst.globalAlpha = opacity;
  dst.drawImage(compose, 0, 0);
  dst.globalAlpha = 1;
}

/**
 * Sample average brightness (0-255) of a slab tile by checking a
 * small grid of pixels. Used to decide if a slab is light enough to
 * need the dark-inner-feather effect.
 */
function sampleTileBrightness(tile: HTMLCanvasElement): number {
  const ctx = tile.getContext("2d");
  if (!ctx) return 128;
  const grid = 8;
  let sum = 0;
  let count = 0;
  try {
    for (let i = 1; i < grid; i++) {
      for (let j = 1; j < grid; j++) {
        const x = Math.floor((i / grid) * tile.width);
        const y = Math.floor((j / grid) * tile.height);
        const data = ctx.getImageData(x, y, 1, 1).data;
        sum += 0.299 * data[0] + 0.587 * data[1] + 0.114 * data[2];
        count++;
      }
    }
  } catch {
    // CORS-tainted canvas (Sanity slab loaded without proper headers)
    // — can't read pixels. Default to "light" so the dark feather
    // applies; better to over-apply than miss white slabs entirely.
    return 200;
  }
  return count > 0 ? sum / count : 128;
}

/* ------------------------------------------------------------------ *
 * Phase 1: perspective-aware slab placement                          *
 * ------------------------------------------------------------------ */

interface Pt {
  x: number;
  y: number;
}

/**
 * Find 4 dominant corners (TL, TR, BR, BL) of a binary mask.
 *
 * Uses the "extremes of x±y" trick: a quadrilateral's 4 corners are
 * the unique points that minimise/maximise (x+y) and (x-y) over the
 * shape. Works robustly for any roughly-quadrilateral mask, regardless
 * of rotation or perspective. Falls back to null when the mask is too
 * small or degenerate (e.g. all 4 corners collinear).
 *
 * Returns coordinates in DST canvas dimensions (w × h), not the
 * mask's natural dimensions — so the caller can draw the warp
 * directly onto the dst-sized compose canvas.
 */
function findMaskCorners(
  mask: ImageData,
  dstW: number,
  dstH: number
): [Pt, Pt, Pt, Pt] | null {
  const { width, height, data } = mask;
  let minSum = Infinity;
  let maxSum = -Infinity;
  let minDiff = Infinity;
  let maxDiff = -Infinity;
  let tl: Pt = { x: 0, y: 0 };
  let tr: Pt = { x: 0, y: 0 };
  let br: Pt = { x: 0, y: 0 };
  let bl: Pt = { x: 0, y: 0 };
  let found = false;

  // Sampled at step=2 for speed. For typical mask sizes this is
  // ~250k–600k iterations — runs in a few ms.
  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const ai = (y * width + x) * 4 + 3;
      if (data[ai] <= 128) continue;
      found = true;
      const sum = x + y;
      const diff = x - y;
      if (sum < minSum) {
        minSum = sum;
        tl = { x, y };
      }
      if (sum > maxSum) {
        maxSum = sum;
        br = { x, y };
      }
      if (diff > maxDiff) {
        maxDiff = diff;
        tr = { x, y };
      }
      if (diff < minDiff) {
        minDiff = diff;
        bl = { x, y };
      }
    }
  }

  if (!found) return null;

  // Reject degenerate quads — area too small or any two corners
  // coincident (which would crash the warp's affine solver).
  const area = Math.abs(
    (tr.x - tl.x) * (br.y - tl.y) - (br.x - tl.x) * (tr.y - tl.y)
  );
  if (area < 100) return null;

  // Scale corners from mask coords (natural dims) into dst coords.
  const sx = dstW / width;
  const sy = dstH / height;
  return [
    { x: tl.x * sx, y: tl.y * sy },
    { x: tr.x * sx, y: tr.y * sy },
    { x: br.x * sx, y: br.y * sy },
    { x: bl.x * sx, y: bl.y * sy },
  ];
}

/**
 * Warp an image into a 4-point quadrilateral on the destination
 * canvas using piecewise-affine triangle splatting.
 *
 * Approach: split the source rectangle into a NxN grid of triangles,
 * compute where each triangle lands in the destination quad via
 * bilinear interpolation across the quad's edges, then draw each
 * triangle with the appropriate affine transform. With N=24 this
 * gives a smooth perspective-style warp — visually indistinguishable
 * from a true homography for textures at typical canvas sizes,
 * without needing WebGL.
 *
 * `corners` are in the order [TL, TR, BR, BL] in dst pixel coords.
 */
function warpImageToQuad(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  corners: [Pt, Pt, Pt, Pt]
): void {
  const [tl, tr, br, bl] = corners;
  const sw = source.width;
  const sh = source.height;
  const N = 24; // grid resolution — higher = smoother but slower

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const u0 = i / N;
      const u1 = (i + 1) / N;
      const v0 = j / N;
      const v1 = (j + 1) / N;

      // Source rectangle for this cell.
      const sx0 = u0 * sw;
      const sx1 = u1 * sw;
      const sy0 = v0 * sh;
      const sy1 = v1 * sh;

      // Destination cell corners via bilinear interpolation across
      // the destination quad. (1-u)(1-v)·TL + u(1-v)·TR + uv·BR + (1-u)v·BL
      const dest = (u: number, v: number): Pt => ({
        x:
          (1 - u) * (1 - v) * tl.x +
          u * (1 - v) * tr.x +
          u * v * br.x +
          (1 - u) * v * bl.x,
        y:
          (1 - u) * (1 - v) * tl.y +
          u * (1 - v) * tr.y +
          u * v * br.y +
          (1 - u) * v * bl.y,
      });
      const d00 = dest(u0, v0);
      const d10 = dest(u1, v0);
      const d11 = dest(u1, v1);
      const d01 = dest(u0, v1);

      // Two triangles per cell: (00, 10, 01) and (10, 11, 01).
      drawAffineTriangle(
        ctx,
        source,
        [sx0, sy0],
        [sx1, sy0],
        [sx0, sy1],
        d00,
        d10,
        d01
      );
      drawAffineTriangle(
        ctx,
        source,
        [sx1, sy0],
        [sx1, sy1],
        [sx0, sy1],
        d10,
        d11,
        d01
      );
    }
  }
}

/**
 * Draw a triangle from `source` to `ctx` by computing the unique
 * affine transform that maps source triangle (s0, s1, s2) to
 * destination triangle (d0, d1, d2), then clipping to the destination
 * triangle and drawing the source image with that transform applied.
 */
function drawAffineTriangle(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  s0: [number, number],
  s1: [number, number],
  s2: [number, number],
  d0: Pt,
  d1: Pt,
  d2: Pt
): void {
  // Solve the affine transform: d = M * s + t where M is 2x2, t is 2x1.
  // System: dN.x = a*sN.x + c*sN.y + e for N=0,1,2 (and similarly for y).
  const [sx0, sy0] = s0;
  const [sx1, sy1] = s1;
  const [sx2, sy2] = s2;

  const det = (sx1 - sx0) * (sy2 - sy0) - (sy1 - sy0) * (sx2 - sx0);
  if (Math.abs(det) < 1e-9) return; // collinear source — skip
  const invDet = 1 / det;

  const a =
    ((d1.x - d0.x) * (sy2 - sy0) - (d2.x - d0.x) * (sy1 - sy0)) * invDet;
  const c =
    ((d2.x - d0.x) * (sx1 - sx0) - (d1.x - d0.x) * (sx2 - sx0)) * invDet;
  const e = d0.x - a * sx0 - c * sy0;

  const b =
    ((d1.y - d0.y) * (sy2 - sy0) - (d2.y - d0.y) * (sy1 - sy0)) * invDet;
  const d =
    ((d2.y - d0.y) * (sx1 - sx0) - (d1.y - d0.y) * (sx2 - sx0)) * invDet;
  const f = d0.y - b * sx0 - d * sy0;

  ctx.save();
  // Clip to the destination triangle so the affine drawImage doesn't
  // bleed past the triangle's edges into adjacent cells.
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}
