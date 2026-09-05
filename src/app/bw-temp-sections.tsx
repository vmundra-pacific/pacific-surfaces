"use client";

import { useEffect } from "react";

/**
 * TEMPORARY — marks the few sections that keep a dark ground.
 *
 * Part of the black & white brand test. Delete this file, its import in
 * app/layout.tsx, and bw-temp.css to restore the site.
 *
 * Why a script rather than CSS: every scroll section on the homepage is
 * built the same way — a navy <section> wrapping a sticky full-height
 * stage — so nothing in the markup separates Collections (text sits on the
 * page, wants black) from The Origin (text sits over photography, wants
 * white). Structure was tried twice and matched both. Their eyebrow labels
 * do distinguish them, and CSS cannot select on text.
 *
 * To move a section between the two treatments, add or remove a phrase
 * from it below. Matching is case-insensitive, partial, and ignores all
 * whitespace — several headings here are split into one <span> per word
 * for their reveal animation (see ui/text-reveal), so the section's
 * textContent runs the words together and a normal phrase would never
 * match. Normalising both sides means you can write the label the way it
 * reads on screen.
 */
const KEEP_DARK = [
  "Scroll to explore", // the hero, whose copy sits over the video
  "The Origin", // full-bleed facility photography behind the copy
  // Both of these are h-screen sections whose copy sits directly on a
  // full-bleed photo or video, so black text landed on the imagery.
  // Matched on the headline rather than the eyebrow — the eyebrows read
  // "06 · Projects" and the middot is easy to get wrong.
  "How designers are using Pacific", // InspirationGrid
  // Matched on the body copy, not the headline: that heading is split
  // into one span per word for its reveal animation, so the section's
  // textContent reads "Seeanysurfaceinyourroom." with no spaces and the
  // obvious label never matched. Pick a phrase from a single text node.
  "Tap any surface in a curated demo room", // VisualizerStrip
  // Full-bleed slab photography behind the whole block.
  "Pacific Surfaces is a low-silica mineral-infused", // EcosurfacesSection
];

/** Lowercase and drop every space, so word-split headings still match. */
const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export default function BwTempSections() {
  useEffect(() => {
    const mark = () => {
      for (const section of document.querySelectorAll("section")) {
        const text = section.textContent ?? "";
        // Deliberately not `section.querySelector("video")`: Kitchen, Bath,
        // Commercial, Community and Voices all embed video in their cards
        // while their copy sits on the page ground, so that test marked
        // five sections dark that should read black.
        const haystack = normalise(text);
        const dark = KEEP_DARK.some((label) =>
          haystack.includes(normalise(label))
        );
        section.toggleAttribute("data-bw-dark", dark);
      }
    };

    mark();
    // Sections mount as you scroll, so re-run when the DOM settles.
    const observer = new MutationObserver(() => mark());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
