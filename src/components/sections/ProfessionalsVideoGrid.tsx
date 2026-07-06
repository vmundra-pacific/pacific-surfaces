"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";

/**
 * ProfessionalsVideoGrid
 *
 * Click-to-play video grid used on /professionals/services and
 * /professionals/collaboration. Each card shows the first frame of an
 * MP4 (via preload="metadata"), with a "Click to play" / "Play"
 * overlay. Clicking starts inline playback; clicking again pauses.
 * Only one video plays at a time — clicking another auto-pauses the
 * previous one.
 *
 * Source files live in /public/videos/professionals/, indexed 1–5.
 * Drop new clips with the same naming and they'll pick up
 * automatically by extending VIDEOS below.
 */

const VIDEOS = [
  "/videos/professionals/professionals-1.mp4",
  "/videos/professionals/professionals-2.mp4",
  "/videos/professionals/professionals-3.mp4",
  "/videos/professionals/professionals-4.mp4",
  "/videos/professionals/professionals-5.mp4",
];

interface ProfessionalsVideoGridProps {
  /** Eyebrow above the section title. Defaults to "In motion". */
  eyebrow?: string;
  /** Section title. */
  title?: string;
  /** Optional intro paragraph. */
  body?: string;
}

export function ProfessionalsVideoGrid({
  eyebrow = "In motion",
  title = "See how Pacific shows up on a project.",
  body,
}: ProfessionalsVideoGridProps) {
  // Track which card is currently playing so we can hide its overlay
  // and pause others on a new click. `null` = nothing playing.
  const [playing, setPlaying] = useState<number | null>(null);
  const refs = useRef<Array<HTMLVideoElement | null>>([]);

  const toggle = (i: number) => {
    const target = refs.current[i];
    if (!target) return;
    if (target.paused) {
      refs.current.forEach((other, idx) => {
        if (other && idx !== i) other.pause();
      });
      void target.play();
      setPlaying(i);
    } else {
      target.pause();
      setPlaying(null);
    }
  };

  return (
    <section className="bg-[#0a1620] border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <AnimatedSection animation="fadeUp">
          <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
            {title}
          </h2>
          {body && (
            <p className="mt-5 max-w-2xl text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              {body}
            </p>
          )}
        </AnimatedSection>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {VIDEOS.map((src, i) => {
            const isPlaying = playing === i;
            return (
              <button
                key={src}
                type="button"
                onClick={() => toggle(i)}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="group relative block rounded-xl overflow-hidden border border-white/10 bg-stone-950 aspect-[3/4] focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <video
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  src={src}
                  playsInline
                  preload="metadata"
                  onPlay={() => {
                    // Ensure only one card plays at a time — pause
                    // any sibling that's still running. Triggers on
                    // native player UI too, not just our click toggle.
                    refs.current.forEach((other, idx) => {
                      if (other && idx !== i && !other.paused) {
                        other.pause();
                      }
                    });
                    setPlaying(i);
                  }}
                  onPause={() => {
                    setPlaying((cur) => (cur === i ? null : cur));
                  }}
                  onEnded={() => setPlaying(null)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      key="overlay"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/60 via-black/20 to-black/35 text-white"
                    >
                      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors">
                        <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-white text-white ml-0.5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.25em] uppercase text-white/90">
                        {/* Different copy per platform — "Click to
                            play" reads natural on desktop, "Play"
                            on mobile where there's no cursor. */}
                        <span className="hidden md:inline">Click to play</span>
                        <span className="md:hidden">Play</span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
