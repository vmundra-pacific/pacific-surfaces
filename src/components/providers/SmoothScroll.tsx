"use client";

import { useEffect } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    let rafId: number | null = null;
    // Set when the effect is cleaned up. If the component unmounts before
    // the dynamic import resolves (React StrictMode does this on every dev
    // mount), we must not construct Lenis / start the rAF loop — they'd
    // never be destroyed.
    let cancelled = false;

    async function initLenis() {
      try {
        const { default: Lenis } = await import("lenis");

        if (cancelled) return;

        lenis = new Lenis({
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
        });

        // Drive Lenis with its documented self-driven rAF loop. GSAP's
        // ticker was previously used here, but Lenis was its only
        // consumer — no other gsap/ScrollTrigger code exists in src/ —
        // so the plain loop drops both libraries from this chunk.
        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      } catch (err) {
        console.info("Lenis failed to load, falling back to native scroll.", err);
      }
    }

    initLenis();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
