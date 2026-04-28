/**
 * Heuristic "similarity" picker for the product page's
 * "You May Also Like" rail.
 *
 * The rail must be ONE row of N cards (default 5), ranked by:
 *   1. Same collection as the source product
 *   2. Same tone bucket as the source product (light vs dark vs warm)
 *
 * Tone is inferred from the product NAME because the Sanity product
 * schema doesn't carry a hue field today. Keyword classifier below is
 * conservative — anything not matching dark/warm falls into "light",
 * which is the right default for Pacific's catalogue (mostly white
 * stones, only a handful of black ones).
 */

export type Tone = "light" | "dark" | "warm";

const DARK_KEYWORDS = [
  "black",
  "nero",
  "noir",
  "midnight",
  "graphite",
  "obsidian",
  "atlantic deep",
  "deep",
  "charcoal",
  "smoke",
  "onyx",
  "anthracite",
  "shadow",
  "carbon",
  "ebony",
  "espresso",
];

const WARM_KEYWORDS = [
  "amber",
  "brown",
  "desert",
  "tan",
  "kedar",
  "amazonik",
  "dorado",
  "gold",
  "bronze",
  "copper",
  "rust",
  "sienna",
  "terra",
  "sand",
  "honey",
  "caramel",
  "cognac",
  "wood",
  "oak",
];

/**
 * Classify a product into a coarse tone bucket from its name.
 * Defaults to "light" when nothing matches — most of the catalogue
 * is white/calacatta-style.
 */
export function toneFromName(name: string | undefined | null): Tone {
  if (!name) return "light";
  const n = name.toLowerCase();
  if (DARK_KEYWORDS.some((k) => n.includes(k))) return "dark";
  if (WARM_KEYWORDS.some((k) => n.includes(k))) return "warm";
  return "light";
}

interface SimilarCandidate {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage?: string;
  price?: number;
  /** Optional collection name; passed through if available so the
   *  ranker can use it. Same-collection matches always beat tone
   *  matches. */
  collectionName?: string;
  categoryName?: string;
}

interface SourceProduct {
  _id: string;
  name: string;
  collection?: { name: string };
}

/**
 * Pick up to N (default 5) candidates ranked for similarity.
 *
 *   Tier 1: same collection (regardless of tone) — these are the most
 *           obvious siblings the user would expect to see together.
 *   Tier 2: same tone, any collection.
 *   Tier 3: anything else, ordered by name (deterministic so the rail
 *           is stable across renders).
 *
 * Within each tier, items keep their input order. We dedupe by _id.
 */
export function pickSimilar(
  source: SourceProduct,
  related: SimilarCandidate[],
  allOther: SimilarCandidate[],
  n: number = 5
): SimilarCandidate[] {
  const sourceCollection = source.collection?.name;
  const sourceTone = toneFromName(source.name);

  // Build the candidate pool — `related` is already filtered to
  // same-collection by the GROQ query, so it's our Tier 1.
  // `allOther` is everything else (already excludes the source product).
  const pool = new Map<string, SimilarCandidate>();
  for (const p of related) if (p._id !== source._id) pool.set(p._id, p);
  for (const p of allOther)
    if (p._id !== source._id && !pool.has(p._id)) pool.set(p._id, p);

  type Scored = { c: SimilarCandidate; tier: number; idx: number };
  const scored: Scored[] = [];
  let idx = 0;
  for (const c of pool.values()) {
    const sameCollection =
      !!sourceCollection &&
      !!c.collectionName &&
      c.collectionName === sourceCollection;
    const sameTone = toneFromName(c.name) === sourceTone;
    let tier = 3;
    if (sameCollection) tier = 1;
    else if (sameTone) tier = 2;
    scored.push({ c, tier, idx: idx++ });
  }

  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.idx - b.idx;
  });

  return scored.slice(0, n).map((s) => s.c);
}
