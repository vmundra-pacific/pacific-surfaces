/**
 * A vanity top as a technical drawing, a gallery frame on its store page
 * (owner, 2026-10-10: "add the dimensions like a technical drawing... this
 * is the length, this is how much thickness we are giving"): the plan with
 * its length and depth, the basins cut in and the faucet holes drilled
 * behind them, and the front elevation with the height of the front edge.
 * Every figure is the size chosen on the page, in inches; basin and faucet
 * positions are indicative, cut to the customer's layout.
 */

const INK = "#14140f";

const inches = (v: string | undefined, fallback: number) => {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const label = (v: string | undefined) => (v && Number.isFinite(Number.parseFloat(v)) ? `${v} in` : "Custom");

/** The holes behind one basin, as offsets from its centre line (inches),
 *  with the spacing to dimension. */
function holesFor(faucet: string): { xs: number[]; span?: string } {
  if (faucet.startsWith("4 in")) return { xs: [-2, 0, 2], span: "4 in centres" };
  if (faucet.startsWith("8 in")) return { xs: [-4, 0, 4], span: "8 in centres" };
  if (faucet.startsWith("Single")) return { xs: [0] };
  if (faucet.startsWith("No")) return { xs: [] };
  return { xs: [0], span: faucet ? `${faucet} spacing` : undefined };
}

export function VanityTopDrawing({
  basins,
  length,
  width,
  height,
  faucet,
  className,
}: {
  basins: number;
  length: string;
  width: string;
  height: string;
  faucet: string;
  className?: string;
}) {
  const L = inches(length, 37);
  const D = inches(width, 22);
  const H = inches(height, 4);
  const holes = holesFor(faucet);

  // Text in proportion to the drawing, so it reads at one size in the
  // gallery frame (~2.1:1) whatever the length.
  const F = Math.max((L + 24) / 2.1, D + H + 22) * 0.045;
  // Plan at the top, elevation under it; y down, in inches.
  const planY = F * 2.4;
  const elevY = planY + D + F * 4;
  const right = L + 12;
  const total = elevY + H + F * 2;

  const centres = basins === 2 ? [L / 4, (3 * L) / 4] : [L / 2];
  const bw = Math.min(17, (basins === 2 ? L / 2 : L) - 7);
  const bd = Math.min(13, D - 7);
  const by = planY + D - bd - 3.5;
  const holeY = by - 2.2;

  const thin = { stroke: INK, strokeOpacity: 0.55, strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  const bold = { stroke: INK, strokeWidth: 1.6, vectorEffect: "non-scaling-stroke" as const, fill: "none" };
  const tick = (x: number, y: number) => <line x1={x - 0.45} y1={y + 0.45} x2={x + 0.45} y2={y - 0.45} stroke={INK} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />;

  return (
    <svg
      viewBox={`-6 0 ${right + 12} ${total}`}
      className={className}
      role="img"
      aria-label={`Technical drawing of the vanity top: ${label(length)} long, ${label(width)} deep, front edge ${label(height)} high, ${basins} basin${basins === 1 ? "" : "s"}, faucet holes ${faucet || "to your layout"}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={-6} y={0} width={right + 12} height={total} fill="#ffffff" />

      {/* plan */}
      <text x={0} y={planY + D + F * 1.1} fontSize={F * 0.7} fill={INK} fillOpacity="0.5" letterSpacing="0.3">
        PLAN
      </text>
      <rect x={0} y={planY} width={L} height={D} {...bold} rx={0.2} />
      {centres.map((cx) => (
        <g key={cx}>
          <rect x={cx - bw / 2} y={by} width={bw} height={bd} rx={2.2} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
          <circle cx={cx} cy={by + bd / 2} r={0.9} fill="none" stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {holes.xs.map((dx) => (
            <circle key={dx} cx={cx + dx} cy={holeY} r={0.62} fill={INK} />
          ))}
        </g>
      ))}
      {/* faucet spacing, on the first basin */}
      {holes.span && holes.xs.length > 1 && (
        <g>
          <line x1={centres[0] + holes.xs[0]} y1={holeY - 1.6} x2={centres[0] + holes.xs[holes.xs.length - 1]} y2={holeY - 1.6} {...thin} />
          {tick(centres[0] + holes.xs[0], holeY - 1.6)}
          {tick(centres[0] + holes.xs[holes.xs.length - 1], holeY - 1.6)}

        </g>
      )}
      {/* the faucet holes as a note under the plan, clear of the dimensions */}
      <text x={0} y={planY + D + F * 2.1} fontSize={F * 0.7} fill={INK}>
        Faucet holes: {faucet || "to your layout"}
      </text>
      <text x={centres[centres.length - 1]} y={by + bd / 2 + bd / 2 - 1.2} fontSize={F * 0.62} fill={INK} fillOpacity="0.55" textAnchor="middle">
        Basin cut-out
      </text>

      {/* length, above the plan */}
      <line x1={0} y1={planY - 0.4} x2={0} y2={planY - 1.9} {...thin} />
      <line x1={L} y1={planY - 0.4} x2={L} y2={planY - 1.9} {...thin} />
      <line x1={0} y1={planY - 1.4} x2={L} y2={planY - 1.4} {...thin} strokeOpacity={0.9} />
      {tick(0, planY - 1.4)}
      {tick(L, planY - 1.4)}
      <rect x={L / 2 - F * 3} y={planY - 1.4 - F * 0.75} width={F * 6} height={F * 1.5} fill="#ffffff" />
      <text x={L / 2} y={planY - 1.4 + F * 0.35} fontSize={F} fill={INK} textAnchor="middle">
        {label(length)}
      </text>

      {/* depth, right of the plan */}
      <line x1={L + 0.4} y1={planY} x2={L + 3.4} y2={planY} {...thin} />
      <line x1={L + 0.4} y1={planY + D} x2={L + 3.4} y2={planY + D} {...thin} />
      <line x1={L + 2.8} y1={planY} x2={L + 2.8} y2={planY + D} {...thin} strokeOpacity={0.9} />
      {tick(L + 2.8, planY)}
      {tick(L + 2.8, planY + D)}
      <text x={L + 3.8} y={planY + D / 2 + F * 0.35} fontSize={F} fill={INK}>
        {label(width)}
      </text>
      <text x={L + 3.8} y={planY + D / 2 + F * 1.3} fontSize={F * 0.65} fill={INK} fillOpacity="0.55">
        depth
      </text>

      {/* front elevation */}
      <text x={0} y={elevY + H + F * 1.1} fontSize={F * 0.7} fill={INK} fillOpacity="0.5" letterSpacing="0.3">
        FRONT ELEVATION
      </text>
      <rect x={0} y={elevY} width={L} height={H} {...bold} />
      <line x1={L + 0.4} y1={elevY} x2={L + 3.4} y2={elevY} {...thin} />
      <line x1={L + 0.4} y1={elevY + H} x2={L + 3.4} y2={elevY + H} {...thin} />
      <line x1={L + 2.8} y1={elevY} x2={L + 2.8} y2={elevY + H} {...thin} strokeOpacity={0.9} />
      {tick(L + 2.8, elevY)}
      {tick(L + 2.8, elevY + H)}
      <text x={L + 3.8} y={elevY + H / 2 + F * 0.1} fontSize={F} fill={INK}>
        {label(height)}
      </text>
      <text x={L + 3.8} y={elevY + H / 2 + F * 1.05} fontSize={F * 0.65} fill={INK} fillOpacity="0.55">
        front edge
      </text>
    </svg>
  );
}
