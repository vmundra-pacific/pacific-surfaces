"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Honours the visitor's "reduce motion" setting (WCAG 2.3.3, and the pause
 * that 2.2.2 asks for on content that moves by itself):
 *
 *   - Framer Motion entrances, slides and scales settle at once
 *     (`reducedMotion="user"` keeps fades and drops transforms);
 *   - looping, muted background videos stay on their first frame. Videos
 *     with controls, or with sound, are the visitor's own choice and are
 *     left alone.
 *
 * Nothing changes for visitors who have not asked for reduced motion.
 */
export default function MotionPrefs({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ambient = (el: EventTarget | null): el is HTMLVideoElement =>
      el instanceof HTMLVideoElement && el.muted && el.loop && !el.controls;
    // `play` does not bubble, so it is caught on the way down.
    const onPlay = (e: Event) => {
      if (query.matches && ambient(e.target)) e.target.pause();
    };
    const pauseAll = () => {
      if (!query.matches) return;
      document.querySelectorAll("video").forEach((v) => {
        if (ambient(v) && !v.paused) v.pause();
      });
    };
    document.addEventListener("play", onPlay, true);
    query.addEventListener("change", pauseAll);
    pauseAll();
    return () => {
      document.removeEventListener("play", onPlay, true);
      query.removeEventListener("change", pauseAll);
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
