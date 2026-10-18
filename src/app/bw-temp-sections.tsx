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
 * for their reveal animation (see ui/text-reveal), so a section's
 * textContent need not space its words the way the screen does.
 * Normalising both sides means you can write the label the way it reads
 * on screen.
 *
 * Text inside [hidden] or [inert] (collapsed FAQ answers, inactive tab
 * panels) is left out: it stays in the DOM so crawlers can read it, but it
 * used to be unmounted until opened, and a collapsed answer that happened
 * to contain a label must not darken its section.
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
  // into one span per word for its reveal animation. Pick a phrase from
  // a single text node.
  "Tap any surface in a curated demo room", // VisualizerStrip
  // Full-bleed slab photography behind the whole block.
  "Pacific Surfaces is a low-silica mineral-infused", // EcosurfacesSection
];

/** Lowercase and drop every space, so word-split headings still match. */
const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, "");

export default function BwTempSections() {
  useEffect(() => {
    const labels = KEEP_DARK.map(normalise);
    // The text each section had when last checked, and the verdict it gave.
    // A section whose text hasn't changed reuses it and skips normalising.
    const seen = new WeakMap<Element, { text: string; dark: boolean }>();
    const hasLabel = (text: string) => {
      const haystack = normalise(text);
      return labels.some((label) => haystack.includes(label));
    };
    /** A section's text without what sits inside [hidden] or [inert]. */
    const shownText = (section: Element) => {
      const walker = document.createTreeWalker(
        section,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) =>
            node instanceof Element &&
            (node.hasAttribute("hidden") || node.hasAttribute("inert"))
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT,
        }
      );
      let text = "";
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE) text += node.nodeValue ?? "";
      }
      return text;
    };

    const mark = () => {
      for (const section of document.querySelectorAll("section")) {
        const text = section.textContent ?? "";
        let verdict = seen.get(section);
        if (verdict?.text !== text) {
          // Deliberately not `section.querySelector("video")`: Kitchen, Bath,
          // Commercial, Community and Voices all embed video in their cards
          // while their copy sits on the page ground, so that test marked
          // five sections dark that should read black.
          verdict = { text, dark: hasLabel(text) };
          seen.set(section, verdict);
        }
        // Leaving hidden text out only matters when the full text matches,
        // so the walk runs just for a matching section that has some.
        const dark =
          verdict.dark &&
          (!section.querySelector("[hidden], [inert]") ||
            hasLabel(shownText(section)));
        section.toggleAttribute("data-bw-dark", dark);
      }
    };

    /** The innermost <section> around a node, if there is one. */
    const sectionOf = (node: Node) =>
      (node instanceof Element ? node : node.parentElement)?.closest("section");
    const addsSection = (record: MutationRecord) => {
      for (const node of record.addedNodes) {
        if (
          node instanceof Element &&
          (node.matches("section") || node.querySelector("section"))
        ) {
          return true;
        }
      }
      return false;
    };

    mark();
    // Sections mount as you scroll, so re-run when the DOM settles. Still
    // synchronous (HomepageSectionNav samples these grounds every frame),
    // but a batch is skipped when no section's text can have changed since
    // the last pass: every insertion or removal sat outside the sections
    // (mega menus, the WhatsApp button, portals) and brought none with it.
    // Text edits are watched only so they are not missed by that skip; as
    // before, they are picked up by the next insertion or removal. Toggling
    // [hidden] / [inert] counts as an insertion or removal: opening an FAQ
    // answer or switching a tab used to mount its text.
    let textEdited = false;
    const observer = new MutationObserver((records) => {
      let structural = false;
      let touched = false;
      for (const record of records) {
        if (record.type === "characterData") {
          if (!textEdited && sectionOf(record.target)) textEdited = true;
          continue;
        }
        structural = true;
        if (!touched && (sectionOf(record.target) || addsSection(record))) {
          touched = true;
        }
      }
      if (structural && (touched || textEdited)) {
        textEdited = false;
        mark();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["hidden", "inert"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
