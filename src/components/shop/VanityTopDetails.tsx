"use client";

import { ChevronDown } from "lucide-react";

/**
 * The detail sections of a vanity top's store page, after a Lowe's product
 * page: "At a Glance" and "Product Dimensions" cards under the gallery,
 * then Overview, What's Included, Product Features, Specifications and
 * Questions & Answers down the page. Every fact comes from the vanity-tops
 * guide (data/applications) or from the options chosen on the page; there
 * are no ratings, reviews or prices, because none are published.
 */

export interface VanityDetails {
  intro: string[];
  benefits: { title: string; body: string }[];
  specs: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  /** Each design's collection, by name. */
  series: Record<string, string>;
}

export interface VanitySelection {
  layout: string;
  basins: number;
  colour: string;
  length: string;
  width: string;
  height: string;
  finish: string;
  lengths: string[];
  widths: string[];
  heights: string[];
  finishes: string[];
}

const spec = (d: VanityDetails, label: string) => d.specs.find((s) => s.label === label)?.value;
const listed = (values: string[]) => values.filter((v) => v !== "Custom").join(", ");
const LIGHT = { fontVariationSettings: "'wght' 300, 'wdth' 100", letterSpacing: "-0.02em" };

/** The two cards under the gallery. */
export function VanityGlance({ sel }: { sel: VanitySelection }) {
  const items = [
    { icon: <BasinGlyph basins={sel.basins} />, text: `${sel.layout}` },
    { icon: <SlabGlyph />, text: "Material: engineered quartz" },
    { icon: <WidthGlyph />, text: sel.length ? `Width: ${sel.length} in` : "Width: your size" },
    { icon: <ToolGlyph />, text: "Made to your template" },
  ];
  return (
    <div className="mt-8 grid gap-4">
      <div className="rounded-lg border border-[#14140f]/12 p-5">
        <h2 className="text-[16px] font-medium">At a Glance</h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((it) => (
            <li key={it.text} className="flex flex-col items-center gap-2 text-center text-[12px] font-light leading-snug">
              {it.icon}
              {it.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid items-center gap-5 rounded-lg border border-[#14140f]/12 p-5 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-[16px] font-medium">Product Dimensions</h2>
          <dl className="mt-4 divide-y divide-[#14140f]/10 text-[14px]">
            {[
              [sel.length || "Your size", "Width, side to side"],
              [sel.width || "Your size", "Depth, front to back"],
              [sel.height || "Your size", "Height"],
            ].map(([v, label]) => (
              <div key={label} className="flex items-baseline gap-4 py-2">
                <dt className="w-20 shrink-0 font-medium">{/^\d/.test(v) ? `${v} in` : v}</dt>
                <dd className="font-light opacity-75">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DimensionDrawing basins={sel.basins} length={sel.length} width={sel.width} />
      </div>
    </div>
  );
}

/** The full-width sections down the page. */
export function VanitySections({ details, sel }: { details: VanityDetails; sel: VanitySelection }) {
  const series = details.series[sel.colour];
  const groups: { title: string; rows: string[][] }[] = [
    {
      title: "General",
      rows: [
        ["Material", spec(details, "Material") ?? "Engineered quartz"],
        ["Design", sel.colour],
        ...(series ? ([["Collection", series]] as [string, string][]) : []),
        ["Basin layout", sel.layout],
        ["Number of basins", String(sel.basins)],
        ["Finish", sel.finish],
        ["Finishes available", sel.finishes.join(", ")],
      ],
    },
    {
      title: "Dimensions",
      rows: [
        ["Width, side to side (in)", `${sel.length || "Custom"} (standard: ${listed(sel.lengths)}, or custom)`],
        ["Depth, front to back (in)", `${sel.width || "Custom"} (standard: ${listed(sel.widths)}, or custom)`],
        ["Height (in)", `${sel.height || "Custom"} (standard: ${listed(sel.heights)}, or custom)`],
        ...(spec(details, "Sizes") ? ([["Sizes", spec(details, "Sizes")!]] as [string, string][]) : []),
      ],
    },
    {
      title: "Features",
      rows: [
        ["Made to order", "Yes, to your template"],
        ["Basin and tap layout", "Cut to yours"],
        ["Upstand", "From the same slab"],
      ],
    },
    {
      title: "Certifications and warranty",
      rows: [
        ...(spec(details, "Certification") ? ([["Certification", spec(details, "Certification")!]] as [string, string][]) : []),
        ...(spec(details, "Warranty") ? ([["Warranty", spec(details, "Warranty")!]] as [string, string][]) : []),
      ],
    },
  ].filter((g) => g.rows.length > 0);

  return (
    <div className="mx-auto mt-16 max-w-7xl text-[#14140f]">
      <Section title="Overview" open>
        <div className="space-y-4 text-[15px] font-light leading-relaxed opacity-85">
          {details.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      <Section title="What's Included" open>
        <ul className="space-y-1.5 text-[15px] font-light">
          <li>{sel.layout} quartz vanity top (1)</li>
          <li>
            Cut-out for {sel.basins === 1 ? "one basin" : `${sel.basins === 2 ? "two" : "three"} basins`}, to your basin
          </li>
          <li>Tap holes, to your tap layout</li>
          <li>Upstand, cut from the same slab</li>
        </ul>
      </Section>

      {details.benefits.length > 0 && (
        <Section title="Product Features">
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {details.benefits.map((b) => (
              <li key={b.title}>
                <p className="text-[15px] font-medium">{b.title}</p>
                <p className="mt-1 text-[14px] font-light leading-relaxed opacity-80">{b.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Specifications" open>
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-[13px] uppercase tracking-[0.14em] opacity-60">{g.title}</h3>
              <dl className="mt-3 grid border-t border-[#14140f]/10 sm:grid-cols-2">
                {g.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 border-b border-[#14140f]/10 py-3 sm:pr-8">
                    <dt className="text-[14px] font-light opacity-70">{k}</dt>
                    <dd className="text-[14px]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      {details.faqs.length > 0 && (
        <Section title="Questions & Answers">
          <ul className="divide-y divide-[#14140f]/10 border-y border-[#14140f]/10">
            {details.faqs.map((f) => (
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
        </Section>
      )}
    </div>
  );
}

function Section({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-t border-[#14140f]/10 py-6 last:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <h2 className="text-[22px] uppercase sm:text-[26px]" style={LIGHT}>
          {title}
        </h2>
        <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-6">{children}</div>
    </details>
  );
}

/** Plan of the top, its basins and the two plan dimensions. */
/** Plan of the top drawn to proportion: 96 in fills the width, a 24 in top
 *  is a quarter of it, and the depth is to the same scale. */
function DimensionDrawing({ basins, length, width }: { basins: number; length: string; width: string }) {
  const L = Number.parseFloat(length) > 0 ? Number.parseFloat(length) : 48;
  const D = Number.parseFloat(width) > 0 ? Number.parseFloat(width) : 22;
  const k = Math.min(120 / Math.max(L, 48), 56 / D);
  const w = L * k;
  const h = D * k;
  const x0 = 20 + (120 - w) / 2;
  const y0 = 10 + (56 - h) / 2;
  const each = w / basins;
  return (
    <svg viewBox="0 0 170 104" className="h-24 w-40" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x={x0} y={y0} width={w} height={h} rx="1.5" />
      {Array.from({ length: basins }, (_, i) => {
        const cx = x0 + each * i + each / 2;
        const bw = Math.min(18 * k, each - 6 * k);
        const bh = Math.min(13 * k, h - 7 * k);
        return <rect key={i} x={cx - bw / 2} y={y0 + (h - bh) / 2 + k} width={bw} height={bh} rx={Math.min(3 * k, 4)} />;
      })}
      <path d={`M${x0} 80h${w}M${x0} 76v8M${x0 + w} 76v8M${x0 + w + 10} ${y0}v${h}M${x0 + w + 6} ${y0}h8M${x0 + w + 6} ${y0 + h}h8`} />
      <text x={x0 + w / 2} y="96" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor">
        {length ? `${length} in` : "W"}
      </text>
      <text x={x0 + w + 16} y={y0 + h / 2 + 3} fontSize="9" stroke="none" fill="currentColor">
        {width ? `${width} in` : "D"}
      </text>
    </svg>
  );
}

function BasinGlyph({ basins }: { basins: number }) {
  const each = 36 / basins;
  return (
    <svg viewBox="0 0 44 28" className="h-8 w-11" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2" y="4" width="40" height="20" rx="1.5" />
      {Array.from({ length: basins }, (_, i) => {
        const cx = 4 + each * i + each / 2;
        const bw = Math.min(12, each - 3);
        return <rect key={i} x={cx - bw / 2} y="10" width={bw} height="10" rx="3" />;
      })}
    </svg>
  );
}

function SlabGlyph() {
  return (
    <svg viewBox="0 0 44 28" className="h-8 w-11" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M4 10l18-6 18 6-18 6z" />
      <path d="M4 10v6l18 6 18-6v-6" />
      <path d="M12 8c4 1 6 4 10 4M26 6c2 2 6 3 9 3" strokeWidth="0.9" />
    </svg>
  );
}

function WidthGlyph() {
  return (
    <svg viewBox="0 0 44 28" className="h-8 w-11" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="4" y="4" width="36" height="12" rx="1.5" />
      <path d="M4 22h36M4 19v6M40 19v6" />
    </svg>
  );
}

function ToolGlyph() {
  return (
    <svg viewBox="0 0 44 28" className="h-8 w-11" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="6" y="8" width="32" height="14" rx="1.5" />
      <path d="M6 8l6-5h20l6 5" />
      <path d="M16 15h12" strokeDasharray="2 2" />
    </svg>
  );
}
