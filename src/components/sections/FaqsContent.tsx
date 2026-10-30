"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import type { FAQItem } from "@/components/sections/FAQ";

/**
 * The /faqs page: every product FAQ set on one page, a chip row to jump
 * between them, and a plain accordion per set. The sets are the ones the
 * product pages carry (lib/faqs); this page's own FaqSchema repeats them.
 *
 * Built for the phone first: the chips wrap rather than scroll sideways,
 * each question is one full-width tap target, and sets are separated by a
 * rule and a heading, not by tall bands of padding.
 */
export interface FaqGroup {
  id: string;
  label: string;
  questions: FAQItem[];
}

function Accordion({ questions }: { questions: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();
  return (
    <div className="border-t border-pacific-mid/40">
      {questions.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-pacific-mid/40">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`${uid}-${i}`}
              className="flex w-full items-start justify-between gap-5 py-4 text-left sm:py-5"
            >
              <span className="text-[15px] font-medium leading-snug sm:text-lg">
                {item.q}
              </span>
              <span className="mt-0.5 shrink-0 opacity-70" aria-hidden="true">
                {isOpen ? (
                  <Minus className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Plus className="h-5 w-5" strokeWidth={1.5} />
                )}
              </span>
            </button>
            {/* Every answer stays in the page's HTML (hidden, not removed),
                as the FAQPage markup needs. */}
            <div
              id={`${uid}-${i}`}
              hidden={!isOpen}
              className="pb-5 pr-10 text-sm font-light leading-relaxed opacity-80 sm:text-base"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FaqsContent({ groups }: { groups: FaqGroup[] }) {
  return (
    <>
      <PageHeader
        badge="FAQs"
        title="Frequently asked questions"
        description="What people ask us most about our quartz, granite, sinks, vanities and facades."
      />

      {/* The same left edge as the heading above (max-w-7xl, as PageHeader),
          with the text held to a readable measure. */}
      <div className="mx-auto max-w-7xl px-6 pb-14 pt-4 sm:pb-20 lg:px-8">
        <div className="max-w-3xl">
          <nav aria-label="FAQ topics" className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#faq-${g.id}`}
                className="rounded-full border border-pacific-mid/50 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:border-current"
              >
                {g.label}
              </a>
            ))}
          </nav>

          {groups.map((g) => (
            <section
              key={g.id}
              id={`faq-${g.id}`}
              aria-labelledby={`faq-h-${g.id}`}
              className="mt-10 scroll-mt-24 sm:mt-14"
            >
              <h2
                id={`faq-h-${g.id}`}
                className="mb-4 text-2xl font-light tracking-tight sm:mb-6 sm:text-3xl"
              >
                {g.label}
              </h2>
              <Accordion questions={g.questions} />
            </section>
          ))}

          <p className="mt-12 text-sm font-light opacity-80 sm:text-base">
            Something we have not covered?{" "}
            <a href="/contact" className="underline underline-offset-4">
              Ask our team
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
