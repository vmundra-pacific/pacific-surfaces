"use client";

/**
 * TestimonialsSection — five voices, all on one screen.
 *
 * Was previously a scroll-pinned (N × 100vh) section that swapped
 * one testimonial at a time. Restructured to a single-screen grid
 * where every quote is visible simultaneously, with each card
 * animating in from a different edge of the viewport (left, top,
 * right, bottom-left, bottom-right) when the section enters view.
 * The convergent entry choreography reads as "voices arriving from
 * everywhere" — appropriate for testimonials sourced from clients
 * across continents.
 */

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Absolutely impressed with the finish and quality. The slab looks even better in real life than in the catalogue. It instantly elevated the entire space.",
    name: "Julia",
    location: "California",
  },
  {
    quote:
      "Consistent quality, excellent polish, and reliable delivery timelines. It's become our go-to choice for premium projects.",
    name: "Emma",
    location: "Paris",
  },
  {
    quote:
      "We chose this for our kitchen, and it's been the best decision. Easy to maintain, highly durable, and looks stunning every single day.",
    name: "Rumi",
    location: "Egypt",
  },
  {
    quote:
      "The detailing and veining are incredibly natural. It gives the elegance of marble with the strength of quartz — perfect for modern interiors.",
    name: "Thomas",
    location: "Poland",
  },
  {
    quote:
      "From material selection to final installation, the entire experience felt premium. You can truly see the difference in quality.",
    name: "Alex",
    location: "Chicago",
  },
];

// Each card enters from a different viewport edge so the five voices
// converge on the centre instead of all sliding the same way. Order:
// left → top → right → bottom-left → bottom-right.
const ENTRY_OFFSETS: Array<{ x: number; y: number }> = [
  { x: -120, y: 0 }, // from left
  { x: 0, y: -120 }, // from top
  { x: 120, y: 0 }, // from right
  { x: -120, y: 120 }, // from bottom-left
  { x: 120, y: 120 }, // from bottom-right
];

export function TestimonialsSection() {
  return (
    <section
      id="sec-voices"
      className="relative bg-[#0a1620] py-16 sm:py-20 md:py-28 px-6 scroll-mt-20 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-pacific-mid mb-4">
            05 · Voices
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08] max-w-3xl">
            Trusted across continents.
          </h2>
        </motion.div>

        {/* Card grid — 1 col on phone, 2 on tablet, 6 on desktop.
            On desktop we use a 6-col grid with each card spanning 2
            cols at explicit col-start positions, so the top row of
            three sits at cols 1+3+5 and the bottom row of two
            centres at cols 2+4. The bottom pair lands directly
            between the gaps of the top three — visually centred
            instead of dangling left or right. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, i) => {
            const offset = ENTRY_OFFSETS[i % ENTRY_OFFSETS.length];
            return (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, x: offset.x, y: offset.y }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                // Stagger the cards slightly so they arrive in
                // sequence rather than landing on the same frame —
                // gives the convergence a sense of rhythm.
                transition={{
                  duration: 0.7,
                  delay: i * 0.1,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                // Desktop layout uses a 6-column grid with each card
                // spanning 2 cols. Top row: cols 1+3+5. Bottom row:
                // cols 2+4 — sits centred between the gaps of the
                // top row instead of left- or right-aligned.
                //
                // i = 0 (Julia)  → col-start-1, span-2
                // i = 1 (Emma)   → col-start-3, span-2
                // i = 2 (Rumi)   → col-start-5, span-2
                // i = 3 (Thomas) → col-start-2, span-2  ← centred bottom-left
                // i = 4 (Alex)   → col-start-4, span-2  ← centred bottom-right
                className={`relative h-full lg:col-span-2 ${
                  i === 0
                    ? "lg:col-start-1"
                    : i === 1
                      ? "lg:col-start-3"
                      : i === 2
                        ? "lg:col-start-5"
                        : i === 3
                          ? "lg:col-start-2"
                          : "lg:col-start-4"
                }`}
              >
                <Quote
                  className="w-6 h-6 text-pacific-mid/40 mb-4"
                  strokeWidth={1.25}
                />
                <blockquote className="text-base sm:text-[17px] font-light text-white leading-relaxed mb-6">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-medium">
                  <span className="text-white">{t.name}</span>
                  <span className="text-pacific-mid/40">·</span>
                  <span className="text-pacific-mid">{t.location}</span>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
