"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { PANEL } from "@/components/sections/sills/SillsBlocks";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { SillIsoDrawing } from "@/components/sections/SillIsoDrawing";
import {
  FINISHES,
  PRODUCT_GROUPS,
  SILL_COLOURS,
  flatSection,
  m2,
  sillPieces,
  type SillPiece,
} from "@/data/thresholds-and-sills";
import { cn } from "@/lib/utils";

/**
 * The collection piece by piece, laid out like the dealer catalogue the
 * owner liked (2026-10-06, kerasom.nl "Dorpels en Vensterbanken"): filter
 * groups down the side, each folding shut, with a count beside every
 * option; the pieces as rows or a grid, each drawn in its own colour and
 * proportions, named on one line with its size spelt out under it (length,
 * width, thickness: the boss's note), and a View button that opens it with
 * its figures. 25 at a time. No article numbers: the collection has none,
 * and none are made up.
 */

const PIECES = sillPieces();
const STEP = 25;
/** Options a filter shows before "Show all". */
const SHORT = 5;
const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const DARK = "inline-flex items-center justify-center gap-2 bg-[#1D1D1C] font-light text-white transition-opacity hover:opacity-85";
const OUTLINE = "inline-flex items-center justify-center gap-2 border border-[#14140f] font-light transition-colors hover:bg-[#ECECE8]";
const THUMB = { w: 1000, h: 667 };
const DETAIL = {
  phone: { frame: { w: 1000, h: 720 }, font: 44 },
  wide: { frame: { w: 1300, h: 760 }, font: 34 },
};

type Key = "product" | "colour" | "material" | "finish" | "thickness" | "length";
type Chosen = Record<Key, string[]>;

const FACETS: { key: Key; title: string; of: (p: SillPiece) => string[] }[] = [
  { key: "product", title: "Product", of: (p) => [p.product.name] },
  { key: "colour", title: "Colour", of: (p) => [p.colour.name] },
  { key: "material", title: "Material", of: (p) => [p.material] },
  { key: "finish", title: "Finish", of: (p) => p.finishes },
  { key: "thickness", title: "Thickness", of: (p) => [`${p.size.thickness} cm`] },
  { key: "length", title: "Length", of: (p) => [`${p.size.length} cm`] },
];

const numbers = (v: number[]) => Array.from(new Set(v)).sort((a, b) => a - b);

/** Each filter's options, in the order the page gives them. */
const OPTIONS: Record<Key, string[]> = {
  product: Array.from(new Set(PIECES.map((p) => p.product.name))),
  colour: SILL_COLOURS.flatMap((g) => g.colours.map((c) => c.name)),
  material: SILL_COLOURS.map((g) => g.material),
  finish: FINISHES.map((f) => f.name),
  thickness: numbers(PIECES.map((p) => p.size.thickness)).map((v) => `${v} cm`),
  length: numbers(PIECES.map((p) => p.size.length)).map((v) => `${v} cm`),
};

const NONE: Chosen = { product: [], colour: [], material: [], finish: [], thickness: [], length: [] };

const SWATCH: Record<string, string> = Object.fromEntries(SILL_COLOURS.flatMap((g) => g.colours.map((c) => [c.name, c.image])));
const GROUP: Record<string, string> = Object.fromEntries(PRODUCT_GROUPS.map((g) => [g.id, g.title]));

const SORTS = {
  product: { label: "Product", by: null },
  "size-up": {
    label: "Size, small to large",
    by: (a: SillPiece, b: SillPiece) => a.size.length - b.size.length || a.size.width - b.size.width || a.size.thickness - b.size.thickness,
  },
  "size-down": {
    label: "Size, large to small",
    by: (a: SillPiece, b: SillPiece) => b.size.length - a.size.length || b.size.width - a.size.width || b.size.thickness - a.size.thickness,
  },
} as const;
type Sort = keyof typeof SORTS;

/** Does the piece pass every filter but `skip`? */
function passes(p: SillPiece, chosen: Chosen, skip?: Key) {
  return FACETS.every((f) => f.key === skip || chosen[f.key].length === 0 || f.of(p).some((v) => chosen[f.key].includes(v)));
}

