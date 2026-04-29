"use client";

/**
 * FilterBar — the sticky top bar containing all filter pills, the result
 * count, the grid-density toggle, and the sort control.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, Grid3x3, Search, X } from "lucide-react";
import { FilterPill } from "./FilterPill";
import {
  HUE_OPTIONS,
  type Collection,
  type Pattern,
  type Finish,
  type Thickness,
} from "@/data/slabs";
import type { useFilterState, SortKey } from "./useFilterState";

/**
 * Default gradient for hue values that aren't in the predefined
 * HUE_OPTIONS list — i.e. custom values an editor typed into the
 * Hue Override field in Sanity (e.g. "lavender", "sage"). Predefined
 * hues keep their hand-tuned gradients; custom ones get this neutral
 * fallback so they at least render consistently.
 */
const CUSTOM_HUE_GRADIENT = "linear-gradient(135deg,#5a6772,#3a444d)";

function titleCase(value: string): string {
  if (!value) return value;
  return value
    .split(/[\s-_]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

type FilterApi = ReturnType<typeof useFilterState>;

interface Props {
  api: FilterApi;
  total: number;
}

export function FilterBar({ api, total }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  /**
   * Hue chips to render — predefined HUE_OPTIONS in their canonical
   * order, PLUS any custom hue strings that show up in the data
   * (sourced from `api.uniqueHues`) but aren't in the predefined
   * set. Custom ones inherit the neutral fallback gradient and a
   * Title Case label. This is the dynamic-discovery half of the
   * "editors can add new hues in Sanity" feature.
   */
  const hueChipOptions = useMemo(() => {
    const predefinedValues = new Set(HUE_OPTIONS.map((o) => o.value));
    const customHues = api.uniqueHues.filter(
      (h) => !predefinedValues.has(h as never)
    );
    const customOptions = customHues.map((h) => ({
      value: h,
      label: titleCase(h),
      color: CUSTOM_HUE_GRADIENT,
    }));
    return [...HUE_OPTIONS, ...customOptions];
  }, [api.uniqueHues]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!barRef.current) return;
      if (!barRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  function toggleOpen(key: string) {
    setOpenKey((k) => (k === key ? null : key));
  }

  return (
    <div
      ref={barRef}
      className={[
        "sticky top-[72px] z-40",
        "border-y border-white/10",
        "bg-[#112732]/95 backdrop-blur-xl",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left — search + filter pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pacific-mid pointer-events-none" />
            <input
              type="text"
              value={api.query}
              onChange={(e) => api.setQuery(e.target.value)}
              placeholder="Search designs…"
              className={[
                "w-44 rounded-full py-2 pl-9 pr-8 text-sm",
                "bg-white/5 border border-white/15 text-white placeholder-pacific-mid/60",
                "outline-none transition-all duration-200",
                "focus:w-56 focus:border-white/40 focus:bg-white/10",
              ].join(" ")}
            />
            {api.query && (
              <button
                onClick={() => api.setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pacific-mid hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Hue */}
          <FilterPill
            label="Hue"
            count={api.filters.hues.size}
            isOpen={openKey === "hue"}
            onToggle={() => toggleOpen("hue")}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-pacific-mid mb-3.5">
              Filter by hue
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {hueChipOptions.map((opt) => {
                const selected = api.filters.hues.has(opt.value);
                const count = api.countFor("hues", opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => api.toggle("hues", opt.value)}
                    disabled={count === 0 && !selected}
                    className={[
                      "group relative aspect-square rounded-lg overflow-hidden",
                      "border-2 transition-all duration-200",
                      selected
                        ? "border-white scale-[1.03]"
                        : "border-transparent hover:scale-[1.05]",
                      count === 0 && !selected
                        ? "opacity-30 cursor-not-allowed"
                        : "",
                    ].join(" ")}
                    style={{ background: opt.color }}
                    aria-label={`${opt.label} hue — ${count} designs`}
                  >
                    <span className="absolute bottom-1 left-1.5 right-1.5 text-left text-[10px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)] tracking-wide">
                      {opt.label}
                    </span>
                    {count > 0 && (
                      <span className="absolute top-1 right-1 text-[9px] text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,.6)] tabular-nums">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </FilterPill>

          {/* Collection */}
          <FilterPill
            label="Collection"
            count={api.filters.collections.size}
            isOpen={openKey === "collection"}
            onToggle={() => toggleOpen("collection")}
          >
            <PopoverCheckList
              title={`Collection · ${api.uniqueCollections.length} series`}
              items={api.uniqueCollections.map((c) => ({
                value: c,
                label: c,
                count: api.countFor("collections", c),
                selected: api.filters.collections.has(c),
              }))}
              onToggle={(v) => api.toggle("collections", v as Collection)}
            />
          </FilterPill>

          {/* Pattern */}
          <FilterPill
            label="Pattern"
            count={api.filters.patterns.size}
            isOpen={openKey === "pattern"}
            onToggle={() => toggleOpen("pattern")}
          >
            <PopoverCheckList
              title="Pattern · visual character"
              items={api.uniquePatterns.map((p) => ({
                value: p,
                label: p,
                count: api.countFor("patterns", p),
                selected: api.filters.patterns.has(p),
              }))}
              onToggle={(v) => api.toggle("patterns", v as Pattern)}
            />
          </FilterPill>

          {/* Finish */}
          <FilterPill
            label="Finish"
            count={api.filters.finishes.size}
            isOpen={openKey === "finish"}
            onToggle={() => toggleOpen("finish")}
          >
            <PopoverCheckList
              title="Surface finish"
              items={api.uniqueFinishes.map((f) => ({
                value: f,
                label: f,
                count: api.countFor("finishes", f),
                selected: api.filters.finishes.has(f),
              }))}
              onToggle={(v) => api.toggle("finishes", v as Finish)}
            />
          </FilterPill>

          {/* Thickness */}
          <FilterPill
            label="Thickness"
            count={api.filters.thicknesses.size}
            isOpen={openKey === "thickness"}
            onToggle={() => toggleOpen("thickness")}
          >
            <PopoverCheckList
              title="Slab thickness"
              items={api.uniqueThicknesses.map((t) => ({
                value: t,
                label: t,
                count: api.countFor("thicknesses", t),
                selected: api.filters.thicknesses.has(t),
              }))}
              onToggle={(v) => api.toggle("thicknesses", v as Thickness)}
            />
          </FilterPill>
        </div>

        {/* Right — result count, view toggle, sort */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-pacific-mid tracking-wider tabular-nums">
            <span className="font-semibold text-white">{total}</span>{" "}
            {total === 1 ? "design" : "designs"}
          </div>

          {/* Grid density */}
          <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            <button
              onClick={() => api.setDense(false)}
              aria-label="Comfortable grid"
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                !api.dense
                  ? "bg-white text-pacific-dark"
                  : "text-pacific-mid hover:text-white",
              ].join(" ")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => api.setDense(true)}
              aria-label="Dense grid"
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                api.dense
                  ? "bg-white text-pacific-dark"
                  : "text-pacific-mid hover:text-white",
              ].join(" ")}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Sort */}
          <SortControl
            value={api.sort}
            onChange={api.setSort}
            isOpen={openKey === "sort"}
            onToggle={() => toggleOpen("sort")}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PopoverCheckList({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: { value: string; label: string; count: number; selected: boolean }[];
  onToggle: (value: string) => void;
}) {
  return (
    <>
      <div className="text-[11px] uppercase tracking-[0.2em] text-pacific-mid mb-3">
        {title}
      </div>
      <div className="flex flex-col gap-0.5 min-w-[220px]">
        {items.map((it) => (
          <button
            key={it.value}
            onClick={() => onToggle(it.value)}
            disabled={it.count === 0 && !it.selected}
            className={[
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5",
              "text-sm text-pacific-light transition-colors",
              "hover:bg-white/5",
              it.count === 0 && !it.selected
                ? "opacity-40 cursor-not-allowed hover:bg-transparent"
                : "",
            ].join(" ")}
          >
            <span>{it.label}</span>
            <span className="flex items-center gap-2.5">
              <span className="text-[11px] text-pacific-mid tabular-nums">
                {it.count}
              </span>
              <span
                className={[
                  "flex h-4 w-4 items-center justify-center rounded border-[1.5px] transition-all",
                  it.selected
                    ? "bg-white border-white text-pacific-dark"
                    : "border-white/30",
                ].join(" ")}
              >
                {it.selected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

const SORT_LABELS: Record<SortKey, string> = {
  new: "New arrivals",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  collection: "By collection",
};

function SortControl({
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-pacific-light hover:border-white/30"
      >
        <span className="hidden sm:inline text-pacific-mid">Sort:</span>
        <span>{SORT_LABELS[value]}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-[12px] border border-white/15 bg-[#112732] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                onChange(k);
                onToggle();
              }}
              className={[
                "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                value === k
                  ? "bg-white/10 text-white"
                  : "text-pacific-mid hover:bg-white/5 hover:text-pacific-light",
              ].join(" ")}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
