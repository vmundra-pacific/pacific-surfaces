import type { CutPiece, Edge } from "@/data/thresholds-and-sills";

/**
 * A cut piece as a 2D line drawing, black on white: the plan, with a line
 * where each edge treatment meets the top face, and a hatched section
 * through the piece showing its profile. Dimensions are lettered L, W and
 * T; the sizes themselves sit in the table under each drawing.
 *
 * Drawn in inches at a representative size (the first length, the widest
 * width, the thickest thickness), scaled to the frame, so the proportions
 * are true to one standard piece.
 */

const INK = "#111111";
const VB_W = 800;
const VB_H = 600;

type Pt = [number, number];

/** Points up one long edge of a section, bottom to top. `inward` is +1
 *  for the back edge (width grows inward from 0), -1 for the front. */
export function edgePts(e: Edge, at: number, t: number, inward: 1 | -1): Pt[] {
  switch (e.kind) {
    case "square":
      return [[at, t]];
    case "bevel":
      return [
        [at, t - e.size],
        [at + inward * e.size, t],
      ];
    case "slope":
      return [
        [at, e.lip],
        [at + inward * e.run, t],
      ];
    case "round": {
      const cy = at + inward * e.r;
      const cz = t - e.r;
      return Array.from({ length: 13 }, (_, i) => {
        const a = ((Math.PI / 2) * i) / 12;
        return [cy - inward * e.r * Math.cos(a), cz + e.r * Math.sin(a)] as Pt;
      });
    }
  }
}

/** The section outline: back edge at 0, front edge at w, thickness up. */
export function sectionOutline(w: number, t: number, back: Edge, front: Edge): Pt[] {
  return [[0, 0], [w, 0], ...edgePts(front, w, t, -1), ...edgePts(back, 0, t, 1).reverse()];
}

/** How far in from the edge the top face begins, where the plan draws a line. */
function inset(e: Edge): number {
  if (e.kind === "bevel") return e.size;
  if (e.kind === "slope") return e.run;
  if (e.kind === "round") return e.r;
  return 0;
}

const pathOf = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-a`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,1.5L10,5L0,8.5" fill="none" stroke={INK} strokeWidth="1.7" />
      </marker>
      <pattern id={`${id}-h`} width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="13" stroke={INK} strokeWidth="1.5" />
      </pattern>
    </defs>
  );
}

/** A dimension: extension lines, the dimension line with arrowheads, a letter. */
function Dim({
  id,
  from,
  to,
  label,
  side,
}: {
  id: string;
  from: Pt;
  to: Pt;
  label: string;
  /** Which side of the dimension line the letter sits. */
  side: "above" | "below" | "left" | "right";
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const off = 26;
  const tx = side === "left" ? mx - off : side === "right" ? mx + off : mx;
  const ty = side === "above" ? my - 14 : side === "below" ? my + 34 : my + 10;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="1.8" markerStart={`url(#${id}-a)`} markerEnd={`url(#${id}-a)`} />
      <text x={tx} y={ty} textAnchor="middle" fontSize="30" fontStyle="italic" fill={INK}>
        {label}
      </text>
    </g>
  );
}

function Ext({ from, to }: { from: Pt; to: Pt }) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={INK} strokeWidth="1.4" />;
}

function Caption({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fontSize="21" letterSpacing="3" fill={INK} opacity="0.75">
      {children.toUpperCase()}
    </text>
  );
}

