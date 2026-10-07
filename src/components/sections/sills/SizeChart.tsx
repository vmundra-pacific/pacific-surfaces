"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Ruler } from "lucide-react";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { PdfLink } from "@/components/sections/sills/TechSpecsDialog";
import { SILL_SIZES, THRESHOLD_SIZES, sizesByLength, type CrateRow } from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * The size chart of the sill collection: every popular size, one per row
 * under Length (cm), Width (cm) and Thickness (cm), each length's widths
 * grouped under it (the owner's boss: the units in the headings, length and
 * width plain). It opens from a button, never on the page itself (owner,
 * 2026-10-06): "View size chart" under Popular sizes, or a product card's
 * sizes link.
 */

const HEAD = "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em]";
const CELL = "px-4 py-2.5 font-light";

export function SizeTable({ title, rows }: { title: string; rows: CrateRow[] }) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.12em]">{title}</h3>
      <table className="mt-4 w-full table-fixed border-collapse border border-[#14140f]/15 bg-white text-left text-base tabular-nums">
        <caption className="sr-only">{title}: popular sizes, length, width and thickness in centimetres</caption>
        <thead className="bg-[#EFEDE9]">
          <tr className="border-b border-[#14140f]/40">
            <th scope="col" className={HEAD}>
              Length (cm)
            </th>
            <th scope="col" className={cn(HEAD, "border-l border-[#14140f]/10")}>
              Width (cm)
            </th>
            <th scope="col" className={cn(HEAD, "border-l border-[#14140f]/10")}>
              Thickness (cm)
            </th>
          </tr>
        </thead>
        {sizesByLength(rows).map(({ length, sizes }) => (
          <tbody key={length} className="border-b border-[#14140f]/20">
            {sizes.map((r, i) => (
              <tr key={r.width}>
                {i === 0 && (
                  <th scope="rowgroup" rowSpan={sizes.length} className={cn(CELL, "align-top")}>
                    {length}
                  </th>
                )}
                <td className={cn(CELL, "border-l border-[#14140f]/10")}>{r.width}</td>
                <td className={cn(CELL, "border-l border-[#14140f]/10")}>{r.thickness}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export function SizeChartButton({
  variant = "button",
  label = "View size chart",
  className,
}: {
  /** The black button, or an underlined link as on the product cards. */
  variant?: "button" | "link";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("inline-flex h-11 items-center gap-2 bg-[#1D1D1C] px-6 text-[13px] font-light text-white transition-opacity hover:opacity-85", className)}
          data-over-media
        >
          <Ruler className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("inline-flex w-fit items-center gap-1.5 border-b border-[#14140f] pb-0.5 text-xs font-light", className)}
        >
          {label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}

      {open && (
        <SillDialog title="Size chart" onClose={close} actions={<PdfLink />}>
          <p className="max-w-2xl text-sm font-light leading-relaxed opacity-80">
            Pacific European Window Sill &amp; Threshold Collection: the popular sizes, one per row, in centimetres. Custom
            sizes are cut to your drawings.
          </p>
          <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <SizeTable title="Window sills" rows={SILL_SIZES} />
            <SizeTable title="Thresholds" rows={THRESHOLD_SIZES} />
          </div>
        </SillDialog>
      )}
    </>
  );
}
