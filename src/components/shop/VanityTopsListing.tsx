"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { BasinPreview } from "@/components/shop/BasinPreview";
import { sanityImageProxyUrl, sanityImg } from "@/lib/sanity-img";
import { cn } from "@/lib/utils";
import type { BasinLayers, VanityTopLayout } from "@/data/store";

/**
 * The vanity tops aisle (/shop/vanity-tops), after Lowe's vanity-tops
 * listing: sink-count and width tiles at the top, the title and a results
 * count, filter menus with counts, then a grid of tops, each with colour
 * swatches. Every card composites its design into its layout's scene live,
 * so the colour shown is the colour ordered.
 *
 * The grid is rendered on the server unfiltered; filters come from the
 * address (?basins=2&width=48&series=Aurora) after mount and are written
 * back to it, so a filtered view can be shared.
 *
 * Dark controls declare `data-over-media`: the site skin (app/bw-temp.css)
 * otherwise paints dark grounds white.
 */

export interface ListingColour {
  name: string;
  slug: string;
  image: string | null;
  /** Its collection, e.g. Aurora, Eclipse. */
  series: string;
}

export interface ListingTop {
  slug: string;
  name: string;
  layout: VanityTopLayout;
  basins: number;
  /** Standard lengths for the layout, inches. */
  widths: string[];
  layers: BasinLayers | null;
  image: string;
}

interface Item {
  key: string;
  top: ListingTop;
  colour: ListingColour;
  order: number;
}

type FacetKey = "basins" | "width" | "series";
type Filters = Record<FacetKey, Set<string>>;
type SortKey = "featured" | "az" | "za";

const PAGE = 24;
const BASIN_WORD = ["", "Single", "Double", "Triple"];
const WIDTH_TILES = ["30", "36", "48", "60", "72"];
const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "az", label: "Name, A to Z" },
  { key: "za", label: "Name, Z to A" },
];

const emptyFilters = (): Filters => ({ basins: new Set(), width: new Set(), series: new Set() });

/** Does an item pass every filter except `skip` (for counting a facet). */
function passes(item: Item, f: Filters, skip?: FacetKey): boolean {
  if (skip !== "basins" && f.basins.size && !f.basins.has(String(item.top.basins))) return false;
  if (skip !== "width" && f.width.size && !item.top.widths.some((w) => f.width.has(w))) return false;
  if (skip !== "series" && f.series.size && !f.series.has(item.colour.series)) return false;
  return true;
}

/** A design's slab photograph as a small swatch, same-origin. */
const swatchUrl = (image: string | null) =>
  image ? sanityImageProxyUrl(sanityImg(image, { w: 120 }) ?? image) : undefined;

