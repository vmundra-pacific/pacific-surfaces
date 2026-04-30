"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Types                                                              *
 * ------------------------------------------------------------------ */

type Pt = [number, number]; // normalised [0, 1] coords

interface ManualPolygon {
  points: Pt[];
  /** controls[i] is an optional bezier control point for the segment
   *  from points[i] → points[(i+1) % length]. null = straight edge. */
  controls: (Pt | null)[];
}

/* ------------------------------------------------------------------ *
 * Component                                                          *
 * ------------------------------------------------------------------ */

interface Props {
  /** Initial tap location in normalised [0, 1] coords. The frame
   *  starts as a small box centred on this point. (Ignored when
   *  `initialPolygon` is provided.) */
  tap: { x: number; y: number };
  /** Optional pre-existing polygon to edit (e.g. when the user
   *  double-taps an already-detected surface to refine it). */
  initialPolygon?: { points: Pt[]; controls: (Pt | null)[] };
  /** User confirmed the polygon — caller should rasterise it. */
  onConfirm: (
    points: Pt[],
    controls: (Pt | null)[],
    imgW: number,
    imgH: number
  ) => void;
  /** User cancelled — close the editor without adding a mask. */
  onCancel: () => void;
  /** Image natural dimensions (used when calling onConfirm). */
  imgW: number;
  imgH: number;
}

/**
 * SVG-based editor for the manual fallback polygon.
 *
 * Capabilities:
 *   - Drag any corner to reposition.
 *   - Click any edge to insert a new corner at that point (turning
 *     a quad into a pentagon, etc.).
 *   - Click the curve toggle on an edge to switch it between a
 *     straight line and a quadratic bezier; drag the control
 *     handle to shape the curve.
 *   - Undo button reverses the last edit.
 *   - Apply button rasterises the polygon to a mask.
 *   - Cancel button closes without applying.
 *
 * The whole editor is overlaid on top of the canvas using SVG with
 * `viewBox="0 0 100 100"` and `preserveAspectRatio="none"`, so all
 * coordinates are normalised in [0, 100] and the SVG stretches to
 * fill its parent regardless of canvas dimensions.
 */
