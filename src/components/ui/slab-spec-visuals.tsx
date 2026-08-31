/**
 * Visual answers to "how thick is it?" and "how does it feel?" for
 * the Sizes tab on the product page, replacing two rows of text.
 *
 * Both are drawn, not photographed: an isometric slab whose drawn
 * edge scales with the real thickness, and a finish swatch whose
 * sheen is rendered from the finish name. Nothing to source, sharp at
 * any size, and correct for whatever the editor sets in Sanity.
 */

import { cn } from "@/lib/utils";
import { finishDescription } from "@/lib/finish-copy";

/**
 * Thickness strings arrive from Sanity as free text — "2 cm",
 * "20mm", "3 cm". Normalise to millimetres so the drawing can be
 * proportional. Returns null when nothing numeric is found, in which
 * case the caller falls back to a nominal edge.
 */
function thicknessInMm(raw: string): number | null {
  const match = raw.match(/([\d.]+)\s*(mm|cm)?/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  // No unit and a small number almost certainly means centimetres
  // ("2", "3"); anything larger is already millimetres.
  const unit = match[2]?.toLowerCase() ?? (value <= 10 ? "cm" : "mm");
  return unit === "cm" ? value * 10 : value;
}

/**
 * One isometric slab. The top face is fixed; only the edge grows, so
 * a 30 mm slab visibly reads thicker than a 12 mm one when the cards
 * sit side by side.
 */
export function SlabThicknessCard({
  thickness,
  size,
  className,
}: {
  thickness: string;
  size: string;
  className?: string;
}) {
  const mm = thicknessInMm(thickness);
  // 12 mm → 7px, 20 mm → 11px, 30 mm → 16px. Clamped so an unusual
  // value can't draw a slab taller than the card.
  const edge = Math.max(4, Math.min(28, ((mm ?? 20) / 30) * 16));

  // Isometric top face, drawn as a rhombus around a 120x62 box.
  const top = "60,6 116,32 60,58 4,32";

  return (
    <div
      className={cn(
        "group flex flex-col items-center text-center px-6 py-7 bg-white/5 border border-white/10 rounded-2xl transition-colors hover:border-white/25",
        className
      )}
    >
      <svg
        viewBox="0 0 120 90"
        className="w-32 h-24 shrink-0"
        role="img"
        aria-label={`${thickness} slab`}
      >
        {/* Front-left edge — the face that carries the thickness. */}
        <polygon
          points={`4,32 60,58 60,${58 + edge} 4,${32 + edge}`}
          className="fill-white/25"
        />
        {/* Front-right edge, a shade darker so the corner turns. */}
        <polygon
          points={`60,58 116,32 116,${32 + edge} 60,${58 + edge}`}
          className="fill-white/15"
        />
        {/* Top face last so it sits above both edges. */}
        <polygon points={top} className="fill-white/85" />
        {/* Hairline along the top arris keeps the form legible at the
            thinnest sizes, where the edge is only a few pixels. */}
        <polyline
          points="4,32 60,58 116,32"
          className="stroke-white/40 fill-none"
          strokeWidth="0.75"
        />
      </svg>

      <div className="mt-3 text-lg font-medium text-white">{thickness}</div>
      <div className="mt-0.5 text-sm font-light text-pacific-mid">{size}</div>
      <div className="mt-3 text-[10px] tracking-[0.25em] uppercase text-pacific-mid/70 font-medium">
        Slab
      </div>
    </div>
  );
}

/**
 * Per-finish rendering parameters. A finish is legible as a swatch
 * only if contrast and highlight change together — sheen alone makes
 * polished and matte look identical at 64px, which is what the first
 * pass got wrong.
 *
 *  light/dark — the base gradient. A polish has a wide tonal range
 *               because it reflects the room; a matte compresses it.
 *  spec       — peak highlight opacity.
 *  band       — highlight width, as a percentage either side of the
 *               diagonal. Narrow reads as a hard reflection, wide as
 *               a soft sheen.
 *  texture    — overlay: fine grain, coarse mottle, or directional
 *               brushing.
 */
type FinishRender = {
  light: string;
  dark: string;
  spec: number;
  band: number;
  texture: "none" | "grain" | "mottle" | "brushed";
};

function renderFor(finish: string): FinishRender {
  const f = finish.toLowerCase();
  if (f.includes("polish"))
    return {
      light: "#ffffff",
      dark: "#7c8b95",
      spec: 0.95,
      band: 7,
      texture: "none",
    };
  if (f.includes("satin"))
    return {
      light: "#f2f5f6",
      dark: "#9aa6ae",
      spec: 0.5,
      band: 20,
      texture: "none",
    };
  if (f.includes("velvet"))
    return {
      light: "#e6e9eb",
      dark: "#9ba5ac",
      spec: 0.32,
      band: 34,
      texture: "grain",
    };
  if (f.includes("hone"))
    return {
      light: "#dfe3e6",
      dark: "#b0b8bd",
      spec: 0.16,
      band: 40,
      texture: "none",
    };
  if (f.includes("matte"))
    return {
      light: "#d5d9dc",
      dark: "#bcc2c6",
      spec: 0,
      band: 50,
      texture: "none",
    };
  if (f.includes("suede"))
    return {
      light: "#d2d7da",
      dark: "#a8b0b6",
      spec: 0.1,
      band: 45,
      texture: "grain",
    };
  if (f.includes("leather"))
    return {
      light: "#dbe0e3",
      dark: "#8f989f",
      spec: 0.28,
      band: 26,
      texture: "mottle",
    };
  if (f.includes("brush"))
    return {
      light: "#e2e6e9",
      dark: "#9aa3aa",
      spec: 0.3,
      band: 30,
      texture: "brushed",
    };
  return {
    light: "#e4e8ea",
    dark: "#a6aeb4",
    spec: 0.3,
    band: 28,
    texture: "none",
  };
}

/**
 * One finish, shown as a lit surface rather than a word in a pill.
 */
export function FinishSwatch({ finish }: { finish: string }) {
  const r = renderFor(finish);
  const id = `finish-${finish.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

  return (
    <div className="flex items-start gap-4">
      <svg
        viewBox="0 0 64 64"
        className="w-16 h-16 shrink-0 rounded-xl border border-white/15"
        role="img"
        aria-label={`${finish} finish`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={r.light} />
            <stop offset="100%" stopColor={r.dark} />
          </linearGradient>
          <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop
              offset={`${Math.max(0, 50 - r.band)}%`}
              stopColor="#fff"
              stopOpacity="0"
            />
            <stop offset="50%" stopColor="#fff" stopOpacity={r.spec} />
            <stop
              offset={`${Math.min(100, 50 + r.band)}%`}
              stopColor="#fff"
              stopOpacity="0"
            />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          {/* Fine even grain — suede and velvet. */}
          <pattern
            id={`${id}-grain`}
            width="2"
            height="2"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0.6" cy="0.6" r="0.35" fill="#6b757d" opacity="0.22" />
          </pattern>
          {/* Irregular mottle — leathered. Three offset circles per
              tile break the grid so it doesn't read as a screen. */}
          <pattern
            id={`${id}-mottle`}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="3" r="1.5" fill="#78838b" opacity="0.28" />
            <circle cx="6.5" cy="6" r="2" fill="#ffffff" opacity="0.22" />
            <circle cx="7" cy="1.5" r="1" fill="#6b757d" opacity="0.2" />
          </pattern>
          {/* Directional streaks — brushed. */}
          <pattern
            id={`${id}-brushed`}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect width="4" height="1" fill="#78838b" opacity="0.18" />
            <rect y="2" width="4" height="0.5" fill="#ffffff" opacity="0.2" />
          </pattern>
        </defs>

        <rect width="64" height="64" fill={`url(#${id})`} />
        {r.texture !== "none" && (
          <rect width="64" height="64" fill={`url(#${id}-${r.texture})`} />
        )}
        {r.spec > 0 && (
          <rect width="64" height="64" fill={`url(#${id}-spec)`} />
        )}
      </svg>

      <div className="min-w-0">
        <div className="text-sm font-medium uppercase tracking-wide text-white">
          {finish}
        </div>
        <p className="mt-1 text-sm font-light leading-relaxed text-pacific-mid">
          {finishDescription(finish) ?? "Premium surface finish."}
        </p>
      </div>
    </div>
  );
}
