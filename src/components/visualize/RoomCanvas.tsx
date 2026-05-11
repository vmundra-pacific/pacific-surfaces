"use client";

import {
  type ReactNode,
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
  candidateFromMaskURL,
  candidateFromPolygon,
  selectAtTap,
  type SurfaceCandidate,
} from "./surface-detection";
import { applySlabToRegion, renderSlabTile } from "./slab-texture";
import type { DemoSurface } from "./demo-rooms";
import type { AIMask } from "./use-segment";
import { ManualFrameEditor } from "./ManualFrameEditor";

interface RoomCanvasProps {
  /** Image source (data URL or remote URL) */
  src: string;
  /** Per-surface slab assignments. Each AI / polygon surface id maps
   *  to a slab. The recomposite loop renders each surface with its
   *  own slab — different surfaces can show different colours. */
  surfaceSlabs: Record<string, Slab>;
  /** Called whenever the user taps a surface (or otherwise focuses one)
   *  so the parent can route slab-picker clicks to that surface. */
  onFocusChange?: (id: string | null) => void;
  /** Hand-curated polygons for demo rooms. When present, these replace the
   *  tap-to-select flow entirely. */
  polygons?: DemoSurface[];
  /** AI-detected surface masks from Grounded SAM. When present, these replace
   *  the tap-to-select flood fill for user uploads. */
  aiMasks?: AIMask[];
  /** Called whenever the active region changes */
  onRegionChange?: (c: SurfaceCandidate | null, surfaceId?: string) => void;
  /** Called when the user taps somewhere outside any existing mask in
   *  AI-mode. Coordinates are normalised to [0, 1]. The parent should
   *  call SAM-2 point-prompted segmentation and append the resulting mask
   *  to `aiMasks`. */
  onPointTap?: (relX: number, relY: number) => void;
  /** When SAM-2 fails, the parent sets this to the tap location and
   *  the canvas opens the manual frame editor on top. */
  manualTap?: { x: number; y: number } | null;
  /** Optional starting polygon for the manual editor (used when
   *  editing an existing surface via double-tap). */
  manualInitialPolygon?: {
    points: [number, number][];
    controls: ([number, number] | null)[];
  };
  /** Called when the user confirms the manual polygon. */
  onManualConfirm?: (
    points: [number, number][],
    controls: ([number, number] | null)[],
    imgW: number,
    imgH: number
  ) => void;
  /** Called when the user cancels the manual frame. */
  onManualCancel?: () => void;
  /** Called when the user double-taps an already-selected AI surface
   *  to enter edit mode. The polygon is pre-computed in normalised
   *  image coords (from the surface's bbox) and passed through, so
   *  the parent can hand it straight to the manual editor. */
  onEditExisting?: (
    surfaceId: string,
    initialPolygon: {
      points: [number, number][];
      controls: ([number, number] | null)[];
    },
    centerTap: { x: number; y: number }
  ) => void;
  /** Fill parent container (vs intrinsic 16:10 aspect) */
  fill?: boolean;
}

export interface RoomCanvasHandle {
  exportPNG: () => string | null;
  reset: () => void;
}

