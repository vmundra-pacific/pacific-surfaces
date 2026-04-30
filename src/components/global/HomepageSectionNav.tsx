"use client";

import { useEffect, useState } from "react";

/**
 * HomepageSectionNav — pinned left-middle vertical nav listing the
 * homepage's major sections by chapter number + name.
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
 *    cream section. With difference blending, the text auto-inverts
 *    relative to whatever's behind it: white-on-dark stays light,
 *    white-on-light becomes dark. Single property, no scroll-tied
 *    color tracking needed.
 *
 * 3. The thin Manufacturer marquee strip is intentionally not in
 *    the nav. It's only ~50px tall, so jumping to its anchor lands
 *    almost exactly where the next section (Origin) starts —
 *    indistinguishable to the user. Skip it; the marquee is
 *    decorative, not a destination.
 *
 * Hidden below `lg` (1024px) — phone/tablet users get the regular
 * scroll experience without an extra UI band overlapping content.
 */

const SECTIONS: { id: string; num: string; label: string }[] = [
  { id: "sec-collections", num: "01", label: "Collections" },
  { id: "sec-applications", num: "02", label: "Applications" },
  { id: "sec-origin", num: "03", label: "Origin" },
  // SignatureProjects section is framed as architect endorsement
  // ("specified by architects on every continent") — the nav label
  // reflects that angle directly rather than the generic "Projects".
  { id: "sec-projects", num: "04", label: "Architects" },
  { id: "sec-voices", num: "05", label: "Voices" },
  { id: "sec-inspiration", num: "06", label: "Inspiration" },
  { id: "sec-visualize", num: "07", label: "Visualize" },
];

export function HomepageSectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Observe each section. When one's centred chunk crosses the
    // viewport, mark it active. rootMargin shrinks the "active band"
    // to roughly the middle 10% of viewport height — stable enough
    // that adjacent sections don't flap at the boundary.
    const observers: IntersectionObserver[] = [];
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const o = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
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
  // anchor jump (which can drop or fight Lenis under load).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
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
      // mix-blend-mode: difference makes the white text auto-invert
      // relative to whatever's behind it — readable on both the dark
      // navy sections AND the cream Inspiration section without any
      // scroll-tied color tracking.
      className="fixed left-3 xl:left-5 top-1/2 -translate-y-1/2 z-30 hidden lg:block mix-blend-difference"
      aria-label="Homepage section navigation"
    >
      <ul className="flex flex-col gap-2.5">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                // Very small font per editorial spec — items read like
                // a side-margin annotation rather than a chunky nav.
                // Active item is full white (high contrast inversion);
                // rest sit at lower opacity for subtle hierarchy.
                className={`group flex items-center gap-1.5 text-[8px] sm:text-[9px] tracking-[0.18em] uppercase transition-opacity duration-300 text-white ${
                  isActive ? "opacity-100" : "opacity-50 hover:opacity-90"
                }`}
              >
                <span
                  className={`block h-px transition-all duration-300 bg-current ${
                    isActive ? "w-4" : "w-2 group-hover:w-3"
                  }`}
                />
                <span className="font-medium tabular-nums">{s.num}</span>
                <span>{s.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
