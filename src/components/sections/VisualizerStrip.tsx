"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const steps = [
  { n: "01", t: "Choose a room or upload your own photo." },
  { n: "02", t: "Apply any Pacific surface to walls, floors, counters." },
  { n: "03", t: "Save, share, and request a sample instantly." },
];

export function VisualizerStrip() {
  return (
    <section className="py-16 sm:py-20 md:py-28 px-6 bg-stone-950">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4"
            >
              02 · Visualize · New
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
            >
              See any surface in your room.
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:max-w-md lg:pt-12"
          >
            <p className="text-base font-light text-stone-300 leading-relaxed">
              Upload your space or choose a template. Apply a Pacific surface to
              countertops, vanities, floors, and walls — then request a sample
              in one click.
            </p>
          </motion.div>
        </div>

        {/* Two-column strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy + steps */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
              Surface Visualizer
            </div>
            <h3 className="text-3xl sm:text-4xl font-light tracking-tight text-white leading-[1.08] mb-4">
              A showroom
              <br />
              for <em className="text-[#9AA8B6] not-italic">your kitchen.</em>
            </h3>
            <p className="text-sm font-light text-stone-400 leading-relaxed mb-10 max-w-md">
              Pick a room template or upload a photo of your space. Drop in a
              Pacific surface. Compare finishes side-by-side. Share a live link
              with your partner, designer, or fabricator.
            </p>

            {/* Steps */}
            <div className="space-y-5 mb-10">
              {steps.map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="text-xs font-medium tracking-[0.15em] text-[#9AA8B6] pt-0.5 shrink-0">
                    {s.n}
                  </span>
                  <span className="text-sm font-light text-stone-300 leading-relaxed">
                    {s.t}
                  </span>
                </div>
              ))}
            </div>

            <MagneticButton href="/visualize" variant="primary" size="lg">
              Launch Visualizer
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </motion.div>

          {/* Right — preview placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900">
              {/* Placeholder room visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.06] flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-stone-400"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <p className="text-xs tracking-[0.15em] uppercase text-stone-500">
                    Live Preview
                  </p>
                </div>
              </div>

              {/* Grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Swatch row */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-3 bg-black/60 backdrop-blur-md rounded-xl">
              {["stone-200", "stone-600", "amber-800/60", "stone-100"].map(
                (c, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg ${
                      i === 0
                        ? "ring-2 ring-white ring-offset-1 ring-offset-black/60"
                        : ""
                    } bg-${c} cursor-pointer transition-transform hover:scale-110`}
                    style={{
                      background:
                        i === 0
                          ? "#e7e5e4"
                          : i === 1
                            ? "#57534e"
                            : i === 2
                              ? "#78350f"
                              : "#f5f5f4",
                    }}
                  />
                )
              )}
              <div className="ml-auto text-right">
                <div className="text-xs font-medium text-white leading-tight">
                  Calacatta Couture
                </div>
                <div className="text-[10px] text-stone-400">
                  Quartz · Polished · 20mm
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
