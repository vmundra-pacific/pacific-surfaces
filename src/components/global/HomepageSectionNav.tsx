"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HomepageSectionNav — a bar of the homepage's sections under the fixed
 * header (owner, 2026-10-20: the left rail overlapped the page, and a
 * hover-only icon would be missed). It appears once the hero has been
 * scrolled past, underlines the section in view, and on phones becomes
 * a row you swipe. It sits under the header, so it never covers content.
 *
 * Clicks scroll with scrollIntoView, which Lenis (the site's smooth
 * scroll) honours; a plain #anchor jump can fight it over the tall
 * scroll-pinned hero. Sustainability points at the EcosurfacesSection,
 * Community at SignatureProjects and Signature Projects at the
 * InspirationGrid.
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

export function HomepageSectionNav() {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  // Set of section ids currently inside the active band. Active pill
  // is recomputed on every observer fire as the topmost intersecting
  // section in SECTIONS order. When the set is empty (parallax hero,
  // gaps between tracked sections, page bottom), active drops to
  // null and no pill is filled — Sustainability no longer "sticks"
  // through Collections, Collections doesn't bleed into Applications,
  // etc.
  const intersectingRef = useRef<Set<string>>(new Set());
  // Shown once the first section reaches the header, hidden over the hero.
  const [shown, setShown] = useState(false);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const first = document.getElementById(SECTIONS[0].id);
      setShown(!!first && first.getBoundingClientRect().top < 140);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // On a phone the row scrolls sideways: keep the current tab in view.
  useEffect(() => {
    if (active) linkRefs.current[active]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

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
    // Land below the header (80 px) and this bar (about 48 px).
    el.style.scrollMarginTop = "128px";
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update the URL hash without forcing the browser to do its own
    // jump — keeps shareable links functional.
    if (history.pushState) history.pushState(null, "", `#${id}`);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Homepage sections"
      aria-hidden={!shown}
      className={`fixed inset-x-0 top-20 z-40 border-b border-black/10 bg-white/90 backdrop-blur-md transition-all duration-300 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <ul className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-10 lg:justify-center lg:gap-2 [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <a
                ref={(el) => {
                  linkRefs.current[s.id] = el;
                }}
                href={`#${s.id}`}
                tabIndex={shown ? 0 : -1}
                onClick={(e) => handleClick(e, s.id)}
                aria-current={isActive ? "true" : undefined}
                // Inline colour: the bw-temp skin rewrites colour utilities.
                style={{ color: "#14140f" }}
                className={`relative block whitespace-nowrap px-3 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity ${
                  isActive ? "opacity-100" : "opacity-55 hover:opacity-100"
                }`}
              >
                {s.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0 h-[2px] origin-left bg-[#14140f] transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
