"use client";

/**
 * FilterPill — a single filter control in the top bar.
 *
 * Click to open a popover (rendered as children). Shows an active-count
 * badge when the filter has selections. Click-outside handled by the
 * parent FilterBar so multiple pills share one listener.
 */

import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  label: string;
  count: number;          // how many selections are active for this filter
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;    // popover contents
}

export function FilterPill({ label, count, isOpen, onToggle, children }: Props) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
          "border transition-colors duration-200",
          count > 0 || isOpen
            ? "border-pacific-light bg-pacific-light text-pacific-dark"
            : "border-white/20 bg-white/5 text-pacific-light hover:bg-white/10 hover:border-pacific-mid/60",
        ].join(" ")}
      >
        <span>{label}</span>
        {count > 0 && (
          <span
            className={[
              "inline-flex items-center justify-center rounded-full px-1.5 min-w-[18px] h-[18px]",
              "text-[11px] font-semibold tabular-nums leading-none",
              "bg-pacific-dark text-pacific-light",
            ].join(" ")}
          >
            {count}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.2, 0.9, 0.3, 1] }}
            className={[
              "absolute left-0 top-full mt-2 z-50",
              "min-w-[320px] rounded-[14px] p-5",
              "bg-pacific-dark/95 backdrop-blur-xl",
              "border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
            ].join(" ")}
            // Prevent the filter bar click-outside handler from firing
            // when interacting INSIDE the popover.
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
