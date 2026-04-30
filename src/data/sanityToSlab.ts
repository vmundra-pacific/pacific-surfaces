/**
 * Maps Sanity CMS product documents to the Slab interface used by the
 * catalogue filter UI. Derives hue and pattern from the product name /
 * collection when the CMS doesn't carry those fields.
 */

import type { Slab, Hue, Pattern, Ribbon, Finish, Thickness } from "./slabs";

/* ------------------------------------------------------------------ *
 * Raw shape coming back from catalogueProductsQuery                   *
 * ------------------------------------------------------------------ */
interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string } | string;
  mainImage?: string | null;
  /**
   * Sanity-computed dominant background colour from the slab photo's
   * palette metadata. Hex string like "#a3835c". Used as the primary
   * source for hue classification — name keywords are only a fallback.
   */
  dominantColor?: string | null;
  /**
   * Editor-supplied hue override from the Sanity Studio "Hue Override"
   * field. When present, wins over both the image-derived hue and the
   * name-keyword fallback. Multi-select so a single slab can sit in
   * more than one bucket (e.g. white base + gold veining).
   */
  manualHues?: string[] | null;
  /**
   * Editor-supplied pattern override from the Sanity Studio
   * "Pattern Override" field. Single value — Marble-look / Movement
   * / Solid / Veined. When present, wins over the keyword-derived
   * pattern from the product name.
   */
  manualPattern?: string | null;
  collectionName?: string | null;
  finishes?: string[] | null;
  thickness?: string[] | null;
  ribbons?: string[] | null;
  visible?: boolean;
}

/* ------------------------------------------------------------------ *
 * Hue derivation — keyword matching against product name              *
 * ------------------------------------------------------------------ */
const HUE_KEYWORDS: Record<Hue, string[]> = {
  white: [
    "white",
    "bianco",
    "blanco",
    "snow",
    "arctic",
    "frost",
    "ice",
    "pearl",
    "crystal",
    "lumina",
    "stellar",
  ],
  cream: ["cream", "ivory", "avorio", "vanilla", "latte", "sand", "alabaster"],
  beige: ["beige", "nara", "sahara", "camel", "dune"],
  grey: [
    "grey",
    "gray",
    "perla",
    "silver",
    "haze",
    "ash",
    "graphite",
    "steel",
    "fog",
    "mist",
    "cement",
    "slate",
  ],
  dark: [
    "dark",
    "nero",
    "noir",
    "black",
    "obsidian",
    "midnight",
    "deep",
    "onyx",
    "carbon",
    "charcoal",
    "shadow",
    "night",
    "raven",
    "ebony",
  ],
  brown: [
    "brown",
    "desert",
    "terra",
    "mocha",
    "walnut",
    "chestnut",
    "bronze",
    "cinnamon",
    "umber",
    "espresso",
    "coffee",
    "kedar",
  ],
  blue: [
    "blue",
    "azzurra",
    "marino",
    "ocean",
    "atlantic",
    "azure",
    "navy",
    "cobalt",
    "indigo",
    "costa",
    "aqua",
  ],
  gold: [
    "gold",
    "oro",
    "dorado",
    "amber",
    "honey",
    "zira",
    "champagne",
    "saffron",
  ],
  pink: [
    "pink",
    "rose",
    "rosa",
    "blush",
    "petal",
    "peony",
    "coral",
    "salmon",
    "magenta",
    "fuchsia",
  ],
};

export function deriveHuesFromName(name: string, collection: string): Hue[] {
  // Tokenise on non-letters so we match WHOLE WORDS only. Substring
  // matching would mis-tag products like "Deepwave" (contains "deep")
  // as Dark, or "Iceland" (contains "ice") as White. Splitting into a
  // set of word tokens and checking exact membership avoids that.
  const lower = `${name} ${collection}`.toLowerCase();
  const tokens = new Set(lower.split(/[^a-z]+/).filter(Boolean));
  const matches: Hue[] = [];
  for (const [hue, keywords] of Object.entries(HUE_KEYWORDS) as [
    Hue,
    string[],
  ][]) {
    if (keywords.some((kw) => tokens.has(kw))) {
      matches.push(hue);
    }
  }
  return matches;
}

/* ------------------------------------------------------------------ *
 * Image-based hue classification                                      *
 *                                                                    *
 * Sanity auto-computes a palette for every uploaded asset; we pull   *
 * the dominant swatch as a hex string and bucket it into one of our  *
 * Hue values via HSL classification.                                  *
 *                                                                    *
 * The thresholds are tuned for stone photography (lots of mid-grey   *
 * and warm-neutral content). Lightness is checked first — extreme    *
 * black/white wins regardless of any tiny saturation. Then           *
 * desaturated colours are bucketed as grey/white/dark by lightness   *
 * alone. Saturated colours fall through to a coarse hue-angle grid.  *
 * ------------------------------------------------------------------ */
