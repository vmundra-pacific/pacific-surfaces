/**
 * Tap-based surface selection with edge-aware flood fill.
 *
 * Gone is the "auto-detect everything" heuristic. Instead the user taps the
 * countertop and we grow a region outward that respects both colour similarity
 * AND image edges — so the fill stops cleanly at the stove, the backsplash,
 * the sink cutout, etc.
 *
 * Pipeline for a single tap:
 *   1. Downsample image to a working grid.
 *   2. Compute a Sobel edge magnitude map (O(N)).
 *   3. Flood from the tap point, advancing to a neighbour only if:
 *        - colour distance to the seed stays below `tolerance`
 *        - edge magnitude at the neighbour is below `edgeGate`
 *   4. Upsample the mask back to full image resolution, feather the edges.
 *
 * The result feels like Photoshop's magic wand tuned for interior photos.
 *
 * Users can also *add* to an existing mask (shift-tap) or *subtract* from it
 * — those modes are implemented by combining the new mask with the previous
 * one via pixel-wise max (union) or (a AND NOT b) (difference).
 */

export interface SurfaceCandidate {
  /** 0..1 confidence score, purely informational */
  score: number;
  /** bounding box in image pixel coordinates */
  bbox: { x: number; y: number; w: number; h: number };
  /** centroid in image pixel coordinates */
  centroid: { x: number; y: number };
  /** Uint8 mask, full image resolution, 0 = out, 255 = in */
  mask: ImageData;
}

const WORK_SIZE = 320; // coarser = faster but chunkier edges; 320 is a sweet spot

// -------------------------- colour helpers -------------------------- //

function toLab(r: number, g: number, b: number): [number, number, number] {
  const rl = r / 255;
  const gl = g / 255;
  const bl = b / 255;
  const l = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  const a = (rl - gl) * 0.5 + 0.5;
  const bb = (gl - bl) * 0.5 + 0.5;
  return [l, a, bb];
}

function colorDist(c1: [number, number, number], c2: [number, number, number]) {
  const dl = c1[0] - c2[0];
  const da = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dl * dl * 0.6 + da * da * 2.2 + db * db * 2.2);
}

// -------------------------- working canvas -------------------------- //

function resample(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  scale: number;
} {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const longest = Math.max(srcW, srcH);
  const scale = longest > WORK_SIZE ? WORK_SIZE / longest : 1;
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas: c, scale };
}

// -------------------------- Sobel edges -------------------------- //

/**
 * Sobel magnitude per pixel, normalised roughly to [0..1].
 */
function sobel(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  // luminance grid
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const k = i * 4;
    lum[i] = (0.2126 * data[k] + 0.7152 * data[k + 1] + 0.0722 * data[k + 2]) / 255;
  }
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = lum[(y - 1) * w + (x - 1)];
      const tc = lum[(y - 1) * w + x];
      const tr = lum[(y - 1) * w + (x + 1)];
      const ml = lum[y * w + (x - 1)];
      const mr = lum[y * w + (x + 1)];
      const bl = lum[(y + 1) * w + (x - 1)];
      const bc = lum[(y + 1) * w + x];
      const br = lum[(y + 1) * w + (x + 1)];
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      out[y * w + x] = Math.min(1, Math.sqrt(gx * gx + gy * gy) * 0.7);
    }
  }
  return out;
}

// -------------------------- edge-aware flood fill -------------------------- //

interface FloodOptions {
  /** LAB-ish colour distance ceiling (0..~2) */
  tolerance?: number;
  /** Edge magnitude above this blocks the fill (0..1) */
  edgeGate?: number;
}

function floodFillInternal(
  img: HTMLImageElement,
  clickX: number,
  clickY: number,
  opts: FloodOptions,
): { mask: ImageData; bbox: { x: number; y: number; w: number; h: number }; centroid: { x: number; y: number } } | null {
  const tolerance = opts.tolerance ?? 0.16;
  const edgeGate = opts.edgeGate ?? 0.28;

  const { canvas, scale } = resample(img);
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const pix = ctx.getImageData(0, 0, w, h);
  const edges = sobel(pix.data, w, h);

  const sx = Math.max(0, Math.min(w - 1, Math.floor(clickX * scale)));
  const sy = Math.max(0, Math.min(h - 1, Math.floor(clickY * scale)));

  // If the tap lands directly on a strong edge, nudge off it toward the
  // flattest neighbour — this avoids the "tap on the seam" case where the
  // fill can't escape.
  let seedX = sx;
  let seedY = sy;
  if (edges[sy * w + sx] > edgeGate * 0.8) {
    let best = edges[sy * w + sx];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = sx + dx;
        const ny = sy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const e = edges[ny * w + nx];
        if (e < best) {
          best = e;
          seedX = nx;
          seedY = ny;
        }
      }
    }
  }

  const seedIdx = (seedY * w + seedX) * 4;
  const seedLab = toLab(pix.data[seedIdx], pix.data[seedIdx + 1], pix.data[seedIdx + 2]);

  const visited = new Uint8Array(w * h);
  const stack: number[] = [seedY * w + seedX];
  visited[seedY * w + seedX] = 1;

  let count = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = seedX;
  let maxX = seedX;
  let minY = seedY;
  let maxY = seedY;

  while (stack.length) {
    const idx = stack.pop()!;
    const x = idx % w;
    const y = (idx / w) | 0;
    count++;
    sumX += x;
    sumY += y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    // 4-connected neighbours
    const neigh = [idx + 1, idx - 1, idx + w, idx - w];
    const nx = [x + 1, x - 1, x, x];
    const ny = [y, y, y + 1, y - 1];
    for (let d = 0; d < 4; d++) {
      const nxx = nx[d];
      const nyy = ny[d];
      if (nxx < 0 || nyy < 0 || nxx >= w || nyy >= h) continue;
      const nIdx = neigh[d];
      if (visited[nIdx]) continue;
      if (edges[nIdx] > edgeGate) continue; // blocked by a strong edge
      const k = nIdx * 4;
      const nLab = toLab(pix.data[k], pix.data[k + 1], pix.data[k + 2]);
      if (colorDist(seedLab, nLab) > tolerance) continue;
      visited[nIdx] = 1;
      stack.push(nIdx);
    }
  }

  if (count < 40) return null;

  // Upsample the boolean grid to full resolution + feather.
  const fullW = img.naturalWidth;
  const fullH = img.naturalHeight;
  const mask = new ImageData(fullW, fullH);
  const sx2 = w / fullW;
  const sy2 = h / fullH;
  for (let y = 0; y < fullH; y++) {
    const sy3 = Math.min(h - 1, (y * sy2) | 0);
    for (let x = 0; x < fullW; x++) {
      const sx3 = Math.min(w - 1, (x * sx2) | 0);
      if (visited[sy3 * w + sx3]) {
        const i = (y * fullW + x) * 4;
        mask.data[i] = 255;
        mask.data[i + 1] = 255;
        mask.data[i + 2] = 255;
        mask.data[i + 3] = 255;
      }
    }
  }
  featherAlpha(mask, 2);

  const fsx = fullW / w;
  const fsy = fullH / h;
  return {
    mask,
    bbox: {
      x: minX * fsx,
      y: minY * fsy,
      w: (maxX - minX + 1) * fsx,
      h: (maxY - minY + 1) * fsy,
    },
    centroid: { x: (sumX / count) * fsx, y: (sumY / count) * fsy },
  };
}

