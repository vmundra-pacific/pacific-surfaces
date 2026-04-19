"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";

export function HeritageSection() {
  return (
    <section className="py-20 md:py-28 px-6 bg-stone-50" id="heritage">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4">
            Manufacturer · Not a Reseller
          </div>
          <TextReveal
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-[1.08] mb-6"
          >
            We make every slab you specify.
          </TextReveal>
          <p className="text-base font-light text-stone-700 leading-relaxed mb-10 max-w-lg">
            Most competitors are distributors of other people&apos;s stone.
            Pacific designs, engineers, and presses every slab at our Hosur
            plant — one of only a handful of Bretonstone lines in India.
            That&apos;s why we can stand behind your project for fifteen years.
          </p>

          {/* Pillars */}
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                title: "Designed",
                desc: "Colours, patterns, and finishes developed in-house by our R&D team.",
              },
              {
                title: "Pressed",
                desc: "1,200-tonne Bretonstone line at our 18-acre plant in Hosur.",
              },
              {
                title: "Shipped",
                desc: "Direct from factory to dealer, US warehouse, or Poland hub.",
              },
            ].map((p) => (
              <div key={p.title}>
                <h5 className="text-sm font-medium text-stone-900 mb-2">
                  {p.title}
                </h5>
                <p className="text-xs font-light text-stone-500 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — heritage card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="rounded-2xl bg-[#112732] text-white p-8 sm:p-10 flex flex-col justify-between min-h-[460px] relative overflow-hidden"
        >
          {/* Grain */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            {/* India flag badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.08] rounded-full mb-5">
              <span
                className="w-[18px] h-[12px] rounded-sm"
                style={{
                  background:
                    "linear-gradient(to bottom, #FF9933 33%, #fff 33% 66%, #138808 66%)",
                }}
              />
              <span className="text-[10px] tracking-[0.22em] uppercase text-white">
                Made in India · Est 2011
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-light tracking-tight leading-[1.05] mb-5">
              From Hosur
              <br />
              <em className="text-[#9AA8B6] not-italic">to everywhere.</em>
            </h3>

            <p className="text-[13px] text-[#9AA8B6] leading-relaxed">
              Pacific Engineered Surfaces is a vertically integrated
              manufacturer.{" "}
              <strong className="text-white font-medium">
                We quarry, engineer, press, polish, and ship from a single
                campus
              </strong>{" "}
              — which is why Pacific slabs are on countertops in{" "}
              <strong className="text-white font-medium">30+ countries</strong>{" "}
              and counting.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/[0.12] pt-5 mt-6">
            <p className="text-sm text-[#9AA8B6] italic leading-relaxed">
              &ldquo;A family-owned Indian manufacturer shouldn&apos;t feel like
              a premium choice. It should be the obvious one.&rdquo;
            </p>
            <cite className="block mt-2.5 not-italic text-[11px] tracking-[0.18em] uppercase text-[#DAE1E8]">
              — Varun Somani, Managing Director
            </cite>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
