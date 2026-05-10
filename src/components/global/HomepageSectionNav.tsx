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
      <ul className="flex flex-col gap-1.5 2xl:gap-2">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          // Switch inactive pills to solid-dark backdrop only when the
          // user is actively inside one of the busy/light-bg sections
          // listed above. Default everywhere else: mix-blend-difference
          // outlined chip (preserved per editorial preference).
          const useSolidInactive =
            active !== null && SECTIONS_NEED_SOLID_BG.has(active);
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                // Pill / tab style.
                //  - Inactive (default): outlined chip with
                //    mix-blend-difference for auto-contrast against
                //    whatever's behind. Works well over dark navy,
                //    marble parallax, and most photo backgrounds.
                //  - Inactive (light/busy section override): solid
                //    dark glass backdrop instead of mix-blend, so
                //    the white label stays legible when the section
                //    bg is too close in value to the text colour.
                //  - Hover/Active: solid dark pill (bg-stone-900 +
                //    white text) with a heavy shadow — high contrast
                //    on every section type.
                className={`block px-2 py-1 text-[8.5px] tracking-[0.08em] 2xl:px-3.5 2xl:py-2 2xl:text-[10px] 2xl:tracking-[0.15em] uppercase font-semibold border rounded-md transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-stone-900 text-white border-stone-900 shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                    : useSolidInactive
                      ? "bg-black/45 backdrop-blur-md border-white/40 text-white hover:bg-stone-900 hover:text-white hover:border-stone-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                      : "border-white/70 text-white mix-blend-difference hover:mix-blend-normal hover:bg-stone-900 hover:text-white hover:border-stone-900 hover:shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
