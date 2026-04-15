"use client";

import { useMemo, useRef, useState } from "react";
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
import { useSegment } from "./use-segment";

/**
 * Top-level orchestrator for the Visualize experience.
 *
 * Two-stage UI:
 *   1. Intake screen: compact editorial head + upload / demo room picker
 *   2. Workspace: full-bleed canvas as the hero, slab dock along the bottom,
 *      inspector panel on the right (collapsible on smaller screens)
 */
export function VisualizeClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<DemoRoom | null>(null);
  const [activeSlab, setActiveSlab] = useState<Slab | null>(null);
  const [activeRegion, setActiveRegion] = useState<SurfaceCandidate | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const canvasRef = useRef<RoomCanvasHandle>(null);
  const { masks: aiMasks, loading: segLoading, error: segError, run: runSegment, clear: clearSegment } = useSegment();

  // Curate a focused slab shortlist for the picker — all 22 is noisy here.
  const curated = useMemo(() => {
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
    const byId = new Map(ALL_SLABS.map((s) => [s.id, s] as const));
    const picked: Slab[] = [];
    for (const id of preferredOrder) {
      const s = byId.get(id);
      if (s) picked.push(s);
    }
    for (const s of ALL_SLABS) if (!picked.includes(s)) picked.push(s);
    return picked;
  }, []);

  // When user uploads their own photo, trigger AI segmentation
  const handleUserUpload = (dataUrl: string) => {
    setActiveDemo(null);
    setImageSrc(dataUrl);
    clearSegment();
    // Fire off AI segmentation in the background
    runSegment(dataUrl);
  };

  const handleReset = () => {
    setImageSrc(null);
    setActiveDemo(null);
    setActiveSlab(null);
    setActiveRegion(null);
    clearSegment();
  };

  const handleExport = () => {
    const url = canvasRef.current?.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacific-visualizer-${activeSlab?.slug ?? "preview"}.png`;
    a.click();
  };

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
            <a
              href="/"
              className="inline-flex items-center gap-2 text-pacific-mid hover:text-pacific-light transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back home
            </a>
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
              Upload a photo. Our detector finds your countertop. Apply any Pacific
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
                    Auto-detection works best with well-lit interiors at eye
                    level. Angled or partially obstructed counters may need a
                    manual tap.
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
          <button
            onClick={() => canvasRef.current?.reset()}
            className="inline-flex items-center gap-1.5 text-pacific-mid hover:text-pacific-light text-[10px] tracking-[.2em] uppercase px-3 py-1.5 border border-white/10 rounded-full hover:border-white/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={handleExport}
            disabled={!activeRegion || !activeSlab}
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
              activeSlab={activeSlab}
              polygons={activeDemo?.surfaces}
              aiMasks={!activeDemo ? aiMasks : undefined}
              segLoading={segLoading}
              segError={segError}
              canvasRef={canvasRef}
              setActiveRegion={setActiveRegion}
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
                  ? "AI is detecting surfaces in your photo…"
                  : !activeRegion
                    ? aiMasks.length > 0
                      ? "Surfaces detected. Tap a highlighted area to select it."
                      : "Tap the countertop to select it. Use ⇧ + tap to extend or ⌥ + tap to trim."
                    : !activeSlab
                      ? "Surface selected. Pick a slab below to preview it."
                      : `${activeSlab.name} applied. Tap another surface to re-select.`}
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
              <InspectorContents slab={activeSlab} region={activeRegion} />
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
          active={activeSlab}
          onPick={setActiveSlab}
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
            <InspectorContents slab={activeSlab} region={activeRegion} />
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
  activeSlab,
  polygons,
  aiMasks,
  segLoading,
  segError,
  canvasRef,
  setActiveRegion,
}: {
  src: string;
  activeSlab: Slab | null;
  polygons?: DemoSurface[];
  aiMasks?: import("./use-segment").AIMask[];
  segLoading?: boolean;
  segError?: string | null;
  canvasRef: React.RefObject<RoomCanvasHandle | null>;
  setActiveRegion: (c: SurfaceCandidate | null) => void;
}) {
  return (
    <div className="relative w-full h-full">
      <RoomCanvas
        ref={canvasRef}
        src={src}
        activeSlab={activeSlab}
        polygons={polygons}
        aiMasks={aiMasks}
        onRegionChange={setActiveRegion}
        fill
      />
      {/* AI segmentation loading overlay */}
      <AnimatePresence>
        {segLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="flex items-center gap-3 text-pacific-light text-xs tracking-[.22em] uppercase bg-pacific-dark/85 border border-white/10 px-5 py-3 rounded-full backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI detecting surfaces…
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* AI error */}
      {segError && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-red-900/80 border border-red-500/40 text-red-200 text-xs px-4 py-2 rounded-lg backdrop-blur-xl">
            AI detection failed: {segError}. You can still tap to select surfaces manually.
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
            <div className="absolute inset-0" style={{ backgroundImage: slab.swatch }} />
            {slab.overlay && (
              <div
                className="absolute inset-0 mix-blend-overlay opacity-80"
                style={{ backgroundImage: slab.overlay }}
              />
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
            <dd className="text-pacific-light">{slab.thicknesses.join(", ")}</dd>
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Tone
            </dt>
            <dd className="text-pacific-light capitalize">{slab.hues.join(", ")}</dd>
            <dt className="text-pacific-mid text-xs tracking-[.14em] uppercase self-center">
              Ribbon
            </dt>
            <dd className="text-pacific-light capitalize">{slab.ribbon ?? "—"}</dd>
          </dl>
          <a
            href="/catalogue"
            className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-pacific-light text-pacific-dark text-[10px] tracking-[.22em] uppercase px-4 py-2.5 rounded-full hover:bg-white transition-colors"
          >
            Request a sample
            <ArrowUpRight className="w-3 h-3" />
          </a>
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
            Upload a photo. Our AI detects countertops, islands, and more.
          </li>
          <li className="flex gap-3">
            <span className="text-pacific-mid w-4 shrink-0">02</span>
            <span>
              Tap a highlighted surface to select it, or tap elsewhere to
              manually pick a region.
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
