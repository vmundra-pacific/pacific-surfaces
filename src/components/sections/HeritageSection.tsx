"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";

/**
 * HeritageSection — thin marquee strip rolling left continuously,
 * independent of page scroll.
 *
 * Truly seamless infinite loop via continuous motion-value updates
 * instead of CSS keyframes. The track's x position decreases every
 * animation frame; when it crosses the width of one duplicated set,
 * we add the set width back to x — wrapping into a position that
 * looks pixel-identical to where we just were (because of the 2×
 * content duplication). No keyframe boundary, no iteration restart,
 * no jump to "start point". The math runs in requestAnimationFrame
 * so the wrap happens within the same frame it's needed; the user
 * cannot perceive any reset because there isn't one.
 */

const items = [
  // Production / capacity stats (annual numbers)
  "12 Million sq ft Quartz Produced Annually",
  "378,000 sq ft Quartz Facility",
  "4.8 Million sq ft Granite Produced Annually",
  // Catalogue stats — sourced from AboutContent / CatalogueClient
  "273+ Unique Designs",
  "44 Collections",
  // Capability stamp
  "Italian Technology",
];

// How fast the strip travels, expressed as time to cross one full
// duplicated set. Lower = faster. 8s feels brisk but readable.
const SECONDS_PER_SET = 8;

export function HeritageSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  // Width of ONE copy of the items (track has 2× copies, so this is
  // half of trackRef's scrollWidth). Initialised at 0 — we'll measure
  // post-mount to handle any web-font load that shifts widths.
  const [setWidth, setSetWidth] = useState(0);
  const x = useMotionValue(0);

  // Measure the width of one item set after mount + on resize. The
  // measurement is half of the track's total scrollWidth because we
  // duplicate items 2×. Re-measuring on resize handles web-font swap
  // (FOUT) which can change letter widths after the initial mount.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setSetWidth(track.scrollWidth / 2);
    measure();
    // RAF after mount catches the post-paint width once fonts have
    // settled. ResizeObserver covers viewport resize + font swap.
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Drive x with rAF. Each frame we move x left by `pixelsPerFrame`,
  // then wrap by adding setWidth whenever x has moved past one full
  // set. Because the two sets are visually identical, the wrap is
  // pixel-invisible. No keyframe restart, no animation iteration —
  // just continuous monotonic motion in modulo arithmetic.
  useAnimationFrame((_t, delta) => {
    if (setWidth <= 0) return;
    const pixelsPerSecond = setWidth / SECONDS_PER_SET;
    const moveBy = -pixelsPerSecond * (delta / 1000);
    let next = x.get() + moveBy;
    // Wrap: if we've passed one full set leftward, jump back by
    // exactly one set's width. The visual at the post-wrap position
    // is identical to the pre-wrap position thanks to duplication.
    while (next <= -setWidth) next += setWidth;
    x.set(next);
  });

  const looped = [...items, ...items];

  return (
    <section
      className="relative bg-black border-y border-white/10 overflow-hidden"
      id="heritage"
      aria-label="Pacific Surfaces — capacity and catalogue stamps"
    >
      <motion.div
        ref={trackRef}
        // x is the motion value updated by useAnimationFrame above —
        // Framer Motion writes it directly to the element's transform
        // every frame without React re-renders.
        style={{ x }}
        className="flex whitespace-nowrap py-3 sm:py-4 will-change-transform"
      >
        {looped.map((label, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span className="text-[11px] sm:text-xs tracking-[0.28em] uppercase font-medium text-white px-4 sm:px-5">
              {label}
            </span>
            <span className="text-pacific-mid/60 text-xl leading-none">•</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
