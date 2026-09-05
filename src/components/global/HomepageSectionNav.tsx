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
 * 2. CONTRAST is measured, not blended. This used to ride on
 *    `mix-blend-mode: difference`, which stopped working the moment
 *    the nav gained `z-30`: a positioned element with a z-index makes
 *    its own stacking context, and a blend group only sees the
 *    backdrop inside its own context — here, nothing. The labels
 *    blended against emptiness and just rendered their own colour.
 *
 *    Instead the rail samples what is actually behind it on scroll
 *    (`document.elementsFromPoint` at three points down its height),
 *    and picks a tone from that:
 *      - a photo, canvas or video behind it  → white + a drop shadow
 *      - a light background                  → black
 *      - a dark background                   → white
 *    Photography reads as "dark" for contrast purposes even when the
 *    image is pale — a marble kitchen is bright but busy, and black
 *    text disappears into the veining. White with a shadow survives
 *    both.
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

/** How the rail should paint itself against whatever is behind it. */
type Tone = "light" | "dark";

/** Relative luminance, 0 (black) to 1 (white). */
function luminance(r: number, g: number, b: number) {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Read the backdrop at one point. Returns "light" only for a solid,
 * genuinely pale background — everything else (photography, video,
 * canvas, a background-image, a dark fill) counts as "dark" so the
 * label stays white.
 */
function toneAt(x: number, y: number, skip: Element | null): Tone {
  const stack = document.elementsFromPoint(x, y);
  const el = stack.find((e) => !skip || !skip.contains(e));
  if (!el) return "light"; // off the page: the document ground is white

  const MEDIA = new Set(["IMG", "CANVAS", "VIDEO", "PICTURE", "SVG"]);
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (MEDIA.has(node.tagName)) return "dark";
    const cs = getComputedStyle(node);
    if (cs.backgroundImage && cs.backgroundImage !== "none") return "dark";
    const m = cs.backgroundColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (m) {
      const alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
      // Anything close to transparent isn't the real ground — keep
      // walking up to whatever is actually painting behind it.
      if (alpha > 0.5) {
        const l = luminance(+m[1], +m[2], +m[3]);
        return l > 0.6 ? "light" : "dark";
      }
    }
    node = node.parentElement;
  }
  return "light";
}

export function HomepageSectionNav() {
  const [active, setActive] = useState<string | null>(null);
  // One tone per item, not one for the rail. The rail is ~230px tall
  // and regularly straddles a section boundary — measuring it as a
  // single unit put black labels on the dark half and lost them.
  const [tones, setTones] = useState<Tone[]>(() =>
    SECTIONS.map(() => "dark" as Tone)
  );
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
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

  // Sample the backdrop as the page moves. Lenis animates scroll in a
  // rAF loop, so polling scrollY in our own rAF stays in step with it
  // without needing a Lenis instance; we only re-measure when the
  // position actually changed, so an idle page costs one comparison
  // per frame.
  useEffect(() => {
    let raf = 0;
    let lastY = -1;

    const measure = () => {
      const nav = navRef.current;
      if (!nav || nav.getBoundingClientRect().width === 0) return;
      const next = SECTIONS.map((_, i) => {
        const a = itemRefs.current[i];
        if (!a) return "dark" as Tone;
        const r = a.getBoundingClientRect();
        const y = r.top + r.height / 2;
        if (y < 0 || y > window.innerHeight) return "dark" as Tone;
        const x = Math.min(window.innerWidth - 1, r.left + r.width / 2);
        return toneAt(x, y, nav);
      });
      // Only re-render when something actually flipped; this runs off a
      // rAF loop and setState every frame would be wasteful.
      setTones((prev) =>
        prev.length === next.length && prev.every((t, i) => t === next[i])
          ? prev
          : next
      );
    };

    const tick = () => {
      const y = window.scrollY;
      if (y !== lastY) {
        lastY = y;
        measure();
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
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
      ref={navRef}
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
        {SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          const tone = tones[i] ?? "dark";
          // Colour is set inline rather than through a `text-white`
          // utility on purpose: bw-temp.css forces every .text-white to
          // black with !important, which is what made this rail black
          // over the hero in the first place. An inline colour also
          // beats any later utility collision.
          const colour = tone === "light" ? "#000000" : "#ffffff";
          return (
            <li key={s.id}>
              <a
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                style={{ color: colour }}
                // Bulleted nav: a small dot + label. No outline, no
                // pill background. Active item = filled dot + brighter
                // label; inactive = hollow ring + dimmer label. Group
                // hover swells the dot slightly so the click target
                // feels alive without bringing back a rectangle.
                //
                // The shadow only rides along on the white treatment —
                // white sits over photography as often as over navy,
                // and marble veining eats an unshadowed label.
                className={`group inline-flex items-center gap-2.5 2xl:gap-3 px-1 py-0.5 text-[9px] tracking-[0.18em] 2xl:text-[10.5px] 2xl:tracking-[0.22em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${
                  tone === "dark"
                    ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
                    : ""
                } ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
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
