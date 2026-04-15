"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Slab } from "@/data/slabs";
import {
  candidateFromPolygon,
  selectAtTap,
  type SurfaceCandidate,
} from "./surface-detection";
import { applySlabToRegion, renderSlabTile } from "./slab-texture";
import type { DemoSurface } from "./demo-rooms";
import type { AIMask } from "./use-segment";

interface RoomCanvasProps {
  /** Image source (data URL or remote URL) */
  src: string;
  /** Currently selected slab */
  activeSlab: Slab | null;
  /** Hand-curated polygons for demo rooms. When present, these replace the
   *  tap-to-select flow entirely. */
  polygons?: DemoSurface[];
  /** AI-detected surface masks from Grounded SAM. When present, these replace
   *  the tap-to-select flood fill for user uploads. */
  aiMasks?: AIMask[];
  /** Called whenever the active region changes */
  onRegionChange?: (c: SurfaceCandidate | null, surfaceId?: string) => void;
  /** Fill parent container (vs intrinsic 16:10 aspect) */
  fill?: boolean;
}

export interface RoomCanvasHandle {
  exportPNG: () => string | null;
  reset: () => void;
}

export const RoomCanvas = forwardRef<RoomCanvasHandle, RoomCanvasProps>(
  function RoomCanvas(
    { src, activeSlab, polygons, aiMasks, onRegionChange, fill = false }: RoomCanvasProps,
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const baseRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [active, setActive] = useState<SurfaceCandidate | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [precomputed, setPrecomputed] = useState<
      { surface: DemoSurface; candidate: SurfaceCandidate }[]
    >([]);
    const [aiSurfaces, setAiSurfaces] = useState<
      { id: string; label: string; candidate: SurfaceCandidate }[]
    >([]);

    // ---------------- Load image + precompute polygon masks ----------------
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setActive(null);
      setActiveId(null);
      setPrecomputed([]);
      onRegionChange?.(null);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        imgRef.current = img;
        setImgSize({ w: img.naturalWidth, h: img.naturalHeight });

        const maxLong = 1600;
        const longest = Math.max(img.naturalWidth, img.naturalHeight);
        const scale = longest > maxLong ? maxLong / longest : 1;
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);

        const base = document.createElement("canvas");
        base.width = w;
        base.height = h;
        base.getContext("2d")!.drawImage(img, 0, 0, w, h);
        baseRef.current = base;

        const c = canvasRef.current!;
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(base, 0, 0);

        const ov = overlayRef.current;
        if (ov) {
          ov.width = w;
          ov.height = h;
        }
        setLoading(false);

        // Pre-compute masks for each hand-curated polygon at full image resolution.
        if (polygons && polygons.length > 0) {
          const computed = polygons.map((s) => ({
            surface: s,
            candidate: candidateFromPolygon(
              s.polygon,
              img.naturalWidth,
              img.naturalHeight,
            ),
          }));
          setPrecomputed(computed);
          // Auto-select the first surface on load so there's an immediate preview hint
          if (computed.length > 0) {
            setActive(computed[0].candidate);
            setActiveId(computed[0].surface.id);
            onRegionChange?.(computed[0].candidate, computed[0].surface.id);
          }
        }
      };
      img.onerror = () => {
        if (!cancelled) setLoading(false);
      };
      img.src = src;

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, polygons]);

    // ---------------- Load AI mask PNGs into SurfaceCandidates ----------------
    useEffect(() => {
      if (!aiMasks || aiMasks.length === 0 || !imgRef.current) {
        setAiSurfaces([]);
        return;
      }
      let cancelled = false;
      const img = imgRef.current;
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      (async () => {
        const results: typeof aiSurfaces = [];
        for (const aim of aiMasks) {
          if (cancelled) return;
          try {
            const maskImg = await loadImageEl(aim.url);
            // Draw mask to canvas at image's natural dimensions to get ImageData
            const c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            const ctx = c.getContext("2d")!;
            ctx.drawImage(maskImg, 0, 0, w, h);
            const maskData = ctx.getImageData(0, 0, w, h);
            // Convert to white-alpha mask format (surface-detection expects alpha channel)
            // Grounded SAM mask: white pixels = surface. Convert to RGBA where A=255 if bright.
            const data = maskData.data;
            let sumX = 0, sumY = 0, count = 0;
            let minX = w, maxX = 0, minY = h, maxY = 0;
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                // Consider pixel as mask if it's mostly white (r+g+b > 384)
                const bright = data[i] + data[i + 1] + data[i + 2] > 384;
                if (bright) {
                  data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
                  sumX += x; sumY += y; count++;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                } else {
                  data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0;
                }
              }
            }
            if (count < 100) continue; // skip tiny noise masks
            results.push({
              id: aim.id,
              label: aim.label,
              candidate: {
                score: 1,
                mask: maskData,
                bbox: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
                centroid: { x: sumX / count, y: sumY / count },
              },
            });
          } catch {
            // skip failed mask loads
          }
        }
        if (!cancelled) {
          setAiSurfaces(results);
          // Auto-select the first surface
          if (results.length > 0) {
            setActive(results[0].candidate);
            setActiveId(results[0].id);
            onRegionChange?.(results[0].candidate, results[0].id);
          }
        }
      })();

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiMasks]);

    // ---------------- Paint overlay mask (polygon fills + outlines) ----------------
    useEffect(() => {
      const ov = overlayRef.current;
      if (!ov) return;
      const ctx = ov.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, ov.width, ov.height);

      if (precomputed.length > 0) {
        // Polygon mode: draw every surface, highlight hovered / active
        for (const { surface, candidate } of precomputed) {
          const isActive = activeId === surface.id;
          const isHovered = hoveredId === surface.id;
          if (activeSlab && !isActive) continue;
          paintPolygon(ctx, candidate, surface.polygon, ov.width, ov.height, {
            fillAlpha: isActive ? 0 : isHovered ? 0.22 : 0.12,
            strokeAlpha: isActive ? 1 : isHovered ? 0.9 : 0.55,
            strokeWidth: isActive ? 4 : 2,
            dashed: !isActive && !isHovered,
          });
        }
      } else if (aiSurfaces.length > 0) {
        // AI mask mode: draw each detected surface mask as an overlay
        for (const { id, candidate } of aiSurfaces) {
          const isActive = activeId === id;
          const isHovered = hoveredId === id;
          if (activeSlab && !isActive) continue;
          paintMaskOverlay(ctx, candidate.mask, {
            fillAlpha: isActive ? 0 : isHovered ? 0.22 : 0.12,
            strokeAlpha: isActive ? 1 : isHovered ? 0.9 : 0.55,
            strokeWidth: isActive ? 4 : 2,
          });
        }
      } else if (active && !activeSlab) {
        // Tap-based fallback for user uploads (no AI masks)
        paintMaskOverlay(ctx, active.mask, {
          fillAlpha: 0.28,
          strokeAlpha: 1,
          strokeWidth: 3,
        });
      }
    }, [precomputed, aiSurfaces, active, activeId, hoveredId, activeSlab]);

    // ---------------- Recomposite with slab ----------------
    useEffect(() => {
      let cancelled = false;
      const run = async () => {
        const canvas = canvasRef.current;
        const base = baseRef.current;
        if (!canvas || !base) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(base, 0, 0);
        if (!active || !activeSlab) return;
        const tile = await renderSlabTile(activeSlab, 1024, 1024);
        if (cancelled) return;
        applySlabToRegion(ctx, base, active.mask, tile, { opacity: 0.95 });
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [active, activeSlab]);

    // ---------------- Pointer handlers ----------------
    const mapPointToImage = (e: React.MouseEvent<HTMLDivElement>) => {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      return { relX, relY, ix: relX * img.naturalWidth, iy: relY * img.naturalHeight };
    };

    const handleTap = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const pt = mapPointToImage(e);
        if (!pt) return;

        if (precomputed.length > 0) {
          // Polygon mode: pick whichever polygon the tap lands inside
          for (const { surface, candidate } of precomputed) {
            if (pointInPolygon([pt.relX, pt.relY], surface.polygon)) {
              setActive(candidate);
              setActiveId(surface.id);
              onRegionChange?.(candidate, surface.id);
              return;
            }
          }
          return; // ignore taps outside any polygon
        }

        if (aiSurfaces.length > 0) {
          // AI mask mode: pick whichever mask contains the tap pixel
          const ix = Math.floor(pt.ix);
          const iy = Math.floor(pt.iy);
          for (const { id, candidate } of aiSurfaces) {
            const w = candidate.mask.width;
            const idx = (iy * w + ix) * 4 + 3; // alpha channel
            if (candidate.mask.data[idx] > 128) {
              setActive(candidate);
              setActiveId(id);
              onRegionChange?.(candidate, id);
              return;
            }
          }
          return; // ignore taps outside any detected surface
        }

        // Fallback: tap-based flood fill for user uploads (no AI)
        const img = imgRef.current!;
        setWorking(true);
        setTimeout(() => {
          const next = selectAtTap(img, pt.ix, pt.iy, {
            tolerance: 0.16,
            edgeGate: 0.28,
          });
          setActive(next);
          onRegionChange?.(next);
          setWorking(false);
        }, 20);
      },
      [precomputed, aiSurfaces, onRegionChange],
    );

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const pt = mapPointToImage(e);
      if (!pt) return;

      if (precomputed.length > 0) {
        let found: string | null = null;
        for (const { surface } of precomputed) {
          if (pointInPolygon([pt.relX, pt.relY], surface.polygon)) {
            found = surface.id;
            break;
          }
        }
        setHoveredId(found);
        return;
      }

      if (aiSurfaces.length > 0) {
        const ix = Math.floor(pt.ix);
        const iy = Math.floor(pt.iy);
        let found: string | null = null;
        for (const { id, candidate } of aiSurfaces) {
          const w = candidate.mask.width;
          const idx = (iy * w + ix) * 4 + 3;
          if (candidate.mask.data[idx] > 128) {
            found = id;
            break;
          }
        }
        setHoveredId(found);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        exportPNG: () => canvasRef.current?.toDataURL("image/png") ?? null,
        reset: () => {
          setActive(null);
          setActiveId(null);
          onRegionChange?.(null);
        },
      }),
      [onRegionChange],
    );

    // ---------------- Render ----------------
    const wrapStyle: React.CSSProperties = fill
      ? {
          aspectRatio: `${imgSize.w} / ${imgSize.h}`,
          maxHeight: "100%",
          maxWidth: "100%",
          cursor: "pointer",
        }
      : { cursor: "pointer" };

    return (
      <div
        className={
          fill
            ? "relative rounded-2xl overflow-hidden bg-[#0a1620] ring-1 ring-white/10 mx-auto"
            : "relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#0a1620] ring-1 ring-white/10"
        }
        style={wrapStyle}
        onClick={handleTap}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoveredId(null)}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
        <canvas
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Polygon hotspot badges */}
        {!loading &&
          precomputed.map(({ surface, candidate }, i) => {
            const cx = (candidate.centroid.x / imgSize.w) * 100;
            const cy = (candidate.centroid.y / imgSize.h) * 100;
            const isActive = activeId === surface.id;
            const isHovered = hoveredId === surface.id;
            if (activeSlab && !isActive) return null;
            return (
              <motion.div
                key={surface.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: isHovered ? 1.06 : 1,
                }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="pointer-events-none absolute"
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ring-2 ${
                      isActive
                        ? "bg-pacific-light text-pacific-dark ring-pacific-light/60 shadow-[0_0_24px_rgba(218,225,232,.55)]"
                        : isHovered
                          ? "bg-white text-pacific-dark ring-white/60 shadow-[0_0_18px_rgba(218,225,232,.35)]"
                          : "bg-pacific-dark/85 text-pacific-light ring-white/50 backdrop-blur"
                    }`}
                  >
                    {isActive ? "✓" : i + 1}
                  </div>
                  <div
                    className={`text-[10px] tracking-[.22em] uppercase px-2.5 py-1 rounded bg-pacific-dark/85 backdrop-blur-md border transition-colors ${
                      isActive
                        ? "border-pacific-light/50 text-pacific-light"
                        : "border-white/10 text-white/90"
                    }`}
                  >
                    {surface.label}
                  </div>
                </div>
              </motion.div>
            );
          })}

        {/* AI mask hotspot badges */}
        {!loading &&
          aiSurfaces.map(({ id, label, candidate }, i) => {
            const cx = (candidate.centroid.x / imgSize.w) * 100;
            const cy = (candidate.centroid.y / imgSize.h) * 100;
            const isActive = activeId === id;
            const isHovered = hoveredId === id;
            if (activeSlab && !isActive) return null;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: isHovered ? 1.06 : 1,
                }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="pointer-events-none absolute"
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ring-2 ${
                      isActive
                        ? "bg-pacific-light text-pacific-dark ring-pacific-light/60 shadow-[0_0_24px_rgba(218,225,232,.55)]"
                        : isHovered
                          ? "bg-white text-pacific-dark ring-white/60 shadow-[0_0_18px_rgba(218,225,232,.35)]"
                          : "bg-pacific-dark/85 text-pacific-light ring-white/50 backdrop-blur"
                    }`}
                  >
                    {isActive ? "✓" : i + 1}
                  </div>
                  <div
                    className={`text-[10px] tracking-[.22em] uppercase px-2.5 py-1 rounded bg-pacific-dark/85 backdrop-blur-md border transition-colors ${
                      isActive
                        ? "border-pacific-light/50 text-pacific-light"
                        : "border-white/10 text-white/90"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              </motion.div>
            );
          })}

        {/* Loading / working */}
        <AnimatePresence>
          {(loading || working) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-pacific-dark/30 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="flex items-center gap-3 text-pacific-light text-xs tracking-[.22em] uppercase bg-pacific-dark/85 border border-white/10 px-4 py-2 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {loading ? "Loading scene" : "Selecting"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

/* -------------------- helpers -------------------- */

/**
 * Point-in-polygon test (ray casting). `point` and polygon verts in the same
 * (usually normalised) coordinate space.
 */
function pointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Paint a polygon's fill + outline (optionally dashed) onto the overlay.
 */
function paintPolygon(
  ctx: CanvasRenderingContext2D,
  _candidate: SurfaceCandidate,
  polygon: [number, number][],
  width: number,
  height: number,
  {
    fillAlpha,
    strokeAlpha,
    strokeWidth,
    dashed,
  }: { fillAlpha: number; strokeAlpha: number; strokeWidth: number; dashed: boolean },
) {
  ctx.save();
  ctx.beginPath();
  polygon.forEach(([nx, ny], i) => {
    const x = nx * width;
    const y = ny * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fillAlpha > 0) {
    ctx.fillStyle = `rgba(218, 225, 232, ${fillAlpha})`;
    ctx.fill();
  }
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
  if (dashed) ctx.setLineDash([14, 10]);
  ctx.stroke();
  ctx.restore();
}

/**
 * Paint an ImageData mask as a tinted fill + edge-detected outline stroke.
 * Used for the user-upload tap-and-fill fallback.
 */
/** Load an image from a URL (data URL or remote) */
function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function paintMaskOverlay(
  ctx: CanvasRenderingContext2D,
  mask: ImageData,
  {
    fillAlpha,
    strokeAlpha,
    strokeWidth,
  }: { fillAlpha: number; strokeAlpha: number; strokeWidth: number },
) {
  const { width: w, height: h, data } = mask;

  const fill = document.createElement("canvas");
  fill.width = w;
  fill.height = h;
  const fctx = fill.getContext("2d")!;
  fctx.fillStyle = `rgba(218, 225, 232, ${fillAlpha})`;
  fctx.fillRect(0, 0, w, h);
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  tmp.getContext("2d")!.putImageData(mask, 0, 0);
  fctx.globalCompositeOperation = "destination-in";
  fctx.drawImage(tmp, 0, 0);
  ctx.drawImage(fill, 0, 0);

  const step = 2;
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = w;
  edgeCanvas.height = h;
  const ectx = edgeCanvas.getContext("2d")!;
  ectx.fillStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
  const half = strokeWidth;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4 + 3;
      if (data[idx] < 128) continue;
      const left = x > 0 ? data[(y * w + x - 1) * 4 + 3] : 0;
      const right = x < w - 1 ? data[(y * w + x + 1) * 4 + 3] : 0;
      const up = y > 0 ? data[((y - 1) * w + x) * 4 + 3] : 0;
      const down = y < h - 1 ? data[((y + 1) * w + x) * 4 + 3] : 0;
      if (left >= 128 && right >= 128 && up >= 128 && down >= 128) continue;
      ectx.fillRect(x - half, y - half, strokeWidth * 2, strokeWidth * 2);
    }
  }
  ctx.drawImage(edgeCanvas, 0, 0);
}
