"use client";

import { useCallback, useState } from "react";
import { Download, FileText } from "lucide-react";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { MaterialTests, SPEC_SHEET_PDF, TechnicalSpecs } from "@/components/sections/sills/TechnicalSpecs";

/**
 * "View technical specifications": the crate sheet in a dialog over the
 * page (sills/SillDialog), with the PDF download beside it, so the page
 * itself stays short.
 */

const DARK = "inline-flex h-11 items-center gap-2 bg-[#1D1D1C] px-6 text-[13px] font-light text-white transition-opacity hover:opacity-85";
const OUTLINE = "inline-flex h-11 items-center gap-2 border border-[#14140f] px-6 text-[13px] font-light transition-colors hover:bg-[#ECECE8]";

export function PdfLink() {
  return (
    <a href={SPEC_SHEET_PDF} download className="inline-flex items-center gap-1.5 text-xs font-light underline-offset-4 hover:underline">
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      PDF
    </a>
  );
}

export function TechSpecsButtons() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setOpen(true)} className={DARK} data-over-media>
          <FileText className="h-4 w-4" aria-hidden="true" />
          View technical specifications
        </button>
        <a href={SPEC_SHEET_PDF} download className={OUTLINE}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download spec sheet (PDF)
        </a>
      </div>

      {open && (
        <SillDialog title="Technical specifications" onClose={close} actions={<PdfLink />}>
          <p className="max-w-2xl text-sm font-light leading-relaxed opacity-80">
            Pacific European Window Sill &amp; Threshold Collection: the test results for quartz and Warangal Black
            granite, then every popular size with its thickness, the pieces in a crate, and the crate&apos;s approximate
            net stone weight and area.
          </p>
          <h3 className="mt-10 border-b border-[#14140f]/15 pb-3 text-[11px] uppercase tracking-[0.15em] opacity-70">
            Material properties
          </h3>
          <div className="mt-6">
            <MaterialTests />
          </div>
          <h3 className="mt-14 border-b border-[#14140f]/15 pb-3 text-[11px] uppercase tracking-[0.15em] opacity-70">
            Sizes and crates
          </h3>
          <div className="mt-6">
            <TechnicalSpecs />
          </div>
        </SillDialog>
      )}
    </>
  );
}
