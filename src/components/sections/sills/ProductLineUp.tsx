"use client";

import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PANEL } from "@/components/sections/sills/SillsBlocks";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { SizeChartButton } from "@/components/sections/sills/SizeChart";
import { SillIsoDrawing } from "@/components/sections/SillIsoDrawing";
import { SillProfileDrawing } from "@/components/sections/SillProfileDrawing";
import { PRODUCT_GROUPS, SILL_PRODUCTS, type SillProduct } from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * The products as a line-up (owner, 2026-10-06, of four layouts tried:
 * "this is nice, use this layout"): a small card each, the piece drawn in
 * 3D; a card opens the piece in 3D with its length, width and thickness
 * marked, its labelled section (straight or sloped top where it has both),
 * what it is, and its sizes.
 */

const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const GROUP: Record<string, string> = Object.fromEntries(PRODUCT_GROUPS.map((g) => [g.id, g.title]));
/** The open piece's drawings share one scale of text: one pair of frames
 *  for phones, one from md up, where the window has two columns. */
const DETAIL = {
  phone: { iso: { w: 1000, h: 700 }, section: { w: 1140, h: 640 }, font: 44 },
  wide: { iso: { w: 1300, h: 720 }, section: { w: 1300, h: 600 }, font: 34 },
};

export function ProductLineUp() {
  const [open, setOpen] = useState<SillProduct | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {SILL_PRODUCTS.map((p) => (
          <li key={p.slug} id={p.slug} className="scroll-mt-28">
            <button
              type="button"
              onClick={() => setOpen(p)}
              aria-haspopup="dialog"
              className={cn(PANEL, "group flex h-full w-full flex-col p-3 text-left")}
            >
              <span className="flex aspect-square w-full items-center justify-center bg-white p-3">
                <SillIsoDrawing profile={p.sections[0]} length={p.drawLength * 1000} dims={false} className="h-auto w-full" />
              </span>
              <span className="mt-3 text-[10px] uppercase tracking-[0.14em] opacity-60">{GROUP[p.group]}</span>
              <span className="mt-1 text-base font-light leading-snug">{p.name}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-light opacity-60 group-hover:opacity-100">
                Details
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <SillDialog title={open.name} onClose={close} fit>
          <ProductDetail product={open} />
        </SillDialog>
      )}
    </>
  );
}

/* One product in full: in 3D and in section, what it is, and its sizes. */
function ProductDetail({ product }: { product: SillProduct }) {
  const [shown, setShown] = useState(0);
  const section = product.sections[shown];
  return (
    <div className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-10">
      <div className="flex flex-col gap-3">
        {product.sections.length > 1 && (
          <div role="group" aria-label="Top" className="flex gap-1">
            {product.sections.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                aria-pressed={i === shown}
                onClick={() => setShown(i)}
                className={cn(
                  "border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors",
                  i === shown ? "border-[#14140f] bg-[#14140f] text-white" : "border-[#14140f]/20 hover:border-[#14140f]/60"
                )}
                data-over-media={i === shown ? true : undefined}
              >
                {s.variant ?? s.name}
              </button>
            ))}
          </div>
        )}
        <div className="border border-[#14140f]/10 bg-white">
          {(["phone", "wide"] as const).map((k) => (
            <SillIsoDrawing
              key={`${k}-${section.slug}`}
              profile={section}
              length={product.drawLength * 1000}
              frame={DETAIL[k].iso}
              font={DETAIL[k].font}
              className={k === "phone" ? "block h-auto w-full md:hidden" : "hidden h-auto w-full md:block"}
            />
          ))}
        </div>
        <div className="border border-[#14140f]/10 bg-white">
          {(["phone", "wide"] as const).map((k) => (
            <SillProfileDrawing
              key={k}
              profile={section}
              frame={DETAIL[k].section}
              font={DETAIL[k].font}
              id={`detail-${section.slug}-${k}`}
              className={k === "phone" ? "block h-auto w-full md:hidden" : "hidden h-auto w-full md:block"}
            />
          ))}
        </div>
        <p className="text-xs font-light opacity-60">Drawings not to scale.</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">{GROUP[product.group]}</p>
        <h3 style={LIGHT} className="mt-2 text-3xl leading-tight">
          {product.name}
        </h3>
        {product.option && <p className="mt-2 text-[11px] uppercase tracking-[0.14em] opacity-60">{product.option}</p>}
        <p className="mt-4 max-w-md text-base font-light leading-relaxed">{product.description}</p>
        <div className="mt-6">
          {product.sizes ? (
            <SizeChartButton label={product.sizes === "sills" ? "Window sill sizes" : "Threshold sizes"} />
          ) : (
            <p className="text-sm font-light opacity-70">Custom sizes: send us the length, width and thickness you need.</p>
          )}
        </div>
      </div>
    </div>
  );
}
