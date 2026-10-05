"use client";

import { useEffect, useRef, useState } from "react";
import type { CutPiece } from "@/data/thresholds-and-sills";
import { sectionOutline } from "@/components/sections/CutPieceDrawing";
import { inchesOr, loadSlab, norm, renderScene, type Face3, type V3 } from "@/components/shop/render3d";

export { parseInches } from "@/components/shop/render3d";

/**
 * A cut piece (sill, threshold, jamb, shelf, seat, bench) drawn as a 3D
 * product view in the chosen Pacific design, for the store.
 *
 * The piece is built from its real sizes and edge profile (the same section
 * the line drawing uses) and drawn by render3d: the slab photograph laid on
 * every face at true scale, folding over the edges the way the stone does,
 * shaded by one light, with a sheen when polished and a soft shadow. Change
 * the colour, the size or the finish and it redraws: the visualizer's idea,
 * for pieces that have no photograph of their own.
 */

/** Longest the piece is drawn, as a multiple of its width, so a 90 in jamb
 *  still reads as a piece rather than a line. */
const MAX_RATIO = 10;
/** How much of a strip, in widths, the frame is fitted to. */
const CLOSE_UP = 3.4;

function stripFaces(piece: CutPiece, L: number, W: number, T: number): Face3[] {
  if (piece.drawing.kind !== "strip") return [];
  // Edge treatments are absolute sizes; keep them inside a thin piece.
  const fit = (e: typeof piece.drawing.back) => {
    if (e.kind === "bevel") return { ...e, size: Math.min(e.size, T * 0.8, W / 3) };
    if (e.kind === "slope") return { ...e, run: Math.min(e.run, W / 3), lip: Math.min(e.lip, T * 0.5) };
    if (e.kind === "round") return { ...e, r: Math.min(e.r, T * 0.95, W / 3) };
    return e;
  };
  // [depth from the back edge, height], anticlockwise from back-bottom.
  const outline = sectionOutline(W, T, fit(piece.drawing.back), fit(piece.drawing.front));
  const faces: Face3[] = [];
  for (let i = 0; i < outline.length; i++) {
    const [z0, y0] = outline[i];
    const [z1, y1] = outline[(i + 1) % outline.length];
    const dz = z1 - z0;
    const dy = y1 - y0;
    if (Math.hypot(dz, dy) < 1e-6) continue;
    const n = norm([0, -dz, dy]);
    faces.push({
      pts: [
        [0, y0, z0],
        [L, y0, z0],
        [L, y1, z1],
        [0, y1, z1],
      ],
      n,
      map: n[1] > 0.45 ? "top" : "side",
      top: n[1] > 0.99,
    });
  }
  faces.push({ pts: outline.map(([z, y]) => [0, y, z] as V3), n: [-1, 0, 0], map: "end" });
  faces.push({ pts: outline.map(([z, y]) => [L, y, z] as V3), n: [1, 0, 0], map: "end" });
  return faces;
}

function cornerFaces(piece: CutPiece, side: number, T: number): Face3[] {
  if (piece.drawing.kind !== "corner") return [];
  const b = Math.min(piece.drawing.bevel, T * 0.8);
  const k = b * Math.SQRT2;
  const A0: V3 = [0, 0, 0];
  const B0: V3 = [side, 0, 0];
  const C0: V3 = [0, 0, side];
  const B1: V3 = [side, T - b, 0];
  const C1: V3 = [0, T - b, side];
  const A2: V3 = [0, T, 0];
  const B2: V3 = [side - k, T, 0];
  const C2: V3 = [0, T, side - k];
  return [
    { pts: [A2, B2, C2], n: [0, 1, 0], map: "top", top: true },
    { pts: [B1, C1, C2, B2], n: norm([Math.SQRT1_2, 1, Math.SQRT1_2]), map: "top" },
    { pts: [B0, C0, C1, B1], n: norm([1, 0, 1]), map: "side" },
    { pts: [A0, C0, C1, C2, A2], n: [-1, 0, 0], map: "end" },
    { pts: [A0, B0, B1, B2, A2], n: [0, 0, -1], map: "side" },
  ];
}

function draw(
  canvas: HTMLCanvasElement,
  piece: CutPiece,
  dims: { L: number; W: number; T: number },
  tex: HTMLImageElement | null,
  polished: boolean
) {
  const { T, W } = dims;
  const corner = piece.drawing.kind === "corner";
  const L = corner ? dims.L : Math.min(dims.L, W * MAX_RATIO);
  const faces = corner ? cornerFaces(piece, L, T) : stripFaces(piece, L, W, T);
  const footprint: V3[] = corner
    ? [
        [0, 0, 0],
        [L, 0, 0],
        [0, 0, L],
      ]
    : [
        [0, 0, 0],
        [L, 0, 0],
        [L, 0, W],
        [0, 0, W],
      ];
  // Frame the near end: a long strip is fitted on its first few widths and
  // runs on out of the frame, like a close studio shot, so its edge profile
  // and the stone read at card size. Corner pieces are fitted whole.
  const fit = corner ? undefined : stripFaces(piece, Math.min(L, W * CLOSE_UP), W, T).flatMap((f) => f.pts);
  renderScene(canvas, {
    faces,
    footprint,
    fit,
    tex,
    fold: T,
    span: { L, W: corner ? L : W },
    polished,
    pad: corner ? 0.12 : 0.1,
  });
}

/** The slab photograph for a design, once loaded. */
export function useSlab(colourImage: string | null): HTMLImageElement | null {
  const [tex, setTex] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let live = true;
    if (!colourImage) {
      setTex(null);
      return;
    }
    loadSlab(colourImage)
      .then((img) => live && setTex(img))
      .catch(() => live && setTex(null));
    return () => {
      live = false;
    };
  }, [colourImage]);
  return tex;
}

/** The size of an element, kept up to date. */
export function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export function PieceRender({
  piece,
  length,
  width,
  thickness,
  colourImage,
  finish = "Polished",
  label,
  className = "",
}: {
  piece: CutPiece;
  /** The sizes chosen, as the options spell them ("36", "1 1/2", "3/4"). */
  length?: string;
  width?: string;
  thickness?: string;
  /** The chosen design's slab photograph. */
  colourImage: string | null;
  finish?: string;
  label: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tex = useSlab(colourImage);
  const size = useSize(wrapRef);

  const L = inchesOr(length, piece.length[0]);
  const W = inchesOr(width, piece.widthRange ? piece.widthRange[1] : (piece.width?.[0] ?? 6));
  const T = inchesOr(thickness, Math.max(...piece.thickness));
  const polished = finish.toLowerCase() === "polished";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    draw(canvas, piece, { L, W, T }, tex, polished);
  }, [piece, L, W, T, tex, polished, size]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
