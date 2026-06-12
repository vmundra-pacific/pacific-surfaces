"use client";

import { useEffect, useState } from "react";

/**
 * Off-screen video preloader.
 *
 * Mounts hidden `<video preload="auto">` elements for each URL in
 * `urls`, which nudges the browser to start fetching the bytes
 * immediately on page load — even though nothing visible on screen
 * is asking for them. The actual `<video>` elements that DO appear
 * on screen (e.g. inside SignatureProjects' card grid) keep their
 * `preload="none"` so they don't double-fetch; when their
 * IntersectionObserver later calls play(), the browser pulls from
 * its HTTP cache instead of doing a fresh network round-trip.
 *
 * Phone gate: on touch devices with narrow viewports we render
 * NOTHING. Mobile shouldn't be downloading 30-50 MB of project
 * videos — Lighthouse mobile run was logging 146 MB total page
 * weight, with the top four entries all being prefetched Sanity
 * .mp4 files. Mobile users get the static poster images instead;
 * the on-screen video components also skip rendering on phone (see
 * SignatureProjects' ProjectVideo skipVideo gate + the analogous
 * gate in ApplicationsScrollSections).
 */
export function VideoPrefetch({ urls }: { urls: string[] }) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  // Don't mount the hidden preload="auto" videos immediately after
  // hydration — on the homepage they'd contend with the hero-frame
  // batch that gates splash dismissal. Wait for HeroScrollCanvas to
  // fire `pacific:hero-ready`, or fall back to idle / an 8s timeout
  // on pages without the hero — whichever comes first.
  const [heroSettled, setHeroSettled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isPhone = false;
    try {
      isPhone =
        window.matchMedia("(pointer: coarse)").matches &&
        window.innerWidth < 1024;
    } catch {
      /* ignore — older browsers without matchMedia */
    }
    // Also bail on Save-Data / 2g/3g — even desktop on a tethered
    // phone shouldn't pre-fetch tens of MB of video.
    type NavConn = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as unknown as { connection?: NavConn })
      .connection;
    const slowNet =
      conn?.saveData === true ||
      (conn?.effectiveType !== undefined &&
        ["slow-2g", "2g", "3g"].includes(conn.effectiveType));
    setShouldPrefetch(!isPhone && !slowNet);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let done = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const settle = () => {
      if (done) return;
      done = true;
      setHeroSettled(true);
    };
    window.addEventListener("pacific:hero-ready", settle);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(settle, { timeout: 8000 });
    } else {
      timeoutId = setTimeout(settle, 8000);
    }
    return () => {
      window.removeEventListener("pacific:hero-ready", settle);
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, []);

  if (urls.length === 0 || !shouldPrefetch || !heroSettled) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0,
        clip: "rect(0,0,0,0)",
        bottom: -1,
        right: -1,
      }}
    >
      {urls.map((url) => (
        <video
          key={url}
          src={url}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
