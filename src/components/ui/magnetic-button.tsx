"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  /**
   * Visual variant.
   *  - primary:      dark fill, white text — for use on light backgrounds
   *  - outline:      transparent + dark text + dark border — for light backgrounds
   *  - outline-dark: transparent + WHITE text + white border, inverts on hover —
   *                  use this on dark backgrounds (e.g. the Find A Dealer button
   *                  inside the dark CTA panel) so the label is always visible.
   *  - ghost:        text-only
   */
  variant?: "primary" | "outline" | "outline-dark" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function MagneticButton({
  children,
  href,
  className,
  variant = "primary",
  size = "md",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 border border-stone-900",
    outline:
      "bg-transparent text-stone-900 border border-stone-300 hover:border-stone-900 hover:bg-stone-50",
    "outline-dark":
      // Transparent with WHITE text/border on dark backgrounds.
      // On hover, fills white and flips the text to dark for inverse-emphasis.
      "bg-transparent text-white border border-white/40 hover:bg-white hover:text-stone-900 hover:border-white",
    ghost:
      "bg-transparent text-stone-600 hover:text-stone-900 border border-transparent",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-4 text-base",
  };

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
