"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Slab } from "@/data/slabs";

interface SlabPickerProps {
  slabs: Slab[];
  active: Slab | null;
  onPick: (s: Slab) => void;
}

export function SlabPicker({ slabs, active, onPick }: SlabPickerProps) {
  return (
    <div className="relative">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[.28em] uppercase text-pacific-mid">
            Apply a slab
          </div>
          <div className="text-pacific-light/90 text-sm mt-1">
            {active ? active.name : "Select a finish to preview it in place"}
          </div>
        </div>
        {active && (
          <div className="text-[10px] tracking-[.22em] uppercase text-pacific-mid">
            {active.collection} · {active.pattern}
          </div>
        )}
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
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-[9px] tracking-[.1em] uppercase text-white/90 text-left leading-tight line-clamp-2">
                    {s.name}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-pacific-light flex items-center justify-center">
                    <Check className="w-3 h-3 text-pacific-dark" strokeWidth={3} />
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