export const RoomCanvas = forwardRef<RoomCanvasHandle, RoomCanvasProps>(
  function RoomCanvas(
    {
      src,
      surfaceSlabs,
      onFocusChange,
      polygons,
      aiMasks,
      onRegionChange,
      onPointTap,
      manualTap,
      manualInitialPolygon,
      onManualConfirm,
      onManualCancel,
      onEditExisting,
      fill = false,
    }: RoomCanvasProps,
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const baseRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    // ── Zoom + pan (demo rooms only) ────────────────────────────────
    // Enabled when `polygons` is set (curated demo rooms). Not enabled
    // for AI-uploaded photos because the slab and surface detection
    // already moves with the image — adding pan there would fight the
    // tap-to-detect interaction. Wheel + buttons control zoom (1×–4×);
    // drag pans when zoomed > 1.
    const zoomEnabled = Boolean(polygons && polygons.length > 0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({
      x: 0,
      y: 0,
      panX: 0,
      panY: 0,
      didMove: false,
    });
    const isZoomed = zoomLevel > 1;

    const zoomIn = () =>
      setZoomLevel((z) => Math.min(4, +(z + 0.5).toFixed(1)));
    const zoomOut = () =>
      setZoomLevel((z) => {
        const next = Math.max(1, +(z - 0.5).toFixed(1));
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    const resetZoom = () => {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    };

    // Reset zoom on scene change (new src) — otherwise switching rooms
    // would inherit the previous room's pan position, which feels wrong.
    useEffect(() => {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    }, [src]);

    // Set while a slab-swap recomposite is running. Drives the
    // "Applying" overlay so the user has visible feedback during the
    // 100–600 ms it takes to render a fresh slab tile + composite it
    // against the room. Distinct from `loading` (initial scene fetch)
    // and `working` (flood-fill / surface detection).
    const [applyingSlab, setApplyingSlab] = useState(false);
    // `active` is the most-recently-toggled candidate, used by the inspector
    // panel and as the single mask for the no-AI tap-fallback path.
    const [active, setActive] = useState<SurfaceCandidate | null>(null);
    // Multi-select: every selected surface ID. Tap toggles in/out, so the
    // same slab can be applied to countertop + backsplash + island in one go.
    const [activeIds, setActiveIds] = useState<string[]>([]);
    const [imgSize, setImgSize] = useState<{ w: number; h: number }>({
      w: 1,
      h: 1,
    });
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    // Tracks which AI mask IDs we've already processed. Lets the aiMasks
    // effect tell new masks (added via point-tap) apart from masks that have
    // been around since the original AMG run, so we don't blow away the
    // user's existing selections every time a single new mask appears.
    const seenAiIdsRef = useRef<Set<string>>(new Set());
    // The location of the user's most recent tap-to-detect. Used to render
    // a localised hazy ripple while SAM-2 is running so the user gets
    // immediate feedback that the right point was registered. Cleared when
    // a new mask arrives (success) or after a 30-second safety timeout.
    const [pendingTap, setPendingTap] = useState<{
      relX: number;
      relY: number;
      // True if the underlying surface at the tap point is BRIGHT (e.g.
      // a white slab area) — used to flip the ripple from light to dark
      // so it's visible against the surface.
      isBright: boolean;
    } | null>(null);
    // Tracks the aiMasks length so the effect below can detect "a new mask
    // just arrived" and clear the pending ripple.
    const aiMasksLengthRef = useRef(aiMasks?.length ?? 0);
    // Tracks the last AI-mask tap so we can detect a double-tap on the
    // SAME surface (within ~450ms) and fire onEditExisting instead of
    // toggling. Used by the edit-existing-surface flow.
    const lastTapRef = useRef<{ id: string; time: number } | null>(null);
    const [precomputed, setPrecomputed] = useState<
      {
        surface: DemoSurface;
        candidate: SurfaceCandidate;
        // Optional shadow pass (lever 2) + highlights pass (lever 3).
        // Both are loaded once when the room mounts and reused for
        // every slab swap on this surface.
        shadow?: HTMLImageElement;
        highlights?: HTMLImageElement;
      }[]
    >([]);
    const [aiSurfaces, setAiSurfaces] = useState<
      { id: string; label: string; candidate: SurfaceCandidate }[]
    >([]);

    // ---------------- Load image + precompute polygon masks ----------------
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setActive(null);
      setActiveIds([]);
      setPrecomputed([]);
      seenAiIdsRef.current = new Set();
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

        // Pre-compute masks for each demo-room surface at full image
        // resolution. Each surface ships with EITHER a normalised
        // polygon (rasterised in-process) OR a maskUrl pointing to a
        // PSD-exported PNG (fetched + alpha-checked). Polygon surfaces
        // resolve synchronously, mask-URL surfaces resolve async; we
        // run them through Promise.all so the order in `polygons` is
        // preserved in the output array.
        if (polygons && polygons.length > 0) {
          (async () => {
            const computed = await Promise.all(
              polygons.map(async (s) => {
                // Load the mask + the (optional) shadow + highlights
                // passes in parallel — all are network fetches against
                // /public/demo-rooms/<id>/, and waiting on the mask
                // first would needlessly stall the auxiliary requests.
                const [cand, shadow, highlights] = await Promise.all([
                  s.maskUrl
                    ? candidateFromMaskURL(
                        s.maskUrl,
                        img.naturalWidth,
                        img.naturalHeight
                      )
                    : s.polygon
                      ? Promise.resolve(
                          candidateFromPolygon(
                            s.polygon,
                            img.naturalWidth,
                            img.naturalHeight
                          )
                        )
                      : Promise.resolve(null),
                  s.shadowUrl
                    ? loadImageEl(s.shadowUrl)
                        .then((el) => {
                          // Demo-room masks/passes have to match the
                          // room photo's natural dimensions exactly,
                          // or alignment drifts by a few pixels at
                          // every painted boundary. Warn loudly when
                          // they don't so misregistration is easy to
                          // diagnose during PSD export iteration.
                          if (
                            el.naturalWidth !== img.naturalWidth ||
                            el.naturalHeight !== img.naturalHeight
                          ) {
                            console.warn(
                              `[demo-room ${s.id}] shadow.png dimensions ` +
                                `${el.naturalWidth}×${el.naturalHeight} don't ` +
                                `match room.jpg ${img.naturalWidth}×${img.naturalHeight}. ` +
                                "Re-export at document size to fix mis-alignment."
                            );
                          }
                          return el;
                        })
                        .catch(() => undefined)
                    : Promise.resolve(undefined),
                  s.highlightsUrl
                    ? loadImageEl(s.highlightsUrl)
                        .then((el) => {
                          if (
                            el.naturalWidth !== img.naturalWidth ||
                            el.naturalHeight !== img.naturalHeight
                          ) {
                            console.warn(
                              `[demo-room ${s.id}] highlights.png dimensions ` +
                                `${el.naturalWidth}×${el.naturalHeight} don't ` +
                                `match room.jpg ${img.naturalWidth}×${img.naturalHeight}. ` +
                                "Re-export at document size to fix mis-alignment."
                            );
                          }
                          return el;
                        })
                        .catch(() => undefined)
                    : Promise.resolve(undefined),
                ]);
                if (!cand) return null;
                return {
                  surface: s,
                  candidate: cand,
                  shadow: shadow ?? undefined,
                  highlights: highlights ?? undefined,
                };
              })
            );
            if (cancelled) return;
            const valid = computed.filter(
              (
                x
              ): x is {
                surface: DemoSurface;
                candidate: SurfaceCandidate;
                shadow: HTMLImageElement | undefined;
                highlights: HTMLImageElement | undefined;
              } => x !== null
            );
            setPrecomputed(valid);
            // Auto-select the first surface so there's an immediate preview hint.
            if (valid.length > 0) {
              setActive(valid[0].candidate);
              setActiveIds([valid[0].surface.id]);
              onRegionChange?.(valid[0].candidate, valid[0].surface.id);
              onFocusChange?.(valid[0].surface.id);
            }
          })();
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
            let sumX = 0,
              sumY = 0,
              count = 0;
            let minX = w,
              maxX = 0,
              minY = h,
              maxY = 0;
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                // Consider pixel as mask if it's mostly white (r+g+b > 384)
                const bright = data[i] + data[i + 1] + data[i + 2] > 384;
                if (bright) {
                  data[i] = 255;
                  data[i + 1] = 255;
                  data[i + 2] = 255;
                  data[i + 3] = 255;
                  sumX += x;
                  sumY += y;
                  count++;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                } else {
                  data[i] = 0;
                  data[i + 1] = 0;
                  data[i + 2] = 0;
                  data[i + 3] = 0;
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
                bbox: {
                  x: minX,
                  y: minY,
                  w: maxX - minX + 1,
                  h: maxY - minY + 1,
                },
                centroid: { x: sumX / count, y: sumY / count },
              },
            });
          } catch {
            // skip failed mask loads
          }
        }
        if (!cancelled) {
          setAiSurfaces(results);

          // Figure out which IDs are brand-new (never seen before this
          // effect run). Mark them seen, then append them to activeIds in
          // one update — strictly additive, never replacing.
          const newSurfaces: typeof results = [];
          for (const r of results) {
            if (!seenAiIdsRef.current.has(r.id)) {
              newSurfaces.push(r);
              seenAiIdsRef.current.add(r.id);
            }
          }

          if (newSurfaces.length > 0) {
            const target = newSurfaces[newSurfaces.length - 1];
            setActive(target.candidate);
            setActiveIds((prev) => {
              const next = [...prev];
              for (const s of newSurfaces) {
                if (!next.includes(s.id)) next.push(s.id);
              }
              console.log(
                "[RoomCanvas] activeIds update:",
                "prev=",
                prev,
                "newSurfaceIds=",
                newSurfaces.map((s) => s.id),
                "next=",
                next
              );
              return next;
            });
            onRegionChange?.(target.candidate, target.id);
            // Auto-focus the newest surface so the slab picker assigns
            // the user's next pick to it.
            onFocusChange?.(target.id);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiMasks]);

    // ---------------- Clear pending tap ripple when a new mask arrives ----------------
    useEffect(() => {
      const len = aiMasks?.length ?? 0;
      if (len > aiMasksLengthRef.current) {
        // A new mask just arrived → SAM-2 finished; remove the ripple.
        setPendingTap(null);
      }
      aiMasksLengthRef.current = len;
    }, [aiMasks]);

    // ---------------- Paint overlay mask (polygon fills + outlines) ----------------
    useEffect(() => {
      const ov = overlayRef.current;
      if (!ov) return;
      const ctx = ov.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, ov.width, ov.height);

      // Outline drawing is disabled. Selection is conveyed entirely via
      // the numbered badges (with check marks) and via the slab fill
      // itself. The previous "marching ants" mask outlines were noisy
      // and competed with the slab visual. We only paint a *hover*
      // overlay (a soft fill, no stroke) so the user has subtle
      // feedback when their cursor is over a surface they could add or
      // remove.
      if (precomputed.length > 0) {
        for (const { surface, candidate } of precomputed) {
          if (hoveredId !== surface.id) continue;
          // Polygon surfaces get the polygon-fill overlay; mask-URL
          // surfaces have no polygon, so paint the candidate's mask
          // directly (same path the AI surfaces use).
          if (surface.polygon) {
            paintPolygon(ctx, candidate, surface.polygon, ov.width, ov.height, {
              fillAlpha: 0.18,
              strokeAlpha: 0,
              strokeWidth: 0,
              dashed: false,
            });
          } else {
            paintMaskOverlay(ctx, candidate.mask, {
              fillAlpha: 0.18,
              strokeAlpha: 0,
              strokeWidth: 0,
            });
          }
        }
      } else if (aiSurfaces.length > 0) {
        for (const { id, candidate } of aiSurfaces) {
          if (hoveredId !== id) continue;
          paintMaskOverlay(ctx, candidate.mask, {
            fillAlpha: 0.18,
            strokeAlpha: 0,
            strokeWidth: 0,
          });
        }
      }

      // ---------- ?debug=masks overlay ----------
      // Paint every precomputed mask in semi-transparent red on top of
      // everything so you can verify mask vs photo alignment without
      // picking a slab. Lives on the overlay canvas (above the main
      // canvas), so the slab-render effect's clear+redraw of the main
      // canvas can't wipe it. Re-runs on every overlay repaint, which
      // means it survives hover state changes and surface selection.
      if (
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("debug") === "masks" &&
        precomputed.length > 0
      ) {
        for (const { candidate } of precomputed) {
          // Use the in-memory mask ImageData directly — no async
          // image loading required. The mask was already rasterised
          // when the room mounted.
          const src = document.createElement("canvas");
          src.width = candidate.mask.width;
          src.height = candidate.mask.height;
          src.getContext("2d")!.putImageData(candidate.mask, 0, 0);

          const tinted = document.createElement("canvas");
          tinted.width = ov.width;
          tinted.height = ov.height;
          const tctx = tinted.getContext("2d")!;
          tctx.drawImage(src, 0, 0, ov.width, ov.height);
          tctx.globalCompositeOperation = "source-in";
          tctx.fillStyle = "#ff2d55";
          tctx.fillRect(0, 0, ov.width, ov.height);

          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.drawImage(tinted, 0, 0);
          ctx.restore();
        }
      }
    }, [precomputed, aiSurfaces, active, activeIds, hoveredId, surfaceSlabs]);

    // ---------------- Recomposite with PER-SURFACE slabs ----------------
    useEffect(() => {
      let cancelled = false;
      // Defer flipping `applyingSlab` to true by a tick — most
      // recomposite passes finish in <50ms (cached tile) and we don't
      // want the overlay to flicker on every interaction. The 80ms
      // threshold means the user only sees the spinner when a tile
      // actually needs decoding, not for instant slab swaps.
      const showOverlayTimer = setTimeout(() => {
        if (!cancelled) setApplyingSlab(true);
      }, 80);
      const run = async () => {
        const canvas = canvasRef.current;
        const base = baseRef.current;
        if (!canvas || !base) {
          clearTimeout(showOverlayTimer);
          setApplyingSlab(false);
          return;
        }
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(base, 0, 0);

        // Build the per-surface render queue. Each entry is a
        // { mask, slab, precise } triple. `precise` is true for
        // demo-room surfaces (whose masks are either hand-painted in
        // Photoshop or eyeballed polygons — both trace the actual
        // edge), and false for AI / SAM-2 masks (which need dilation
        // + feather to compensate for their inherent inset).
        type Job = {
          mask: ImageData;
          slab: Slab;
          precise: boolean;
          shadow?: HTMLImageElement;
          highlights?: HTMLImageElement;
          bbox: { x: number; y: number; w: number; h: number };
        };
        const jobs: Job[] = [];
        for (const id of activeIds) {
          const slab = surfaceSlabs[id];
          if (!slab) continue;
          const poly = precomputed.find((p) => p.surface.id === id);
          if (poly) {
            jobs.push({
              mask: poly.candidate.mask,
              slab,
              precise: true,
              shadow: poly.shadow,
              highlights: poly.highlights,
              bbox: poly.candidate.bbox,
            });
            continue;
          }
          const ai = aiSurfaces.find((a) => a.id === id);
          if (ai)
            jobs.push({
              mask: ai.candidate.mask,
              slab,
              precise: false,
              bbox: ai.candidate.bbox,
            });
        }
        if (jobs.length === 0) return;

        // Cache slab tiles by slab id so we don't re-render the same
        // tile if multiple surfaces share a slab.
        const tileCache = new Map<string, HTMLCanvasElement>();
        for (const job of jobs) {
          if (!tileCache.has(job.slab.id)) {
            const tile = await renderSlabTile(job.slab, 1024, 1024);
            if (cancelled) return;
            tileCache.set(job.slab.id, tile);
          }
        }

        // Composite each surface with its own slab. `precise` is
        // forwarded into applySlabToRegion so demo-room masks render
        // with tight edges (no dilation, hairline feather) while AI
        // masks keep their forgiving dilate + feather defaults.
        for (const { mask, slab, precise, shadow, highlights, bbox } of jobs) {
          const tile = tileCache.get(slab.id);
          if (!tile) continue;
          // opacity: 0.9 — paints the slab at 90% strength so a hint
          // (10%) of the original photo bleeds through. Lets the
          // underlying lighting / micro-shadows / surface character
          // read through subtly, so the slab feels integrated with
          // the room rather than pasted on. The hand-painted shadow
          // and highlight layers do most of the integration work;
          // this last 10% is the polish pass.
          applySlabToRegion(ctx, base, mask, tile, {
            opacity: 0.9,
            precise,
            shadow,
            highlights,
            bbox,
          });
        }
      };
      run().finally(() => {
        clearTimeout(showOverlayTimer);
        if (!cancelled) setApplyingSlab(false);
      });
      return () => {
        cancelled = true;
        clearTimeout(showOverlayTimer);
      };
    }, [activeIds, surfaceSlabs, precomputed, aiSurfaces]);

    // ---------------- Pointer handlers ----------------
    const mapPointToImage = (e: React.MouseEvent<HTMLDivElement>) => {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      return {
        relX,
        relY,
        ix: relX * img.naturalWidth,
        iy: relY * img.naturalHeight,
      };
    };

    // ── Zoom + pan handlers ──
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      if (!zoomEnabled) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!zoomEnabled) return;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
        didMove: false,
      };
      // Only switch into pan mode when zoomed in; at 1× a mousedown is
      // always a tap. We still record the start position so we can
      // detect drag-vs-click for tap suppression later.
      if (isZoomed) setIsPanning(true);
    };

    const handlePanMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        panStartRef.current.didMove = true;
      }
      setPan({
        x: panStartRef.current.panX + dx / zoomLevel,
        y: panStartRef.current.panY + dy / zoomLevel,
      });
    };

    const handlePanEnd = () => {
      setIsPanning(false);
    };

    const handleTap = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        // While the manual frame editor is open, taps on the canvas
        // should NOT trigger SAM-2 / segmentation. The editor handles
        // its own pointer events for corner drag, edge insert, etc.
        if (manualTap) return;
        // Suppress tap when the click was actually a pan drag (mouse
        // moved >4px between down and up). Without this, releasing
        // after a pan would always trigger a surface-tap.
        if (panStartRef.current.didMove) {
          panStartRef.current.didMove = false;
          return;
        }

        const pt = mapPointToImage(e);
        if (!pt) return;

        if (precomputed.length > 0) {
          // Demo-room mode: hit-test by polygon when we have one
          // (fast path), or by sampling the candidate mask's alpha
          // channel for mask-URL surfaces (pixel-perfect path).
          for (const { surface, candidate } of precomputed) {
            const hit = surface.polygon
              ? pointInPolygon([pt.relX, pt.relY], surface.polygon)
              : (() => {
                  const mw = candidate.mask.width;
                  const mh = candidate.mask.height;
                  const mx = Math.floor(pt.relX * mw);
                  const my = Math.floor(pt.relY * mh);
                  if (mx < 0 || my < 0 || mx >= mw || my >= mh) return false;
                  return candidate.mask.data[(my * mw + mx) * 4 + 3] > 128;
                })();
            if (hit) {
              // Compute next state synchronously from current activeIds
              // (instead of from inside the updater) so we can call the
              // parent's onFocusChange without triggering React's
              // "setState during render" warning. Calling a parent
              // setState from inside another component's setState
              // updater is what was tripping the error before.
              const has = activeIds.includes(surface.id);
              const next = has
                ? activeIds.filter((x) => x !== surface.id)
                : [...activeIds, surface.id];
              setActiveIds(next);
              onFocusChange?.(
                has ? (next[next.length - 1] ?? null) : surface.id
              );
              setActive(candidate);
              onRegionChange?.(candidate, surface.id);
              return;
            }
          }
          return; // ignore taps outside any polygon
        }

        // SAM-2 point-detect mode (user uploaded a photo and the parent
        // wired up onPointTap). This branch is the primary tap behaviour
        // for user uploads — it runs whether or not we already have any
        // detected surfaces.
        if (onPointTap) {
          const ix = Math.floor(pt.ix);
          const iy = Math.floor(pt.iy);
          // First check: did the tap land on any already-detected mask?
          for (const { id, candidate } of aiSurfaces) {
            const w = candidate.mask.width;
            const idx = (iy * w + ix) * 4 + 3; // alpha channel
            if (candidate.mask.data[idx] > 128) {
              const now = Date.now();
              const isDoubleTap =
                lastTapRef.current &&
                lastTapRef.current.id === id &&
                now - lastTapRef.current.time < 450;
              lastTapRef.current = { id, time: now };

              // DOUBLE-TAP on an already-selected surface → open the
              // manual editor pre-loaded with this surface's polygon
              // (from its bbox, normalised to image coords) so the
              // user can refine it. We compute the starting polygon
              // here because RoomCanvas knows the natural image dims.
              if (isDoubleTap && activeIds.includes(id) && onEditExisting) {
                const nx = (v: number) => v / Math.max(1, imgSize.w);
                const ny = (v: number) => v / Math.max(1, imgSize.h);
                const bx = candidate.bbox.x;
                const by = candidate.bbox.y;
                const bw = candidate.bbox.w;
                const bh = candidate.bbox.h;
                const initial = {
                  points: [
                    [nx(bx), ny(by)] as [number, number],
                    [nx(bx + bw), ny(by)] as [number, number],
                    [nx(bx + bw), ny(by + bh)] as [number, number],
                    [nx(bx), ny(by + bh)] as [number, number],
                  ],
                  controls: [null, null, null, null] as (
                    | [number, number]
                    | null
                  )[],
                };
                onEditExisting(id, initial, {
                  x: nx(candidate.centroid.x),
                  y: ny(candidate.centroid.y),
                });
                return;
              }

              // Single tap → toggle in/out of the selection.
              setActiveIds((prev) => {
                const has = prev.includes(id);
                const next = has ? prev.filter((x) => x !== id) : [...prev, id];
                onFocusChange?.(has ? (next[next.length - 1] ?? null) : id);
                return next;
              });
              setActive(candidate);
              onRegionChange?.(candidate, id);
              return;
            }
          }
          // Tap landed somewhere new — fire SAM-2 to detect the surface
          // under the cursor. The new mask flows back through `aiMasks`
          // and the additive effect above auto-selects it.
          // Show the localised hazy ripple immediately for feedback;
          // the mask-arrival effect clears it on success, the safety
          // timeout below clears it if the request hangs / fails.
          // Sample the underlying canvas (which already reflects any
          // applied slab) to decide whether the ripple should be light
          // or dark for visibility against the surface.
          const isBright = sampleAreaIsBright(
            canvasRef.current,
            pt.relX,
            pt.relY
          );
          const tap = { relX: pt.relX, relY: pt.relY, isBright };
          setPendingTap(tap);
          window.setTimeout(() => {
            setPendingTap((current) =>
              current && current.relX === tap.relX && current.relY === tap.relY
                ? null
                : current
            );
          }, 30000);
          onPointTap(pt.relX, pt.relY);
          return;
        }

        // Fallback: tap-based flood fill for environments where the
        // SAM-2 endpoint isn't wired up at all.
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
      // imgSize.h/w and onEditExisting intentionally omitted — they're
      // referenced in the closure but only matter on the next user
      // interaction (not on render); including them would re-bind the
      // handler on every imgSize change and reset interaction state.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        precomputed,
        aiSurfaces,
        onRegionChange,
        onPointTap,
        manualTap,
        activeIds,
        onFocusChange,
      ]
    );

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const pt = mapPointToImage(e);
      if (!pt) return;

      if (precomputed.length > 0) {
        let found: string | null = null;
        for (const { surface, candidate } of precomputed) {
          // Polygon hit-test for polygon surfaces, alpha-channel
          // hit-test for mask-URL surfaces.
          const hit = surface.polygon
            ? pointInPolygon([pt.relX, pt.relY], surface.polygon)
            : (() => {
                const mw = candidate.mask.width;
                const mh = candidate.mask.height;
                const mx = Math.floor(pt.relX * mw);
                const my = Math.floor(pt.relY * mh);
                if (mx < 0 || my < 0 || mx >= mw || my >= mh) return false;
                return candidate.mask.data[(my * mw + mx) * 4 + 3] > 128;
              })();
          if (hit) {
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
          setActiveIds([]);
          onRegionChange?.(null);
        },
      }),
      [onRegionChange]
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

    // Inline style for the inner transformed wrapper. Composes the
    // current zoom + pan into a single CSS transform. translate is
    // applied BEFORE scale so the pan offset is measured in pre-scaled
    // pixels (matches how we update pan in handlePanMove).
    const transformStyle: React.CSSProperties = zoomEnabled
      ? {
          transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "center center",
          transition: isPanning ? "none" : "transform 0.18s ease-out",
          cursor: isZoomed ? (isPanning ? "grabbing" : "grab") : "pointer",
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
        onMouseMove={(e) => {
          handlePanMove(e);
          handleMove(e);
        }}
        onMouseDown={handlePanStart}
        onMouseUp={handlePanEnd}
        onWheel={handleWheel}
        onMouseLeave={() => {
          handlePanEnd();
          setHoveredId(null);
        }}
      >
        {/* Inner transformed wrapper — canvas + overlay + badges
            scale and pan together. Loading overlay / manual editor /
            zoom buttons sit OUTSIDE this and stay fixed at native
            size so UI doesn't zoom with the photo. */}
        <div className="absolute inset-0 w-full h-full" style={transformStyle}>
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

          {/* Polygon hotspot badges — every surface stays visible so users
            can keep adding/removing selections after a slab is picked. */}
          {!loading &&
            precomputed.map(({ surface, candidate }, i) =>
              renderBadge({
                key: surface.id,
                cx: (candidate.centroid.x / imgSize.w) * 100,
                cy: (candidate.centroid.y / imgSize.h) * 100,
                isActive: activeIds.includes(surface.id),
                isHovered: hoveredId === surface.id,
                dotContent: activeIds.includes(surface.id) ? "✓" : i + 1,
                labelContent: surface.label,
                animationDelay: i * 0.05,
              })
            )}

          {/* AI mask hotspot badges — same multi-select treatment. */}
          {!loading &&
            aiSurfaces.map(({ id, label, candidate }, i) =>
              renderBadge({
                key: id,
                cx: (candidate.centroid.x / imgSize.w) * 100,
                cy: (candidate.centroid.y / imgSize.h) * 100,
                isActive: activeIds.includes(id),
                isHovered: hoveredId === id,
                dotContent: activeIds.includes(id) ? "✓" : i + 1,
                labelContent: label,
                animationDelay: i * 0.05,
              })
            )}

          {/* Localised tap-ripple — shows immediately on tap, replaces the
            full-canvas loading overlay with feedback at the click point.
            Two stacked layers: a soft hazy disc that spreads outward, and
            a tighter pulsing ring at the exact pixel. */}
          <AnimatePresence>
            {pendingTap && (
              <motion.div
                key="pending-ripple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute"
                style={{
                  left: `${pendingTap.relX * 100}%`,
                  top: `${pendingTap.relY * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Outer hazy bloom — inverted on bright surfaces. */}
                <motion.div
                  initial={{ scale: 0.4, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                  style={{
                    background: pendingTap.isBright
                      ? "radial-gradient(circle, rgba(10,22,32,0.55) 0%, rgba(10,22,32,0.20) 40%, transparent 70%)"
                      : "radial-gradient(circle, rgba(218,225,232,0.45) 0%, rgba(218,225,232,0.15) 40%, transparent 70%)",
                    backdropFilter: "blur(3px)",
                  }}
                />
                {/* Inner pulsing dot at the exact tap pixel */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.95, 0.7, 0.95] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={
                    pendingTap.isBright
                      ? "absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pacific-dark shadow-[0_0_16px_rgba(10,22,32,.85)]"
                      : "absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pacific-light shadow-[0_0_16px_rgba(218,225,232,.85)]"
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* ── End of inner transformed wrapper ─────────────────────
            Everything below this comment renders at native size and
            does NOT zoom/pan with the photo (loading overlay,
            manual editor, zoom controls). */}

        {/* Zoom controls — only visible on demo rooms. Three buttons
            in the top-right: zoom out, reset, zoom in. Reset is
            disabled (greyed) when already at 1×. */}
        {zoomEnabled && !loading && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-pacific-dark/85 border border-white/15 rounded-full p-1 shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              disabled={zoomLevel <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-full text-pacific-light hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Zoom out"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              disabled={zoomLevel === 1 && pan.x === 0 && pan.y === 0}
              className="px-2 h-7 flex items-center justify-center rounded-full text-[10px] tracking-[.2em] uppercase text-pacific-light hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors tabular-nums"
              aria-label="Reset zoom"
            >
              {zoomLevel.toFixed(1)}×
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              disabled={zoomLevel >= 4}
              className="w-7 h-7 flex items-center justify-center rounded-full text-pacific-light hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Zoom in"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        )}

        {/* Image-load / flood-fill / slab-apply overlay (covers the
            canvas). We keep this for the brief image-load, tap-flood-
            fill, and slab-swap recomposite states, but NOT for SAM-2
            point detection — the ripple above handles that without
            obscuring the rest of the photo. */}
        <AnimatePresence>
          {(loading || working || applyingSlab) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-pacific-dark/30 backdrop-blur-[2px] pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 text-pacific-light text-[11px] tracking-[.22em] uppercase bg-pacific-dark/85 border border-white/10 px-5 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {loading
                  ? "Loading scene"
                  : applyingSlab
                    ? "Applying slab"
                    : "Selecting"}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual frame editor — shown when SAM-2 missed and the user
            needs to draw the surface boundary themselves. Has corner
            drag, edge-click-to-add-corner, undo, and curve toggle. */}
        {manualTap && onManualConfirm && onManualCancel && (
          <ManualFrameEditor
            tap={manualTap}
            initialPolygon={manualInitialPolygon}
            imgW={imgSize.w}
            imgH={imgSize.h}
            onConfirm={onManualConfirm}
            onCancel={onManualCancel}
          />
        )}
      </div>
    );
  }
);

/* -------------------- helpers -------------------- */

/**
 * Sample a small area around a normalised (0-1) tap point on a canvas
 * and return true if the average luminance is bright (i.e. above
 * mid-grey). Used to decide whether the tap-ripple animation should be
 * dark (visible against bright surfaces) or light (visible against
 * dark surfaces).
 */
function sampleAreaIsBright(
  canvas: HTMLCanvasElement | null,
  relX: number,
  relY: number
): boolean {
  if (!canvas) return false;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const cx = Math.floor(relX * canvas.width);
  const cy = Math.floor(relY * canvas.height);
  const sample = 12;
  const x = Math.max(0, Math.min(canvas.width - sample, cx - sample / 2));
  const y = Math.max(0, Math.min(canvas.height - sample, cy - sample / 2));
  try {
    const data = ctx.getImageData(x, y, sample, sample).data;
    let sumLum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sumLum += 0.299 * r + 0.587 * g + 0.114 * b;
      count++;
    }
    return count > 0 && sumLum / count > 140;
  } catch {
    // CORS-tainted canvas → can't read pixels. Fall back to light ripple.
    return false;
  }
}

/**
 * Render a numbered badge anchored at a percentage position on the canvas.
 *
 * Edge-aware: when the centroid is in the right portion of the canvas, the
 * label flips to the left side of the dot so it doesn't overflow past the
 * canvas's `overflow-hidden` wrapper. Vertical position is also nudged
 * inward when the badge would otherwise be clipped at the top or bottom.
 */
function renderBadge({
  key,
  cx,
  cy,
  isActive,
  isHovered,
  dotContent,
  labelContent,
  animationDelay,
}: {
  key: string;
  cx: number;
  cy: number;
  isActive: boolean;
  isHovered: boolean;
  dotContent: ReactNode;
  labelContent: ReactNode;
  animationDelay: number;
}) {
  // Flip the label to the LEFT of the dot when the centroid is in the
  // right ~30% of the canvas. Without this the label runs past the right
  // edge and gets clipped by the wrapper's overflow-hidden.
  const labelOnLeft = cx > 70;

  // Vertical anchoring: if the centroid is right at the top edge, anchor
  // the badge so it extends DOWN (instead of being centered, which clips
  // the top half). Same idea at the bottom.
  const translateY = cy < 8 ? "0%" : cy > 92 ? "-100%" : "-50%";

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: isHovered ? 1.06 : 1 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="pointer-events-none absolute"
      style={{
        left: `${cx}%`,
        top: `${cy}%`,
        transform: `translate(-50%, ${translateY})`,
      }}
    >
      <div
        className={`flex items-center gap-2 ${labelOnLeft ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ring-2 shrink-0 ${
            isActive
              ? "bg-pacific-light text-pacific-dark ring-pacific-light/60 shadow-[0_0_24px_rgba(218,225,232,.55)]"
              : isHovered
                ? "bg-white text-pacific-dark ring-white/60 shadow-[0_0_18px_rgba(218,225,232,.35)]"
                : "bg-pacific-dark/85 text-pacific-light ring-white/50 backdrop-blur"
          }`}
        >
          {dotContent}
        </div>
        <div
          className={`text-[10px] tracking-[.22em] uppercase px-2.5 py-1 rounded bg-pacific-dark/85 backdrop-blur-md border whitespace-nowrap transition-colors ${
            isActive
              ? "border-pacific-light/50 text-pacific-light"
              : "border-white/10 text-white/90"
          }`}
        >
          {labelContent}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Point-in-polygon test (ray casting). `point` and polygon verts in the same
 * (usually normalised) coordinate space.
 */
function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
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
  }: {
    fillAlpha: number;
    strokeAlpha: number;
    strokeWidth: number;
    dashed: boolean;
  }
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
  // Only stroke if both width and alpha are non-zero. Some browsers
  // draw a 1px default line when lineWidth=0 is set explicitly.
  if (strokeWidth > 0 && strokeAlpha > 0) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
    if (dashed) ctx.setLineDash([14, 10]);
    ctx.stroke();
  }
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
  }: { fillAlpha: number; strokeAlpha: number; strokeWidth: number }
) {
  const { width: w, height: h, data } = mask;
  // Destination overlay is at canvas size (downsampled to ≤1600px), but
  // the mask is at the image's natural size. Scale everything we draw to
  // dst into dst dimensions so the outline traces the full surface.
  const dstW = ctx.canvas.width;
  const dstH = ctx.canvas.height;

  // Soft fill (only when fillAlpha > 0). This is what we use for the
  // hover overlay now that the marching-ants stroke is gone.
  if (fillAlpha > 0) {
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
    ctx.drawImage(fill, 0, 0, dstW, dstH);
  }

  // Edge stroke — skipped entirely when stroke is invisible (we now
  // never draw it in the main flow, but the parameter still exists for
  // any future callers that want a marching-ants effect back).
  if (strokeAlpha <= 0 || strokeWidth <= 0) return;

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
  ctx.drawImage(edgeCanvas, 0, 0, dstW, dstH);
}
