"use client";

import { motion } from "framer-motion";
import { DEMO_ROOMS, type DemoRoom } from "./demo-rooms";

interface DemoRoomStripProps {
  activeId?: string;
  onPick: (room: DemoRoom) => void;
}

export function DemoRoomStrip({ activeId, onPick }: DemoRoomStripProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid">
          Or try a demo room
        </div>
        <div className="text-[10px] text-pacific-mid/60">
          {DEMO_ROOMS.length} scenes
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {DEMO_ROOMS.map((r, i) => {
          const isActive = r.id === activeId;
          return (
            <motion.button
              key={r.id}
              onClick={() => onPick(r)}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
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
    </div>
  );
}
