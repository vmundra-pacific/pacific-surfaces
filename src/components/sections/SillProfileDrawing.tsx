import type { SillProfile } from "@/data/thresholds-and-sills";

/**
 * A sill or threshold section as a line drawing: the supplier's drawing,
 * traced (data/thresholds-and-sills PROFILES), hatched as a cut section,
 * with its features labelled and the back and front marked.
 *
 * Every drawing is 1000 units across plus the same side margin, so at the
 * same width on the page all six share one scale for text and line; only
 * their heights differ. Not to scale between drawings, and the page says so.
 */

const INK = "#14140f";
const PAD = 70;
const FONT = 34;
const SMALL = 28;

export function SillProfileDrawing({ profile, className }: { profile: SillProfile; className?: string }) {
  const H = Math.max(...profile.points.map(([, y]) => y));
  const labelYs = profile.labels.map((l) => l.at[1]);
  // The back / front captions sit on their own line below everything.
  const captionY = Math.min(0, ...labelYs) - 70;
  const top = Math.max(H, ...labelYs.map((y) => y + FONT)) + 40;
  const bottom = captionY - SMALL - 20;
  const sy = (y: number) => top - y;
  const pts = profile.points.map(([x, y]) => `${x},${sy(y)}`).join(" ");
  const hatch = `hatch-${profile.slug}`;

  return (
    <svg
      viewBox={`${-PAD} 0 ${1000 + 2 * PAD} ${top - bottom}`}
      className={className}
      role="img"
      aria-label={`Section of the ${profile.name.toLowerCase()}: ${profile.labels.map((l) => l.text.toLowerCase()).join(", ")}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={hatch} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="22" stroke={INK} strokeOpacity="0.16" strokeWidth="3" />
        </pattern>
      </defs>
      <polygon
        points={pts}
        fill={`url(#${hatch})`}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {profile.joint && (
        <line
          x1={profile.joint[0][0]}
          y1={sy(profile.joint[0][1])}
          x2={profile.joint[1][0]}
          y2={sy(profile.joint[1][1])}
          stroke={INK}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {profile.labels.map((l) => {
        const above = l.at[1] > l.to[1];
        // The leader leaves the text on the side facing the point.
        const ly = above ? sy(l.at[1]) + 12 : sy(l.at[1]) - FONT * 0.8 - 6;
        return (
          <g key={l.text}>
            <line
              x1={l.at[0]}
              y1={ly}
              x2={l.to[0]}
              y2={sy(l.to[1])}
              stroke={INK}
              strokeOpacity="0.55"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={l.to[0]} cy={sy(l.to[1])} r="6" fill={INK} />
            <text x={l.at[0]} y={sy(l.at[1])} fontSize={FONT} fill={INK} textAnchor={l.anchor ?? "middle"}>
              {l.text}
            </text>
          </g>
        );
      })}
      <text x={0} y={sy(captionY)} fontSize={SMALL} fill={INK} fillOpacity="0.5" letterSpacing="3">
        BACK
      </text>
      <text x={1000} y={sy(captionY)} fontSize={SMALL} fill={INK} fillOpacity="0.5" letterSpacing="3" textAnchor="end">
        FRONT
      </text>
    </svg>
  );
}
