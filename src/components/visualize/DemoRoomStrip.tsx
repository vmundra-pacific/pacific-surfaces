"use client";

/**
 * DemoRoomStrip — three category sections stacked vertically:
 *   1. Kitchens
 *   2. Bathrooms
 *   3. Living Room
 *
 * Each section renders its rooms (filtered from DEMO_ROOMS by
 * `category`). Empty categories show a muted "Coming soon" placeholder
 * so the three-section structure stays visible even before all
 * categories have curated demos.
 */

import { motion } from "framer-motion";
import { DEMO_ROOMS, type DemoRoom } from "./demo-rooms";

interface DemoRoomStripProps {
  activeId?: string;
  onPick: (room: DemoRoom) => void;
}

// The categories we render, in order. Maps the user-facing label to
// the `category` value on each DemoRoom for filtering.
const SECTIONS: Array<{
  label: string;
  matchCategory: DemoRoom["category"];
}> = [
  { label: "Kitchens", matchCategory: "Kitchen" },
  { label: "Bathrooms", matchCategory: "Bathroom" },
  { label: "Living Room", matchCategory: "Living" },
];

export function DemoRoomStrip({ activeId, onPick }: DemoRoomStripProps) {
  return (
    <div className="space-y-7">
      {SECTIONS.map(({ label, matchCategory }) => {
        const rooms = DEMO_ROOMS.filter((r) => r.category === matchCategory);
        return (
          <section key={label}>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-[11px] tracking-[.28em] uppercase text-pacific-light font-medium">
                {label}
              </h3>
              <span className="text-[10px] text-pacific-mid/60 tabular-nums">
                {rooms.length === 0
                  ? "Coming soon"
                  : `${rooms.length} ${rooms.length === 1 ? "scene" : "scenes"}`}
              </span>
            </div>
            {rooms.length === 0 ? (
              // Empty-state placeholder — keeps the section visible
              // so the three-category structure reads even before a
              // category has demos. Subtle dashed border, muted copy.
              <div className="rounded-lg border border-dashed border-white/10 bg-white/[.015] py-8 px-4 text-center">
                <p className="text-[11px] tracking-[.05em] text-pacific-mid/60 font-light">
                  Curated {label.toLowerCase()} scenes are on the way.
                </p>
              </div>
            ) : (
              // Two-column grid for thumbnails on small screens, three
              // on medium+. Same card design as the previous strip:
              // 4/3 image, ring outline, label band at the bottom.
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rooms.map((r, i) => {
                  const isActive = r.id === activeId;
                  return (
                    <motion.button
                      key={r.id}
                      onClick={() => onPick(r)}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden ring-1 transition-all ${
                        isActive
                          ? "ring-pacific-light/90"
                          : "ring-white/10 hover:ring-white/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.thumb}
                        alt={r.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/75 to-transparent">
                        <div className="text-[9px] tracking-[.1em] uppercase text-white/90 text-left leading-tight truncate">
                          {r.label}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
