"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  // "Coming soon" modal — fired by the 3D showroom buttons in both
  // the intake screen and the workspace header.
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const canvasRef = useRef<RoomCanvasHandle>(null);

  // Lock the page scroll while the visualizer is mounted. Two reasons:
  //   1. The global `scrollbar-gutter: stable` rule (added in
  //      globals.css to stabilise the site header) reserves a vertical
  //      scrollbar gutter even on pages that don't actually scroll —
  //      that gutter was visible at the right edge of /visualize.
  //   2. When the inspector reaches its scroll bounds, the wheel event
  //      otherwise propagates to the body, scrolling the (mostly
  //      empty) page underneath. Locking body overflow keeps every
  //      wheel event inside the inspector or the slab dock.
  // We override the gutter to `auto` so no space is reserved on this
  // page, and restore the prior values when the visualizer unmounts.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevGutter = html.style.scrollbarGutter;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.scrollbarGutter = "auto";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.scrollbarGutter = prevGutter;
    };
  }, []);


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

  // ---- Surface-aware slab filtering ----
  // Some collections only make sense for specific surface types:
  //   - Integra (Sinks)        → only show when the focused surface
  //                              has "sink" in its label
  //   - Centrepiece Couture    → only show when the focused surface
  //                              has "table" in its label (small
  //                              feature tables, gallery centrepieces)
  // Editors label surfaces in demo-rooms.ts (or via Sanity) — so a
  // demo room marking its sink area `label: "Kitchen Sink"` will get
  // Integra options surfaced; everything else stays general.
  //
  // When no surface is focused yet, we hide both specialty
  // collections — the user hasn't picked a surface, so we don't yet
  // know which catalogue to show.
  const focusedSurface = useMemo(() => {
    if (!focusedSurfaceId) return null;
    // Demo room surfaces (polygons / masks) come from activeDemo.
    if (activeDemo) {
      return (
        activeDemo.surfaces.find((s) => s.id === focusedSurfaceId) ?? null
      );
    }
    // AI / SAM-2 surfaces from user uploads.
    return aiMasks.find((m) => m.id === focusedSurfaceId) ?? null;
  }, [focusedSurfaceId, activeDemo, aiMasks]);

  const focusedSurfaceLabel = (focusedSurface?.label ?? "").toLowerCase();

  const filteredCurated = useMemo(() => {
    const isSink = focusedSurfaceLabel.includes("sink");
    const isTable = focusedSurfaceLabel.includes("table");

    return curated.filter((slab) => {
      const col = (slab.collection ?? "").toLowerCase();
      const isIntegra = col.includes("integra");
      const isCentrepiece = col.includes("centrepiece");

      if (isSink) {
        // Sink surface: only Integra collection slabs.
        return isIntegra;
      }
      if (isTable) {
        // Small-table surface: only Centrepiece Couture.
        return isCentrepiece;
      }

      // General surfaces (countertop, vanity, backsplash, etc., or
      // unfocused state): show only the standard catalogue —
      // quartz collections, granite, semi-precious, exotic. Drop
      // specialty collections that have a dedicated surface type
      // (Integra sinks, Centrepiece tables) plus other niche
      // collections that don't fit a generic slab application.
      const specialtyDenylist = [
        "integra",
        "centrepiece",
        "fab creation",
        "ecosurface",
        "natural stone finish",
        "stone finish",
      ];
      return !specialtyDenylist.some((kw) => col.includes(kw));
    });
  }, [curated, focusedSurfaceLabel]);

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
        {/* pt-24 / pt-28 clears the site's fixed h-20 top navbar so
            "Back home" + the visualizer eyebrow no longer slide
            under it. Was pt-8 / pt-12 (just intra-page breathing
            room) which assumed there was no parent header. */}
        <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-24">
          <div className="flex items-center justify-between mb-10 md:mb-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-pacific-mid hover:text-pacific-light transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back home
            </Link>
            <div className="flex items-center gap-3">
              {/* 3D showroom — was a Link to /visualize/showroom; now
                  opens a "Coming soon" modal instead since the
                  showroom isn't ready for production users yet. */}
              <button
                type="button"
                onClick={() => setComingSoonOpen(true)}
                className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.22em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
              >
                <Box className="w-3 h-3" />
                3D showroom
              </button>
              {/* "· beta" removed per editorial direction. */}
              <div className="hidden md:flex items-center gap-2 text-[10px] tracking-[.24em] uppercase text-pacific-mid">
                <Sparkles className="w-3.5 h-3.5" />
                Pacific visualiser
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
              Pick a demo room below to see the visualiser in action — every
              surface is precision-mapped for photoreal results. Or upload your
              own photo to try tap-to-detect on your space.
            </p>
          </header>

          {/* Layout swapped + reweighted: Demo room takes the larger
              left column (1.4fr) since the curated rooms render
              best, and Upload-your-own sits on the right (1fr) as a
              secondary path. Was upload-left / demo-right with
              upload taking the larger column. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-[1.4fr_1fr] gap-6"
          >
            {/* PRIMARY: demo rooms — three category sections
                (Kitchens / Bathrooms / Living Room) rendered inside
                the card. The "Recommended" badge + "Start here"
                eyebrow + footer note were removed; the categorical
                sections now ARE the card. */}
            <div className="rounded-2xl border border-white/20 bg-white/[.04] p-6 lg:p-8 relative overflow-hidden">
              <DemoRoomStrip
                activeId={activeDemo?.id}
                onPick={(r) => {
                  setActiveDemo(r);
                  setImageSrc(r.src);
                  clearSegment(); // demo rooms use hand-curated polygons, not AI
                }}
              />
            </div>

            {/* SECONDARY: upload — narrower, less emphasis. Same
                UploadZone component; only the framing wrapper differs. */}
            <div className="rounded-2xl border border-white/10 bg-white/[.02] p-6 lg:p-8">
              <div className="text-[10px] md:text-xs tracking-[.28em] uppercase text-pacific-mid mb-4">
                Or upload your own
              </div>
              <UploadZone onImage={handleUserUpload} />
              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-pacific-mid leading-relaxed">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>
                    Tap-to-detect works best on well-lit, uncluttered surfaces.
                    Results vary with photo quality.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* "Coming soon" modal for the 3D showroom button. Lives
            outside the main scroll so it floats above everything. */}
        <ComingSoonModal
          open={comingSoonOpen}
          onClose={() => setComingSoonOpen(false)}
        />
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
            Pacific visualiser
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 3D showroom — opens "Coming soon" modal (same modal
              the intake screen uses). The 3D showroom route exists
              but isn't ready for production users yet. */}
          <button
            type="button"
            onClick={() => setComingSoonOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <Box className="w-3 h-3" />
            3D showroom
          </button>
          {/* Explicit entry point into manual mode — opens the editor
              centred on the canvas without waiting for SAM-2 to fail. */}
          <button
            onClick={() => setPendingManualTap({ x: 0.5, y: 0.5 })}
            disabled={!imageSrc || !!pendingManualTap}
            className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Box className="w-3 h-3" />
            <span className="hidden sm:inline">Manual surface</span>
          </button>
          <button
            onClick={() => canvasRef.current?.reset()}
            className="hidden md:inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleExport}
            disabled={!activeRegion || !focusedSlab}
            className="inline-flex items-center gap-1.5 bg-pacific-light text-pacific-dark text-[10px] tracking-[.2em] uppercase px-3 py-1.5 rounded-full hover:bg-white disabled:opacity-40 disabled:hover:bg-pacific-light transition-colors"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            Contact us
          </Link>
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
              className="hidden lg:flex w-[340px] shrink-0 border-l border-white/8 bg-pacific-dark/40 backdrop-blur-xl flex-col min-h-0 overscroll-contain"
            >
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/8">
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
              <InspectorContents
                slab={focusedSlab}
                region={activeRegion}
                surfaceLabel={focusedSurface?.label ?? null}
                surfaceCount={Object.keys(surfaceSlabs).length}
                totalSurfaces={
                  activeDemo ? activeDemo.surfaces.length : aiMasks.length
                }
              />
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

      {/* Slab dock — uses filteredCurated so specialty collections
          (Integra sinks / Centrepiece tables) only appear for the
          surface types they apply to, and general surfaces show only
          quartz / granite / semi-precious / exotic. Surface label
          drives the filter; see the focusedSurface + filteredCurated
          memos at the top of this component for the matching rules. */}
      <div className="shrink-0 border-t border-white/8 bg-pacific-dark/60 backdrop-blur-xl px-4 md:px-6 py-4">
        <SlabPicker
          slabs={filteredCurated}
          active={focusedSlab}
          onPick={handlePickSlab}
          focusedSurfaceLabel={
            focusedSurface?.label ??
            (focusedSurfaceId
              ? `surface ${aiMasks.findIndex((m) => m.id === focusedSurfaceId) + 1 || "?"}`
              : null)
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
            className="lg:hidden fixed inset-x-0 bottom-0 top-24 z-40 bg-pacific-dark/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col min-h-0"
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/8">
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
            <InspectorContents
              slab={focusedSlab}
              region={activeRegion}
              surfaceLabel={focusedSurface?.label ?? null}
              surfaceCount={Object.keys(surfaceSlabs).length}
              totalSurfaces={
                activeDemo ? activeDemo.surfaces.length : aiMasks.length
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Coming soon" modal — same instance as intake screen, mounted
          here too so it works from the workspace header's 3D showroom
          button. Modal is the same shared component either way. */}
      <ComingSoonModal
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
      />
    </main>
  );
}

