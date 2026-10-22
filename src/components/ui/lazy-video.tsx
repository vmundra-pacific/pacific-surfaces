"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

/**
 * A silent looping background video that loads nothing until it nears the
 * screen, plays while on screen and pauses off it (owner, 2026-10-22:
 * phone performance, lazy-load wherever possible). An autoplay <video>
 * downloads in full the moment the page opens, wherever it sits; this
 * one shows its poster until then. For videos below the fold; heroes
 * keep a plain autoplay <video>.
 */
export function LazyVideo(props: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (typeof IntersectionObserver === "undefined") {
      v.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} {...props} autoPlay={false} preload="none" muted playsInline />;
}