function StripDrawing({ piece, back, front }: { piece: CutPiece; back: Edge; front: Edge }) {
  const id = `cp-${piece.slug}`;
  const L = piece.length[0];
  const W = piece.widthRange ? piece.widthRange[1] : (piece.width?.[piece.width.length - 1] ?? 6);
  const T = Math.max(...piece.thickness);

  // Plan: length across, width down; back edge on top, front edge below.
  const s = Math.min(600 / L, 170 / W);
  const pw = L * s;
  const ph = W * s;
  const x0 = (VB_W - pw) / 2 - 20;
  const y0 = 96 + (170 - ph) / 2;
  const line = (e: Edge) => Math.min(Math.max(inset(e) * s, 8), ph / 2 - 4);

  // Section: the full width at a larger scale, back edge on the left.
  const s2 = Math.min(560 / W, 110 / T);
  const sw = W * s2;
  const st = T * s2;
  const sx = (VB_W - sw) / 2 + 20;
  const base = 470 + st / 2;
  const outline = sectionOutline(W, T, back, front).map(([y, z]) => [sx + y * s2, base - z * s2] as Pt);

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={`${piece.name}: plan and section drawing`} className="h-full w-full" fontFamily="inherit">
      <Defs id={id} />
      <Caption x={36} y={50}>Plan</Caption>
      <rect x={x0} y={y0} width={pw} height={ph} fill="#fff" stroke={INK} strokeWidth="3" />
      {back.kind !== "square" && <line x1={x0} y1={y0 + line(back)} x2={x0 + pw} y2={y0 + line(back)} stroke={INK} strokeWidth="1.8" />}
      {front.kind !== "square" && <line x1={x0} y1={y0 + ph - line(front)} x2={x0 + pw} y2={y0 + ph - line(front)} stroke={INK} strokeWidth="1.8" />}
      <Ext from={[x0, y0 + ph + 6]} to={[x0, y0 + ph + 42]} />
      <Ext from={[x0 + pw, y0 + ph + 6]} to={[x0 + pw, y0 + ph + 42]} />
      <Dim id={id} from={[x0, y0 + ph + 34]} to={[x0 + pw, y0 + ph + 34]} label="L" side="below" />
      <Ext from={[x0 + pw + 6, y0]} to={[x0 + pw + 44, y0]} />
      <Ext from={[x0 + pw + 6, y0 + ph]} to={[x0 + pw + 44, y0 + ph]} />
      <Dim id={id} from={[x0 + pw + 36, y0]} to={[x0 + pw + 36, y0 + ph]} label="W" side="right" />

      <Caption x={36} y={372}>Section</Caption>
      <path d={pathOf(outline)} fill={`url(#${id}-h)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <Ext from={[sx - 6, base]} to={[sx - 44, base]} />
      <Ext from={[sx - 6, base - st]} to={[sx - 44, base - st]} />
      <Dim id={id} from={[sx - 36, base]} to={[sx - 36, base - st]} label="T" side="left" />
    </svg>
  );
}

function CornerDrawing({ piece, bevel }: { piece: CutPiece; bevel: number }) {
  const id = `cp-${piece.slug}`;
  const leg = piece.length[0];
  const T = Math.max(...piece.thickness);

  // Plan: the right angle at top left, the two sides against the walls,
  // the front edge on the diagonal with the bevel line inside it.
  const Lp = 240;
  const s = Lp / leg;
  const x0 = 290;
  const y0 = 90;
  const d = Math.max(bevel * s, 8) * Math.SQRT2;

  // Section through the front edge: a short run of the piece, broken off
  // on the left, with the bevel on the right.
  const depth = 3;
  const s2 = Math.min(330 / depth, 110 / T);
  const sw = depth * s2;
  const st = T * s2;
  const sx = (VB_W - sw) / 2;
  const base = 480 + st / 2;
  const b = bevel * s2;
  const zig = [
    [sx, base],
    [sx - 6, base - st * 0.3],
    [sx + 6, base - st * 0.6],
    [sx, base - st],
  ] as Pt[];
  const outline: Pt[] = [...zig, [sx + sw - b, base - st], [sx + sw, base - st + b], [sx + sw, base]];

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={`${piece.name}: plan and section drawing`} className="h-full w-full" fontFamily="inherit">
      <Defs id={id} />
      <Caption x={36} y={50}>Plan</Caption>
      <path d={pathOf([[x0, y0], [x0 + Lp, y0], [x0, y0 + Lp]])} fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <line x1={x0 + Lp - d} y1={y0} x2={x0} y2={y0 + Lp - d} stroke={INK} strokeWidth="1.8" />
      <Ext from={[x0, y0 - 6]} to={[x0, y0 - 40]} />
      <Ext from={[x0 + Lp, y0 - 6]} to={[x0 + Lp, y0 - 40]} />
      <Dim id={id} from={[x0, y0 - 32]} to={[x0 + Lp, y0 - 32]} label="L" side="above" />
      <Ext from={[x0 - 6, y0]} to={[x0 - 40, y0]} />
      <Ext from={[x0 - 6, y0 + Lp]} to={[x0 - 40, y0 + Lp]} />
      <Dim id={id} from={[x0 - 32, y0]} to={[x0 - 32, y0 + Lp]} label="L" side="left" />

      <Caption x={36} y={384}>Section at the front edge</Caption>
      <path d={pathOf(outline)} fill={`url(#${id}-h)`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <Ext from={[sx + sw + 6, base]} to={[sx + sw + 44, base]} />
      <Ext from={[sx + sw - b + 4, base - st]} to={[sx + sw + 44, base - st]} />
      <Dim id={id} from={[sx + sw + 36, base]} to={[sx + sw + 36, base - st]} label="T" side="right" />
    </svg>
  );
}

export function CutPieceDrawing({ piece }: { piece: CutPiece }) {
  return piece.drawing.kind === "strip" ? (
    <StripDrawing piece={piece} back={piece.drawing.back} front={piece.drawing.front} />
  ) : (
    <CornerDrawing piece={piece} bevel={piece.drawing.bevel} />
  );
}
