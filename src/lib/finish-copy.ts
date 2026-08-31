/**
 * Short, plain-language notes on what each finish actually is —
 * shown under the finish name wherever finishes are listed (the
 * product page's "Finishes Available" column and the Beyond Finish
 * grid), so a name like "Suede" isn't left to explain itself.
 *
 * The canonical finish values live on the product schema
 * (src/sanity/schemas/product.ts → `finishes`): polished, matte,
 * suede, velvet, honed, leathered. Everything past those six is a
 * natural-stone / facade finish that shows up on Beyond Finish
 * products.
 *
 * Matching is loose — lowercased substring — so "Polished",
 * "polished" and "Super Polished" all resolve to the same entry.
 * Order matters: the first match wins, so keep more specific keys
 * above more general ones.
 */
const FINISH_BLURBS: { match: string; body: string }[] = [
  {
    match: "polish",
    body: "Mirror-bright and light-reflecting. Pushes colour and vein depth hardest, and wipes clean the most easily.",
  },
  {
    match: "hone",
    body: "Smooth but matte — the shine taken off for a soft, contemporary calm. Shows the stone honestly, with no glare.",
  },
  {
    match: "leather",
    body: "Gently textured with a subtle sheen, closer to hide than stone. Hides fingerprints and water marks better than a polish.",
  },
  {
    match: "suede",
    body: "Velvet-soft underhand with a deep, powdery matte. Richest on dark colours, where it reads almost fabric-like.",
  },
  {
    match: "velvet",
    body: "A whisper of texture over a low-sheen surface. Warmer to the touch than honed, and forgiving of daily marks.",
  },
  {
    match: "matte",
    body: "Flat and glare-free. Quiet in bright rooms and a natural partner to muted, earthy palettes.",
  },
  {
    match: "satin",
    body: "The middle ground between honed and polished — a low lustre that catches light without reflecting the room.",
  },
  {
    match: "brush",
    body: "Wire-brushed to raise a fine, tactile grain. Warm underhand and quietly forgiving of everyday wear.",
  },
  {
    match: "flame",
    body: "Thermally shocked to a rugged, non-slip surface. Built for outdoor paving and facades that face real weather.",
  },
  {
    match: "bush",
    body: "Hammered to an even, pitted relief. Strongly tactile and high-grip — a facade and landscape workhorse.",
  },
  {
    match: "sandblast",
    body: "Abraded to a uniform matte grain. Even-toned, slip-resistant and unfussy about upkeep.",
  },
  {
    match: "river",
    body: "Softly undulating, as though shaped by water. Organic underhand while staying easy to maintain.",
  },
  {
    match: "antique",
    body: "Aged to a worn, lived-in surface with gentle movement. Best where a room wants history rather than newness.",
  },
  {
    match: "split",
    body: "Cleaved along the stone's own bed to leave a raw, uneven face. Dramatic in relief on feature walls.",
  },
  {
    match: "fluted",
    body: "Cut into repeating vertical channels. Casts its own shadow line and gives flat surfaces rhythm.",
  },
  {
    match: "groove",
    body: "Machined channels at a regular pitch. Adds directional texture and a crisp, architectural edge.",
  },
];

/**
 * Description for a finish name. Returns null when nothing matches,
 * so callers can decide between hiding the line and printing their
 * own fallback rather than being handed filler copy.
 */
export function finishDescription(name: string): string | null {
  const haystack = name.toLowerCase();
  return FINISH_BLURBS.find((b) => haystack.includes(b.match))?.body ?? null;
}
