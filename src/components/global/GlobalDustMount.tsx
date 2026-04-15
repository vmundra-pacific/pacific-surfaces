"use client";

/**
 * Client-only mount wrapper for GlobalDust.
 *
 * Next 15 Server Components can't import `next/dynamic({ ssr:false })`,
 * so we go through a client boundary here. We also gate on
 * `prefers-reduced-motion` and on mobile viewports — the ambient layer
 * is atmosphere only, not critical to the brand, so we skip it where
 * it could hurt performance or accessibility.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GlobalDust = dynamic(() => import("./GlobalDust"), { ssr: false });

export default function GlobalDustMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  if (!enabled) return null;
  return <GlobalDust />;
}
