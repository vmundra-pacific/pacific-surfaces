"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LearnTextSectionProps {
  heading: string;
  content: string;
  index: number;
}

/**
 * Text-only learn-page section used for /learn/maintenance-* and
 * /learn/warranty-* topics. No image column — just the heading and
 * body, with a Framer Motion entrance animation tied to scroll
 * position so each section fades + slides in as the reader reaches it.
 *
 * Light/dark backgrounds alternate (matching the rest of the
 * /learn/[topic] template) for editorial rhythm.
 */
export function LearnTextSection({
  heading,
  content,
  index,
}: LearnTextSectionProps) {
  const isDark = index % 2 === 1;

  return (
    <section
      className={cn(
        "py-20 md:py-28 px-6",
        isDark ? "bg-[#112732]" : "bg-stone-50"
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.05,
          }}
          className={cn(
            "text-[10px] font-medium tracking-[0.3em] uppercase mb-5",
            isDark ? "text-white/50" : "text-stone-500"
          )}
        >
          {`Section ${String(index + 1).padStart(2, "0")}`}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.12,
          }}
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] mb-6",
            isDark ? "text-white" : "text-stone-900"
          )}
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2,
          }}
          className={cn(
            "text-base sm:text-lg font-light leading-relaxed",
            isDark ? "text-stone-300" : "text-stone-600"
          )}
        >
          {content}
        </motion.p>
      </motion.div>
    </section>
  );
}
