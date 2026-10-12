"use client";

import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PANEL } from "@/components/sections/sills/SillsBlocks";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { SillIsoDrawing } from "@/components/sections/SillIsoDrawing";
import { SillSectionDims } from "@/components/sections/SillSectionDims";
import { PRODUCT_GROUPS, SILL_COLOURS, SILL_PRODUCTS, m2, sizesByLength, type SillProduct, type SizeRow } from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * The products as a line-up (owner, 2026-10-06, of four layouts tried:
 * "this is nice, use this layout"): a small card each, the piece drawn in
 * 3D; a card opens the piece in 3D with its length, width and thickness
 * marked, its section drawn with the figures on record (straight or sloped
 * top where it has both), what it is, and the sizes of that product alone
 * (owner, 2026-10-10: not the whole size chart).
 */

const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const GROUP: Record<string, string> = Object.fromEntries(PRODUCT_GROUPS.map((g) => [g.id, g.title]));
/** The open piece's drawings share one scale of text: one pair of frames
 *  for phones, one from md up, where the window has two columns. */
const DETAIL = {
  phone: { iso: { w: 1000, h: 700 }, font: 44 },
  wide: { iso: { w: 1300, h: 720 }, font: 34 },
};
const HEAD = "px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em]";
const CELL = "px-3 py-2 font-light";

export function ProductLineUp() {
  const [open, setOpen] = useState<SillProduct | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
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
    <div className="grid gap-8 md:grid-cols-[11fr_9fr] md:gap-10">
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
        <div className="border border-[#14140f]/10 bg-white px-2 py-4">
          <SillSectionDims key={section.slug} profile={section} id={`detail-${section.slug}`} className="block h-auto max-h-[300px] w-full" />
        </div>
        <p className="text-xs font-light opacity-60">
          Section drawn in proportion, dimensioned where the figures are fixed; the 3D drawing is not to scale.
        </p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">{GROUP[product.group]}</p>
        <h3 style={LIGHT} className="mt-2 text-3xl leading-tight">
          {product.name}
        </h3>
        {product.option && <p className="mt-2 text-[11px] uppercase tracking-[0.14em] opacity-60">{product.option}</p>}
        <p className="mt-4 max-w-md text-base font-light leading-relaxed">{product.description}</p>
        <ProductColours product={product} />
        <div className="mt-8">
          {product.sizes ? (
            <ProductSizes product={product} rows={product.sizes} />
          ) : (
            <p className="border-t border-[#14140f]/15 pt-4 text-sm font-light leading-relaxed opacity-80">
              Made to order: send us the length, width and thickness you need, or your drawing, and we cut it to size.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* The sizes of this product alone, each length's widths under it, with
   the crate figures where the crate sheet has them. */
function ProductSizes({ product, rows }: { product: SillProduct; rows: SizeRow[] }) {
  const crate = rows.some((r) => r.pieces);
  const sloped = rows.some((r) => r.front);
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">
        Sizes{product.sizesFor ? ` · ${product.sizesFor}` : ""}
      </p>
      <table className="mt-3 w-full border-collapse border border-[#14140f]/15 bg-white text-left text-sm tabular-nums">
        <caption className="sr-only">{product.name}: sizes in centimetres</caption>
        <thead className="bg-[#EFEDE9]">
          <tr className="border-b border-[#14140f]/40">
            <th scope="col" className={HEAD}>
              Length (cm)
            </th>
            <th scope="col" className={cn(HEAD, "border-l border-[#14140f]/10")}>
              Width (cm)
            </th>
            <th scope="col" className={cn(HEAD, "border-l border-[#14140f]/10")}>
              {sloped ? "Height, back / front (cm)" : "Thickness (cm)"}
            </th>
            {crate && (
              <th scope="col" className={cn(HEAD, "border-l border-[#14140f]/10")}>
                Pcs / crate
              </th>
            )}
            {crate && (
              <th scope="col" className={cn(HEAD, "hidden border-l border-[#14140f]/10 sm:table-cell")}>
                Approx. kg / m²
              </th>
            )}
          </tr>
        </thead>
        {sizesByLength(rows).map(({ length, sizes }) => (
          <tbody key={length} className="border-b border-[#14140f]/20">
            {sizes.map((r, i) => (
              <tr key={`${r.width}-${r.thickness}`}>
                {i === 0 && (
                  <th scope="rowgroup" rowSpan={sizes.length} className={cn(CELL, "align-top")}>
                    {length}
                  </th>
                )}
                <td className={cn(CELL, "border-l border-[#14140f]/10")}>{r.width}</td>
                <td className={cn(CELL, "border-l border-[#14140f]/10")}>{r.front ? `${r.thickness} / ${r.front}` : r.thickness}</td>
                {crate && <td className={cn(CELL, "border-l border-[#14140f]/10")}>{r.pieces ?? "–"}</td>}
                {crate && (
                  <td className={cn(CELL, "hidden border-l border-[#14140f]/10 sm:table-cell")}>
                    {r.kg ? `${r.kg.toLocaleString("en-GB")} / ${m2(r.m2 ?? 0)}` : "–"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <p className="mt-3 text-xs font-light leading-relaxed opacity-60">
        {crate
          ? "Per crate: approximate net stone weight and area; pieces per crate can be changed to suit the order. "
          : "Pieces per crate to suit the order. "}
        Custom sizes are cut to your drawings.
      </p>
    </div>
  );
}

/* The colours it is cut in (owner, 2026-10-10: the available colours with
   each product): quartz only where every size is 3 cm or thinner. */
function ProductColours({ product }: { product: SillProduct }) {
  const thick = product.sizes?.some((r) => r.thickness > 3);
  return (
    <div className="mt-6 space-y-4">
      {SILL_COLOURS.filter((g) => !(g.material === "Quartz" && thick)).map((g) => (
        <div key={g.material}>
          <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">
            {g.material} · {g.finishes.join(", ").toLowerCase()}
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {g.colours.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-sm font-light">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 rounded-full border border-[#14140f]/20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.image})` }}
                />
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {thick && <p className="text-xs font-light opacity-60">Quartz is made 2 and 3 cm thick, so this piece is cut in granite.</p>}
    </div>
  );
}