function featherAlpha(img: ImageData, radius: number) {
  const { width: w, height: h, data } = img;
  const src = new Uint8ClampedArray(data.length);
  src.set(data);
  const r = Math.max(1, radius | 0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += src[(yy * w + xx) * 4 + 3];
          n++;
        }
      }
      data[(y * w + x) * 4 + 3] = n ? (sum / n) | 0 : 0;
    }
  }
}

// -------------------------- polygon → mask -------------------------- //

/**
 * Rasterise a normalised polygon into an ImageData mask at the given image
 * dimensions. Used by demo rooms that ship with hand-curated countertop
 * polygons — pixel-perfect, no detection required.
 */
export function maskFromPolygon(
  polygon: [number, number][],
  width: number,
  height: number,
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.beginPath();
  polygon.forEach(([nx, ny], i) => {
    const x = nx * width;
    const y = ny * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Build a SurfaceCandidate from a normalised polygon.
 */
export function candidateFromPolygon(
  polygon: [number, number][],
  width: number,
  height: number,
): SurfaceCandidate {
  const mask = maskFromPolygon(polygon, width, height);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (const [nx, ny] of polygon) {
    const x = nx * width;
    const y = ny * height;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    sumX += x;
    sumY += y;
    count++;
  }
  return {
    score: 1,
    mask,
    bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
    centroid: { x: sumX / count, y: sumY / count },
  };
}

// -------------------------- public API -------------------------- //

/**
 * Primary selection tool. Runs an edge-aware flood fill from a tap point.
 */
export function selectAtTap(
  img: HTMLImageElement,
  clickX: number,
  clickY: number,
  opts: FloodOptions = {},
): SurfaceCandidate | null {
  const r = floodFillInternal(img, clickX, clickY, opts);
  if (!r) return null;
  return { score: 1, ...r };
}

/**
 * Add to an existing mask by running a second fill and unioning with the
 * previous selection.
 */
export function addToMask(
  img: HTMLImageElement,
  previous: SurfaceCandidate,
  clickX: number,
  clickY: number,
  opts: FloodOptions = {},
): SurfaceCandidate | null {
  const newer = floodFillInternal(img, clickX, clickY, opts);
  if (!newer) return previous;
  const merged = unionMasks(previous.mask, newer.mask);
  return recomputeBounds(merged);
}

/**
 * Subtract a fill result from an existing mask.
 */
export function subtractFromMask(
  img: HTMLImageElement,
  previous: SurfaceCandidate,
  clickX: number,
  clickY: number,
  opts: FloodOptions = {},
): SurfaceCandidate | null {
  const newer = floodFillInternal(img, clickX, clickY, opts);
  if (!newer) return previous;
  const merged = differenceMasks(previous.mask, newer.mask);
  return recomputeBounds(merged);
}

function unionMasks(a: ImageData, b: ImageData): ImageData {
  const out = new ImageData(a.width, a.height);
  for (let i = 3; i < a.data.length; i += 4) {
    out.data[i - 3] = 255;
    out.data[i - 2] = 255;
    out.data[i - 1] = 255;
    out.data[i] = Math.max(a.data[i], b.data[i]);
  }
  return out;
}

function differenceMasks(a: ImageData, b: ImageData): ImageData {
  const out = new ImageData(a.width, a.height);
  for (let i = 3; i < a.data.length; i += 4) {
    out.data[i - 3] = 255;
    out.data[i - 2] = 255;
    out.data[i - 1] = 255;
    // a AND NOT b
    out.data[i] = b.data[i] > 128 ? 0 : a.data[i];
  }
  return out;
}

function recomputeBounds(mask: ImageData): SurfaceCandidate | null {
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = mask.width;
  let maxX = 0;
  let minY = mask.height;
  let maxY = 0;
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      if (mask.data[(y * mask.width + x) * 4 + 3] > 128) {
        count++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (count === 0) return null;
  return {
    score: 1,
    bbox: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    centroid: { x: sumX / count, y: sumY / count },
    mask,
  };
}
