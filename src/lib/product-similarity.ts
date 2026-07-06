/**
 * Heuristic "similarity" picker for the product page's
 * "You May Also Like" rail (and the Compare Colors picker, which
 * shares the same ranked candidate list).
 *
 * Ranking — strict priority order:
 *   Tier 1: Same collection as the source product
 *   Tier 2: Shares at least one hue value with the source product
 *   Tier 3: Everything else (deterministic name order)
 *
 * Hues come from the product's `manualHues` field in Sanity (an array
 * of strings — "white", "cream", "grey", "dark", "brown", etc.). The
 * editor sets these per product. A product with hues ["grey","cream"]
 * matches another product with hues ["grey"] OR ["cream","white"]
 * because the intersection is non-empty.
 */

interface SimilarCandidate {
  _id: string;
  name: string;
  slug: { current: string };
  mainImage?: string;
  price?: number;
  /** Collection name; passed through if available so the ranker can
   *  use it. Same-collection matches always beat hue matches. */
  collectionName?: string;
  categoryName?: string;
  /** Editor-set hues from Sanity. May be missing on older imports. */
  manualHues?: string[];
}

interface SourceProduct {
  _id: string;
  name: string;
  collection?: { name: string };
  manualHues?: string[];
}

/**
 * Return true when source and candidate share at least one hue. Case-
 * insensitive, whitespace-tolerant. Empty / missing hue arrays return
 * false so untagged products don't accidentally match each other on
 * "both have no hues."
 */
function shareHue(
  sourceHues: string[] | undefined,
  candidateHues: string[] | undefined
): boolean {
  if (!sourceHues?.length || !candidateHues?.length) return false;
  const norm = (s: string) => s.trim().toLowerCase();
  const set = new Set(sourceHues.map(norm));
  return candidateHues.some((h) => set.has(norm(h)));
}

/**
 * Pick up to N (default 5) candidates ranked for similarity.
 *
 *   Tier 1: same collection
 *   Tier 2: shares at least one hue
 *   Tier 3: anything else
 *
 * Within each tier, items keep their input order (caller is expected
 * to pre-sort). Dedupes by _id.
 */
export function pickSimilar(
  source: SourceProduct,
  related: SimilarCandidate[],
  allOther: SimilarCandidate[],
  n: number = 5
): SimilarCandidate[] {
  const sourceCollection = source.collection?.name;
  const sourceHues = source.manualHues;

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
    const sameHue = shareHue(sourceHues, c.manualHues);
    let tier = 3;
    if (sameCollection) tier = 1;
    else if (sameHue) tier = 2;
    scored.push({ c, tier, idx: idx++ });
  }

  scored.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.idx - b.idx;
  });

  return scored.slice(0, n).map((s) => s.c);
}
