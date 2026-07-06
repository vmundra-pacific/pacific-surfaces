"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";

/**
 * Reusable FAQ section with collapsible accordion + FAQPage JSON-LD.
 *
 * Drops into any page with `<FAQ questions={[...]} />`. The JSON-LD
 * schema attached at the section root makes the Q&A eligible for
 * Google's "People also ask" rich result on search pages — that's
 * the SEO win.
 *
 * Visual: editorial accordion. Question is always visible; answer
 * unfolds on click with a smooth height animation. Plus/minus icon
 * indicator. Brand-consistent typography.
 */
export interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  /** Question/answer pairs to render. */
  questions: FAQItem[];
  /** Section eyebrow, e.g. "FAQ" or "Quartz Questions". */
  eyebrow?: string;
  /** Section heading, e.g. "Frequently Asked Questions". */
  heading?: string;
  /** Section background — light (cream) or dark (navy). Default light. */
  theme?: "light" | "dark";
  /** Section id for scroll anchors. */
  id?: string;
}

export function FAQ({
  questions,
  eyebrow = "FAQ",
  heading = "Frequently Asked Questions",
  theme = "light",
  id,
}: FAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!questions || questions.length === 0) return null;

  const isLight = theme === "light";
  const sectionBg = isLight ? "bg-[#DAE1E8]" : "bg-stone-950";
  const eyebrowColor = isLight ? "text-stone-500" : "text-stone-500";
  const headingColor = isLight ? "text-stone-900" : "text-white";
  const dividerColor = isLight ? "border-stone-300" : "border-white/10";
  const questionColor = isLight ? "text-stone-900" : "text-white";
  const answerColor = isLight ? "text-stone-700" : "text-stone-300";
  const iconColor = isLight ? "text-stone-700" : "text-pacific-mid";

  return (
    <section
      id={id ?? "sec-faq"}
      className={`py-16 sm:py-20 md:py-28 px-6 ${sectionBg} scroll-mt-20`}
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <div
            className={`text-xs font-medium tracking-[0.25em] uppercase mb-3 ${eyebrowColor}`}
          >
            {eyebrow}
          </div>
          <TextReveal
            as="h2"
            className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.08] ${headingColor}`}
          >
            {heading}
          </TextReveal>
        </div>

        {/* Accordion */}
        <div className={`border-t ${dividerColor}`}>
          {questions.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className={`border-b ${dividerColor}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-5 sm:py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-base sm:text-lg font-medium leading-snug ${questionColor}`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 mt-0.5 ${iconColor} transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <Minus className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className={`pb-5 sm:pb-7 pr-10 text-sm sm:text-base font-light leading-relaxed ${answerColor}`}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON-LD FAQPage schema for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: questions.map((q) => ({
              "@type": "Question",
              name: q.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: q.a,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
