"use client";

import { motion } from "framer-motion";

const badges = [
  { icon: "NSF", title: "NSF/ANSI 51", sub: "Food Contact Safe" },
  { icon: "GG", title: "Greenguard Gold", sub: "Low Emissions" },
  { icon: "CE", title: "CE Marked", sub: "EU Conformity" },
  { icon: "ISO", title: "ISO 9001:2015", sub: "Quality System" },
  { icon: "15Y", title: "15 Year Warranty", sub: "Residential" },
];

export function TrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative bg-[#112732] border-y border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        {/* Label */}
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#9AA8B6] text-center mb-5">
          Specified by architects on five continents. Manufactured in Hosur,
          India.
        </p>
        {/* Badges — single scrollable row */}
        <div className="flex items-center justify-center gap-8 overflow-x-auto no-scrollbar">
          {badges.map((b) => (
            <div key={b.icon} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-medium tracking-wider text-white/80">
                {b.icon}
              </div>
              <div>
                <div className="text-[11px] font-medium text-white/90 leading-tight whitespace-nowrap">
                  {b.title}
                </div>
                <div className="text-[10px] text-[#9AA8B6] leading-tight whitespace-nowrap">
                  {b.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
