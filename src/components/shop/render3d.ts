/**
 * The small 3D renderer behind the store's live views (PieceRender for
 * sills and thresholds, VanityTopRender for vanity tops): a piece is a list
 * of flat faces in inches, drawn in one fixed three-quarter view from above,
 * with the chosen slab photograph laid onto every stone face at true scale,
 * one light, a polish sheen and a soft shadow. Canvas 2D only: each face is
 * an affine map of the photograph, clipped to the face.
 */

import { sanityImageProxyUrl, sanityImg } from "@/lib/sanity-img";

export type V3 = [number, number, number]; // X along the length, Y up, Z toward the front
/** How a face takes the slab photograph: seen from above, or folded over an edge. */
export type TexMap = "top" | "side" | "end";

export interface Face3 {
  pts: V3[];
  n: V3;
  map: TexMap;
  /** Gets the polish sheen. */
  top?: boolean;
}

/** The width of slab the photograph shows, inches (superjumbo, 137 x 79). */
export const SLAB_W = 137;

// The view: left end toward the viewer, the length running away to the right.
const YAW = (28 * Math.PI) / 180;
const PITCH = (30 * Math.PI) / 180;
const CY = Math.cos(YAW);
const SY = Math.sin(YAW);
const CP = Math.cos(PITCH);
const SP = Math.sin(PITCH);
/** Toward the camera, for culling and depth. */
export const VIEW: V3 = [-SY * CP, SP, CY * CP];
export const LIGHT = norm([-0.45, 1, 0.6]);

