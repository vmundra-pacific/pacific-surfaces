"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({
  children,
  className,
  delay = 0,
  as: Tag = "h2",
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const words = children.split(" ");

  return (
    <Tag ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 0.55,
              ease: [0.25, 0.4, 0.25, 1],
              delay: delay + i * 0.04,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

interface LineRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function LineReveal({ children, className, delay = 0 }: LineRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: "0%" } : { y: "100%" }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.4, 0.25, 1],
          delay,
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
