"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HomepageSectionNav — pinned left-middle vertical nav, six labelled
 * pill tabs in scroll order.
 *
 * Three things to know:
 *
 * 1. CLICK = programmatic scrollIntoView. The site uses Lenis for
 *    smooth-scroll, which intercepts wheel/keyboard scroll. Native
 *    `href="#id"` anchor clicks don't always behave predictably under
 *    Lenis — especially over very tall scroll-pinned sections like
 *    the homepage hero. Calling `scrollIntoView({ behavior: "smooth" })`
 *    on the target element triggers a programmatic scroll that Lenis
 *    respects, so the jump always works.
 *
 * 2. CONTRAST handled via CSS `mix-blend-mode: difference`. The
 *    homepage alternates dark and light backgrounds (e.g. cream
 *    InspirationGrid) — fixed white text would disappear on the
 *    cream section. With difference blending, the pills auto-invert
 *    relative to whatever's behind them: white-on-dark stays light,
 *    white-on-light becomes dark. Single property, no scroll-tied
 *    color tracking needed.
 *
 * 3. Sustainability points at the EcosurfacesSection (low-silica
 *    feature block under TrustStrip). Community = SignatureProjects
 *    (community endorsement section). Signature Projects =
 *    InspirationGrid (the project-photo gallery). Voices and
 *    Visualize were dropped from the rail per the editorial mock —
 *    they still exist on the page, just not pinned to the side nav.
 *
 * Hidden below `lg` (1024px) — phone/tablet users get the regular
 * scroll experience without an extra UI band overlapping content.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: "sec-sustainability", label: "Sustainability" },
  { id: "sec-collections", label: "Collections" },
  { id: "sec-applications", label: "Applications" },
  { id: "sec-origin", label: "Origin" },
  { id: "sec-architects", label: "Community" },
  { id: "sec-projects", label: "Signature Projects" },
  { id: "sec-visualize", label: "Visualize" },
];

// Sections whose backgrounds are light AND visually busy (cream
// papers + photo grids etc.) where mix-blend-difference produces
// muddy, hard-to-read pill text. While the user is in one of these
// sections, inactive pills swap to a solid dark backdrop so the
// labels stay legible. Anywhere else, the chips keep the original
// mix-blend-difference auto-inversion the user prefers.
const SECTIONS_NEED_SOLID_BG = new Set<string>(["sec-projects"]);

export function HomepageSectionNav() {
  const [active, setActive] = useState<string | null>(null);
  // Set of section ids currently inside the active band. Active pill
  // is recomputed on every observer fire as the topmost intersecting
  // section in SECTIONS order. When the set is empty (parallax hero,
  // gaps between tracked sections, page bottom), active drops to
  // null and no pill is filled — Sustainability no longer "sticks"
  // through Collections, Collections doesn't bleed into Applications,
  // etc.
  const intersectingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const set = intersectingRef.current;

    const recompute = () => {
      const next = SECTIONS.find((s) => set.has(s.id))?.id ?? null;
      setActive(next);
    };

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const o = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) set.add(id);
          else set.delete(id);
          recompute();
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      o.observe(el);
      observers.push(o);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Click handler — programmatic scroll via scrollIntoView so Lenis
  // routes through its own animation pipeline rather than the native
  // anchor jump (which can drop or fight Lenis under load). We also
  // set `active` IMMEDIATELY so the pill flips to its filled-white
  // state on click without waiting for the smooth scroll to land
  // and the IntersectionObserver to fire (otherwise the user clicks
  // a pill, sees nothing change for ~600 ms, and assumes the click
  // didn't register). The observer will re-confirm or override once
  // the scroll settles.
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update the URL hash without forcing the browser to do its own
    // jump — keeps shareable links functional.
    if (history.pushState) history.pushState(null, "", `#${id}`);
  };

  return (
    <nav
      // Pinned to the left edge, vertically centred. z-30 sits above
      // page content but below the fixed header (z-50). Hidden on
      // mobile / tablet — only shows lg+ where there's room.
      //
      // Earlier versions tried `mix-blend: difference` for auto-
      // inversion, but on bright marble heroes the active pill's
      // dark label blended into the marble veins and read as muddy.
      // The pills now carry their own contrast layers — see the
      // per-pill className below.
      // Below xl (≤1279px) there isn't enough room next to centred
      // section content for the rail without it overlapping text — at
      // lg the DNV/SGS cards' inner copy starts ~80px from the viewport
      // edge and the rail's longest pill ("Signature Projects") is wider
      // than that. Hide entirely on lg+down.
      // - xl (1280–1535): compact rail, tight padding + small font.
      // - 2xl+ (≥1536):    original full-size rail.
      className="fixed left-2 2xl:left-6 top-1/2 -translate-y-1/2 z-30 hidden xl:block"
      aria-label="Homepage section navigation"
    >
      <ul className="flex flex-col gap-2.5 2xl:gap-3">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          // On light/busy sections (cream Inspiration grid) we lose
          // mix-blend-difference and use solid-white text + dot. On
          // every other section the bullet + label use
          // mix-blend-difference for auto-contrast against whatever's
          // behind (dark navy, marble, photo).
          const useSolidInactive =
            active !== null && SECTIONS_NEED_SOLID_BG.has(active);
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                // Bulleted nav: a small dot + label. No outline, no
                // pill background. Active item = filled dot + brighter
                // label; inactive = hollow ring + dimmer label. Group
                // hover swells the dot slightly so the click target
                // feels alive without bringing back a rectangle.
                className={`group inline-flex items-center gap-2.5 2xl:gap-3 px-1 py-0.5 text-[9px] tracking-[0.18em] 2xl:text-[10.5px] 2xl:tracking-[0.22em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${
                  isActive
                    ? useSolidInactive
                      ? "text-white"
                      : "text-white mix-blend-difference"
                    : useSolidInactive
                      ? "text-white/70 hover:text-white"
                      : "text-white/85 mix-blend-difference hover:text-white"
                }`}
              >
                <span
                  className={`inline-block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-2 h-2 2xl:w-2.5 2xl:h-2.5 bg-current"
                      : "w-1.5 h-1.5 2xl:w-2 2xl:h-2 border border-current bg-transparent group-hover:bg-current"
                  }`}
                  aria-hidden="true"
                />
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
