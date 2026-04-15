"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ClipRevealSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ClipRevealSection({ children, className = "" }: ClipRevealSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  // Animate clip-path from a small centered rectangle to full view
  const clipProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.section
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: useTransform(
          clipProgress,
          [0, 1],
          [
            "inset(8% 8% 8% 8% round 24px)",
            "inset(0% 0% 0% 0% round 0px)",
          ]
        ),
      }}
    >
      {children}
    </motion.section>
  );
}
