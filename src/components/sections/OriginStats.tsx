"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";

export function OriginStats() {
  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — copy + stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-5">
            04 · The Origin
          </div>
          <TextReveal
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-[1.08] mb-6"
          >
            Cut, pressed, polished by us.
          </TextReveal>
          <p className="text-base font-light text-stone-700 leading-relaxed mb-10 max-w-lg">
            Pacific Engineered Surfaces is one of the few manufacturers in India
            running a full Bretonstone line. Every slab you specify is made at
            our Hosur plant — not sourced, not rebadged. That&apos;s why we can
            stand behind them for 15 years.
          </p>

          <div className="flex gap-10">
            {[
              { n: "14", l: "Days per slab" },
              { n: "1,200T", l: "Press force" },
              { n: '131"', l: "Max slab width" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-3xl sm:text-4xl font-light tracking-tight text-stone-900">
                  {s.n}
                </div>
                <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-stone-500 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — visual placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#112732] to-[#0a1620]"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#9AA8B6]">
              3D Slab Atlas · Coming Soon
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
