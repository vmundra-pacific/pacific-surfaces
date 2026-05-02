"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

/**
 * Visualizer call-out — full-bleed editorial.
 * Demo kitchen as background, overlaid copy + inline feature list +
 * single centered CTA. No card boxes. Replaces the 6-card grid that
 * was reading as boxy/uncool.
 */
const featurePills = [
  "AI surface detection",
  "Per-surface materials",
  "Surface-aware slabs",
  "Manual frame tool",
  "Export & sample request",
];

export function VisualizerStrip() {
  const textShadow = "0 2px 8px rgba(0,0,0,.7), 0 6px 32px rgba(0,0,0,.55)";
  return (
    <section
      id="sec-visualize"
      className="relative w-full h-screen overflow-hidden bg-stone-950 scroll-mt-20"
    >
      {/* Background — kitchen demo room. Sized + cropped to look
          editorial rather than literal. */}
      <Image
        src="/demo-rooms/pacific-kitchen-01/room.jpg"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />

      {/* Scrim — heavier than the projects slide because we have more
          text to keep legible. Top + bottom darken; middle stays
          softer so the kitchen still reads. */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/40 to-stone-950/85 pointer-events-none" />

      {/* Centered editorial column */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase text-white/75 mb-4 sm:mb-6"
          style={{ textShadow }}
        >
          07 · Visualize · New
        </motion.div>

        <TextReveal
          as="h2"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] mb-6 sm:mb-8"
        >
          See any surface in
          your room.
        </TextReveal>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-light"
          style={{ textShadow }}
        >
          Tap any surface in a curated demo room — or upload a photo of your
          own space. AI segments the countertop, vanity, splashback, sink, or
          table in seconds. Apply any Pacific slab, compare finishes
          side-by-side, save the look, or request a physical sample without
          leaving the page.
        </motion.p>

        {/* Inline feature pills — typographic, no boxes */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap gap-x-6 gap-y-3 justify-center text-[11px] sm:text-xs tracking-[0.18em] uppercase text-white/65 mb-10 sm:mb-14"
          style={{ textShadow }}
        >
          {featurePills.map((pill, i) => (
            <span key={pill} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-white/30" aria-hidden="true">
                  ·
                </span>
              )}
              {pill}
            </span>
          ))}
        </motion.div>

        <MagneticButton href="/visualize" variant="primary" size="lg">
          Launch Visualizer
          <ArrowRight className="w-4 h-4" />
        </MagneticButton>
      </div>
    </section>
  );
}
