"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Box,
  Download,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import { slabs as ALL_SLABS, type Slab } from "@/data/slabs";
import { UploadZone } from "./UploadZone";
import { DemoRoomStrip } from "./DemoRoomStrip";
import { RoomCanvas, type RoomCanvasHandle } from "./RoomCanvas";
import { SlabPicker } from "./SlabPicker";
import type { SurfaceCandidate } from "./surface-detection";
import type { DemoRoom, DemoSurface } from "./demo-rooms";
import { useDepth, useSegment } from "./use-segment";

/**
 * Top-level orchestrator for the Visualize experience.
 *
 * Two-stage UI:
 *   1. Intake screen: compact editorial head + upload / demo room picker
 *   2. Workspace: full-bleed canvas as the hero, slab dock along the bottom,
 *      inspector panel on the right (collapsible on smaller screens)
 */
interface VisualizeClientProps {
  /** Slabs fetched from Sanity (mirrors the products page). Falls back to
   *  the hardcoded local catalogue if empty / not provided. */
  sanitySlabs?: Slab[];
}

export function VisualizeClient({ sanitySlabs }: VisualizeClientProps = {}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<DemoRoom | null>(null);
  // PER-SURFACE COLOURS: each selected surface (by its mask id) maps
  // to its own slab. Tapping a surface focuses it; picking a slab
  // from the dock assigns it to the focused surface only — other
  // selected surfaces keep their existing slabs.
  const [surfaceSlabs, setSurfaceSlabs] = useState<Record<string, Slab>>({});
  // The "focused" surface — the most recently tapped one. The slab
  // picker shows this surface's current slab as the active swatch
  // and assigns picks to this surface.
  const [focusedSurfaceId, setFocusedSurfaceId] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<SurfaceCandidate | null>(
    null
  );
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const canvasRef = useRef<RoomCanvasHandle>(null);

  // The slab currently being shown as "active" in the picker — the
  // one assigned to the focused surface, if any.
  const focusedSlab = focusedSurfaceId
    ? (surfaceSlabs[focusedSurfaceId] ?? null)
    : null;
  const {
    masks: aiMasks,
    loading: segLoading,
    error: segError,
    runPoint: runPointSegment,
    addManualMask,
    removeMask,
    clear: clearSegment,
  } = useSegment();

  // When SAM-2 misses (or the user explicitly opens manual mode), this
  // holds the tap that should become the centre of the manual frame.
  // RoomCanvas reads this to render the draggable polygon editor.
  const [pendingManualTap, setPendingManualTap] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // When set, the manual editor opens with this polygon as its starting
  // shape (used by the "double-tap to edit existing surface" flow).
  const [pendingInitialPolygon, setPendingInitialPolygon] = useState<{
    points: [number, number][];
    controls: ([number, number] | null)[];
  } | null>(null);
  // The id of the AI mask being edited. When the user confirms, we
  // remove this mask and add the freshly-edited polygon in its place.
  const [editingMaskId, setEditingMaskId] = useState<string | null>(null);

  // Phase 1 — depth-aware perspective. We fetch a depth map for the
  // uploaded image in the background. RoomCanvas uses it (when ready)
  // to estimate each surface's plane orientation and warp the slab in
  // perspective so it follows the surface like a real installation.
  const { run: runDepth, clear: clearDepth } = useDepth();

  // Tap-to-detect: when the user taps the canvas, run SAM-2. If
  // SAM-2 succeeds, the mask flows back through `aiMasks` and
  // RoomCanvas auto-selects it. If SAM-2 misses, set
  // `pendingManualTap` so RoomCanvas opens the draggable manual frame.
  const handlePointTap = useCallback(
    async (relX: number, relY: number) => {
      if (!imageSrc || activeDemo) return;
      const result = await runPointSegment(imageSrc, relX, relY);
      if (result.kind === "manual") {
        setPendingManualTap(result.tap);
      }
    },
    [imageSrc, activeDemo, runPointSegment]
  );

  // Called by RoomCanvas when the user confirms the manual frame.
  // The polygon can have any number of points (>= 3) and per-edge
  // bezier control points for curves. We rasterise it client-side.
  // If we were editing an existing mask, remove the old one first.
  const handleManualConfirm = useCallback(
    (
      points: [number, number][],
      controls: ([number, number] | null)[],
      imgW: number,
      imgH: number
    ) => {
      if (editingMaskId) removeMask(editingMaskId);
      addManualMask(points, controls, imgW, imgH);
      setPendingManualTap(null);
      setPendingInitialPolygon(null);
      setEditingMaskId(null);
    },
    [addManualMask, removeMask, editingMaskId]
  );

  const handleManualCancel = useCallback(() => {
    setPendingManualTap(null);
    setPendingInitialPolygon(null);
    setEditingMaskId(null);
  }, []);

  // Called by RoomCanvas when the user double-taps an already-selected
  // AI surface. RoomCanvas has already done the bbox-to-normalised
  // conversion, so we just hand the polygon to the editor and remember
  // which mask we're replacing.
  const handleEditExisting = useCallback(
    (
      surfaceId: string,
      initialPolygon: {
        points: [number, number][];
        controls: ([number, number] | null)[];
      },
      centerTap: { x: number; y: number }
    ) => {
      setPendingInitialPolygon(initialPolygon);
      setPendingManualTap(centerTap);
      setEditingMaskId(surfaceId);
    },
    []
  );

  // Curate a focused slab shortlist for the picker — all 22 is noisy here.
  // Prefer Sanity-managed products (so the visualizer always reflects what
  // editors publish on the products page); fall back to the hardcoded list.
  const curated = useMemo(() => {
    const source =
      sanitySlabs && sanitySlabs.length > 0 ? sanitySlabs : ALL_SLABS;

    const preferredOrder = [
      "calacatta-pacifica",
      "calacatta-themis",
      "lumina-cristal",
      "bianco-luce",
      "winter-haze-p12",
      "nara-natural",
      "desert-brown-4013",
      "kedar-amazonik",
      "zira-dorado",
      "graphite-matter",
      "atlantic-deep",
      "midnight-obsidian",
      "nero-statuario",
    ];
    // Sanity slabs use product slug; local slabs use id. Try both.
    const bySlug = new Map(source.map((s) => [s.slug, s] as const));
    const byId = new Map(source.map((s) => [s.id, s] as const));
    const picked: Slab[] = [];
    for (const key of preferredOrder) {
      const s = bySlug.get(key) ?? byId.get(key);
      if (s && !picked.includes(s)) picked.push(s);
    }
    for (const s of source) if (!picked.includes(s)) picked.push(s);
    return picked;
  }, [sanitySlabs]);

  // When user uploads their own photo, start with a clean canvas. We
  // skip the AMG auto-detect pass on purpose — tap-to-detect gives
  // precise per-surface control. We DO kick off depth estimation in
  // the background so it's ready by the time the user picks a slab,
  // enabling perspective-correct slab placement.
  const handleUserUpload = (dataUrl: string) => {
    setActiveDemo(null);
    setImageSrc(dataUrl);
    clearSegment();
    clearDepth();
    runDepth(dataUrl);
  };

  const handleReset = () => {
    setImageSrc(null);
    setActiveDemo(null);
    setSurfaceSlabs({});
    setFocusedSurfaceId(null);
    setActiveRegion(null);
    clearSegment();
  };

  const handleExport = () => {
    const url = canvasRef.current?.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacific-visualizer-${focusedSlab?.slug ?? "preview"}.png`;
    a.click();
  };

  // Slab picker → assigns the chosen slab to the focused surface only.
  // Other selected surfaces keep their existing slabs, so the user can
  // build up a multi-colour scene one surface at a time.
  const handlePickSlab = useCallback(
    (slab: Slab) => {
      if (!focusedSurfaceId) return;
      setSurfaceSlabs((prev) => ({ ...prev, [focusedSurfaceId]: slab }));
    },
    [focusedSurfaceId]
  );

  // Apply the focused surface's slab (if any) to ALL currently
  // selected surfaces. Useful when the user wants the "same colour
  // everywhere" old behaviour without picking the slab N times.
  const handleApplyToAll = useCallback(
    (allActiveIds: string[]) => {
      if (!focusedSlab) return;
      setSurfaceSlabs((prev) => {
        const next = { ...prev };
        for (const id of allActiveIds) next[id] = focusedSlab;
        return next;
      });
    },
    [focusedSlab]
  );

  // -------------------- Intake screen --------------------
  if (!imageSrc) {
    return (
      <main className="min-h-screen bg-[#0a1620] text-pacific-light">
        <div
          className="pointer-events-none fixed inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 30% 10%, rgba(154,168,182,.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(218,225,232,.06) 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-24">
          <div className="flex items-center justify-between mb-10 md:mb-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-pacific-mid hover:text-pacific-light transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back home
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/visualize/showroom"
                className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.22em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
              >
                <Box className="w-3 h-3" />
                3D showroom
              </Link>
              <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[.24em] uppercase text-pacific-mid">
                <Sparkles className="w-3.5 h-3.5" />
                Pacific visualiser · beta
              </div>
            </div>
          </div>

          <header className="mb-10 md:mb-14 max-w-3xl">
            <div className="text-[10px] md:text-xs tracking-[.28em] uppercase text-pacific-mid mb-5">
              See it in your space
            </div>
            <h1
              className="font-light tracking-tight leading-[.9]"
              style={{ fontSize: "clamp(40px, 6.5vw, 108px)" }}
            >
              Every slab,
              <br />
              <em className="italic font-extralight text-pacific-mid">
                in your kitchen.
              </em>
            </h1>
            <p className="mt-6 text-pacific-mid/90 text-base md:text-lg max-w-xl leading-relaxed">
              Upload a photo. Tap any surface to select it. Apply any Pacific
              slab to see the finished look — photoreal in seconds, no measuring
              required.
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-[1.2fr_1fr] gap-6"
          >
            <UploadZone onImage={handleUserUpload} />
            <div className="rounded-2xl border border-white/10 bg-white/[.02] p-6">
              <DemoRoomStrip
                activeId={activeDemo?.id}
                onPick={(r) => {
                  setActiveDemo(r);
                  setImageSrc(r.src);
                  clearSegment(); // demo rooms use hand-curated polygons, not AI
                }}
              />
              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-pacific-mid leading-relaxed">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>
                    Tap-to-detect works best on well-lit, uncluttered surfaces.
                    Tap each surface you want to swap; they all take the same
                    slab.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // -------------------- Workspace screen --------------------
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a1620] text-pacific-light flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 h-14 px-4 md:px-6 flex items-center justify-between border-b border-white/8 bg-pacific-dark/60 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-pacific-mid hover:text-pacific-light transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">New scene</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[.24em] uppercase text-pacific-mid">
            <Sparkles className="w-3.5 h-3.5" />
            Pacific visualiser · beta
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/visualize/showroom"
            className="hidden md:inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <Box className="w-3 h-3" />
            3D showroom
          </Link>
          {/* Explicit entry point into manual mode — opens the editor
              centred on the canvas without waiting for SAM-2 to fail. */}
          <button
            onClick={() => setPendingManualTap({ x: 0.5, y: 0.5 })}
            disabled={!imageSrc || !!pendingManualTap}
            className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Box className="w-3 h-3" />
            Manual surface
          </button>
          <button
            onClick={() => canvasRef.current?.reset()}
            className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={handleExport}
            disabled={!activeRegion || !focusedSlab}
            className="inline-flex items-center gap-1.5 bg-pacific-light text-pacific-dark text-[10px] tracking-[.2em] uppercase px-3 py-1.5 rounded-full hover:bg-white disabled:opacity-40 disabled:hover:bg-pacific-light transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={() => setInspectorOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 border border-white/10 rounded-full hover:border-white/30 transition-colors"
            aria-label="Toggle info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main stage + inspector */}
      <div className="flex-1 min-h-0 flex">
        {/* Canvas stage */}
        <section className="relative flex-1 min-w-0 p-4 md:p-6 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <StageCanvas
              src={imageSrc}
              surfaceSlabs={surfaceSlabs}
              polygons={activeDemo?.surfaces}
              aiMasks={!activeDemo ? aiMasks : undefined}
              segLoading={segLoading}
              segError={segError}
              canvasRef={canvasRef}
              setActiveRegion={setActiveRegion}
              onPointTap={handlePointTap}
              onFocusChange={setFocusedSurfaceId}
              manualTap={pendingManualTap}
              manualInitialPolygon={pendingInitialPolygon}
              onManualConfirm={handleManualConfirm}
              onManualCancel={handleManualCancel}
              onEditExisting={handleEditExisting}
            />
          </div>

          {/* Floating status line */}
          <div className="pointer-events-none absolute left-6 bottom-6 right-6 md:left-10 md:right-10 flex items-end justify-between gap-4">
            <div className="pointer-events-auto bg-pacific-dark/70 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/10 max-w-md">
              <div className="text-[10px] tracking-[.24em] uppercase text-pacific-mid mb-1">
                Status
              </div>
              <div className="text-pacific-light text-sm">
                {segLoading
                  ? "Detecting the surface you tapped…"
                  : !activeRegion
                    ? aiMasks.length > 0
                      ? `${aiMasks.length} surface${aiMasks.length > 1 ? "s" : ""} selected. Tap another surface to add it, or pick a slab below.`
                      : "Tap any surface in the photo to select it."
                    : !focusedSlab
                      ? "Surface selected. Pick a slab below to apply it. Tap another surface to focus it and pick a different slab."
                      : `${focusedSlab.name} applied to focused surface. Tap others to add/colour them.`}
              </div>
            </div>
          </div>
        </section>

        {/* Inspector — collapsible on mobile */}
        <AnimatePresence>
          {inspectorOpen && (
            <motion.aside
              key="inspector"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden lg:flex w-[340px] shrink-0 border-l border-white/8 bg-pacific-dark/40 backdrop-blur-xl flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid">
                  Inspector
                </div>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="text-pacific-mid hover:text-pacific-light"
                  aria-label="Hide inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <InspectorContents slab={focusedSlab} region={activeRegion} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Reopen button when inspector is closed (desktop) */}
        {!inspectorOpen && (
          <button
            onClick={() => setInspectorOpen(true)}
            className="hidden lg:flex absolute right-6 top-20 z-10 w-9 h-9 items-center justify-center bg-pacific-dark/70 backdrop-blur-xl border border-white/10 rounded-full hover:border-white/40 text-pacific-mid hover:text-pacific-light transition-colors"
            aria-label="Show inspector"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Slab dock */}
      <div className="shrink-0 border-t border-white/8 bg-pacific-dark/60 backdrop-blur-xl px-4 md:px-6 py-4">
        <SlabPicker
          slabs={curated}
          active={focusedSlab}
          onPick={handlePickSlab}
          focusedSurfaceLabel={
            focusedSurfaceId
              ? `surface ${aiMasks.findIndex((m) => m.id === focusedSurfaceId) + 1 || "?"}`
              : null
          }
          canApplyToAll={!!focusedSlab && aiMasks.length >= 2}
          onApplyToAll={() => handleApplyToAll(aiMasks.map((m) => m.id))}
        />
      </div>

      {/* Mobile inspector drawer */}
      <AnimatePresence>
        {inspectorOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed inset-x-0 bottom-0 top-24 z-40 bg-pacific-dark/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid">
                Inspector
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="text-pacific-mid hover:text-pacific-light"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <InspectorContents slab={focusedSlab} region={activeRegion} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* --------------------------------------------------------------------- *
 * Full-bleed canvas that preserves aspect ratio while filling the stage *
 * --------------------------------------------------------------------- */

function StageCanvas({
  src,
  surfaceSlabs,
  polygons,
  aiMasks,
  segError,
  canvasRef,
  setActiveRegion,
  onPointTap,
  onFocusChange,
  manualTap,
  manualInitialPolygon,
  onManualConfirm,
  onManualCancel,
  onEditExisting,
}: {
  src: string;
  surfaceSlabs: Record<string, Slab>;
  polygons?: DemoSurface[];
  aiMasks?: import("./use-segment").AIMask[];
  segLoading?: boolean;
  segError?: string | null;
  canvasRef: React.RefObject<RoomCanvasHandle | null>;
  setActiveRegion: (c: SurfaceCandidate | null) => void;
  onPointTap?: (relX: number, relY: number) => void;
  onFocusChange?: (id: string | null) => void;
  manualTap?: { x: number; y: number } | null;
  manualInitialPolygon?: {
    points: [number, number][];
    controls: ([number, number] | null)[];
  } | null;
  onManualConfirm?: (
    points: [number, number][],
    controls: ([number, number] | null)[],
    imgW: number,
    imgH: number
  ) => void;
  onManualCancel?: () => void;
  onEditExisting?: (
    surfaceId: string,
    initialPolygon: {
      points: [number, number][];
      controls: ([number, number] | null)[];
    },
    centerTap: { x: number; y: number }
  ) => void;
}) {
  return (
    <div className="relative w-full h-full">
      <RoomCanvas
        ref={canvasRef}
        src={src}
        surfaceSlabs={surfaceSlabs}
        polygons={polygons}
        aiMasks={aiMasks}
        onRegionChange={setActiveRegion}
        onPointTap={onPointTap}
        onFocusChange={onFocusChange}
        manualTap={manualTap}
        manualInitialPolygon={manualInitialPolygon ?? undefined}
        onManualConfirm={onManualConfirm}
        onManualCancel={onManualCancel}
        onEditExisting={onEditExisting}
        fill
      />
      {/* SAM-2 point-detect feedback is rendered as a localised ripple at
          the tap location inside RoomCanvas itself — no full-canvas
          overlay here. */}
      {/* AI error */}
      {segError && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-red-900/80 border border-red-500/40 text-red-200 text-xs px-4 py-2 rounded-lg backdrop-blur-xl">
            AI detection failed: {segError}. You can still tap to select
            surfaces manually.
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------- Inspector content (shared desktop/mobile) --------------- */

function InspectorContents({
  slab,
  region,
}: {
  slab: Slab | null;
  region: SurfaceCandidate | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {slab ? (
        <div>
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] ring-1 ring-white/10 mb-4">
            {slab.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slab.photoUrl}
                alt={slab.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: slab.swatch }}
                />
                {slab.overlay && (
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-80"
                    style={{ backgroundImage: slab.overlay }}
                  />
                )}
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              <div className="text-pacific-light text-lg leading-tight">
                {slab.name}
              </div>
              <div className="text-pacific-mid text-xs">
                {slab.collection} · {slab.pattern}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Finishes
            </dt>
            <dd className="text-pacific-light">{slab.finishes.join(", ")}</dd>
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Thickness
            </dt>
            <dd className="text-pacific-light">
              {slab.thicknesses.join(", ")}
            </dd>
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Tone
            </dt>
            <dd className="text-pacific-light capitalize">
              {slab.hues.join(", ")}
            </dd>
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Ribbon
            </dt>
            <dd className="text-pacific-light capitalize">
              {slab.ribbon ?? "—"}
            </dd>
          </dl>
          <Link
            href="/catalogue"
            className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-pacific-light text-pacific-dark text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:bg-white transition-colors"
          >
            Request a sample
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 p-4 text-sm text-pacific-mid">
          Pick a slab from the dock below to preview it on your scene.
        </div>
      )}

      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-3">
          Selection
        </div>
        {region ? (
          <div className="text-sm text-pacific-light">
            Surface locked.{" "}
            <span className="text-pacific-mid">
              {Math.round(region.bbox.w)} × {Math.round(region.bbox.h)} px ·
              confidence {(region.score * 100).toFixed(0)}
            </span>
          </div>
        ) : (
          <div className="text-sm text-pacific-mid">
            No surface selected yet. Tap a highlighted region in the scene.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-3">
          How it works
        </div>
        <ol className="space-y-2.5 text-sm text-pacific-light/85">
          <li className="flex gap-3">
            <span className="text-pacific-mid w-4 shrink-0">01</span>
            Upload a photo of any kitchen, bath, or work area.
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid w-4 shrink-0">02</span>
            <span>
              Tap each surface you want to swap. AI segments the surface under
              your finger in a couple of seconds.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid w-4 shrink-0">03</span>
            Pick a slab. We preserve your room&apos;s lighting while replacing
            the stone.
          </li>
        </ol>
      </div>
    </div>
  );
}
