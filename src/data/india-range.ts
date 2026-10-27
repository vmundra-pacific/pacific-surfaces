/**
 * The quartz and Eclipse colours shown to visitors in India (owner,
 * 2026-10-27): only those in the Indian catalogue, the Resources page's
 * "PACIFIC INDIA CATALOG" ("Pacific Italian surfaces Indian catalogue,
 * updated October 2026"). Every other range (granites, semi-precious,
 * sinks...) is the same in every region, and every other region sees all
 * quartz and Eclipse colours.
 *
 * Matched from the catalogue by colour name, the catalogue's and the
 * site's codes disagree in places (it gives Venezia 5075, the site's
 * Havana). In the catalogue but not on the site, so not shown anywhere:
 * Carrara Beige.
 *
 * Added by the owner on top of the catalogue (2026-10-27): Cristallo
 * Gold, Sahara Camouflage and Stellar Fusion (Eclipse).
 *
 * When the Indian catalogue changes, update INDIA_QUARTZ below. A quartz
 * or Eclipse colour added to the site later stays hidden in India until
 * it is listed here.
 */

/** Slugs of the quartz and Eclipse colours in the Indian catalogue. */
export const INDIA_QUARTZ = new Set<string>([
  // Aurora
  "arva-white-1002", // Arva White (1002)
  "brilliant-white-1003", // Brilliant White (1003)
  "classic-gray-1005", // Classic Gray (1005)
  "desert-silk", // Desert Silk
  "echo-white-1001", // Echo White (1001)
  // Celestia
  "seasons-4005", // Seasons (4005)
  "silken-4010", // Silken (4010)
  "stella-4002", // Stella (4002)
  // Eclipse
  "almond-mist-p10", // Almond Mist (P10)
  "arlina-p05", // Arlina (P05)
  "cristallo-gold", // Cristallo Gold (owner's addition)
  "dolce-vita", // Dolce Vita
  "elano-p03", // Elano (P03)
  "elvion-p04", // Elvion (P04)
  "horizon-veil-p22", // Horizon Veil (P22)
  "mintara-p02", // Mintara (P02)
  "orenda-p25", // Orenda (P25)
  "patagonia-p30", // Patagonia
  "sahara-camouflage", // Sahara Camouflage (owner's addition)
  "statuario", // Statuario
  "stellar-fusion", // Stellar Fusion (owner's addition)
  "super-white-eclipse", // Super White
  "taj-vein-p01", // Taj Vein (P01)
  // Kosmic
  "astral-mist", // ASTRAL MIST
  "bianco-cristallo", // BIANCO CRISTALLO
  "cappuccino", // CAPPUCCINO
  "cappuccino-dark", // cappuccino dark (the catalogue's Dark Cappuccino)
  "cherry-hill-5068", // Cherry Hill (5068)
  "coastal-pearl-5007", // Coastal Pearl (5007)
  "french-vanilla-5064", // French Vanilla (5064)
  "galactic-halo-5012", // Galactic Halo (5012)
  "golden-dawn-5013", // Golden Dawn (5013)
  "irish-cream-5016", // Irish Cream (5016)
  "latte-luxe-5040", // Latte Luxe (5040)
  "maple-gaze", // MAPLE GAZE
  "matcha-mist-1", // Matcha Mist (5076)
  "merlot-5063", // Merlot (5063)
  "poseidon", // POSEIDON
  "ruskin-5028", // Ruskin (5028)
  "sakura", // Sakura (5077)
  "suzuka-5033", // Suzuka (5033)
  "venezia-5075", // Venezia (5074)
  "walnut-5070", // Walnut (5070)
  // Luminara
  "mystique-2006", // Mystique (2006)
  "oasis-2009", // Oasis (2009)
  "zenith-2013", // Zenith (2013)
  // Nebula
  "alabaster-noir-3003", // Alabaster Noir (3003)
  "artemis-3058", // Artemis (3058)
  "arya-pearl-3009", // Arya Pearl (3009)
  "ashford-3052", // Ashford(3052)
  "aureate-3014", // Aureate (3014)
  "bellagio-3016", // Bellagio (3016)
  "belleza-3017", // Belleza (3017)
  "bohemia-3018", // Bohemia (3018)
  "caterina", // CATERINA
  "costa-3026", // Costa (3026)
  "deepwave", // Deepwave (3061)
  "glacial-silver-3059", // Glacial Silver (3059)
  "hazel-gold-3039", // Hazel Gold (3039)
  "hermes-3040", // Hermes (3040)
  "honeydew-3041", // Honeydew (3041)
  "soneva-4001", // Soneva (4001), filed under Nebula; Celestia in the catalogue
  // Solid Series
  "super-white-1009", // Super White (1009)
  // No collection
  "tiffany", // Tiffany
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
