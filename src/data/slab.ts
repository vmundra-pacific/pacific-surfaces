/**
 * The slab, as the owner gave it (2026-11-25): "347 X 201 Cm ... 137X79
 * Inch", for quartz and Eclipse, then "only mention cm & Inch". Shown
 * centimetres first, then inches, the slash glued to the measure before
 * it, with no "superjumbo" beside it: "347 × 201 cm / 137 × 79 in".
 * (It was 350 × 205 cm from 2026-11-18.) Every page that states the slab
 * size takes it from here, or writes the same words.
 */
export const SLAB_CM = "347\u00a0×\u00a0201\u00a0cm";
export const SLAB_IN = "137\u00a0×\u00a079\u00a0in";
export const SLAB_SIZE = `${SLAB_CM}\u00a0/ ${SLAB_IN}`;

/** The slab typed in inches ("137 x 79 inches"); a 137 × 79 cm or mm
 *  piece is not the slab. */
const SLAB_137_79 =
  /(^|[^\d.])137(\.0)?\s*(["″”]|in\w*)?\s*[x×X]\s*79(\.0)?(?![\d.])(?!\s*(?:cm|mm)\b)/i;

/** One dimension group: 1 to 3 numbers joined by "x", each perhaps marked
 *  with an inch sign, then perhaps a unit ("inches", "in", "cm"). */
const DIMENSIONS =
  /(\d+(?:\.\d+)?)\s*["″”]?(?:\s*[x×X]\s*\d+(?:\.\d+)?\s*["″”]?){0,2}\s*(?:inches|inch|in|cm)?(?![a-z])/gi;

const fmt = (n: number) => String(Math.round(n * 10) / 10);
/** A converted figure: whole numbers from 10 up, one decimal below
 *  ("3 in" is 7.6 cm, not 8; "1.2 cm" is 0.5 in, not 0). */
const conv = (v: number) => fmt(v >= 10 ? Math.round(v) : v);

/** Non-breaking spaces inside a measure, so "347 × 201 cm" never splits
 *  across lines; the only break is at the slash. */
const NB_X = "\u00a0×\u00a0";

/**
 * A size typed into Sanity, as the site shows it: the slab
 * ("137 x 79 inches") as SLAB_SIZE, and any other size in centimetres
 * first, then inches ("48 X 22 inches" -> "122 × 56 cm / 48 × 22 in",
 * "325 X 203 CM" -> "325 × 203 cm / 128 × 80 in"). Text without a unit
 * ("As Per Requirement") is left as typed.
 */
export function slabSizeLabel(size: string): string {
  // Already "… cm / … in": shown as typed, never converted twice.
  if (/\bcm\s*\/\s*[\d.]/i.test(size)) return size;
  if (SLAB_137_79.test(size)) return SLAB_SIZE;
  return size
    .replace(DIMENSIONS, (m) => {
      const typed = m.match(/\d+(?:\.\d+)?/g) ?? [];
      const nums = typed.map(Number);
      const word = m.match(/(inches|inch|in|cm)\s*$/i)?.[1]?.toLowerCase();
      const unit = word
        ? word === "cm"
          ? "cm"
          : "in"
        : /["″”]/.test(m)
          ? "in"
          : null;
      if (!unit || !nums.length) return m;
      // The unit as typed keeps its figures; the other is converted.
      const cm = unit === "cm" ? typed : nums.map((n) => conv(n * 2.54));
      const inch = unit === "in" ? typed : nums.map((n) => conv(n / 2.54));
      const trail = /\s$/.test(m) ? " " : "";
      return `${cm.join(NB_X)}\u00a0cm / ${inch.join(NB_X)}\u00a0in${trail}`;
    })
    .replace(/\s+:\s+/g, ": ");
}
