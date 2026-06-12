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
      const img = await loadImage(rewriteToProxy(slab.photoUrl));
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
 * Rewrite Sanity CDN image URLs to our same-origin /api/cdn proxy.
 *
 * Why: the canvas Export PNG path calls `toDataURL`, which throws a
 * SecurityError if any image drawn onto the canvas came from a
 * cross-origin source that didn't echo CORS headers. Sanity's image
 * CDN intermittently fails to return `Access-Control-Allow-Origin` on
 * first hit (cold cache), so a fraction of slab loads taint the canvas
 * and silently disable export.
 *
 * Routing through `/api/cdn/...` makes the request same-origin, side-
 * stepping CORS entirely. The proxy is implemented at
 * `src/app/api/cdn/[...path]/route.ts` and already forwards image
 * requests with the original query string intact.
 *
 * Non-Sanity URLs (data: URLs from SVG fallback, blob: URLs, demo-room
 * paths) pass through unchanged.
 */
function rewriteToProxy(src: string): string {
  return src.replace(/^https?:\/\/cdn\.sanity\.io\//, "/api/cdn/");
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
  opts: {
    opacity?: number;
    precise?: boolean;
    /**
     * Optional grayscale shadow pass painted on top of the surface.
     * Multiplied over the slab so dark areas of the shadow PNG dim
     * the rendered slab (under-cabinet shadow, lip drop-off, etc.).
     * White / transparent pixels leave the slab unchanged.
     */
    shadow?: HTMLImageElement;
    /**
     * Multiplier for the shadow pass effect. 1.0 = single multiply
     * pass. >1.0 stacks the multiply for stronger darkening. <1.0
     * blends a softer pass via globalAlpha. Default 2.0 — two full
     * multiply passes give the shadow good visual weight on both
     * pale and dark slabs. Pull down toward 1.0 if a particular
     * shadow.png has very dark blacks and starts crushing the slab.
     */
    shadowStrength?: number;
    /**
     * Optional grayscale highlights / reflections pass. Screen-blended
     * over the slab so bright pixels (window reflections, pendant
     * spill, edge sheen) lift the slab toward white in those zones.
     * Black / transparent pixels leave the slab unchanged.
     */
    highlights?: HTMLImageElement;
    /**
     * Multiplier for the highlights pass — same semantics as
     * shadowStrength but for the screen blend. Default 1.0; increase
     * if the reflections look too subtle.
     */
    highlightsStrength?: number;
    /**
     * Optional bounding box of the surface mask in the same
     * coordinate space as `mask`. When provided, the slab tile is
     * cover-fit to the bbox instead of the whole canvas — meaning
     * one slab covers one surface at natural scale, instead of
     * showing a tiny zoomed-in slice of a slab the size of the room.
     * Demo rooms pass this from `candidate.bbox`. AI surfaces also
     * have it, but pass `undefined` to fall back to canvas cover-fit
     * if you ever want the old behavior.
     */
    bbox?: { x: number; y: number; w: number; h: number };
    /**
     * Multiplier on the cover-fit scale.
     *   1.0  = slab exactly covers the bbox (one whole slab on the
     *          surface).
     *   <1.0 = slab is smaller than the bbox, tiled to fill it.
     *          Pattern features look smaller / more numerous — like
     *          looking at a real countertop where you can see several
     *          slabs' worth of veining variation.
     *   >1.0 = slab is larger than the bbox, only the center portion
     *          shows. Pattern features look bigger / more zoomed in.
     * Default 0.8 (about 25% more pattern visible than 1:1 cover-fit).
     */
    slabZoom?: number;
  } = {}
) {
  const {
    opacity = 1,
    precise = false,
    shadow,
    shadowStrength = 2,
    highlights,
    // 0 = highlights pass off by default. The screen blend was
    // washing texture out on light slabs; killing it preserves full
    // slab veining contrast. shadow.png alone provides enough lighting
    // integration. Re-enable per-call with `highlightsStrength: 0.4`
    // for darker slabs that need a sheen lift.
    highlightsStrength = 0,
    bbox,
    slabZoom = 1,
  } = opts;
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
  //    `precise: true` skips this entirely: hand-painted PSD masks (and
  //    eyeballed demo-room polygons) already trace the true edge, so
  //    dilation just spills the slab over adjoining pixels and creates
  //    the white halo that demo-room previews were showing.
  const dilatedMask = document.createElement("canvas");
  dilatedMask.width = w;
  dilatedMask.height = h;
  const dmCtx = dilatedMask.getContext("2d")!;
  if (precise) {
    // No dilation — copy source as-is.
    dmCtx.drawImage(sourceMask, 0, 0);
  } else {
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
  }
  // c) Feather the dilated mask for a soft edge against the
  //    surrounding photo. Two settings:
  //      - default (SAM-2): 2-8px blur to fade slab into the room
  //        across imprecise mask edges.
  //      - precise: 1px hairline blur, just enough to defeat aliasing
  //        on the diagonal pixels of a hand-painted mask without
  //        eating into the visible surface.
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mctx = maskCanvas.getContext("2d")!;
  const featherPx = precise
    ? 1
    : Math.max(2, Math.min(8, Math.round(Math.max(w, h) * 0.004)));
  mctx.filter = `blur(${featherPx}px)`;
  mctx.drawImage(dilatedMask, 0, 0);
  mctx.filter = "none";

  const compose = document.createElement("canvas");
  compose.width = w;
  compose.height = h;
  const cctx = compose.getContext("2d")!;

  // 1) Cover-fit the slab. Two modes:
  //    - With bbox supplied: cover-fit to the surface's bounding box,
  //      then multiply by slabZoom. slabZoom < 1 means the slab is
  //      smaller than the bbox and gets tiled. slabZoom >= 1 means
  //      the slab is drawn once, possibly extending past the bbox.
  //    - Without bbox: cover-fit to the whole canvas (legacy behaviour
  //      for AI/SAM-2 surfaces).
  //    The mask's natural dimensions can differ from dst — bbox is
  //    in mask coords, so scale it to dst before fitting.
  let bX: number, bY: number, bW: number, bH: number, scaleCover: number;
  if (bbox) {
    const sx = w / mask.width;
    const sy = h / mask.height;
    bX = bbox.x * sx;
    bY = bbox.y * sy;
    bW = bbox.w * sx;
    bH = bbox.h * sy;
    scaleCover = Math.max(bW / tile.width, bH / tile.height);
  } else {
    bX = 0;
    bY = 0;
    bW = w;
    bH = h;
    scaleCover = Math.max(w / tile.width, h / tile.height);
  }
  const targetScale = scaleCover * slabZoom;

  if (slabZoom >= 1) {
    // Single draw, slab covers (and may extend past) the bbox.
    const drawW = tile.width * targetScale;
    const drawH = tile.height * targetScale;
    const drawX = bX + (bW - drawW) / 2;
    const drawY = bY + (bH - drawH) / 2;
    cctx.drawImage(tile, drawX, drawY, drawW, drawH);
  } else {
    // Slab is smaller than the bbox — tile it. Pre-scale the tile to
    // its target rendering size, then use createPattern to repeat it
    // across the bbox area. The mask clip later trims tiling to the
    // actual surface shape.
    const scaledTileW = Math.max(1, Math.round(tile.width * targetScale));
    const scaledTileH = Math.max(1, Math.round(tile.height * targetScale));
    const scaledTile = document.createElement("canvas");
    scaledTile.width = scaledTileW;
    scaledTile.height = scaledTileH;
    scaledTile
      .getContext("2d")!
      .drawImage(tile, 0, 0, scaledTileW, scaledTileH);

    const pattern = cctx.createPattern(scaledTile, "repeat");
    if (pattern) {
      cctx.save();
      cctx.fillStyle = pattern;
      cctx.fillRect(bX, bY, bW, bH);
      cctx.restore();
    } else {
      // Pattern creation failed — fall back to single cover-fit draw.
      const drawW = tile.width * scaleCover;
      const drawH = tile.height * scaleCover;
      const drawX = bX + (bW - drawW) / 2;
      const drawY = bY + (bH - drawH) / 2;
      cctx.drawImage(tile, drawX, drawY, drawW, drawH);
    }
  }

  // 2) Soft-light a HEAVILY BLURRED copy of the room onto the slab.
  //    The blur kills the original surface's pattern (veining,
  //    texture) but preserves smooth lighting variations (object
  //    shadows, ambient gradients). Soft-light blends those onto the
  //    slab so it inherits the scene's lighting without the previous
  //    surface's pattern bleeding through.
  //
  //    SKIP THIS PASS when an explicit shadow layer was provided.
  //    shadow.png is a much higher-fidelity replacement: it tells us
  //    exactly where shadows fall, with whatever density the user
  //    chose, instead of approximating from the original photo's
  //    luminance. Running both stacks two lighting sources on top of
  //    each other and produces blown-out blacks wherever the original
  //    photo happened to be dark (e.g. the slab reads as charcoal on
  //    a back wall that originally had black stone). The soft-light
  //    pass remains the default for AI/SAM-2 surfaces that don't
  //    ship a shadow layer.
  if (!shadow) {
    const blurPx = Math.max(
      8,
      Math.min(40, Math.round(Math.max(w, h) * 0.012))
    );
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
  }

  // 2b) Multiply the optional shadow pass over the slab. Black pixels
  //     in the shadow PNG darken the slab (under-cabinet shadows,
  //     lip drop-off), white pixels leave it untouched, transparent
  //     pixels are ignored entirely. This is what makes the surface
  //     read as "installed" rather than "stamped on" — without it,
  //     the slab is uniformly bright everywhere the mask covers.
  //
  //     `shadowStrength` lets us run more (or less) than one full
  //     multiply pass: integer passes at full alpha, then a fractional
  //     residual pass via globalAlpha. e.g. strength=1.5 = one full
  //     multiply + one half-alpha multiply, giving a stronger crush
  //     without re-exporting darker blacks from PS.
  //
  //     Order matters: we run multiply AFTER the soft-light room
  //     blend (so the shadow stacks on top of the ambient lighting
  //     pass) but BEFORE the destination-in mask clip (so the
  //     multiply is constrained to the same area as the slab).
  if (shadow && shadowStrength > 0) {
    // Adaptive shadow scaling: a single shadowStrength setting can't
    // serve both ends of the slab brightness spectrum. Multiply at
    // 2.0 looks great on a black marble (deep, atmospheric shadows)
    // but turns a white calacatta to gray. So we sample the slab's
    // average brightness and scale the effective multiply count down
    // hard for light slabs, keeping it full for dark ones.
    //   brightness  0  (black) → factor 1.00 → full shadowStrength
    //   brightness 255 (white) → factor 0.15 → 15% shadowStrength
    //   linear in between
    // The aggressive 0.15 floor means a pure white slab only gets a
    // gentle 0.3-strength multiply (with shadowStrength: 2 default),
    // preserving its brightness while still grounding it with a
    // hint of shadow integration.
    const tileBrightness = sampleTileBrightness(tile);
    const brightnessFactor = 1 - 0.85 * (tileBrightness / 255);
    const effectiveStrength = shadowStrength * brightnessFactor;

    cctx.globalCompositeOperation = "multiply";
    let remaining = effectiveStrength;
    while (remaining > 0) {
      cctx.globalAlpha = Math.min(1, remaining);
      cctx.drawImage(shadow, 0, 0, w, h);
      remaining -= 1;
    }
    cctx.globalAlpha = 1;
    cctx.globalCompositeOperation = "source-over";
  }

  // 2c) Screen the optional highlights pass over the slab — same
  //     stacking trick as shadow, but with `screen` blend so bright
  //     pixels add light. Window reflections + pendant spill paint
  //     here. Order: highlights ride on top of shadow so a bright
  //     reflection on a shadowed corner still reads as bright (a
  //     real glossy slab does this — sheen wins over ambient
  //     occlusion at the surface boundary).
  if (highlights && highlightsStrength > 0) {
    cctx.globalCompositeOperation = "screen";
    let remaining = highlightsStrength;
    while (remaining > 0) {
      cctx.globalAlpha = Math.min(1, remaining);
      cctx.drawImage(highlights, 0, 0, w, h);
      remaining -= 1;
    }
    cctx.globalAlpha = 1;
    cctx.globalCompositeOperation = "source-over";
  }

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
  //
  //     SKIP when an explicit shadow layer was supplied. The user's
  //     shadow.png already controls every aspect of edge darkening
  //     (under-lip drop, corner shading, sink rim). Running this pass
  //     on top stacks an auto-vignette over the authored shadow and
  //     produces the dark band on the right edge of the island / dark
  //     line along the floor that the user was flagging. AI/SAM-2
  //     surfaces (no shadow layer) still get the vignette as their
  //     only grounding cue.
  const slabBrightness = sampleTileBrightness(tile);
  if (slabBrightness > 175 && !shadow) {
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

// Brightness results keyed by tile canvas — tiles are cached and
// reused across recomposites, so repeat calls for the same tile are
// free. WeakMap so a discarded tile's entry is GC'd with it.
const tileBrightnessCache = new WeakMap<HTMLCanvasElement, number>();

/**
 * Sample average brightness (0-255) of a slab tile by downscaling it
 * into a 7×7 offscreen canvas (drawImage handles the averaging — same
 * 7×7 sample-grid semantics as the previous 49 separate 1×1
 * getImageData readbacks) and averaging the 49 pixels in ONE
 * getImageData call. Used to decide if a slab is light enough to need
 * the dark-inner-feather effect.
 */
function sampleTileBrightness(tile: HTMLCanvasElement): number {
  const cached = tileBrightnessCache.get(tile);
  if (cached !== undefined) return cached;
  const small = document.createElement("canvas");
  small.width = 7;
  small.height = 7;
  const sctx = small.getContext("2d");
  if (!sctx) return 128;
  try {
    sctx.drawImage(tile, 0, 0, 7, 7);
    const data = sctx.getImageData(0, 0, 7, 7).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const result = sum / 49;
    tileBrightnessCache.set(tile, result);
    return result;
  } catch {
    // CORS-tainted canvas (Sanity slab loaded without proper headers)
    // — can't read pixels. Default to "light" so the dark feather
    // applies; better to over-apply than miss white slabs entirely.
    return 200;
  }
}

/* ------------------------------------------------------------------ *
 * Removed: an earlier perspective-warp chain (findMaskCorners +      *
 * warpImageToQuad + drawAffineTriangle) that warped the slab to      *
 * follow surface plane orientation via "extremes of x±y" corner      *
 * detection. The corners misfired on irregular masks (sink cutouts,  *
 * chamfered edges); cover-fit replaced it. Stripped pre-deploy as    *
 * part of the simplification audit.                                  *
 * ------------------------------------------------------------------ */
