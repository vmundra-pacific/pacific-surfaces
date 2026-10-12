import type { SillProfile } from "@/data/thresholds-and-sills";

/**
 * A section as a technical drawing (owner, 2026-10-10: "what is this
 * height, what is this angle... so that we look professional"): the
 * hatched section in its own proportions, its features labelled, and
 * dimension lines for the figures on record in `profile.dims`, the width
 * across under it, the height at the back on the left, at the front (or at
 * the crest of a rounded top) on the right. Nothing is dimensioned that is
 * not on record.
 */

const INK = "#14140f";
const F = 40;
const GAP = 70;
const TICK = 14;

type Pt = [number, number];

const textW = (t: string) => t.length * 0.55 * F;

export function SillSectionDims({ profile, id, className }: { profile: SillProfile; id?: string; className?: string }) {
  const hatch = `dims-hatch-${id ?? profile.slug}`;
  const d = profile.dims ?? {};
  const ys = profile.points.map(([, y]) => y);
  const H = Math.max(...ys);
  const heightAt = (pick: (x: number) => boolean) => Math.max(0, ...profile.points.filter(([x]) => pick(x)).map(([, y]) => y));
  const backH = heightAt((x) => x <= 100);
  const frontH = heightAt((x) => x >= 990);
  const right = d.front ? { h: frontH, text: d.front, from: 1000 } : d.middle ? { h: H, text: d.middle, from: 500 } : null;

  const labelTops = profile.labels.map((l) => l.at[1] + F);
  const labelBottoms = profile.labels.map((l) => l.at[1] - F * 0.4);
  const low = Math.min(0, ...labelBottoms);
  const widthY = low - GAP;
  const top = Math.max(H, ...labelTops) + 40;
  const bottom = widthY - F * 1.4 - (d.width ? 40 : 0);

  const leftX = -GAP;
  const rightX = 1000 + GAP;
  const L = d.back ? GAP + 30 + textW(d.back) : 60;
  const R = right ? GAP + 30 + textW(right.text) : 60;
  // Labels may run past the outline; keep them in the frame.
  const minLabel = Math.min(0, ...profile.labels.map((l) => (l.anchor === "start" ? l.at[0] : l.anchor === "end" ? l.at[0] - textW(l.text) : l.at[0] - textW(l.text) / 2)));
  const maxLabel = Math.max(1000, ...profile.labels.map((l) => (l.anchor === "end" ? l.at[0] : l.anchor === "start" ? l.at[0] + textW(l.text) : l.at[0] + textW(l.text) / 2)));
  const x0 = Math.min(-L, minLabel - 20);
  const x1 = Math.max(1000 + R, maxLabel + 20);

  const sy = (y: number) => top - y;
  const pts = profile.points.map(([x, y]) => `${x},${sy(y)}`).join(" ");
  const line = (a: Pt, b: Pt, o = 0.85, w = 1) => (
    <line x1={a[0]} y1={sy(a[1])} x2={b[0]} y2={sy(b[1])} stroke={INK} strokeOpacity={o} strokeWidth={w} vectorEffect="non-scaling-stroke" />
  );
  const tick = ([x, y]: Pt) => line([x - TICK, y - TICK], [x + TICK, y + TICK], 1, 1.4);

  const parts = [d.width && `width ${d.width}`, d.back && `height at the back ${d.back}`, d.front && `at the front ${d.front}`, d.middle && `at the crest ${d.middle}`].filter(Boolean);

  return (
    <svg
      viewBox={`${x0} 0 ${x1 - x0} ${top - bottom}`}
      className={className}
      role="img"
      aria-label={`Section of the ${profile.name.toLowerCase()}${parts.length ? `: ${parts.join(", ")}` : ""}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={hatch} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="22" stroke={INK} strokeOpacity="0.16" strokeWidth="3" />
        </pattern>
      </defs>
      <polygon points={pts} fill={`url(#${hatch})`} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      {profile.labels.map((l) => {
        const above = l.at[1] > l.to[1];
        const ly = above ? sy(l.at[1]) + 12 : sy(l.at[1]) - F * 0.8 - 6;
        return (
          <g key={l.text}>
            <line x1={l.at[0]} y1={ly} x2={l.to[0]} y2={sy(l.to[1])} stroke={INK} strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={l.to[0]} cy={sy(l.to[1])} r="6" fill={INK} />
            <text x={l.at[0]} y={sy(l.at[1])} fontSize={F * 0.85} fill={INK} fillOpacity="0.7" textAnchor={l.anchor ?? "middle"}>
              {l.text}
            </text>
          </g>
        );
      })}

      {d.width && (
        <g>
          {line([0, -12], [0, widthY - 20], 0.45)}
          {line([1000, -12], [1000, widthY - 20], 0.45)}
          {line([0, widthY], [1000, widthY])}
          {tick([0, widthY])}
          {tick([1000, widthY])}
          <text x={500} y={sy(widthY) + F * 1.15} fontSize={F} fill={INK} textAnchor="middle">
            {d.width}
          </text>
        </g>
      )}

      {d.back && (
        <g>
          {line([-12, backH], [leftX - 20, backH], 0.45)}
          {line([-12, 0], [leftX - 20, 0], 0.45)}
          {line([leftX, 0], [leftX, backH])}
          {tick([leftX, 0])}
          {tick([leftX, backH])}
          <text x={leftX - 26} y={sy(backH / 2) + F * 0.35} fontSize={F} fill={INK} textAnchor="end">
            {d.back}
          </text>
        </g>
      )}

      {right && (
        <g>
          {line([right.from + 12, right.h], [rightX + 20, right.h], 0.45)}
          {line([1012, 0], [rightX + 20, 0], 0.45)}
          {line([rightX, 0], [rightX, right.h])}
          {tick([rightX, 0])}
          {tick([rightX, right.h])}
          <text x={rightX + 26} y={sy(right.h / 2) + F * 0.35} fontSize={F} fill={INK}>
            {right.text}
          </text>
        </g>
      )}

      <text x={0} y={sy(bottom) - 8} fontSize={F * 0.7} fill={INK} fillOpacity="0.5" letterSpacing="3">
        BACK
      </text>
      <text x={1000} y={sy(bottom) - 8} fontSize={F * 0.7} fill={INK} fillOpacity="0.5" letterSpacing="3" textAnchor="end">
        FRONT
      </text>
    </svg>
  );
}
