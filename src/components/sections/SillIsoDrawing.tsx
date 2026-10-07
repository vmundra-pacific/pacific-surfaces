"use client";

import { useId } from "react";
import type { SillProfile } from "@/data/thresholds-and-sills";

/**
 * A piece as a 3D line drawing, in the same hand as its section
 * (SillProfileDrawing): the section is the hatched face at the near end,
 * and the piece runs back from it along its length, so the two drawings
 * always agree (owner, 2026-10-06: drawings in place of the photographs,
 * "organised and understandable even by a layman"). Length, width and
 * thickness are marked, the words of the size chart; the length drawn is
 * shortened, not to scale.
 *
 * Every drawing fits the same frame, with its text at one size in frame
 * units, so a row of cards reads alike. An oblique view: the section stays
 * true to shape, the length recedes up and to the right. The faces turned
 * to the viewer are filled far to near, top faces white and upright ones a
 * light grey; the lines are drawn after them, each left out where a nearer
 * face covers it.
 */

const INK = "#14140f";
const ANGLE = (32 * Math.PI) / 180;
const DEPTH = 0.5;
const RX = DEPTH * Math.cos(ANGLE);
const RY = -DEPTH * Math.sin(ANGLE);

type Pt = [number, number];

/** Section x (back to front) and y (up), z along the length, to the page. */
const proj = ([x, y]: Pt, z: number): Pt => [x + RX * z, -y + RY * z];
const str = (ps: Pt[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const textWidth = (t: string, font: number) => t.length * 0.56 * font;

/** Is p inside the convex polygon, at least m in from each of its edges? */
function insideBy(p: Pt, poly: Pt[], m: number) {
  let side = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const len = Math.hypot(ex, ey);
    if (len < 1e-9) continue;
    const d = (ex * (p[1] - a[1]) - ey * (p[0] - a[0])) / len;
    if (Math.abs(d) < m) return false;
    if (side === 0) side = Math.sign(d);
    else if (Math.sign(d) !== side) return false;
  }
  return true;
}

/** White for a face turned up (t 0), a light grey for an upright one (t 1). */
function tone(t: number) {
  const k = Math.max(0, Math.min(1, t));
  const c = (from: number, to: number) => Math.round(from + (to - from) * k);
  return `rgb(${c(255, 233)},${c(255, 232)},${c(255, 228)})`;
}

export function SillIsoDrawing({
  profile,
  length = 3000,
  frame = { w: 1700, h: 820 },
  font = 37,
  dims = true,
  values,
  texture,
  line = 1.6,
  className,
}: {
  profile: SillProfile;
  /** How long to draw it, in the section's units (its width is 1000). */
  length?: number;
  /** The drawing's own units; drawings sharing a frame share a scale of text. */
  frame?: { w: number; h: number };
  /** Text size, in frame units. */
  font?: number;
  /** Mark the length, width and thickness; off for small drawings. */
  dims?: boolean;
  /** Figures for the marks ("88 cm"), for one size of a piece. */
  values?: { length: string; width: string; thickness: string };
  /** A colour's swatch, laid over the faces in place of the line drawing's
   *  white, the near end shaded rather than hatched. */
  texture?: string;
  /** Line weight, in pixels. */
  line?: number;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hatch = `iso-hatch-${uid}`;
  const tex = `iso-tex-${uid}`;
  const words = {
    length: values ? `Length ${values.length}` : "Length",
    width: values ? `Width ${values.width}` : "Width",
    thickness: values ? `Thickness ${values.thickness}` : "Thickness",
  };
  const pts = profile.points;
  const n = pts.length;
  const at = (i: number) => pts[((i % n) + n) % n];

  // Which way round the outline runs, for the faces' outward normals.
  let twiceArea = 0;
  for (let i = 0; i < n; i++) twiceArea += at(i)[0] * at(i + 1)[1] - at(i + 1)[0] * at(i)[1];
  const ccw = twiceArea > 0;

  // Fit the solid into the frame, leaving room round it for the dimensions.
  const off = font * 1.3;
  const gap = font * 0.35;
  const bare = font * 0.6;
  const mL = dims ? off + gap + textWidth(words.thickness, font) + 10 : bare;
  const mR = dims ? font * 1.4 : bare;
  const mT = dims ? font * 2.4 : bare;
  const mB = dims ? off + font * 1.5 : bare;
  const ends = pts.flatMap((p) => [proj(p, 0), proj(p, length)]);
  const bx0 = Math.min(...ends.map((p) => p[0]));
  const bx1 = Math.max(...ends.map((p) => p[0]));
  const by0 = Math.min(...ends.map((p) => p[1]));
  const by1 = Math.max(...ends.map((p) => p[1]));
  const boxW = frame.w - mL - mR;
  const boxH = frame.h - mT - mB;
  const s = Math.min(boxW / (bx1 - bx0), boxH / (by1 - by0));
  const tx = mL + (boxW - (bx1 - bx0) * s) / 2 - bx0 * s;
  const ty = mT + (boxH - (by1 - by0) * s) / 2 - by0 * s;
  const V = (p: Pt, z: number): Pt => {
    const [x, y] = proj(p, z);
    return [x * s + tx, y * s + ty];
  };

  const faces = pts.map((p, i) => {
    const q = at(i + 1);
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (ccw ? dy : -dy) / len;
    const ny = (ccw ? -dx : dx) / len;
    return {
      i,
      visible: RX * nx - RY * ny > 1e-6,
      depth: -RX * ((p[0] + q[0]) / 2) + RY * ((p[1] + q[1]) / 2),
      ny,
      poly: [V(p, 0), V(q, 0), V(q, length), V(p, length)] as Pt[],
    };
  });
  const drawn = faces.filter((f) => f.visible).sort((a, b) => b.depth - a.depth);
  const rank = new Map(drawn.map((f, k) => [f.i, k]));

  /** The outline turns at vertex i, so a line runs along the length there. */
  const crease = (i: number) => {
    const a = at(i - 1);
    const b = at(i);
    const c = at(i + 1);
    const u: Pt = [b[0] - a[0], b[1] - a[1]];
    const v: Pt = [c[0] - b[0], c[1] - b[1]];
    const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
    return cos < Math.cos((20 * Math.PI) / 180);
  };

  // Each face's far edge, and a line along the length at every turn of the
  // outline and wherever a face in view meets one out of view.
  type Seg = { a: Pt; b: Pt; owners: number[] };
  const segs: Seg[] = drawn.map((f) => ({ a: f.poly[2], b: f.poly[3], owners: [f.i] }));
  for (let i = 0; i < n; i++) {
    const f0 = faces[(i - 1 + n) % n];
    const f1 = faces[i];
    if (!f0.visible && !f1.visible) continue;
    if (f0.visible === f1.visible && !crease(i)) continue;
    segs.push({ a: V(at(i), 0), b: V(at(i), length), owners: [f0.i, f1.i] });
  }

  /** The parts of a line that no nearer face covers. */
  const shown = (seg: Seg): [Pt, Pt][] => {
    const k = Math.max(...seg.owners.map((o) => rank.get(o) ?? -1));
    const over = drawn.filter((f) => (rank.get(f.i) ?? -1) > k && !seg.owners.includes(f.i));
    const steps = Math.min(400, Math.max(2, Math.ceil(Math.hypot(seg.b[0] - seg.a[0], seg.b[1] - seg.a[1]) / 4)));
    const parts: [Pt, Pt][] = [];
    let from: Pt | null = null;
    let to: Pt | null = null;
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const p: Pt = [seg.a[0] + (seg.b[0] - seg.a[0]) * t, seg.a[1] + (seg.b[1] - seg.a[1]) * t];
      if (over.some((f) => insideBy(p, f.poly, 0.6))) {
        if (from && to) parts.push([from, to]);
        from = null;
        to = null;
      } else {
        from ??= p;
        to = p;
      }
    }
    if (from && to) parts.push([from, to]);
    return parts;
  };

  const end = pts.map((p) => V(p, 0));

  // Dimensions: width under the near end, thickness beside it, length along
  // the front edge.
  const ys = pts.map((p) => p[1]);
  const top = Math.max(...ys);
  const topX = Math.min(...pts.filter((p) => p[1] === top).map((p) => p[0]));
  const back = V([0, 0], 0);
  const front = V([1000, 0], 0);
  const peak = V([topX, top], 0);
  const far = V([1000, 0], length);
  const tick = font * 0.42;
  const wy = back[1] + off;
  const tX = back[0] - off;
  const ul = Math.hypot(far[0] - front[0], far[1] - front[1]) || 1;
  const u: Pt = [(far[0] - front[0]) / ul, (far[1] - front[1]) / ul];
  const v: Pt = [-u[1], u[0]];
  const along = (p: Pt, k: number): Pt => [p[0] + v[0] * k, p[1] + v[1] * k];
  const lenA = along(front, off);
  const lenB = along(far, off);
  const lenMid = along([(front[0] + far[0]) / 2, (front[1] + far[1]) / 2], off + font * 0.75);
  const lenAngle = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  const slash = (c: Pt, d: Pt) => ({
    x1: c[0] - (d[0] * tick) / 2,
    y1: c[1] - (d[1] * tick) / 2,
    x2: c[0] + (d[0] * tick) / 2,
    y2: c[1] + (d[1] * tick) / 2,
  });
  const diag: Pt = [Math.SQRT1_2, -Math.SQRT1_2];
  const lenTick: Pt = [
    u[0] * Math.cos(Math.PI / 4) + u[1] * Math.sin(Math.PI / 4),
    -u[0] * Math.sin(Math.PI / 4) + u[1] * Math.cos(Math.PI / 4),
  ];
  const marks: { x1: number; y1: number; x2: number; y2: number }[] = [
    // width
    { x1: back[0], y1: back[1] + 8, x2: back[0], y2: wy + tick },
    { x1: front[0], y1: front[1] + 8, x2: front[0], y2: wy + tick },
    { x1: back[0], y1: wy, x2: front[0], y2: wy },
    slash([back[0], wy], diag),
    slash([front[0], wy], diag),
    // thickness
    { x1: back[0] - 8, y1: back[1], x2: tX - tick, y2: back[1] },
    { x1: peak[0] - 8, y1: peak[1], x2: tX - tick, y2: peak[1] },
    { x1: tX, y1: back[1], x2: tX, y2: peak[1] },
    slash([tX, back[1]], diag),
    slash([tX, peak[1]], diag),
    // length
    { x1: along(front, 8)[0], y1: along(front, 8)[1], x2: along(front, off + tick)[0], y2: along(front, off + tick)[1] },
    { x1: along(far, 8)[0], y1: along(far, 8)[1], x2: along(far, off + tick)[0], y2: along(far, off + tick)[1] },
    { x1: lenA[0], y1: lenA[1], x2: lenB[0], y2: lenB[1] },
    slash(lenA, lenTick),
    slash(lenB, lenTick),
  ];

  const stroke = { stroke: INK, strokeWidth: line, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const };

  return (
    <svg
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      className={className}
      role="img"
      aria-label={dims ? `The ${profile.name.toLowerCase()} in 3D, its length, width and thickness marked` : `The ${profile.name.toLowerCase()} in 3D`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={hatch} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="22" stroke={INK} strokeOpacity="0.16" strokeWidth="3" />
        </pattern>
        {texture && (
          <pattern id={tex} patternUnits="userSpaceOnUse" x="0" y="0" width={frame.w} height={frame.h}>
            <image href={texture} x="0" y="0" width={frame.w} height={frame.h} preserveAspectRatio="xMidYMid slice" />
          </pattern>
        )}
      </defs>

      {drawn.map((f) => {
        const turned = 1 - Math.max(0, f.ny);
        if (texture)
          return (
            <g key={f.i}>
              <polygon points={str(f.poly)} fill={`url(#${tex})`} stroke={`url(#${tex})`} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
              {turned > 0.02 && <polygon points={str(f.poly)} fill="#000" fillOpacity={(0.3 * Math.min(1, turned)).toFixed(3)} />}
            </g>
          );
        const fill = tone(turned);
        return (
          <polygon
            key={f.i}
            points={str(f.poly)}
            fill={fill}
            stroke={fill}
            strokeWidth="0.8"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {segs.flatMap((seg, k) =>
        shown(seg).map(([a, b], j) => <line key={`${k}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...stroke} />)
      )}

      {/* The near end: the section itself, hatched, or shaded stone. */}
      <polygon points={str(end)} fill={texture ? `url(#${tex})` : "#fff"} />
      <polygon
        points={str(end)}
        fill={texture ? "rgba(0,0,0,0.42)" : `url(#${hatch})`}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {dims &&
        marks.map((d, k) => (
          <line key={k} {...d} stroke={INK} strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      {dims && (
      <g fill={INK} fontSize={font}>
        <text x={(back[0] + front[0]) / 2} y={wy + font * 1.15} textAnchor="middle">
          {words.width}
        </text>
        <text x={tX - gap} y={(back[1] + peak[1]) / 2 + font * 0.35} textAnchor="end">
          {words.thickness}
        </text>
        <text
          x={lenMid[0]}
          y={lenMid[1]}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${lenAngle.toFixed(2)} ${lenMid[0].toFixed(1)} ${lenMid[1].toFixed(1)})`}
        >
          {words.length}
        </text>
      </g>
      )}
    </svg>
  );
}
