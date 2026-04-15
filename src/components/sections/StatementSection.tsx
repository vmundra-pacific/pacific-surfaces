"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StatementSectionProps {
  statement: string;
  theme?: "light" | "dark";
}

export function StatementSection({ statement, theme = "light" }: StatementSectionProps) {
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
      className={`relative py-32 sm:py-44 lg:py-56 px-6 overflow-hidden ${isDark ? "bg-stone-950" : "bg-white"}`}
    >
      <motion.div
        style={{ y, opacity }}
        className="max-w-6xl mx-auto"
      >
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-light tracking-tight leading-[1.15] ${isDark ? "text-white" : "text-stone-900"}`}
        >
          {statement}
        </h2>
      </motion.div>
    </section>
  );
}
