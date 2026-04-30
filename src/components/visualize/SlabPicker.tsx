"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Slab } from "@/data/slabs";

interface SlabPickerProps {
  slabs: Slab[];
  /** The slab assigned to the currently focused surface (used to
   *  highlight the active swatch). */
  active: Slab | null;
  /** Pick a slab — the parent assigns it to the focused surface only. */
  onPick: (s: Slab) => void;
  /** Optional label for the focused surface, shown so the user knows
   *  which surface their slab pick will be applied to. */
  focusedSurfaceLabel?: string | null;
  /** Show the "Apply to all selected" button (only when at least one
   *  surface already has a slab). */
  canApplyToAll?: boolean;
  /** Click handler for the "Apply to all" button — assigns the
   *  currently focused slab to every selected surface. */
  onApplyToAll?: () => void;
}

export function SlabPicker({
  slabs,
  active,
  onPick,
  focusedSurfaceLabel,
  canApplyToAll,
  onApplyToAll,
}: SlabPickerProps) {
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between mb-4 gap-3">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid">
            {focusedSurfaceLabel
              ? `Slab for ${focusedSurfaceLabel}`
              : "Apply a slab"}
          </div>
          <div className="text-pacific-light/90 text-sm mt-1 truncate">
            {active ? active.name : "Tap a surface, then pick a finish"}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {active && (
            <div className="hidden sm:block text-[10px] tracking-[.22em] uppercase text-pacific-mid">
              {active.collection} · {active.pattern}
            </div>
          )}
          {canApplyToAll && onApplyToAll && (
            <button
              onClick={onApplyToAll}
              className="text-[10px] tracking-[.22em] uppercase text-pacific-mid hover:text-pacific-light px-3 py-1.5 border border-white/15 rounded-full hover:border-white/40 transition-colors"
              title="Apply this slab to every selected surface"
            >
              Apply to all
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 scrollbar-thin">
        <div className="flex gap-3 px-1">
          {slabs.map((s) => {
            const isActive = active?.id === s.id;
            return (
              <motion.button
                key={s.id}
                onClick={() => onPick(s)}
                whileTap={{ scale: 0.97 }}
                className={`relative shrink-0 w-[88px] h-[108px] rounded-lg overflow-hidden ring-1 transition-all ${
                  isActive
                    ? "ring-pacific-light/90 shadow-[0_6px_28px_rgba(218,225,232,.18)]"
                    : "ring-white/10 hover:ring-white/30"
                }`}
                aria-label={s.name}
              >
                {/* ALWAYS render the procedural swatch + overlay as
                    the base layer. Two reasons:
                      1. Lazy-loaded photos take a moment to arrive,
                         and we never want users staring at empty
                         thumbnails while the dock scrolls.
                      2. If a Sanity photo fails to load (404, slow
                         CDN), the swatch keeps the slab visually
                         identifiable instead of dropping to a blank
                         tile.
                    The product photo, when present, is layered on top
                    with native lazy loading. Browser only fetches it
                    when the thumbnail enters the viewport. */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: s.swatch }}
                />
                {s.overlay && (
                  <div
                    className="absolute inset-0 opacity-80 mix-blend-overlay"
                    style={{ backgroundImage: s.overlay }}
                  />
                )}
                {s.photoUrl && (
                  // Real product photo from Sanity layered over the
                  // swatch. Lazy + async decode keeps the dock
                  // responsive when there are 13+ thumbnails. If the
                  // request fails the swatch beneath remains visible.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photoUrl.includes("cdn.sanity.io") ? s.photoUrl + (s.photoUrl.includes("?") ? "&" : "?") + "w=240&h=180&fit=crop&q=70&auto=format" : s.photoUrl}
                    alt={s.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-[9px] tracking-[.1em] uppercase text-white/90 text-left leading-tight line-clamp-2">
                    {s.name}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pacific-light flex items-center justify-center">
                    <Check
                      className="w-3 h-3 text-pacific-dark"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
