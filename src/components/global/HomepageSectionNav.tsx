"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Eye, Factory, Layers, Leaf, LayoutGrid, Users, type LucideIcon } from "lucide-react";

/**
 * HomepageSectionNav — the homepage's sections, from the end of the hero on.
 *  - Desktop (lg+): a slim black dock on the right edge, one icon per
 *    section (owner, 2026-10-20, after an icon dock on another site); the
 *    section in view is highlighted and hovering an icon slides its name
 *    out to the left.
 *  - Phones and tablets: a bar under the fixed header that you swipe, the
 *    section in view underlined and kept in view.
 * Neither covers the page's text: the dock sits in the edge margin.
 *
 * Clicks scroll with scrollIntoView, which Lenis (the site's smooth
 * scroll) honours; a plain #anchor jump can fight it over the tall
 * scroll-pinned hero. Sustainability points at the EcosurfacesSection,
 * Community at SignatureProjects and Signature Projects at the
 * InspirationGrid.
 */

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "sec-sustainability", label: "Sustainability", icon: Leaf },
  { id: "sec-collections", label: "Collections", icon: Layers },
  { id: "sec-applications", label: "Applications", icon: LayoutGrid },
  { id: "sec-origin", label: "Origin", icon: Factory },
  { id: "sec-architects", label: "Community", icon: Users },
  { id: "sec-projects", label: "Signature Projects", icon: Building2 },
  { id: "sec-visualize", label: "Visualize", icon: Eye },
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
    // Land below the header (80 px), and below the bar on phones (48 px).
    el.style.scrollMarginTop = window.matchMedia("(min-width: 1024px)").matches ? "88px" : "128px";
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update the URL hash without forcing the browser to do its own
    // jump — keeps shareable links functional.
    if (history.pushState) history.pushState(null, "", `#${id}`);
  };

  return (
    <>
    {/* desktop: icon dock on the right edge */}
    <nav
      aria-label="Homepage sections"
      aria-hidden={!shown}
      className={`fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 transition-all duration-300 lg:block ${
        shown ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0"
      }`}
    >
      <ul className="flex flex-col gap-1 rounded-l-xl bg-[#14140f]/90 px-1.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <li key={s.id} className="group/dock relative">
              <a
                href={`#${s.id}`}
                tabIndex={shown ? 0 : -1}
                onClick={(e) => handleClick(e, s.id)}
                aria-label={s.label}
                aria-current={isActive ? "true" : undefined}
                // Inline colours: the bw-temp skin rewrites colour utilities.
                style={{ color: isActive ? "#14140f" : "#ffffff", background: isActive ? "#ffffff" : "transparent" }}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive ? "" : "opacity-75 hover:bg-white/10 hover:opacity-100"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
              </a>
              <span
                aria-hidden="true"
                style={{ color: "#ffffff" }}
                className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md bg-[#14140f]/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] opacity-0 transition-all duration-200 group-hover/dock:translate-x-0 group-hover/dock:opacity-100 group-focus-within/dock:translate-x-0 group-focus-within/dock:opacity-100"
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
    {/* phones and tablets: the swipeable bar under the header */}
    <nav
      ref={navRef}
      aria-label="Homepage sections"
      aria-hidden={!shown}
      className={`fixed inset-x-0 top-20 z-40 border-b border-black/10 bg-white/90 backdrop-blur-md transition-all duration-300 lg:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <ul className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden">
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
    </>
  );
}