export function norm([x, y, z]: V3): V3 {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** World inches to screen inches (x right, y down) and depth (nearer is larger). */
export function project([X, Y, Z]: V3) {
  const xr = X * CY + Z * SY;
  const zr = -X * SY + Z * CY;
  return { x: xr, y: zr * SP - Y * CP, d: Y * SP + zr * CP };
}

/** "1 1/2" -> 1.5, "3/8" -> 0.375, "36" -> 36; NaN when it isn't a size. */
export function parseInches(value: string | undefined): number {
  if (!value) return NaN;
  const m = value.trim().match(/^(\d+(?:\.\d+)?)?(?:\s*(\d+)\/(\d+))?$/);
  if (!m || (!m[1] && !m[2])) return NaN;
  return (m[1] ? Number(m[1]) : 0) + (m[2] ? Number(m[2]) / Number(m[3]) : 0);
}

/** A size option as inches, or the fallback when it is blank or custom. */
export const inchesOr = (value: string | undefined, fallback: number) => {
  const n = parseInches(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const IMAGES = new Map<string, Promise<HTMLImageElement>>();

/** A design's slab photograph, same-origin through /api/cdn (as the
 *  visualizer loads slabs) and without a CORS request: the canvas is only
 *  drawn, never read back. */
export function loadSlab(colourImage: string): Promise<HTMLImageElement> {
  const src = sanityImageProxyUrl(sanityImg(colourImage, { w: 1600 }) ?? colourImage);
  let p = IMAGES.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
    IMAGES.set(src, p);
    p.catch(() => IMAGES.delete(src));
  }
  return p;
}

/** Where a point falls on the slab photograph, in inches. */
function texInches([X, Y, Z]: V3, map: TexMap, fold: number): [number, number] {
  if (map === "top") return [X, Z];
  // Fold the slab over the edge, so the veins run on down the face.
  if (map === "side") return [X, Z + (fold - Y)];
  return [X - (fold - Y), Z];
}

export type ToScreen = (p: V3) => [number, number];

export interface SceneOptions {
  faces: Face3[];
  /** Outline on the ground, for the shadow. */
  footprint: V3[];
  /** Points to fit in the frame; every face point when omitted. */
  fit?: V3[];
  tex: HTMLImageElement | null;
  /** Height the photograph folds over the edges from (the top's thickness). */
  fold: number;
  /** Plan size, to sample the middle of the slab. */
  span: { L: number; W: number };
  polished: boolean;
  pad?: number;
  /** Drawn over the faces, e.g. basins cut into a top. */
  overlay?: (ctx: CanvasRenderingContext2D, toScreen: ToScreen, scale: number) => void;
}

export function renderScene(canvas: HTMLCanvasElement, o: SceneOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  if (cw === 0 || ch === 0) return;

  const all = (o.fit ?? o.faces.flatMap((f) => f.pts)).map(project);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const pad = o.pad ?? 0.1;
  const s = Math.min((cw * (1 - 2 * pad)) / (maxX - minX || 1), (ch * (1 - 2 * pad)) / (maxY - minY || 1));
  const ox = (cw - (maxX - minX) * s) / 2 - minX * s;
  const oy = (ch - (maxY - minY) * s) / 2 - minY * s;
  const toScreen: ToScreen = (p) => {
    const q = project(p);
    return [q.x * s + ox, q.y * s + oy];
  };

  // Soft shadow under the piece, then a tighter one where it meets the floor.
  // Drawn off the canvas so only its blurred shadow lands on it: shadowBlur
  // works in every browser, a canvas filter does not (Safari).
  const shadow = (blur: number, alpha: number, drop: number) => {
    const away = cw + ch + 100;
    ctx.save();
    ctx.shadowColor = `rgba(20, 20, 15, ${alpha})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = away;
    ctx.shadowOffsetY = drop;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    o.footprint.map(toScreen).forEach(([x, y], i) => (i ? ctx.lineTo(x - away, y) : ctx.moveTo(x - away, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  shadow(Math.max(6, cw * 0.03), 0.22, cw * 0.015);
  shadow(Math.max(2, cw * 0.006), 0.28, 0);

  // Slab photograph to texture pixels: its long side is 137 in.
  const tex = o.tex;
  const iw = tex?.naturalWidth ?? 1;
  const ih = tex?.naturalHeight ?? 1;
  const portrait = ih > iw;
  const k = Math.max(iw, ih) / SLAB_W;
  const longPx = Math.max(iw, ih);
  const shortPx = Math.min(iw, ih);
  const offU = Math.max(o.fold * k, (longPx - o.span.L * k) / 2);
  const offV = Math.max(o.fold * k, (shortPx - o.span.W * k) / 2);
  const texPx = (p: V3, map: TexMap): [number, number] => {
    const [u, v] = texInches(p, map, o.fold);
    const a = offU + u * k;
    const b = offV + v * k;
    return portrait ? [b, a] : [a, b];
  };

  const visible = o.faces
    .filter((f) => dot(f.n, VIEW) > 1e-3)
    .map((f) => ({ f, d: f.pts.reduce((sum, p) => sum + project(p).d, 0) / f.pts.length }))
    .sort((a, b) => a.d - b.d);

  for (const { f } of visible) {
    const scr = f.pts.map(toScreen);
    // Grow each face a hair so neighbours meet without a seam.
    const cx = scr.reduce((a, p) => a + p[0], 0) / scr.length;
    const cy = scr.reduce((a, p) => a + p[1], 0) / scr.length;
    const grown = scr.map(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      const l = Math.hypot(dx, dy) || 1;
      return [x + (dx / l) * 0.6, y + (dy / l) * 0.6] as [number, number];
    });

    ctx.save();
    ctx.beginPath();
    grown.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    if (tex) {
      // The affine map from texture pixels to the screen, from three corners.
      const i2 = f.pts.length > 3 ? f.pts.length - 1 : 2;
      const [t0, t1, t2] = [texPx(f.pts[0], f.map), texPx(f.pts[1], f.map), texPx(f.pts[i2], f.map)];
      const [s0, s1, s2] = [scr[0], scr[1], scr[i2]];
      const ux = t1[0] - t0[0];
      const uy = t1[1] - t0[1];
      const vx = t2[0] - t0[0];
      const vy = t2[1] - t0[1];
      const det = ux * vy - uy * vx;
      if (Math.abs(det) > 1e-9) {
        const ax = s1[0] - s0[0];
        const ay = s1[1] - s0[1];
        const bx = s2[0] - s0[0];
        const by = s2[1] - s0[1];
        const a = (ax * vy - bx * uy) / det;
        const c = (bx * ux - ax * vx) / det;
        const b = (ay * vy - by * uy) / det;
        const d = (by * ux - ay * vx) / det;
        ctx.setTransform(a, b, c, d, s0[0] - a * t0[0] - c * t0[1], s0[1] - b * t0[0] - d * t0[1]);
        ctx.drawImage(tex, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    } else {
      ctx.fillStyle = "#d8d5cf";
      ctx.fill();
    }
    // Light and shade.
    const shade = 0.5 + 0.5 * Math.max(0, dot(f.n, LIGHT));
    ctx.fillStyle = `rgba(0, 0, 0, ${((1 - shade) * 0.85).toFixed(3)})`;
    ctx.fill();
    if (f.top) {
      // The sheen of a polished face, faint on a honed one.
      const xs = scr.map((p) => p[0]);
      const ys = scr.map((p) => p[1]);
      const g = ctx.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
      const peak = o.polished ? 0.2 : 0.06;
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.42, `rgba(255,255,255,${peak})`);
      g.addColorStop(0.58, `rgba(255,255,255,${peak * 0.6})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.restore();
  }

  o.overlay?.(ctx, toScreen, s);
}
