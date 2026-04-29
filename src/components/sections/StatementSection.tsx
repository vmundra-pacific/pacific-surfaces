"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StatementSectionProps {
  statement: string;
  theme?: "light" | "dark";
}

export function StatementSection({
  statement,
  theme = "light",
}: StatementSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const isDark = theme === "dark";

  return (
    <section
      ref={ref}
      className={`relative py-20 sm:py-32 md:py-44 lg:py-56 px-6 overflow-hidden ${isDark ? "bg-stone-950" : "bg-[#112732]"}`}
    >
      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      <motion.div
        style={{ y, opacity, willChange: "transform, opacity" }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <h2
          className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-light tracking-tight leading-[1.2] ${isDark ? "text-white" : "text-white"}`}
        >
          {statement}
        </h2>
      </motion.div>
    </section>
  );
}
