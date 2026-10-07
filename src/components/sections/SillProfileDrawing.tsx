import type { SillProfile } from "@/data/thresholds-and-sills";

/**
 * A sill or threshold section as a line drawing (data/thresholds-and-sills
 * SECTIONS), hatched as a cut section, with its features labelled and the
 * back and front marked.
 *
 * On its own, every drawing is 1000 units across plus the same side margin,
 * so at the same width on the page all of them share one scale for text and
 * line; only their heights differ. Given a `frame`, it fits that frame
 * instead, its text at `font` in frame units, so drawings of any depth in
 * frames of one size read alike (the product cards). Not to scale between
 * drawings, and the page says so.
 */

const INK = "#14140f";
const PAD = 70;
const FONT = 34;
const SMALL = 28;

type Pt = [number, number];

export function SillProfileDrawing({
  profile,
  className,
  bare = false,
  frame,
  font = FONT,
  id,
}: {
  profile: SillProfile;
  className?: string;
  /** The outline alone, for small sizes: no labels, no back and front. */
  bare?: boolean;
  /** Fit this frame, in its own units, with the text at `font`. */
  frame?: { w: number; h: number };
  font?: number;
  /** Unique on the page, for the hatching; the profile's slug by default. */
  id?: string;
}) {
  const hatch = `hatch-${id ?? profile.slug}`;
  if (frame && !bare) return <FramedSection profile={profile} frame={frame} font={font} hatch={hatch} className={className} />;

  const H = Math.max(...profile.points.map(([, y]) => y));
  const labels = bare ? [] : profile.labels;
  const labelYs = labels.map((l) => l.at[1]);
  // The back / front captions sit on their own line below everything.
  const captionY = Math.min(0, ...labelYs) - 70;
  const top = Math.max(H, ...labelYs.map((y) => y + FONT)) + (bare ? 20 : 40);
  const bottom = bare ? -20 : captionY - SMALL - 20;
  const sy = (y: number) => top - y;
  const pts = profile.points.map(([x, y]) => `${x},${sy(y)}`).join(" ");

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
      {labels.map((l) => {
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
      {!bare && (
        <>
          <text x={0} y={sy(captionY)} fontSize={SMALL} fill={INK} fillOpacity="0.5" letterSpacing="3">
            BACK
          </text>
          <text x={1000} y={sy(captionY)} fontSize={SMALL} fill={INK} fillOpacity="0.5" letterSpacing="3" textAnchor="end">
            FRONT
          </text>
        </>
      )}
    </svg>
  );
}

/* The section fitted to a frame: the outline scales down as far as it must
   to fit with its labels, while the text, the leaders' reach and the back
   and front captions keep their size in frame units. The outline sits in
   the middle of the frame, as in every card. */
function FramedSection({
  profile,
  frame,
  font,
  hatch,
  className,
}: {
  profile: SillProfile;
  frame: { w: number; h: number };
  font: number;
  hatch: string;
  className?: string;
}) {
  const small = font * 0.82;
  const ys = profile.points.map(([, y]) => y);
  const gMax = Math.max(...ys);
  const gMin = Math.min(...ys);
  const textW = (t: string) => t.length * 0.56 * font;
  const M = 16;
  // Room at the top for the caption the card sets over the frame.
  const top0 = font * 1.5;

  const layout = (s: number) => {
    const T = (p: Pt): Pt => [p[0] * s, (gMax - p[1]) * s];
    const items = profile.labels.map((l) => {
      const to = T(l.to);
      const x = to[0] + (l.at[0] - l.to[0]);
      const y = to[1] - (l.at[1] - l.to[1]);
      const w = textW(l.text);
      const anchor = l.anchor ?? "middle";
      const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
      return { l, to, x, y, left, right: left + w, top: y - font * 0.8, bottom: y + font * 0.25, above: l.at[1] > l.to[1] };
    });
    const minX = Math.min(0, ...items.map((i) => i.left));
    const maxX = Math.max(1000 * s, ...items.map((i) => i.right));
    const minY = Math.min(0, ...items.map((i) => i.top));
    const lowest = Math.max((gMax - gMin) * s, ...items.map((i) => i.bottom));
    const captionY = lowest + small * 1.6;
    return { T, items, minX, maxX, minY, maxY: captionY + small * 0.3, captionY };
  };
  const fits = (s: number) => {
    const L = layout(s);
    return L.maxX - L.minX <= frame.w - 2 * M && L.maxY - L.minY <= frame.h - top0 - M;
  };
  let s = 1;
  if (!fits(1)) {
    let lo = 0.02;
    let hi = 1;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    s = lo;
  }
  const L = layout(s);
  const dx = Math.min(Math.max((frame.w - 1000 * s) / 2, M - L.minX), frame.w - M - L.maxX);
  const dy = top0 + (frame.h - top0 - M - (L.maxY - L.minY)) / 2 - L.minY;
  const place = (p: Pt): Pt => [p[0] + dx, p[1] + dy];
  const at = (p: Pt) => place(L.T(p));
  const pts = profile.points.map((p) => at(p).map((v) => v.toFixed(1)).join(",")).join(" ");
  const left = at([0, gMin]);
  const right = at([1000, gMin]);

  return (
    <svg
      viewBox={`0 0 ${frame.w} ${frame.h}`}
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
          x1={at(profile.joint[0])[0]}
          y1={at(profile.joint[0])[1]}
          x2={at(profile.joint[1])[0]}
          y2={at(profile.joint[1])[1]}
          stroke={INK}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {L.items.map((it) => {
        const [tx, ty] = place([it.x, it.y]);
        const [px, py] = place(it.to);
        // The leader leaves the text on the side facing the point.
        const ly = it.above ? ty + 12 : ty - font * 0.8 - 6;
        return (
          <g key={it.l.text}>
            <line x1={tx} y1={ly} x2={px} y2={py} stroke={INK} strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={px} cy={py} r="6" fill={INK} />
            <text x={tx} y={ty} fontSize={font} fill={INK} textAnchor={it.l.anchor ?? "middle"}>
              {it.l.text}
            </text>
          </g>
        );
      })}
      <text x={left[0]} y={L.captionY + dy} fontSize={small} fill={INK} fillOpacity="0.5" letterSpacing="3">
        BACK
      </text>
      <text x={right[0]} y={L.captionY + dy} fontSize={small} fill={INK} fillOpacity="0.5" letterSpacing="3" textAnchor="end">
        FRONT
      </text>
    </svg>
  );
}
