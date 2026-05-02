"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TextReveal } from "@/components/ui/text-reveal";

export function OriginStats() {
  // Phone gate. The 2.8 MB origin.mp4 was downloading on every mobile
  // visit and contributing to the 100+ MB total page weight Lighthouse
  // was logging. On phone (and on Save-Data / 2g/3g) we render the
  // poster JPG as a static <img> instead. Same composition, no video
  // bytes. Falls back to the desktop branch on first SSR paint and
  // re-evaluates client-side once we can read window/navigator.
  const [skipVideo, setSkipVideo] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isPhone = false;
    try {
      isPhone =
        window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth < 1024;
    } catch {
      /* ignore */
    }
    type NavConn = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as unknown as { connection?: NavConn })
      .connection;
    const slowNet =
      conn?.saveData === true ||
      (conn?.effectiveType !== undefined &&
        ["slow-2g", "2g", "3g"].includes(conn.effectiveType));
    setSkipVideo(isPhone || slowNet);
  }, []);

  return (
    // relative + isolate so the looping background video can sit
    // behind the content without bleeding into neighbouring sections.
    // Dark navy fallback bg keeps the section legible if the video
    // file isn't present yet.
    <section
      id="sec-origin"
      className="relative isolate overflow-hidden min-h-screen flex items-center py-16 sm:py-20 md:py-28 px-6 bg-[#112732] scroll-mt-20"
    >
      {/* Background video — silent, looping, full-bleed cover.
          Drop the clip at /public/videos/origin.mp4 (and a poster JPG
          alongside it for instant first paint). Playback will start
          automatically. Until the file is present, the section falls
          back to the dark-navy bg above with no visible breakage.
          On phone we serve the poster as a still image instead so the
          section doesn't pull a multi-MB video into a phone session. */}
      {skipVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src="/videos/origin-poster.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src="/videos/origin.mp4"
          poster="/videos/origin-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
      {/* Tint overlay — deep navy at ~70% opacity so the headline and
          body text remain legible over any frame of the clip. */}
      <div className="absolute inset-0 bg-[#112732]/72 -z-10" />

      {/* Content sits at full section width (no max-w on the wrapper)
          so the text doesn't feel like a narrow column floating on a
          big background video. The paragraph itself keeps max-w-2xl
          so it stays readable on wide displays. w-full needed because
          the section is a flex container — without it the wrapper
          would shrink to content width and break the mx-auto. */}
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="mx-auto max-w-7xl"
        >
          <div className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-5">
            03 · The Origin
          </div>
          <TextReveal
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.08] mb-6 max-w-4xl"
          >
            Everything under one roof: precision, performance, perfection.
          </TextReveal>
          <p className="text-base font-light text-pacific-light leading-relaxed max-w-2xl">
            From raw material selection to the final polished surface, every
            stage is seamlessly integrated within our expansive facility. This
            unified approach ensures consistent quality, faster turnaround, and
            complete control over every detail of production.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