export function ManualFrameEditor({
  tap,
  initialPolygon,
  onConfirm,
  onCancel,
  imgW,
  imgH,
}: Props) {
  // Starting polygon: caller-supplied (edit mode) or default small box.
  const initial: ManualPolygon = initialPolygon ?? {
    points: [
      [Math.max(0, tap.x - 0.07), Math.max(0, tap.y - 0.07)], // TL
      [Math.min(1, tap.x + 0.07), Math.max(0, tap.y - 0.07)], // TR
      [Math.min(1, tap.x + 0.07), Math.min(1, tap.y + 0.07)], // BR
      [Math.max(0, tap.x - 0.07), Math.min(1, tap.y + 0.07)], // BL
    ],
    controls: [null, null, null, null],
  };

  const [poly, setPoly] = useState<ManualPolygon>(initial);
  const [history, setHistory] = useState<ManualPolygon[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  /** Push current state onto the undo stack BEFORE mutating. */
  const pushHistory = () => {
    setHistory((h) => [
      ...h,
      {
        points: poly.points.map((p) => [...p] as Pt),
        controls: poly.controls.map((c) => (c ? ([...c] as Pt) : null)),
      },
    ]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setPoly(prev);
    setHistory((h) => h.slice(0, -1));
  };

  /* -------------------------------------------------------------- *
   * Pointer → SVG coord conversion                                 *
   * -------------------------------------------------------------- */

  const svgPoint = (clientX: number, clientY: number): Pt => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    ];
  };

  /* -------------------------------------------------------------- *
   * Drag handlers (corners + curve controls)                       *
   * -------------------------------------------------------------- */

  type Drag =
    | { kind: "corner"; index: number }
    | { kind: "control"; index: number };
  const dragRef = useRef<Drag | null>(null);

  const handlePointerDown = (e: React.PointerEvent, drag: Drag) => {
    e.stopPropagation();
    e.preventDefault();
    pushHistory();
    dragRef.current = drag;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = svgPoint(e.clientX, e.clientY);
    if (dragRef.current.kind === "corner") {
      const i = dragRef.current.index;
      setPoly((prev) => {
        const points = prev.points.map((pt, j) => (j === i ? p : pt));
        return { ...prev, points };
      });
    } else {
      const i = dragRef.current.index;
      setPoly((prev) => {
        const controls = prev.controls.map((c, j) => (j === i ? p : c));
        return { ...prev, controls };
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  /* -------------------------------------------------------------- *
   * Edge clicks — insert a new corner at the clicked point         *
   * -------------------------------------------------------------- */

  const handleEdgeClick = (segmentIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    pushHistory();
    const p = svgPoint(e.clientX, e.clientY);
    setPoly((prev) => {
      const points = [...prev.points];
      const controls = [...prev.controls];
      // Insert new point AFTER segmentIndex's start, with a fresh
      // straight-line segment leading away from it.
      points.splice(segmentIndex + 1, 0, p);
      controls.splice(segmentIndex + 1, 0, null);
      return { points, controls };
    });
  };

  /* -------------------------------------------------------------- *
   * Curve toggle                                                   *
   * -------------------------------------------------------------- */

  const toggleCurve = (segmentIndex: number) => {
    pushHistory();
    setPoly((prev) => {
      const controls = [...prev.controls];
      if (controls[segmentIndex]) {
        // Already curved → make straight.
        controls[segmentIndex] = null;
      } else {
        // Make curved: place control point at the midpoint, slightly
        // pushed perpendicular to the edge so the curve is visible.
        const a = prev.points[segmentIndex];
        const b = prev.points[(segmentIndex + 1) % prev.points.length];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        // Perpendicular offset (~5% of image, normal to edge):
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        controls[segmentIndex] = [
          Math.max(0, Math.min(1, mx + nx * 0.05)),
          Math.max(0, Math.min(1, my + ny * 0.05)),
        ];
      }
      return { ...prev, controls };
    });
  };

  /* -------------------------------------------------------------- *
   * Delete a corner (right-click or with min 3 points)             *
   * -------------------------------------------------------------- */

  const deleteCorner = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (poly.points.length <= 3) return;
    pushHistory();
    setPoly((prev) => {
      const points = prev.points.filter((_, j) => j !== i);
      const controls = prev.controls.filter((_, j) => j !== i);
      return { points, controls };
    });
  };

  /* -------------------------------------------------------------- *
   * Build SVG path string for the polygon                          *
   * -------------------------------------------------------------- */

  const svgPath = (() => {
    const N = poly.points.length;
    if (N === 0) return "";
    const px = (p: Pt) => p[0] * 100;
    const py = (p: Pt) => p[1] * 100;
    let d = `M ${px(poly.points[0])} ${py(poly.points[0])}`;
    for (let i = 0; i < N; i++) {
      const next = poly.points[(i + 1) % N];
      const ctrl = poly.controls[i];
      if (ctrl) {
        d += ` Q ${px(ctrl)} ${py(ctrl)} ${px(next)} ${py(next)}`;
      } else {
        d += ` L ${px(next)} ${py(next)}`;
      }
    }
    return d + " Z";
  })();

  /* -------------------------------------------------------------- *
   * Keyboard shortcuts                                             *
   * -------------------------------------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        onConfirm(poly.points, poly.controls, imgW, imgH);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poly, history.length]);

  /* -------------------------------------------------------------- *
   * Render                                                         *
   * -------------------------------------------------------------- */

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Top-right floating cancel button — always visible escape
          hatch even if the bottom toolbar is off-screen / scrolled. */}
      <button
        onClick={onCancel}
        className="pointer-events-auto absolute top-3 right-3 z-40 w-9 h-9 rounded-full bg-pacific-dark/90 border border-white/20 text-pacific-light hover:bg-red-500/30 hover:border-red-400/60 transition-colors flex items-center justify-center shadow-lg"
        aria-label="Cancel manual frame"
        title="Cancel (Esc)"
      >
        ✕
      </button>

      {/* SVG editor — fills the canvas area */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Polygon fill (semi-transparent) + stroke */}
        <path
          d={svgPath}
          fill="rgba(218, 225, 232, 0.28)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />

        {/* Edge hit-targets (transparent thick lines) for click-to-add-corner */}
        {poly.points.map((p, i) => {
          const next = poly.points[(i + 1) % poly.points.length];
          const ctrl = poly.controls[i];
          const d = ctrl
            ? `M ${p[0] * 100} ${p[1] * 100} Q ${ctrl[0] * 100} ${ctrl[1] * 100} ${next[0] * 100} ${next[1] * 100}`
            : `M ${p[0] * 100} ${p[1] * 100} L ${next[0] * 100} ${next[1] * 100}`;
          return (
            <path
              key={`edge-${i}`}
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              style={{ cursor: "copy" }}
              onClick={(e) => handleEdgeClick(i, e)}
            />
          );
        })}

        {/* Curve control handles + lines from edge midpoint */}
        {poly.controls.map((ctrl, i) => {
          if (!ctrl) return null;
          const a = poly.points[i];
          const b = poly.points[(i + 1) % poly.points.length];
          const mx = (a[0] + b[0]) / 2;
          const my = (a[1] + b[1]) / 2;
          return (
            <g key={`ctrl-${i}`}>
              <line
                x1={mx * 100}
                y1={my * 100}
                x2={ctrl[0] * 100}
                y2={ctrl[1] * 100}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.2"
                strokeDasharray="0.8 0.8"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={ctrl[0] * 100}
                cy={ctrl[1] * 100}
                r="1.2"
                fill="rgba(218,225,232,0.95)"
                stroke="rgb(15, 30, 45)"
                strokeWidth="0.3"
                vectorEffect="non-scaling-stroke"
                style={{ cursor: "grab" }}
                onPointerDown={(e) =>
                  handlePointerDown(e, { kind: "control", index: i })
                }
              />
            </g>
          );
        })}

        {/* Corner handles — drag to move, right-click to delete */}
        {poly.points.map((p, i) => (
          <circle
            key={`corner-${i}`}
            cx={p[0] * 100}
            cy={p[1] * 100}
            r="1.6"
            fill="rgba(218, 225, 232, 1)"
            stroke="rgb(15, 30, 45)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            style={{ cursor: "grab" }}
            onPointerDown={(e) =>
              handlePointerDown(e, { kind: "corner", index: i })
            }
            onContextMenu={(e) => deleteCorner(i, e)}
          />
        ))}
      </svg>

      {/* Toolbar — fixed-positioned in the viewport top-centre, just
          below the page header. Avoids overlapping the slab dock at
          the bottom and the inspector panel on the right. */}
      <div className="pointer-events-auto fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 bg-pacific-dark/95 backdrop-blur-xl border border-white/15 rounded-xl p-3 shadow-2xl text-pacific-light text-xs min-w-[280px] max-w-[480px]">
        <div className="text-[10px] tracking-[.22em] uppercase text-pacific-mid mb-1 px-1">
          Adjust the surface
        </div>

        <button
          onClick={undo}
          disabled={history.length === 0}
          className="px-3 py-1.5 rounded border border-white/15 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
          aria-label="Undo last change"
        >
          ↶ Undo {history.length > 0 ? `(${history.length})` : ""}
        </button>

        {/* Per-edge curve toggles */}
        <div className="border-t border-white/10 pt-2 mt-1">
          <div className="text-[9px] tracking-[.18em] uppercase text-pacific-mid mb-1 px-1">
            Edge curves
          </div>
          <div className="grid grid-cols-2 gap-1">
            {poly.controls.map((c, i) => (
              <button
                key={i}
                onClick={() => toggleCurve(i)}
                className={`px-2 py-1 rounded border text-[10px] transition-colors ${
                  c
                    ? "bg-pacific-light/15 border-pacific-light/50 text-pacific-light"
                    : "border-white/15 hover:bg-white/10"
                }`}
              >
                Edge {i + 1}: {c ? "curved" : "straight"}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-2 mt-1 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded border border-red-400/40 text-red-200 hover:bg-red-500/15 hover:border-red-400/70 transition-colors font-medium"
          >
            ✕ Cancel
          </button>
          <button
            onClick={() => onConfirm(poly.points, poly.controls, imgW, imgH)}
            className="flex-1 px-3 py-2 rounded bg-pacific-light text-pacific-dark hover:bg-white transition-colors font-medium"
          >
            ✓ Apply ({poly.points.length}-sided)
          </button>
        </div>

        <div className="border-t border-white/10 pt-2 mt-1 text-[9px] text-pacific-mid leading-relaxed">
          <p>• Drag corners to move</p>
          <p>• Click an edge to add a corner</p>
          <p>• Right-click a corner to delete it</p>
          <p>• Toggle curves above</p>
          <p>• ⌘/Ctrl-Z to undo, Enter to apply</p>
        </div>
      </div>
    </div>
  );
}