/* --------------------------------------------------------------------- *
 * "Coming soon" modal for the 3D showroom button.                       *
 * Lightweight standalone component — small overlay with a centred       *
 * card. Doesn't reuse the larger OrderSampleModal because that has      *
 * form inputs we don't need here.                                       *
 * --------------------------------------------------------------------- */

function ComingSoonModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // z-[100] to clear all sticky / fixed siblings on the page
          className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-pacific-dark border border-white/10 rounded-2xl shadow-2xl px-8 py-10 max-w-md w-full text-center"
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full text-pacific-mid hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 mb-5">
              <Box className="w-6 h-6 text-pacific-light" strokeWidth={1.5} />
            </div>
            <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-2">
              3D Showroom
            </div>
            <h3 className="text-2xl font-light tracking-tight text-white mb-3">
              Coming soon.
            </h3>
            <p className="text-sm font-light text-pacific-mid leading-relaxed mb-6">
              An immersive walk-through of the Pacific catalogue is on the
              way. In the meantime, try the visualiser on a curated demo
              room — every surface is precision-mapped for photoreal
              previews.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] tracking-[0.25em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  surfaceLabel,
  surfaceCount,
  totalSurfaces,
}: {
  slab: Slab | null;
  region: SurfaceCandidate | null;
  surfaceLabel: string | null;
  surfaceCount: number;
  totalSurfaces: number;
}) {
  // Build a tidy slug for product-detail deep-links — falls back to
  // the catalogue if the slab doesn't carry one.
  const productHref = slab?.slug
    ? `/products/${slab.slug}`
    : "/catalogue";

  const scrollRef = useRef<HTMLDivElement>(null);
  // Hover-to-scroll: forward wheel events into our own scrollTop and
  // suppress the page-level handler. Without this, when the inner
  // content fits, wheel events fall through to the body even though
  // overflow-y-auto is set — so the user feels like nothing happens
  // when they hover over the inspector and try to flick scroll.
  const onInspectorWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop += e.deltaY;
    e.stopPropagation();
  };

  return (
    <div
      ref={scrollRef}
      onWheel={onInspectorWheel}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
    >
      {/* ─────────────── Surface state ─────────────── */}
      <section className="px-5 pt-5 pb-4 border-b border-white/8">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-2">
          Active surface
        </div>
        {surfaceLabel ? (
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-pacific-light text-base leading-tight capitalize truncate">
              {surfaceLabel}
            </div>
            {totalSurfaces > 0 && (
              <div className="text-[10px] text-pacific-mid tabular-nums shrink-0">
                {surfaceCount}/{totalSurfaces} coloured
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-pacific-mid font-light leading-relaxed">
            Tap a highlighted surface in the scene to begin.
          </div>
        )}
        {region && (
          <div className="mt-2 text-[10px] tracking-[.12em] uppercase text-pacific-mid/70 tabular-nums">
            {Math.round(region.bbox.w)} × {Math.round(region.bbox.h)} px ·
            confidence {(region.score * 100).toFixed(0)}%
          </div>
        )}
      </section>

      {/* ─────────────── Slab preview ─────────────── */}
      <section className="px-5 py-5 border-b border-white/8">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-3">
          Selected slab
        </div>
        {slab ? (
          <>
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
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-pacific-light text-base leading-tight font-light">
                  {slab.name}
                </div>
                <div className="text-pacific-mid text-[11px] tracking-[.04em]">
                  {slab.collection}
                  {slab.pattern ? ` · ${slab.pattern}` : ""}
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {slab.finishes?.length > 0 && (
                <>
                  <dt className="text-pacific-mid text-[10px] tracking-[.18em] uppercase self-center">
                    Finishes
                  </dt>
                  <dd className="text-pacific-light/90 font-light">
                    {slab.finishes.join(", ")}
                  </dd>
                </>
              )}
              {slab.thicknesses?.length > 0 && (
                <>
                  <dt className="text-pacific-mid text-[10px] tracking-[.18em] uppercase self-center">
                    Thickness
                  </dt>
                  <dd className="text-pacific-light/90 font-light">
                    {slab.thicknesses.join(", ")}
                  </dd>
                </>
              )}
              {slab.hues?.length > 0 && (
                <>
                  <dt className="text-pacific-mid text-[10px] tracking-[.18em] uppercase self-center">
                    Tone
                  </dt>
                  <dd className="text-pacific-light/90 font-light capitalize">
                    {slab.hues.join(", ")}
                  </dd>
                </>
              )}
              {slab.ribbon && (
                <>
                  <dt className="text-pacific-mid text-[10px] tracking-[.18em] uppercase self-center">
                    Ribbon
                  </dt>
                  <dd className="text-pacific-light/90 font-light capitalize">
                    {slab.ribbon}
                  </dd>
                </>
              )}
            </dl>
            <div className="mt-5 flex gap-2">
              <Link
                href={productHref}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-pacific-light text-pacific-dark text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:bg-white transition-colors"
              >
                View product
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <a
                href={`mailto:bindu@thepacific.group?subject=${encodeURIComponent(
                  `Sample Request - ${slab.name}`,
                )}&body=${encodeURIComponent(
                  `Hi Pacific team,\n\nI'd like to request a sample of ${slab.name}.\n\nThanks!`,
                )}`}
                className="inline-flex items-center justify-center gap-1.5 border border-white/20 text-pacific-light text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:border-white/50 transition-colors"
              >
                Sample
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[.02] p-5 text-center">
            <p className="text-sm text-pacific-mid font-light leading-relaxed">
              Pick a slab from the dock below to preview it on the focused
              surface.
            </p>
          </div>
        )}
      </section>

      {/* ─────────────── How it works ─────────────── */}
      <section className="px-5 py-5 border-b border-white/8">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-3">
          How it works
        </div>
        <ol className="space-y-3 text-sm text-pacific-light/80 font-light leading-relaxed">
          <li className="flex gap-3">
            <span className="text-pacific-mid text-[10px] tracking-[.18em] w-6 shrink-0 pt-0.5">
              01
            </span>
            <span>
              Start with a demo room or upload a photo of your own space.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid text-[10px] tracking-[.18em] w-6 shrink-0 pt-0.5">
              02
            </span>
            <span>
              Tap each surface you want to swap — countertops, vanities,
              splashbacks, sinks, tables.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid text-[10px] tracking-[.18em] w-6 shrink-0 pt-0.5">
              03
            </span>
            <span>
              Pick a slab from the dock. We keep the room&apos;s lighting and
              shadows so the preview reads true to life.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid text-[10px] tracking-[.18em] w-6 shrink-0 pt-0.5">
              04
            </span>
            <span>
              Export the result, or request a physical sample of the slab you
              love.
            </span>
          </li>
        </ol>
      </section>

      {/* ─────────────── Tips ─────────────── */}
      <section className="px-5 py-5">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid mb-3">
          Tips
        </div>
        <ul className="space-y-2 text-[12px] text-pacific-light/70 font-light leading-relaxed">
          <li className="flex gap-2">
            <span className="text-pacific-mid">·</span>
            Use bright, head-on photos for the most accurate detection.
          </li>
          <li className="flex gap-2">
            <span className="text-pacific-mid">·</span>
            Tap multiple surfaces to colour them independently — each keeps its
            own slab.
          </li>
          <li className="flex gap-2">
            <span className="text-pacific-mid">·</span>
            If AI misses, use Manual surface in the top bar to draw the area
            yourself.
          </li>
        </ul>
      </section>

      {/* Bottom safety pad so the last item never sits flush against
          the slab dock when the panel is mid-scroll. */}
      <div className="h-4" />
    </div>
  );
}
