"use client";

import { motion } from "framer-motion";

/**
 * Hero video block for the Quartz Surfaces (/products) page.
 *
 * Plays the dolly-zoom slab render as a fixed-height background with
 * a small editorial caption pinned in the bottom-left corner. The
 * video lives in normal document flow — NOT a fixed/sticky overlay —
 * so the page scrolls past it normally while the video continues to
 * play. By the time the user has scrolled to the catalogue grid, the
 * video has scrolled off-screen and stops playing only when removed
 * from view (browser default for muted autoplay).
 *
 * Behaviour:
 *   - autoPlay + loop + muted + playsInline so it starts on every
 *     browser without a user gesture and survives mobile autoplay
 *     restrictions;
 *   - object-cover so it fills the frame regardless of aspect ratio;
 *   - a soft pacific-dark gradient scrim sits on top so the corner
 *     caption stays readable against any video frame;
 *   - text uses the brand pacific-light + tracked-out caps treatment
 *     to match the rest of the site.
 */
export function QuartzHeroVideo() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-pacific-dark">
      {/* Background video — fills the frame */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/quartz-hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Soft scrim — keeps the caption readable regardless of which
          frame the video is on, and ramps to the catalogue's exact
          background colour (#112732) at the bottom so the video
          transitions seamlessly into the page below with no visible
          seam. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,39,50,0.10) 0%, rgba(17,39,50,0.05) 45%, rgba(17,39,50,0.55) 85%, #112732 100%)",
        }}
      />

      {/* Bottom-left caption — pinned in a corner so the video
          dominates the frame visually. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-6 md:left-10 bottom-6 md:bottom-10 max-w-md"
      >
        <div
          className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-pacific-light/95 mb-3"
          // Layered shadow: a tight inner shadow (sharp edge) plus
          // a wider outer halo (softens against bright frames).
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,.85), 0 2px 18px rgba(0,0,0,.75)",
          }}
        >
          Pacific Surfaces · Quartz
        </div>
        <h1
          className="text-white font-light leading-[1.05] text-3xl md:text-5xl lg:text-6xl tracking-tight"
          style={{
            textShadow: "0 2px 6px rgba(0,0,0,.9), 0 6px 32px rgba(0,0,0,.8)",
          }}
        >
          Engineered stone,
          <br />
          <em className="italic font-extralight text-white/90">
            crafted for the everyday.
          </em>
        </h1>
        <p
          className="mt-4 text-sm md:text-base text-pacific-light/95 font-light leading-relaxed max-w-sm"
          style={{
            textShadow: "0 1px 4px rgba(0,0,0,.85), 0 2px 18px rgba(0,0,0,.75)",
          }}
        >
          Premium quartz slabs designed for kitchens, vanities, and feature
          walls — beautiful under any light, durable through any season.
        </p>
      </motion.div>
    </section>
  );
}
