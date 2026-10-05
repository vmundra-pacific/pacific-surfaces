"use client";

import { useEffect, useRef } from "react";
import { inchesOr, renderScene, type Face3, type ToScreen, type V3 } from "@/components/shop/render3d";
import { useSize, useSlab } from "@/components/shop/PieceRender";

/**
 * A vanity top drawn to scale in the chosen design: the width, depth and
 * height picked on its store page, with its basins cut in and tap holes
 * behind them. The photographed scene above it cannot change size, so this
 * is the view that answers "what does 36 in look like next to 48 in"; the
 * page switches to it whenever a dimension changes.
 *
 * Basins and tap holes are drawn generically (a rounded cut-out, a drain,
 * three holes on 4 in centres): the real cut-outs follow the customer's own
 * basin and tap layout, as the page says.
 */

function topFaces(L: number, D: number, H: number): Face3[] {
  return [
    { pts: [[0, H, 0], [L, H, 0], [L, H, D], [0, H, D]], n: [0, 1, 0], map: "top", top: true },
    { pts: [[0, 0, D], [L, 0, D], [L, H, D], [0, H, D]], n: [0, 0, 1], map: "side" },
    { pts: [[0, 0, 0], [0, 0, D], [0, H, D], [0, H, 0]], n: [-1, 0, 0], map: "end" },
    { pts: [[L, 0, 0], [L, H, 0], [L, H, D], [L, 0, D]], n: [1, 0, 0], map: "end" },
    { pts: [[0, 0, 0], [0, H, 0], [L, H, 0], [L, 0, 0]], n: [0, 0, -1], map: "side" },
  ];
}

/** A rounded rectangle on the top face, as points. */
function roundedRect(x0: number, z0: number, x1: number, z1: number, r: number, y: number): V3[] {
  const pts: V3[] = [];
  const corners: [number, number, number][] = [
    [x1 - r, z0 + r, -Math.PI / 2],
    [x1 - r, z1 - r, 0],
    [x0 + r, z1 - r, Math.PI / 2],
    [x0 + r, z0 + r, Math.PI],
  ];
  for (const [cx, cz, a0] of corners) {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    }
  }
  return pts;
}

const circle = (cx: number, cz: number, r: number, y: number): V3[] =>
  Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)] as V3;
  });

function polygon(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function drawBasins(ctx: CanvasRenderingContext2D, toScreen: ToScreen, L: number, D: number, H: number, basins: number) {
  const each = L / basins;
  const bw = Math.max(10, Math.min(20, each - 8));
  const bd = Math.max(9, Math.min(15, D - 8));
  const z0 = (D - bd) / 2 + 1.5;
  const z1 = z0 + bd;
  const line = Math.max(1, ctx.canvas.width / 900);
  for (let i = 0; i < basins; i++) {
    const cx = each * (i + 0.5);
    const outline = roundedRect(cx - bw / 2, z0, cx + bw / 2, z1, Math.min(3, bw / 4, bd / 4), H).map(toScreen);
    // The bowl: porcelain, in shadow toward the back wall.
    ctx.save();
    polygon(ctx, outline);
    ctx.fillStyle = "#f2f1ee";
    ctx.fill();
    ctx.clip();
    const ys = outline.map((p) => p[1]);
    const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
    g.addColorStop(0, "rgba(0,0,0,0.42)");
    g.addColorStop(0.5, "rgba(0,0,0,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0.02)");
    ctx.fillStyle = g;
    ctx.fill();
    // The drain.
    polygon(ctx, circle(cx, (z0 + z1) / 2 + 1, 0.9, H).map(toScreen));
    ctx.fillStyle = "#8f8e8a";
    ctx.fill();
    ctx.restore();
    polygon(ctx, outline);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = line;
    ctx.stroke();
    // Tap holes behind it, on 4 in centres.
    const zt = Math.max(1, z0 - 2.2);
    for (const dx of [-4, 0, 4]) {
      polygon(ctx, circle(cx + dx, zt, 0.6, H).map(toScreen));
      ctx.fillStyle = "#3a3a36";
      ctx.fill();
    }
  }
}

export function VanityTopRender({
  basins,
  length,
  width,
  height,
  colourImage,
  finish = "Polished",
  label,
  showSize = true,
}: {
  basins: number;
  /** Side to side, inches as the options spell it. */
  length?: string;
  /** Front to back. */
  width?: string;
  height?: string;
  colourImage: string | null;
  finish?: string;
  label: string;
  /** The "to scale" label; off in a thumbnail. */
  showSize?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tex = useSlab(colourImage);
  const size = useSize(wrapRef);

  const L = inchesOr(length, 36);
  const D = inchesOr(width, 22);
  const H = inchesOr(height, 4);
  const polished = finish.toLowerCase() === "polished";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    // Fit to the largest standard top, so 24 in looks smaller than 96 in
    // rather than every size filling the frame.
    const frame = Math.max(L, 48);
    renderScene(canvas, {
      faces: topFaces(L, D, H),
      footprint: [
        [0, 0, 0],
        [L, 0, 0],
        [L, 0, D],
        [0, 0, D],
      ],
      fit: topFaces(frame, D, H).flatMap((f) => f.pts),
      tex,
      fold: H,
      span: { L, W: D },
      polished,
      pad: 0.08,
      overlay: (ctx, toScreen) => drawBasins(ctx, toScreen, L, D, H, Math.max(1, Math.min(3, basins))),
    });
  }, [L, D, H, basins, tex, polished, size]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 h-full w-full" />
      {showSize && (
      <span
        data-on-light
        className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] text-[#14140f] shadow-sm"
      >
        To scale: {L} × {D} × {H} in
      </span>
      )}
    </div>
  );
}
