"use client";

import { useEffect } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    let gsapTickerFn: ((time: number) => void) | null = null;
    // Set when the effect is cleaned up. If the component unmounts before
    // the dynamic imports resolve (React StrictMode does this on every dev
    // mount), we must not construct Lenis / register the ticker — they'd
    // never be destroyed.
    let cancelled = false;

    async function initLenis() {
      try {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        lenis = new Lenis({
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
        });

        // ---- GSAP / ScrollTrigger integration ----
        // Tell ScrollTrigger when Lenis scrolls so scrub animations stay in sync
        lenis.on("scroll", ScrollTrigger.update);

        // Drive Lenis from GSAP's ticker for a single consistent loop
        gsapTickerFn = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(gsapTickerFn);
        gsap.ticker.lagSmoothing(0);
      } catch (err) {
        console.info("Lenis/GSAP integration failed, falling back to native scroll.", err);
      }
    }

    initLenis();

    return () => {
      cancelled = true;
      if (gsapTickerFn) {
        import("gsap").then(({ default: gsap }) => {
          if (gsapTickerFn) gsap.ticker.remove(gsapTickerFn);
        });
      }
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