export function hexToHue(hex: string | null | undefined): Hue | null {
  if (!hex) return null;
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  // Lightness-first: very light or very dark wins outright.
  if (l >= 0.86) return "white";
  if (l <= 0.18) return "dark";

  // Low-saturation neutrals — bucket by lightness.
  if (s < 0.12) {
    if (l > 0.72) return "white";
    if (l < 0.3) return "dark";
    return "grey";
  }

  // Magenta-to-pink wrap-around (320° → 360° → 0° → 15°). Caught
  // before the rest of the warm zone so a light, faintly-saturated
  // hex like `#f0c8d4` (rose marble) lands in `pink` instead of
  // falling through to `beige`. Only LIGHT pinks qualify — darker
  // values in the same hue band are red-brown territory and fall
  // through to the existing brown/beige logic below.
  if (h >= 320 || h < 15) {
    if (l >= 0.6) return "pink";
  }

  // Pure purple range (270°–320°) — neutralise to grey for stone.
  if (h >= 270 && h < 320) return "grey";

  // Saturated colours — pick by hue angle, with a few brightness
  // refinements where two buckets overlap (gold vs cream/beige,
  // brown vs beige).
  if (h >= 200 && h <= 270) return "blue";
  if (h > 65 && h < 200) {
    // green/cyan zone — rare for stone, fold into blue if leans cyan.
    return h > 175 ? "blue" : "grey";
  }

  // 0–65° = warm zone (red → orange → yellow). Stone shows up here
  // most of the time, so split it carefully.
  if (h >= 35) {
    // Yellow-leaning: gold if rich, cream if very light, beige otherwise.
    if (s >= 0.3 && l <= 0.65) return "gold";
    if (l >= 0.78) return "cream";
    return "beige";
  }
  if (h >= 18) {
    // Orange: brown when dark, beige when mid, cream when light.
    if (l < 0.45) return "brown";
    if (l > 0.78) return "cream";
    return "beige";
  }
  // 0–18° = red-brown (light pinks already caught by the magenta-
  // pink zone above; this branch only runs for darker / less-pink
  // hex values).
  if (l < 0.5) return "brown";
  return "beige";
}

// Whitelist of valid hue buckets for sanitising the manualHues field.
// Defensive — Sanity's predefined-list option doesn't enforce values
// at the API layer, so a stale value left over from a renamed bucket
// would silently survive in the data.
export const VALID_HUES: ReadonlySet<Hue> = new Set<Hue>([
  "white",
  "cream",
  "beige",
  "grey",
  "dark",
  "brown",
  "blue",
  "gold",
  "pink",
]);

export function deriveHues(
  name: string,
  collection: string,
  dominantColor?: string | null,
  manualHues?: string[] | null
): string[] {
  // 1. Editor-supplied override wins. Allow ANY string — predefined
  //    Hue values get hand-tuned gradients in the filter UI, and
  //    custom values (e.g. "lavender") render with a neutral
  //    fallback gradient so editors aren't restricted to the
  //    predefined bucket list. We still trim empty/whitespace
  //    strings so an accidental empty tag doesn't pollute things.
  if (manualHues && manualHues.length > 0) {
    const cleaned = manualHues
      .map((h) => (typeof h === "string" ? h.trim() : ""))
      .filter((h) => h.length > 0);
    if (cleaned.length > 0) return cleaned;
  }

  // 2. Image-derived hue from Sanity palette metadata.
  const fromImage = hexToHue(dominantColor);
  if (fromImage) return [fromImage];

  // 3. Keyword match on name + collection.
  const fromName = deriveHuesFromName(name, collection);
  if (fromName.length > 0) return fromName;

  // 4. Final fallback: grey (neutral) so unmatched products don't
  //    pollute the White hue filter.
  return ["grey"];
}

/* ------------------------------------------------------------------ *
 * Pattern derivation — keyword matching against collection/name       *
 * ------------------------------------------------------------------ */
export const VALID_PATTERNS = [
  "Marble-look",
  "Movement",
  "Solid",
  "Veined",
] as const;
export type ValidPattern = (typeof VALID_PATTERNS)[number];

export function derivePattern(name: string, collection: string): Pattern {
  const lower = `${name} ${collection}`.toLowerCase();
  if (lower.includes("vein")) return "Veined";
  if (
    lower.includes("solid") ||
    lower.includes("pure") ||
    lower.includes("stellar")
  )
    return "Solid";
  if (
    lower.includes("movement") ||
    lower.includes("flow") ||
    lower.includes("wave")
  )
    return "Movement";
  return "Marble-look";
}

/**
 * Three-tier pattern resolver mirroring deriveHues:
 *   1. EDITOR OVERRIDE — manualPattern field on the Sanity product
 *      doc, validated against VALID_PATTERNS. Always wins.
 *   2. AUTO — derivePattern(name, collection), keyword-matching on
 *      vein / solid / pure / stellar / movement / flow / wave.
 *   3. FALLBACK — "Marble-look".
 */