export function VanityTopsListing({
  tops,
  colours,
  intro,
  faqs,
}: {
  tops: ListingTop[];
  colours: ListingColour[];
  intro: string[];
  faqs: { question: string; answer: string }[];
}) {
  // Featured: every design once, the layouts taking turns, then again with
  // the layouts moved on one, so the first screen is varied.
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (let pass = 0; pass < tops.length; pass++) {
      colours.forEach((colour, i) => {
        const top = tops[(i + pass) % tops.length];
        out.push({ key: `${top.slug}:${colour.slug || colour.name}`, top, colour, order: out.length });
      });
    }
    return out;
  }, [tops, colours]);

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("featured");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Filters from the address, once, after mount.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = emptyFilters();
    q.get("basins")?.split(",").filter(Boolean).forEach((v) => f.basins.add(v));
    q.get("width")?.split(",").filter(Boolean).forEach((v) => f.width.add(v));
    q.get("series")?.split(",").filter(Boolean).forEach((v) => f.series.add(v));
    if (f.basins.size || f.width.size || f.series.size) setFilters(f);
  }, []);

  // ...and back to it, so a view can be shared.
  useEffect(() => {
    const q = new URLSearchParams();
    if (filters.basins.size) q.set("basins", [...filters.basins].join(","));
    if (filters.width.size) q.set("width", [...filters.width].join(","));
    if (filters.series.size) q.set("series", [...filters.series].join(","));
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    setShown(PAGE);
  }, [filters]);

  // Close a menu on an outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const results = useMemo(() => {
    const list = items.filter((it) => passes(it, filters));
    const title = (it: Item) => `${it.colour.name} ${it.top.name}`;
    if (sort === "az") list.sort((a, b) => title(a).localeCompare(title(b)));
    else if (sort === "za") list.sort((a, b) => title(b).localeCompare(title(a)));
    return list;
  }, [items, filters, sort]);

  const facets = useMemo(() => {
    const count = (key: FacetKey, value: string) =>
      items.filter((it) => passes(it, filters, key) && matchValue(it, key, value)).length;
    const widths = Array.from(new Set(tops.flatMap((t) => t.widths))).sort((a, b) => Number(a) - Number(b));
    const series = Array.from(new Set(colours.map((c) => c.series))).sort();
    return {
      basins: tops.map((t) => ({ value: String(t.basins), label: `${BASIN_WORD[t.basins]} basin`, count: count("basins", String(t.basins)) })),
      width: widths.map((w) => ({ value: w, label: `${w} in`, count: count("width", w) })),
      series: series.map((s) => ({ value: s, label: s, count: count("series", s) })),
    };
  }, [items, filters, tops, colours]);

  const toggle = (key: FacetKey, value: string, only = false) =>
    setFilters((f) => {
      const next: Filters = { basins: new Set(f.basins), width: new Set(f.width), series: new Set(f.series) };
      if (only) {
        const was = next[key].has(value) && next[key].size === 1;
        next[key] = new Set(was ? [] : [value]);
      } else if (next[key].has(value)) next[key].delete(value);
      else next[key].add(value);
      return next;
    });

  const clearAll = () => setFilters(emptyFilters());
  const active = [
    ...[...filters.basins].map((v) => ({ key: "basins" as const, value: v, label: `${BASIN_WORD[Number(v)]} basin` })),
    ...[...filters.width].map((v) => ({ key: "width" as const, value: v, label: `${v} in wide` })),
    ...[...filters.series].map((v) => ({ key: "series" as const, value: v, label: v })),
  ];

  const facetMenus: { key: FacetKey; label: string; options: { value: string; label: string; count: number }[] }[] = [
    { key: "basins", label: "Number of Basins", options: facets.basins },
    { key: "width", label: "Vanity Width (In)", options: facets.width },
    { key: "series", label: "Collection", options: facets.series },
  ];

  return (
    <div className="bg-white text-[#14140f]">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-28 sm:px-8 lg:pt-32">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[13px] font-light">
          <Link href="/" className="underline-offset-4 hover:underline">Home</Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/shop" className="underline-offset-4 hover:underline">Store</Link>
          <span className="mx-2 opacity-40">/</span>
          <span>Vanity Tops</span>
        </nav>

        {/* Shop by sink count and width, as tiles */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex gap-2 rounded-lg border border-[#14140f]/10 bg-[#f5f5f3] p-2">
            {tops.map((t) => (
              <NavTile
                key={t.slug}
                label={`${BASIN_WORD[t.basins]} basin`}
                selected={filters.basins.has(String(t.basins)) && filters.basins.size === 1}
                onClick={() => toggle("basins", String(t.basins), true)}
              >
                <BasinIcon basins={t.basins} />
              </NavTile>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 rounded-lg border border-[#14140f]/10 bg-[#f5f5f3] p-2">
            {WIDTH_TILES.map((w) => (
              <NavTile
                key={w}
                label={`${w}-in`}
                selected={filters.width.has(w) && filters.width.size === 1}
                onClick={() => toggle("width", w, true)}
              >
                <WidthIcon width={w} />
              </NavTile>
            ))}
          </div>
        </div>

        <h1
          className="mt-10 text-[28px] uppercase leading-tight sm:text-[34px]"
          style={{ fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.02em" }}
        >
          Quartz Vanity Tops
        </h1>
        <p className="mt-1 text-[14px] font-light opacity-70">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>

        {/* Filter menus */}
        <div ref={barRef} className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#14140f]/25 px-4 text-[13px] hover:border-[#14140f]"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            All Filters
          </button>
          {facetMenus.map((m) => (
            <div key={m.key} className="relative">
              <button
                type="button"
                aria-expanded={open === m.key}
                onClick={() => setOpen(open === m.key ? null : m.key)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px]",
                  filters[m.key].size ? "border-[#14140f]" : "border-[#14140f]/25 hover:border-[#14140f]"
                )}
              >
                {m.label}
                {filters[m.key].size > 0 && <span className="opacity-60">({filters[m.key].size})</span>}
                <ChevronDown className={cn("h-4 w-4 transition-transform", open === m.key && "rotate-180")} aria-hidden="true" />
              </button>
              {open === m.key && (
                <div className="absolute left-0 top-12 z-30 w-64 rounded-lg border border-[#14140f]/10 bg-white p-2 shadow-xl">
                  <CheckList options={m.options} selected={filters[m.key]} onToggle={(v) => toggle(m.key, v)} />
                </div>
              )}
            </div>
          ))}
          <div className="relative ml-auto">
            <button
              type="button"
              aria-expanded={open === "sort"}
              onClick={() => setOpen(open === "sort" ? null : "sort")}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#14140f]/25 px-4 text-[13px] hover:border-[#14140f]"
            >
              Sort by: {SORTS.find((s) => s.key === sort)?.label}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {open === "sort" && (
              <div className="absolute right-0 top-12 z-30 w-52 rounded-lg border border-[#14140f]/10 bg-white p-2 shadow-xl">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setSort(s.key);
                      setOpen(null);
                    }}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-[14px] font-light hover:bg-[#f5f5f3]"
                  >
                    {s.label}
                    {s.key === sort && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {active.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {active.map((a) => (
              <button
                key={`${a.key}-${a.value}`}
                type="button"
                onClick={() => toggle(a.key, a.value)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f0efec] px-3 py-1.5 text-[13px] font-light hover:bg-[#e6e4e0]"
              >
                {a.label}
                <X className="h-3.5 w-3.5" aria-label={`Remove ${a.label}`} />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="text-[13px] underline underline-offset-4">
              Clear all
            </button>
          </div>
        )}

        {/* The grid */}
        {results.length === 0 ? (
          <p className="py-24 text-center font-light opacity-70">No vanity tops match. Clear a filter to see more.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {results.slice(0, shown).map((it) => (
              <TopCard key={it.key} item={it} colours={colours} />
            ))}
          </ul>
        )}

        {shown < results.length && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-[13px] font-light opacity-60">
              Showing {Math.min(shown, results.length)} of {results.length}
            </p>
            <button
              type="button"
              data-over-media
              onClick={() => setShown((n) => n + PAGE)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#14140f] px-8 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85"
            >
              Show more
            </button>
          </div>
        )}

        {/* Related searches */}
        <section aria-labelledby="related-heading" className="mt-20 border-t border-[#14140f]/10 pt-10">
          <h2 id="related-heading" className="text-[12px] uppercase tracking-[0.18em] opacity-60">
            Related searches
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Single basin vanity tops", href: "/shop/vanity-tops?basins=1" },
              { label: "Double basin vanity tops", href: "/shop/vanity-tops?basins=2" },
              { label: "Triple basin vanity tops", href: "/shop/vanity-tops?basins=3" },
              { label: "48-inch vanity tops", href: "/shop/vanity-tops?width=48" },
              { label: "72-inch vanity tops", href: "/shop/vanity-tops?width=72" },
              { label: "Integrated quartz sinks", href: "/shop" },
              { label: "Vanity tops guide", href: "/applications/bathroom-vanity-tops" },
              { label: "All quartz designs", href: "/products/quartz" },
            ].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="inline-flex rounded-full border border-[#14140f]/20 px-4 py-2 text-[13px] font-light hover:border-[#14140f]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* The guide, and its questions */}
        {intro.length > 0 && (
          <section aria-labelledby="guide-heading" className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <h2
                id="guide-heading"
                className="text-[24px] uppercase leading-tight sm:text-[30px]"
                style={{ fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.02em" }}
              >
                Quartz vanity tops, cut to your basin
              </h2>
              <div className="mt-5 space-y-4 text-[15px] font-light leading-relaxed opacity-80">
                {intro.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <Link
                href="/applications/bathroom-vanity-tops"
                className="mt-6 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] underline-offset-4 hover:underline"
              >
                Read the full guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {faqs.length > 0 && (
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.18em] opacity-60">Frequently asked questions</h2>
                <ul className="mt-3 divide-y divide-[#14140f]/10 border-y border-[#14140f]/10">
                  {faqs.map((f) => (
                    <li key={f.question}>
                      <details className="group py-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px]">
                          {f.question}
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="mt-3 text-[14px] font-light leading-relaxed opacity-80">{f.answer}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>

      {/* All filters, as a panel */}
      {drawer && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <button type="button" aria-label="Close filters" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/40" />
          <aside role="dialog" aria-label="All filters" className="relative flex h-full w-full max-w-sm flex-col bg-white text-[#14140f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#14140f]/10 px-5 py-4">
              <h2 className="text-[18px] font-light">All Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="rounded-full p-2 hover:bg-[#f5f5f3]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {facetMenus.map((m) => (
                <details key={m.key} open className="border-b border-[#14140f]/10 py-2">
                  <summary className="cursor-pointer list-none px-2 py-2 text-[14px] uppercase tracking-[0.12em]">{m.label}</summary>
                  <CheckList options={m.options} selected={filters[m.key]} onToggle={(v) => toggle(m.key, v)} />
                </details>
              ))}
            </div>
            <div className="flex gap-3 border-t border-[#14140f]/10 p-4">
              <button type="button" onClick={clearAll} className="h-11 flex-1 rounded-full border border-[#14140f]/25 text-[13px] uppercase tracking-[0.12em]">
                Clear all
              </button>
              <button
                type="button"
                data-over-media
                onClick={() => setDrawer(false)}
                className="h-11 flex-1 rounded-full bg-[#14140f] text-[13px] uppercase tracking-[0.12em] text-white"
              >
                View {results.length}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function matchValue(it: Item, key: FacetKey, value: string): boolean {
  if (key === "basins") return String(it.top.basins) === value;
  if (key === "width") return it.top.widths.includes(value);
  return it.colour.series === value;
}

function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; count: number }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <ul>
      {options.map((o) => {
        const on = selected.has(o.value);
        const empty = o.count === 0 && !on;
        return (
          <li key={o.value}>
            <button
              type="button"
              disabled={empty}
              onClick={() => onToggle(o.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded px-2 py-2 text-left text-[14px] font-light hover:bg-[#f5f5f3]",
                empty && "cursor-not-allowed opacity-35"
              )}
            >
              <span
                data-over-media={on ? "" : undefined}
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                  on ? "border-[#14140f] bg-[#14140f] text-white" : "border-[#14140f]/40"
                )}
              >
                {on && <Check className="h-3 w-3" aria-hidden="true" />}
              </span>
              <span className="flex-1">{o.label}</span>
              <span className="text-[12px] opacity-50">({o.count})</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function NavTile({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex w-[88px] flex-col items-center gap-2 rounded-md border bg-white px-2 pb-3 pt-4 text-[12px] font-light transition-colors sm:w-24",
        selected ? "border-[#14140f]" : "border-transparent hover:border-[#14140f]/30"
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/** A vanity top seen from above, with its basins and tap holes. */
function BasinIcon({ basins }: { basins: number }) {
  const w = 52;
  const each = (w - 8) / basins;
  return (
    <svg viewBox="0 0 56 30" className="h-8 w-14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2" y="4" width={w} height="22" rx="1.5" />
      {Array.from({ length: basins }, (_, i) => {
        const cx = 6 + each * i + each / 2;
        const bw = Math.min(16, each - 4);
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y="11" width={bw} height="11" rx="3" />
            <circle cx={cx} cy="7.5" r="0.9" fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

/** A top with its width dimensioned. */
function WidthIcon({ width }: { width: string }) {
  return (
    <svg viewBox="0 0 56 30" className="h-8 w-14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="4" y="3" width="48" height="15" rx="1.5" />
      <rect x="20" y="7" width="16" height="8" rx="2.5" />
      <path d="M4 24h48M4 21.5v5M52 21.5v5" />
      <text x="28" y="29.5" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
        {width} in
      </text>
    </svg>
  );
}

function TopCard({ item, colours }: { item: Item; colours: ListingColour[] }) {
  const [colour, setColour] = useState(item.colour);
  // This design, then four more from its collection.
  const swatches = useMemo(() => {
    const same = colours.filter((c) => c.series === item.colour.series && c.name !== item.colour.name);
    return [item.colour, ...same.slice(0, 4)];
  }, [colours, item.colour]);
  const more = colours.filter((c) => c.series === item.colour.series).length - swatches.length;

  const href = `/shop/${item.top.slug}?colour=${encodeURIComponent(colour.name)}`;
  const title = `${item.top.layout} Quartz Vanity Top in ${colour.name.replace(/\s*\([^)]*\)\s*$/, "")}`;
  const widths = item.top.widths;

  return (
    <li className="flex flex-col">
      <Link href={href} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-[#f4f4f1]">
          {item.top.layers ? (
            <BasinPreview
              assets={item.top.layers}
              colourName={colour.name}
              colourImage={colour.image}
              alt={title}
              maxWidth={640}
              lazy
            />
          ) : (
            <Image src={item.top.image} alt={title} fill unoptimized sizes="25vw" className="object-cover" />
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-1.5">
        {swatches.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            aria-label={`Show in ${c.name}`}
            aria-pressed={c.name === colour.name}
            onClick={() => setColour(c)}
            className={cn(
              "h-7 w-7 rounded-[3px] border bg-[#e8e6e2] bg-cover bg-center p-0",
              c.name === colour.name ? "border-[#14140f] ring-1 ring-[#14140f] ring-offset-1" : "border-[#14140f]/20"
            )}
            style={swatchUrl(c.image) ? { backgroundImage: `url(${swatchUrl(c.image)})` } : undefined}
          />
        ))}
        {more > 0 && <span className="ml-1 text-[12px] font-light opacity-60">+{more}</span>}
      </div>
      <p className="mt-1.5 text-[12px] font-light opacity-70">
        Colour: <span className="opacity-100">{colour.name}</span>
      </p>

      <p className="mt-2 text-[13px] font-medium">Pacific Surfaces</p>
      <Link href={href} className="text-[14px] font-light leading-snug underline-offset-4 hover:underline">
        <span className="line-clamp-2">{title}</span>
      </Link>
      <p className="mt-1.5 text-[12px] font-light opacity-60">
        {item.colour.series} · {widths[0]} to {widths[widths.length - 1]} in wide, or your size
      </p>
      <p className="mt-2 text-[13px] font-light">Made to order. Price confirmed with your order.</p>
      <Link
        href={href}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[#14140f] text-[12px] uppercase tracking-[0.12em] hover:bg-black/5"
      >
        Choose size
      </Link>
    </li>
  );
}
