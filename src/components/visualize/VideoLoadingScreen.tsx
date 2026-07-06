"use client";

import { motion } from "framer-motion";

interface VideoLoadingScreenProps {
  /** What to show while the video plays. Falls back to a default. */
  message?: string;
  /** Optional sub-line shown smaller below the main message. */
  subMessage?: string;
  /** Whether the video should loop. Defaults to true (existing
   *  behaviour). Set false when the caller wants to dismiss after
   *  one full playthrough — pair with `onEnded`. */
  loop?: boolean;
  /** Fired when the video reaches the end (only meaningful when
   *  `loop` is false). The splash uses this to dismiss itself. */
  onEnded?: () => void;
}

/**
 * Full-coverage loading overlay that plays the brand homepage render
 * as a background while a status message sits on top.
 *
 * Visual treatment:
 *   - Video fills the available area (object-cover).
 *   - A pacific-dark gradient scrim sits over the video so the text
 *     is readable regardless of which frame is playing. The scrim is
 *     darkest at the bottom (where the message sits) and softer at
 *     the top so the video still reads through.
 *   - Text is brand pacific-light with a tracked-out caps treatment
 *     and a subtle drop shadow for guaranteed contrast.
 *   - A pulsing dot in the brand light colour keeps the eye busy.
 *
 * The component is intended to be rendered as an absolute/inset-0
 * overlay inside its parent (which controls when it's visible).
 */
export function VideoLoadingScreen({
  message = "Working on your scene…",
  subMessage,
  loop = true,
  onEnded,
}: VideoLoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // Subtle exit: just a clean opacity fade, no scale, no
      // clip-path, no blur. The page underneath simply emerges as
      // the splash dissolves. Eased curve keeps it gentle.
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
      }}
      className="absolute inset-0 z-50 overflow-hidden bg-pacific-dark"
    >
      {/* Background video — autoplay, muted for autoplay eligibility
          on every browser, plays inline on mobile. Loops by default;
          when the caller asks for play-once we wire `onEnded` so the
          splash can dismiss after the full render finishes. */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/loading.mp4"
        poster="/videos/loading-poster.jpg"
        autoPlay
        loop={loop}
        muted
        playsInline
        preload="auto"
        onEnded={onEnded}
      />

      {/* Gradient scrim — darker at the bottom under the message,
          softer at the top so the video remains visible. Static now;
          rides the parent's opacity fade out, no separate "dim the
          lights" beat — that was too dramatic for what should feel
          like a quiet handoff. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,22,32,0.30) 0%, rgba(10,22,32,0.55) 60%, rgba(10,22,32,0.92) 100%)",
        }}
      />

      {/* Status content — vertically centred, brand-coloured text
          with a subtle drop shadow for guaranteed contrast against
          any video frame. The whole content block fades out faster
          than the surrounding video on exit so the message dissolves
          a beat before the video, layering the transition. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4 text-center px-6 max-w-lg">
          {/* Pulsing brand dot */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-2.5 h-2.5 rounded-full bg-pacific-light shadow-[0_0_20px_rgba(218,225,232,.9)]"
          />

          {/* Brand label up top */}
          <div
            className="text-[10px] tracking-[.32em] uppercase text-pacific-light/85"
            style={{ textShadow: "0 1px 8px rgba(10,22,32,.85)" }}
          >
            Pacific Surfaces
          </div>

          {/* Main message — large, light, with shadow */}
          <h2
            className="text-pacific-light font-light text-2xl md:text-3xl leading-tight"
            style={{ textShadow: "0 2px 14px rgba(10,22,32,.85)" }}
          >
            {message}
          </h2>

          {/* Optional sub-line */}
          {subMessage && (
            <p
              className="text-pacific-light/80 text-sm md:text-base max-w-md leading-relaxed"
              style={{ textShadow: "0 1px 8px rgba(10,22,32,.85)" }}
            >
              {subMessage}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
