/**
 * The quartz and Eclipse colours shown to visitors in India (owner,
 * 2026-10-27, replaced 2026-11-02 by the "Colors by Series" sheet: 7 series,
 * 54 colours). Every other range (granites, semi-precious,
 * sinks...) is the same in every region, and every other region sees all
 * quartz and Eclipse colours.
 *
 * Matched by colour name, the sheet's and the site's codes disagree in
 * places (it gives Venezia 5075, the site's Havana). Names on the sheet
 * that differ from the site's: "Arya White" is Arva White, "Deep Wave" is
 * Deepwave, "Arya" is Arya (3008, not Arya Pearl), Tiffany and Viola are
 * Eclipse colours here. Aurora+ is the site's Solid Series Super White and
 * Brilliant White.
 *
 * When the Indian catalogue changes, update INDIA_QUARTZ below. A quartz
 * or Eclipse colour added to the site later stays hidden in India until
 * it is listed here.
 */

/** Slugs of the quartz and Eclipse colours in the Indian catalogue
 *  ("Colors by Series": 7 series, 54 colours, owner 2026-11-02). */
export const INDIA_QUARTZ = new Set<string>([
  // Kosmic (16)
  "astral-mist", // Astral Mist
  "cappuccino", // Cappuccino
  "cherry-hill-5068", // Cherry Hill (5068)
  "coastal-pearl-5007", // Coastal Pearl (5007)
  "driftwood-5010", // Driftwood (5010)
  "french-vanilla-5064", // French Vanilla (5064)
  "golden-dawn-5013", // Golden Dawn (5013)
  "latte-luxe-5040", // Latte Luxe (5040)
  "matcha-mist-1", // Matcha Mist (5076)
  "bianco-cristallo", // Bianco Cristallo
  "poseidon", // Poseidon
  "ruskin-5028", // Ruskin (5028)
  "sakura", // Sakura (5077)
  "stellar-ember-5031", // Stellar Ember (5031)
  "merlot-5063", // Merlot (5063)
  "walnut-5070", // Walnut (5070)
  // Nebula (14)
  "alabaster-noir-3003", // Alabaster Noir (3003)
  "arena-3007", // Arena (3007)
  "artemis-3058", // Artemis (3058)
  "arya-3008", // Arya (3008)
  "aureate-3014", // Aureate (3014)
  "bellagio-3016", // Bellagio (3016)
  "bohemia-3018", // Bohemia (3018)
  "caterina", // Caterina
  "deepwave", // Deep Wave (3061)
  "glacial-silver-3059", // Glacial Silver (3059)
  "hazel-gold-3039", // Hazel Gold (3039)
  "hermes-3040", // Hermes (3040)
  "honeydew-3041", // Honeydew (3041)
  "costa-3026", // Costa (3026)
  // Eclipse (10)
  "ashen-bloom-quartz", // Ashen Bloom (the record added 2026-11-02, not Ashen Bloom (P21))
  "elano-p03", // Elano (P03)
  "taj-vein-p01", // Taj Vein (P01)
  "tiffany", // Tiffany
  "patagonia-p30", // Patagonia
  "almond-mist-p10", // Almond Mist (P10)
  "cristallo-gold", // Cristallo Gold
  "sahara-camouflage", // Sahara Camouflage
  "orenda-p25", // Orenda (P25)
  "viola-quartz", // Viola
  // Aurora (4)
  "arva-white-1002", // Arva White (1002); the sheet reads "Arya White"
  "classic-gray-1005", // Classic Gray (1005)
  "desert-silk", // Desert Silk
  "echo-white-1001", // Echo White (1001)
  // Aurora+ (2)
  "super-white-1009", // Super White (1009)
  "brilliant-white-1003", // Brilliant White (1003)
  // Celestia (4)
  "carrara-beige-quartz", // Carrara Beige
  "seasons-4005", // Seasons (4005)
  "soneva-4001", // Soneva (4001)
  "stella-4002", // Stella (4002)
  // Luminara (4)
  "mystique-2006", // Mystique (2006)
  "oasis-2009", // Oasis (2009)
  "silken-4010", // Silken (4010)
  "zenith-2013", // Zenith (2013)
]);

/** Collections whose colours are quartz (Eclipse is a quartz line). */
export const QUARTZ_COLLECTION_NAMES = [
  "Aurora",
  "Celestia",
  "Eclipse",
  "Kosmic",
  "Luminara",
  "Nebula",
  "Solid Series",
  "Quartz",
];
const QUARTZ_COLLECTIONS = new Set(QUARTZ_COLLECTION_NAMES);

/** A quartz series code in a colour's name: 1001-5999 or P01-P99, as in
 *  "Copper Mist (3060)". Only quartz colours carry one (checked
 *  2026-10-27: 121 products, none of them granite or anything else). */
const SERIES_CODE = /\((?:[1-5]\d{3}|P\d{2})\)/i;

export interface RegionalItem {
  slug?: string | null;
  name?: string | null;
  productType?: string | null;
  collection?: string | null;
}

/** A quartz or Eclipse colour, however it is filed in Sanity: by type, by
 *  collection (some Eclipse colours have no type), or by its series code
 *  (some are typed "physical" with no collection). */
export function isQuartzColour(item: RegionalItem): boolean {
  return (
    item.productType === "quartz-slab" ||
    (!!item.collection && QUARTZ_COLLECTIONS.has(item.collection)) ||
    (!!item.name && SERIES_CODE.test(item.name))
  );
}

/** Whether a colour is shown to visitors from `country` (ISO code). */
export function shownInRegion(
  item: RegionalItem,
  country: string | null | undefined
): boolean {
  if (country !== "IN" || !isQuartzColour(item)) return true;
  return !!item.slug && INDIA_QUARTZ.has(item.slug);
}