export function resolvePattern(
  name: string,
  collection: string,
  manualPattern?: string | null
): Pattern {
  // Any non-empty editor override wins. Predefined values are listed
  // in VALID_PATTERNS for reference / suggestions; custom values are
  // accepted verbatim and surface as new filter chips in the
  // catalogue.
  if (manualPattern && manualPattern.trim().length > 0) {
    return manualPattern.trim();
  }
  return derivePattern(name, collection);
}

/* ------------------------------------------------------------------ *
 * Ribbon mapping                                                      *
 * ------------------------------------------------------------------ */
function deriveRibbon(ribbons?: string[] | null): Ribbon {
  if (!ribbons || ribbons.length === 0) return null;
  const lower = ribbons.map((r) => r.toLowerCase());
  if (lower.includes("new")) return "new";
  if (lower.includes("featured") || lower.includes("top color"))
    return "featured";
  return null;
}

/* ------------------------------------------------------------------ *
 * Swatch fallback — simple CSS gradient from the primary hue          *
 * ------------------------------------------------------------------ */
export const HUE_SWATCH: Record<Hue, string> = {
  white:
    "radial-gradient(ellipse at 30% 20%, #fff 0%, #eef1f4 30%, #c5ccd3 70%, #98a3ad 100%)",
  cream: "linear-gradient(160deg, #f4f0e8 0%, #ded5c5 50%, #b8a98d 100%)",
  beige: "linear-gradient(160deg, #dedcd3 0%, #beb5a0 50%, #8b8168 100%)",
  grey: "radial-gradient(ellipse at 60% 40%, #f8f9fb 0%, #dfe3e8 50%, #aab3bc 100%)",
  dark: "linear-gradient(135deg, #2a3640 0%, #1a2832 50%, #0f1a22 100%)",
  brown: "linear-gradient(145deg, #eae3d4 0%, #c9bca2 60%, #8a7a5c 100%)",
  blue: "linear-gradient(135deg, #3a4852 0%, #28353f 50%, #1a2631 100%)",
  gold: "radial-gradient(ellipse at 30% 30%, #f4efe5 0%, #d5c9b0 50%, #a28e6a 100%)",
  pink: "radial-gradient(ellipse at 30% 25%, #fdf0f3 0%, #f6cdd6 45%, #e6a4b3 100%)",
};

/* ------------------------------------------------------------------ *
 * Thickness normalisation                                             *
 * "2 CM", "2cm", "2 cm", "20mm", "20 mm" → "2 cm"                   *
 * "3 CM", "3cm", "3 cm", "30mm", "30 mm" → "3 cm"                   *
 * ------------------------------------------------------------------ */
function normalizeThickness(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  // mm values → cm
  const mmMatch = s.match(/^(\d+)\s*mm$/);
  if (mmMatch) {
    const cm = parseInt(mmMatch[1], 10) / 10;
    return `${cm} cm`;
  }
  // cm values (with or without spaces)
  const cmMatch = s.match(/^(\d+)\s*cm$/);
  if (cmMatch) {
    return `${cmMatch[1]} cm`;
  }
  // fallback: return title-cased original
  return raw.trim();
}

/* ------------------------------------------------------------------ *
 * Public mapper                                                       *
 * ------------------------------------------------------------------ */
export function mapSanityToCatalogue(products: SanityProduct[]): Slab[] {
  return products
    .filter((p) => p.visible !== false)
    .map((p) => {
      const slug =
        typeof p.slug === "string" ? p.slug : (p.slug?.current ?? p._id);
      const collection = p.collectionName ?? "Vision Series";
      const hues = deriveHues(
        p.name,
        collection,
        p.dominantColor,
        p.manualHues
      );
      const pattern = resolvePattern(p.name, collection, p.manualPattern);
      const finishes: Finish[] =
        p.finishes && p.finishes.length > 0
          ? (p.finishes as Finish[])
          : ["Polished"];
      const thicknesses: Thickness[] =
        p.thickness && p.thickness.length > 0
          ? ([...new Set(p.thickness.map(normalizeThickness))] as Thickness[])
          : ["2 cm", "3 cm"];

      // Look up the swatch gradient for the slab's primary hue.
      // `hues[0]` may be a custom editor-defined string outside the
      // predefined Hue union, in which case HUE_SWATCH is missing
      // an entry — fall through to `white` so we always render
      // something. Cast via `Hue` is safe because the lookup is
      // guarded by the optional-chain.
      const primaryHue = hues[0] as Hue | undefined;
      const swatch = (primaryHue && HUE_SWATCH[primaryHue]) || HUE_SWATCH.white;

      return {
        id: p._id,
        name: p.name,
        slug,
        hues,
        collection,
        pattern,
        finishes,
        thicknesses,
        ribbon: deriveRibbon(p.ribbons),
        swatch,
        photoUrl: p.mainImage ?? undefined,
      };
    });
}
