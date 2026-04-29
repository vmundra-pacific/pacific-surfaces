"use client";

/**
 * TestimonialsSection — full-viewport pinned testimonials with
 * scroll-driven transitions.
 *
 * Why this version
 * ----------------
 * The previous implementation used per-layer opacity/translate
 * keyframes driven directly off scrollYProgress. That gave smooth
 * scroll-tied motion in theory, but in practice keyframes from
 * adjacent slots could co-render at low opacity simultaneously —
 * producing the "ghost stack" of testimonials on top of each
 * other.
 *
 * This version splits the responsibilities cleanly:
 *
 *   1. Scroll position picks WHICH testimonial is current. We
 *      subscribe to scrollYProgress with `useMotionValueEvent` and
 *      derive an index (0..total-1) by flooring `progress * total`.
 *      That's the only thing scroll does — pick the index.
 *
 *   2. Transition between testimonials is handled by
 *      `<AnimatePresence mode="wait">`. The current testimonial
 *      mounts; when the index changes, the previous one fully
 *      animates out BEFORE the next one mounts. This makes
 *      ghost-stacking impossible — at most one testimonial is in
 *      the React tree at a time.
 *
 *   3. Within a testimonial's slot, the quote has a subtle
 *      scroll-tied y parallax (±20px around centre) so the section
 *      still feels alive while pinned. Tied to a sub-progress
 *      computed from the user's position WITHIN the active slot.
 *
 * The section is `(N × 100vh)` tall so each testimonial gets a
 * full viewport's worth of scroll before the next one is selected,
 * and the inner content sticks at top-0 h-screen as before.
 */

import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Absolutely impressed with the finish and quality. The slab looks even better in real life than in the catalogue. It instantly elevated the entire space.",
  },
  {
    quote:
      "Consistent quality, excellent polish, and reliable delivery timelines. It's become our go-to choice for premium projects.",
  },
  {
    quote:
      "We chose this for our kitchen, and it's been the best decision. Easy to maintain, highly durable, and looks stunning every single day.",
  },
  {
    quote:
      "The detailing and veining are incredibly natural. It gives the elegance of marble with the strength of quartz — perfect for modern interiors.",
  },
  {
    quote:
      "From material selection to final installation, the entire experience felt premium. You can truly see the difference in quality.",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const total = TESTIMONIALS.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pick the active testimonial based on scroll. Floor(progress *
  // total) gives a clean integer that only changes when the user
  // crosses an exact slot boundary — no fractional overlap.
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(total - 1, Math.max(0, Math.floor(latest * total)));
    setCurrentIndex((prev) => (prev === idx ? prev : idx));
  });

  return (
    <section
      ref={ref}
      className="relative bg-[#0a1620]"
      style={{ minHeight: `${total * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Pinned eyebrow */}
        <div className="absolute top-8 left-6 lg:top-12 lg:left-12 z-20">
          <div className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-pacific-mid">
            06 · Voices
          </div>
        </div>

        <ProgressIndicator currentIndex={currentIndex} total={total} />

        {/* Background watermark glyph — static behind the
            testimonial, faintly visible. */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <Quote
            className="w-[60vmin] h-[60vmin] text-pacific-light/[0.05]"
            strokeWidth={1}
          />
        </div>

        {/* Testimonial — only one mounted at a time thanks to
            AnimatePresence mode="wait". The exit animation
            completes before the next one enters, so ghost-stacking
            is structurally impossible. */}
        <AnimatePresence mode="wait" initial={false}>
          <TestimonialFrame
            key={currentIndex}
            testimonial={TESTIMONIALS[currentIndex]}
            scrollYProgress={scrollYProgress}
            currentIndex={currentIndex}
            total={total}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ================================================================== *
 *  Single testimonial frame.                                          *
 * ================================================================== */

function TestimonialFrame({
  testimonial,
  scrollYProgress,
  currentIndex,
  total,
}: {
  testimonial: Testimonial;
  scrollYProgress: MotionValue<number>;
  currentIndex: number;
  total: number;
}) {
  // Sub-parallax: a small ±20px y nudge based on the user's
  // position WITHIN this testimonial's slot. Keeps the pinned
  // moment from feeling completely static — the quote drifts up
  // gently as you scroll through its assigned screen.
  const slice = 1 / total;
  const slotStart = currentIndex * slice;
  const slotEnd = slotStart + slice;
  const subY = useTransform(scrollYProgress, [slotStart, slotEnd], [20, -20]);

  return (
    <motion.div
      // Enter from below + invisible, exit upward + invisible. The
      // fade is short (260ms) so quick scrollers don't see a
      // limp-feeling transition. Easing matches the rest of the
      // site's editorial motion language.
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
    >
      <motion.blockquote
        style={{ y: subY }}
        className="relative z-10 max-w-4xl text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.25]"
      >
        <span aria-hidden="true" className="text-pacific-mid/60 text-3xl mr-1">
          “
        </span>
        {testimonial.quote}
        <span aria-hidden="true" className="text-pacific-mid/60 text-3xl ml-1">
          ”
        </span>
      </motion.blockquote>
    </motion.div>
  );
}

/* ================================================================== *
 *  Progress indicator                                                 *
 * ================================================================== */

function ProgressIndicator({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-6 lg:right-12 z-20 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === currentIndex;
        return (
          <motion.div
            key={i}
            animate={{
              opacity: active ? 1 : 0.3,
              scale: active ? 1.4 : 0.7,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-1.5 h-1.5 rounded-full bg-white"
          />
        );
      })}
    </div>
  );
}
