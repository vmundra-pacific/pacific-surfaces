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
  variant?: "primary" | "primary-dark" | "outline" | "outline-dark" | "ghost";
  size?: "sm" | "md" | "lg";
  /**
   * Action-button mode (form submit, logout, etc.) — mutually
   * exclusive with `href`. When `href` is omitted this renders a real
   * <button> (via motion.button) instead of a bare, non-interactive
   * <motion.div>, so it's keyboard/form accessible and actually
   * fires clicks/submits. Added for the customer portal's
   * login/logout/submit actions, which have no URL to navigate to.
   */
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  href,
  className,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement & HTMLButtonElement>(null);
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

  // Pacific brand tokens only. These were previously built on the
  // `stone-*` palette, which is a WARM brown-black (#1c1917) — visibly
  // off-brand against Pacific's cool teal-black (#112732). Because this
  // component is the site's only CTA primitive, every call-to-action on
  // every page inherited the wrong hue.
  const variants = {
    primary:
      "bg-pacific-dark text-white hover:bg-pacific-dark/90 border border-pacific-dark",
    // Solid WHITE fill with dark text — the documented primary CTA for
    // use ON dark backgrounds. The design system specifies this pairing
    // ("bg-white text-pacific-dark on dark") but no variant implemented
    // it, so call sites were reaching for `!important` overrides on
    // `primary` instead.
    "primary-dark":
      "bg-white text-pacific-dark hover:bg-pacific-light border border-white",
    outline:
      "bg-transparent text-pacific-dark border border-pacific-mid hover:border-pacific-dark hover:bg-pacific-light/40",
    "outline-dark":
      // Transparent with WHITE text/border on dark backgrounds.
      // On hover, fills white and flips the text to dark for inverse-emphasis.
      "bg-transparent text-white border border-pacific-mid/40 hover:bg-white hover:text-pacific-dark hover:border-white",
    ghost:
      "bg-transparent text-pacific-mid hover:text-pacific-dark border border-transparent",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-4 text-base",
  };

  const sharedClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    const inner = (
      <motion.div
        ref={ref}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        className={sharedClassName}
      >
        {children}
      </motion.div>
    );
    return <Link href={href}>{inner}</Link>;
  }

  // No href — action-button mode. Real <button> so it participates
  // in form submission (type="submit") and is properly focusable/
  // clickable without a Link wrapper.
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={sharedClassName}
    >
      {children}
    </motion.button>
  );
}