const nameOf = (p: SillPiece) => `${p.product.name} ${p.material} ${p.colour.name}`;
const sizeOf = (p: SillPiece) => `Length ${p.size.length} cm · Width ${p.size.width} cm · Thickness ${p.size.thickness} cm`;
const finishesOf = (p: SillPiece) => {
  const text = p.finishes.join(", ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** The piece drawn in its colour, in its own proportions (length shortened). */
function PieceDrawing({
  piece,
  marks = false,
  frame = THUMB,
  font,
  line,
  className,
}: {
  piece: SillPiece;
  marks?: boolean;
  frame?: { w: number; h: number };
  font?: number;
  line?: number;
  className?: string;
}) {
  const { size } = piece;
  const profile = flatSection(`${piece.id}-section`, piece.product.name, size.width, size.thickness);
  const ratio = Math.min(7, Math.max(2, size.length / size.width));
  return (
    <SillIsoDrawing
      profile={profile}
      length={ratio * 1000}
      texture={piece.colour.image}
      dims={marks}
      values={marks ? { length: `${size.length} cm`, width: `${size.width} cm`, thickness: `${size.thickness} cm` } : undefined}
      frame={frame}
      font={font}
      line={line}
      className={className}
    />
  );
}

export function SillCatalogue() {
  const [chosen, setChosen] = useState<Chosen>(NONE);
  const [sort, setSort] = useState<Sort>("product");
  const [view, setView] = useState<"list" | "grid">("list");
  const [shown, setShown] = useState(STEP);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [piece, setPiece] = useState<SillPiece | null>(null);
  const close = useCallback(() => setPiece(null), []);

  const results = useMemo(() => {
    const found = PIECES.filter((p) => passes(p, chosen));
    const by = SORTS[sort].by;
    return by ? [...found].sort(by) : found;
  }, [chosen, sort]);

  // How many pieces each option would show, the other filters held.
  const counts = useMemo(
    () =>
      Object.fromEntries(
        FACETS.map((f) => [
          f.key,
          Object.fromEntries(OPTIONS[f.key].map((o) => [o, PIECES.filter((p) => passes(p, chosen, f.key) && f.of(p).includes(o)).length])),
        ])
      ) as Record<Key, Record<string, number>>,
    [chosen]
  );

  const active = FACETS.reduce((n, f) => n + chosen[f.key].length, 0);
  const toggle = (key: Key, value: string) => {
    setChosen((c) => ({ ...c, [key]: c[key].includes(value) ? c[key].filter((v) => v !== value) : [...c[key], value] }));
    setShown(STEP);
  };
  const clear = () => {
    setChosen(NONE);
    setShown(STEP);
  };

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-0">
      <div className="lg:border-r lg:border-[#14140f]/15 lg:pr-8">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="sill-filters"
          className="flex w-full items-center justify-between border border-[#14140f]/20 bg-white px-4 py-3 text-sm font-light lg:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
            Filters{active > 0 ? ` (${active})` : ""}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} strokeWidth={1.25} aria-hidden="true" />
        </button>
        <div id="sill-filters" className={cn("mt-4 lg:mt-0 lg:block", filtersOpen ? "block" : "hidden")}>
          {FACETS.map((f) => (
            <FilterGroup
              key={f.key}
              facet={f}
              counts={counts[f.key]}
              chosen={chosen[f.key]}
              onToggle={(o) => toggle(f.key, o)}
            />
          ))}
          {active > 0 && (
            <button type="button" onClick={clear} className="mt-5 text-sm font-light underline underline-offset-4">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 lg:pl-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <p className="text-base font-light" aria-live="polite">
            <span className="tabular-nums">{results.length}</span> {results.length === 1 ? "piece" : "pieces"} found
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div role="group" aria-label="View as" className="flex items-center gap-2">
              <span className="text-sm font-light opacity-60">View</span>
              {(["list", "grid"] as const).map((v) => {
                const Icon = v === "list" ? List : LayoutGrid;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    aria-label={v === "list" ? "List" : "Grid"}
                    onClick={() => setView(v)}
                    className={cn("p-1 transition-opacity", view === v ? "opacity-100" : "opacity-35 hover:opacity-70")}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.25} />
                  </button>
                );
              })}
            </div>
            <label className="flex items-center gap-2 text-sm font-light">
              <span className="opacity-60">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border border-[#14140f]/20 bg-[#F4F4F2] px-3 py-2 text-sm font-light"
              >
                {(Object.keys(SORTS) as Sort[]).map((k) => (
                  <option key={k} value={k}>
                    {SORTS[k].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {results.length === 0 ? (
          <p className="border-t border-[#14140f]/15 py-10 text-sm font-light">
            No piece matches every filter.{" "}
            <button type="button" onClick={clear} className="underline underline-offset-4">
              Clear the filters
            </button>
          </p>
        ) : view === "list" ? (
          <ul className="border-t border-[#14140f]/15">
            {results.slice(0, shown).map((p) => (
              <li key={p.id} className="flex items-center gap-4 border-b border-[#14140f]/15 py-4 sm:gap-6">
                <span className="flex h-14 w-20 shrink-0 items-center justify-center sm:h-[72px] sm:w-28">
                  <PieceDrawing piece={p} line={1} className="h-full w-full" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug sm:text-[17px]">{nameOf(p)}</p>
                  <p className="mt-1 text-[13px] font-light opacity-60 sm:text-sm">{sizeOf(p)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPiece(p)}
                  aria-label={`View ${nameOf(p)}, ${sizeOf(p)}`}
                  className={cn(DARK, "h-10 shrink-0 px-4 text-[13px] sm:h-11 sm:px-6")}
                  data-over-media
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-3 border-t border-[#14140f]/15 pt-6 md:grid-cols-3 xl:grid-cols-4">
            {results.slice(0, shown).map((p) => (
              <li key={p.id} className={cn(PANEL, "flex flex-col p-3")}>
                <span className="flex aspect-[4/3] items-center justify-center bg-white p-4">
                  <PieceDrawing piece={p} line={1} className="h-full w-full" />
                </span>
                <p className="mt-3 text-sm leading-snug">{nameOf(p)}</p>
                <p className="mt-1 flex-1 text-xs font-light leading-relaxed opacity-60">
                  Length {p.size.length} cm
                  <br />
                  Width {p.size.width} cm
                  <br />
                  Thickness {p.size.thickness} cm
                </p>
                <button
                  type="button"
                  onClick={() => setPiece(p)}
                  aria-label={`View ${nameOf(p)}, ${sizeOf(p)}`}
                  className={cn(DARK, "mt-3 h-10 w-full text-[13px]")}
                  data-over-media
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}

        {results.length > shown && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-xs font-light opacity-60">
              Showing {shown} of {results.length}
            </p>
            <button type="button" onClick={() => setShown((s) => s + STEP)} className={cn(OUTLINE, "h-11 px-6 text-[13px]")}>
              Show the next {Math.min(STEP, results.length - shown)} pieces
            </button>
          </div>
        )}
      </div>

      {piece && <PieceDialog piece={piece} onClose={close} />}
    </div>
  );
}

/* One filter: its title folds it shut; long lists show five, then all. */
function FilterGroup({
  facet,
  counts,
  chosen,
  onToggle,
}: {
  facet: (typeof FACETS)[number];
  counts: Record<string, number>;
  chosen: string[];
  onToggle: (option: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [all, setAll] = useState(false);
  const options = OPTIONS[facet.key];
  const list = all ? options : options.slice(0, SHORT);
  return (
    <div className="border-b border-[#14140f]/12 py-5 first:pt-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span style={LIGHT} className="text-xl">
          {facet.title}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} strokeWidth={1.25} aria-hidden="true" />
      </button>
      {open && (
        <ul className="mt-3 space-y-1.5">
          {list.map((o) => {
            const n = counts[o] ?? 0;
            const on = chosen.includes(o);
            return (
              <li key={o}>
                <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm font-light", n === 0 && !on && "cursor-default opacity-40")}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={n === 0 && !on}
                    onChange={() => onToggle(o)}
                    className="h-3.5 w-3.5 shrink-0 accent-[#14140f]"
                  />
                  {facet.key === "colour" && (
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#14140f]/20 bg-cover bg-center"
                      style={{ backgroundImage: `url(${SWATCH[o]})` }}
                    />
                  )}
                  <span>
                    {o} <span className="tabular-nums opacity-55">({n})</span>
                  </span>
                </label>
              </li>
            );
          })}
          {options.length > SHORT && (
            <li>
              <button type="button" onClick={() => setAll((a) => !a)} className="pt-1 text-sm font-light underline underline-offset-4">
                {all ? "Show fewer" : "Show all…"}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/* One piece over the page: drawn in its colour with its figures marked,
   and its specification. */
function PieceDialog({ piece, onClose }: { piece: SillPiece; onClose: () => void }) {
  const { size } = piece;
  const rows: [string, React.ReactNode][] = [
    [
      "Colour",
      <span key="c" className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border border-[#14140f]/20 bg-cover bg-center"
          style={{ backgroundImage: `url(${piece.colour.image})` }}
        />
        {piece.colour.name}
      </span>,
    ],
    ["Material", piece.material],
    ["Finishes", finishesOf(piece)],
    ["Length", `${size.length} cm`],
    ["Width", `${size.width} cm`],
    ["Thickness", `${size.thickness} cm`],
    ["Per crate", `${size.pieces} ${size.pieces === 1 ? "piece" : "pieces"}`],
    ["Crate weight", `Approx. ${size.kg.toLocaleString("en-GB")} kg net stone`],
    ["Crate area", `Approx. ${m2(size.m2)} m²`],
  ];

  return (
    <SillDialog title={`${piece.product.name} · ${piece.colour.name}`} onClose={onClose} fit>
      <div className="grid gap-8 md:grid-cols-[3fr_2fr] md:gap-10">
        <div>
          <div className="border border-[#14140f]/10 bg-white">
            {(["phone", "wide"] as const).map((k) => (
              <PieceDrawing
                key={k}
                piece={piece}
                marks
                frame={DETAIL[k].frame}
                font={DETAIL[k].font}
                className={k === "phone" ? "block h-auto w-full md:hidden" : "hidden h-auto w-full md:block"}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-light opacity-60">
            Drawing not to scale. Colours are indicative: approve a physical sample before ordering.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] opacity-60">{GROUP[piece.product.group]}</p>
          <h3 style={LIGHT} className="mt-2 text-3xl leading-tight">
            {piece.product.name}
          </h3>
          <dl className="mt-6 border-t border-[#14140f]/15 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-[#14140f]/15 py-2.5">
                <dt className="text-[11px] uppercase tracking-[0.15em] opacity-60">{k}</dt>
                <dd className="font-light">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs font-light leading-relaxed opacity-60">Crate weights vary with colour and material.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact#enquiry" className={cn(DARK, "h-11 px-6 text-[13px]")} data-over-media>
              Get a quote
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact#enquiry" className={cn(OUTLINE, "h-11 px-6 text-[13px]")}>
              Ask for a sample
            </Link>
          </div>
        </div>
      </div>
    </SillDialog>
  );
}
