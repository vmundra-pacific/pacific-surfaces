"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, X } from "lucide-react";
import { SPEC_SHEET_PDF, TechnicalSpecs } from "@/components/sections/sills/TechnicalSpecs";

/**
 * "View technical specifications": the crate sheet in a dialog over the
 * page, with the PDF download beside it, so the page itself stays short.
 * Escape, the close button or a click outside the panel closes it; the page
 * behind does not scroll while it is open.
 */

const DARK = "inline-flex h-11 items-center gap-2 bg-[#1D1D1C] px-6 text-[13px] font-light text-white transition-opacity hover:opacity-85";
const OUTLINE = "inline-flex h-11 items-center gap-2 border border-[#14140f] px-6 text-[13px] font-light transition-colors hover:bg-[#ECECE8]";

export function TechSpecsButtons() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const back = opener.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      back?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button ref={opener} type="button" onClick={() => setOpen(true)} className={DARK} data-over-media>
          <FileText className="h-4 w-4" aria-hidden="true" />
          View technical specifications
        </button>
        <a href={SPEC_SHEET_PDF} download className={OUTLINE}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download spec sheet (PDF)
        </a>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[400] flex justify-center bg-black/55 sm:p-6 lg:p-10"
            onClick={() => setOpen(false)}
          >
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tech-specs-title"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full w-full max-w-6xl overflow-y-auto overscroll-contain bg-white text-[#14140f] outline-none"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#14140f]/10 bg-white px-5 py-4 sm:px-8">
                <h2 id="tech-specs-title" className="text-sm uppercase tracking-[0.12em]">
                  Technical specifications
                </h2>
                <div className="flex items-center gap-2">
                  <a href={SPEC_SHEET_PDF} download className="inline-flex items-center gap-1.5 text-xs font-light underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    PDF
                  </a>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-2 hover:opacity-60">
                    <X className="h-5 w-5" strokeWidth={1.25} />
                  </button>
                </div>
              </div>
              <div className="px-5 py-8 sm:px-8 sm:py-10">
                <p className="max-w-2xl text-sm font-light leading-relaxed opacity-80">
                  Pacific European Window Sill &amp; Threshold Collection: every standard size with its thickness, the pieces
                  in a crate, and the crate&apos;s approximate net stone weight and area.
                </p>
                <div className="mt-8">
                  <TechnicalSpecs />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
