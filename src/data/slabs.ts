/**
 * Slab catalogue data — the source of truth for the /catalogue page.
 *
 * In production, this will come from Sanity (or whatever CMS powers the
 * rest of the site). For now we keep it as a typed in-memory list so
 * we can iterate on the filter UX without blocking on a CMS migration.
 */

export type Hue =
  | "white"
  | "cream"
  | "beige"
  | "grey"
  | "dark"
  | "brown"
  | "blue"
  | "gold";

export type Collection =
  | "Vision Series"
  | "Luminara"
  | "Celestia"
  | "Aurora"
  | "Nebula"
  | "Kosmic"
  | "Chromia";

export type Pattern = "Marble-look" | "Veined" | "Solid" | "Movement";
export type Finish = "Polished" | "Honed" | "Leathered";
export type Thickness = "12mm" | "20mm" | "30mm";
export type Ribbon = "new" | "featured" | null;

export interface Slab {
  id: string;
  name: string;
  slug: string;
  hues: Hue[];
  collection: Collection;
  pattern: Pattern;
  finishes: Finish[];
  thicknesses: Thickness[];
  ribbon: Ribbon;
  /** CSS gradient string — placeholder until real photography lands */
  swatch: string;
  /** Optional overlay applied atop the swatch to suggest veining */
  overlay?: string;
  /**
   * Optional URL to a real slab photograph. When present, the 3D showroom
   * and other visualisers will prefer this over the CSS swatch. Drop files
   * in `/public/slabs/{slug}.jpg` and add the path here.
   */
  photoUrl?: string;
}

/* ------------------------------------------------------------------ *
 * Placeholder swatch definitions                                      *
 * Each is a layered CSS gradient evoking a marble/quartz surface.     *
 * ------------------------------------------------------------------ */

const tx = {
  whiteMarble:
    "radial-gradient(ellipse at 30% 20%, #fff 0%, #eef1f4 30%, #c5ccd3 70%, #98a3ad 100%)",
  whiteMarbleVein:
    "linear-gradient(115deg, transparent 40%, rgba(120,130,140,.2) 42%, transparent 44%), linear-gradient(160deg, transparent 60%, rgba(90,100,110,.25) 62%, transparent 64%)",

  darkMarble:
    "linear-gradient(135deg, #2a3640 0%, #1a2832 50%, #0f1a22 100%)",
  darkMarbleVein:
    "linear-gradient(45deg, transparent 48%, rgba(180,190,200,.15) 49%, rgba(220,225,232,.3) 50%, rgba(180,190,200,.15) 51%, transparent 52%), radial-gradient(circle at 20% 80%, rgba(218,225,232,.2) 0%, transparent 35%)",

  cream:
    "linear-gradient(160deg, #f4f0e8 0%, #ded5c5 50%, #b8a98d 100%)",
  creamVein:
    "linear-gradient(70deg, transparent 45%, rgba(140,110,80,.25) 47%, transparent 49%), radial-gradient(ellipse at 80% 20%, rgba(255,250,240,.5) 0%, transparent 40%)",

  grey:
    "radial-gradient(ellipse at 60% 40%, #f8f9fb 0%, #dfe3e8 50%, #aab3bc 100%)",
  greyVein:
    "linear-gradient(130deg, transparent 30%, rgba(100,110,120,.3) 32%, transparent 35%), linear-gradient(170deg, transparent 55%, rgba(140,150,160,.2) 57%, transparent 60%)",

  darkBlue:
    "linear-gradient(135deg, #3a4852 0%, #28353f 50%, #1a2631 100%)",
  darkBlueVein:
    "radial-gradient(circle at 40% 60%, rgba(218,225,232,.22) 0%, transparent 40%), linear-gradient(60deg, transparent 40%, rgba(180,195,210,.15) 42%, transparent 44%)",

  brown:
    "linear-gradient(145deg, #eae3d4 0%, #c9bca2 60%, #8a7a5c 100%)",
  brownVein:
    "linear-gradient(100deg, transparent 50%, rgba(90,70,40,.25) 52%, transparent 54%), radial-gradient(circle at 70% 30%, rgba(255,250,235,.4) 0%, transparent 35%)",

  pureWhite:
    "radial-gradient(circle at 50% 50%, #fafafa 0%, #ebecee 40%, #b5babf 100%)",
  pureWhiteVein:
    "linear-gradient(45deg, transparent 48%, rgba(170,180,195,.35) 50%, transparent 52%), linear-gradient(140deg, transparent 65%, rgba(120,130,140,.2) 67%, transparent 69%)",

  blackObsidian:
    "linear-gradient(140deg, #0e1820 0%, #1a2832 100%)",
  blackObsidianVein:
    "radial-gradient(ellipse at 30% 70%, rgba(218,225,232,.18) 0%, transparent 45%), linear-gradient(80deg, transparent 30%, rgba(200,210,220,.1) 32%, transparent 35%)",

  beige:
    "linear-gradient(160deg, #dedcd3 0%, #beb5a0 50%, #8b8168 100%)",
  beigeVein:
    "radial-gradient(circle at 20% 30%, rgba(255,245,225,.5) 0%, transparent 35%), linear-gradient(115deg, transparent 40%, rgba(100,85,55,.2) 42%, transparent 44%)",

  calacatta:
    "radial-gradient(ellipse at 40% 60%, #ffffff 0%, #eef2f6 40%, #b8c3cd 100%)",
  calacattaVein:
    "linear-gradient(50deg, transparent 30%, rgba(90,100,115,.3) 32%, transparent 34%), linear-gradient(155deg, transparent 55%, rgba(130,145,160,.25) 57%, transparent 59%), radial-gradient(circle at 70% 30%, rgba(255,255,255,.5) 0%, transparent 30%)",

  graphite:
    "linear-gradient(135deg, #292e35 0%, #1a1f25 60%, #0d1216 100%)",
  graphiteVein:
    "linear-gradient(65deg, transparent 40%, rgba(210,220,230,.2) 42%, transparent 44%), radial-gradient(circle at 80% 20%, rgba(220,230,240,.2) 0%, transparent 35%)",

  gold:
    "radial-gradient(ellipse at 30% 30%, #f4efe5 0%, #d5c9b0 50%, #a28e6a 100%)",
  goldVein:
    "radial-gradient(circle at 60% 70%, rgba(255,245,220,.4) 0%, transparent 35%), linear-gradient(110deg, transparent 45%, rgba(110,85,55,.25) 47%, transparent 49%)",
};

export const slabs: Slab[] = [
  {
    id: "calacatta-pacifica",
    name: "Calacatta Pacifica",
    slug: "calacatta-pacifica",
    hues: ["white"],
    collection: "Vision Series",
    pattern: "Marble-look",
    finishes: ["Polished", "Honed"],
    thicknesses: ["20mm", "30mm"],
    ribbon: "new",
    swatch: tx.whiteMarble,
    overlay: tx.whiteMarbleVein,
  },
  {
    id: "nero-statuario",
    name: "Nero Statuario",
    slug: "nero-statuario",
    hues: ["dark"],
    collection: "Kosmic",
    pattern: "Veined",
    finishes: ["Polished"],
    thicknesses: ["20mm"],
    ribbon: null,
    swatch: tx.darkMarble,
    overlay: tx.darkMarbleVein,
  },
  {
    id: "desert-brown-4013",
    name: "Desert Brown 4013",
    slug: "desert-brown-4013",
    hues: ["brown", "cream"],
    collection: "Aurora",
    pattern: "Movement",
    finishes: ["Honed", "Leathered"],
    thicknesses: ["20mm", "30mm"],
    ribbon: "featured",
    swatch: tx.cream,
    overlay: tx.creamVein,
  },
  {
    id: "winter-haze-p12",
    name: "Winter Haze P12",
    slug: "winter-haze-p12",
    hues: ["grey", "white"],
    collection: "Luminara",
    pattern: "Marble-look",
    finishes: ["Polished"],
    thicknesses: ["12mm", "20mm"],
    ribbon: null,
    swatch: tx.grey,
    overlay: tx.greyVein,
  },
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    slug: "midnight-obsidian",
    hues: ["dark"],
    collection: "Chromia",
    pattern: "Solid",
    finishes: ["Leathered"],
    thicknesses: ["20mm"],
    ribbon: "new",
    swatch: tx.darkBlue,
    overlay: tx.darkBlueVein,
  },
  {
    id: "kedar-amazonik",
    name: "Kedar Amazonik",
    slug: "kedar-amazonik",
    hues: ["brown", "beige"],
    collection: "Nebula",
    pattern: "Movement",
    finishes: ["Honed"],
    thicknesses: ["20mm", "30mm"],
    ribbon: null,
    swatch: tx.brown,
    overlay: tx.brownVein,
  },
  {
    id: "lumina-cristal",
    name: "Lumina Cristal",
    slug: "lumina-cristal",
    hues: ["white"],
    collection: "Celestia",
    pattern: "Marble-look",
    finishes: ["Polished", "Honed"],
    thicknesses: ["12mm", "20mm", "30mm"],
    ribbon: null,
    swatch: tx.pureWhite,
    overlay: tx.pureWhiteVein,
  },
  {
    id: "atlantic-deep",
    name: "Atlantic Deep",
    slug: "atlantic-deep",
    hues: ["dark", "blue"],
    collection: "Vision Series",
    pattern: "Solid",
    finishes: ["Leathered", "Honed"],
    thicknesses: ["20mm"],
    ribbon: "featured",
    swatch: tx.blackObsidian,
    overlay: tx.blackObsidianVein,
  },
  {
    id: "nara-natural",
    name: "Nara Natural",
    slug: "nara-natural",
    hues: ["beige", "cream"],
    collection: "Aurora",
    pattern: "Movement",
    finishes: ["Polished"],
    thicknesses: ["20mm"],
    ribbon: null,
    swatch: tx.beige,
    overlay: tx.beigeVein,
  },
  {
    id: "calacatta-themis",
    name: "Calacatta Themis",
    slug: "calacatta-themis",
    hues: ["white", "grey"],
    collection: "Luminara",
    pattern: "Veined",
    finishes: ["Polished"],
    thicknesses: ["20mm", "30mm"],
    ribbon: "new",
    swatch: tx.calacatta,
    overlay: tx.calacattaVein,
  },
  {
    id: "graphite-matter",
    name: "Graphite Matter",
    slug: "graphite-matter",
    hues: ["dark", "grey"],
    collection: "Kosmic",
    pattern: "Solid",
    finishes: ["Honed"],
    thicknesses: ["20mm"],
    ribbon: null,
    swatch: tx.graphite,
    overlay: tx.graphiteVein,
  },
  {
    id: "zira-dorado",
    name: "Zira Dorado",
    slug: "zira-dorado",
    hues: ["gold", "beige"],
    collection: "Nebula",
    pattern: "Marble-look",
    finishes: ["Polished"],
    thicknesses: ["20mm", "30mm"],
    ribbon: null,
    swatch: tx.gold,
    overlay: tx.goldVein,
  },
  {
    id: "bianco-luce",
    name: "Bianco Luce",
    slug: "bianco-luce",
    hues: ["white"],
    collection: "Celestia",
    pattern: "Veined",
    finishes: ["Polished", "Honed"],
    thicknesses: ["12mm", "20mm"],
    ribbon: "new",
    swatch: tx.calacatta,
    overlay: tx.calacattaVein,
  },
  {
    id: "abisso-marino",
    name: "Abisso Marino",
    slug: "abisso-marino",
    hues: ["blue", "dark"],
    collection: "Chromia",
    pattern: "Movement",
    finishes: ["Leathered"],
    thicknesses: ["20mm"],
    ribbon: null,
    swatch: tx.darkBlue,
    overlay: tx.darkBlueVein,
  },
  {
    id: "sabbia-nera",
    name: "Sabbia Nera",
    slug: "sabbia-nera",
    hues: ["dark", "brown"],
    collection: "Kosmic",
    pattern: "Movement",
    finishes: ["Honed", "Leathered"],
    thicknesses: ["20mm", "30mm"],
    ribbon: null,
    swatch: tx.graphite,
    overlay: tx.graphiteVein,
  },
  {
    id: "perla-grey",
    name: "Perla Grey",
    slug: "perla-grey",
    hues: ["grey"],
    collection: "Luminara",
    pattern: "Solid",
    finishes: ["Polished"],
    thicknesses: ["12mm", "20mm"],
    ribbon: null,
    swatch: tx.grey,
    overlay: tx.greyVein,
  },
  {
    id: "avorio-chiaro",
    name: "Avorio Chiaro",
    slug: "avorio-chiaro",
    hues: ["cream", "white"],
    collection: "Aurora",
    pattern: "Marble-look",
    finishes: ["Polished", "Honed"],
    thicknesses: ["20mm"],
    ribbon: "featured",
    swatch: tx.cream,
    overlay: tx.creamVein,
  },
  {
    id: "oro-antico",
    name: "Oro Antico",
    slug: "oro-antico",
    hues: ["gold", "brown"],
    collection: "Nebula",
    pattern: "Veined",
    finishes: ["Polished"],
    thicknesses: ["20mm", "30mm"],
    ribbon: "new",
    swatch: tx.gold,
    overlay: tx.goldVein,
  },
  {
    id: "vision-bianco",
    name: "Vision Bianco",
    slug: "vision-bianco",
    hues: ["white", "grey"],
    collection: "Vision Series",
    pattern: "Marble-look",
    finishes: ["Polished"],
    thicknesses: ["20mm", "30mm"],
    ribbon: null,
    swatch: tx.whiteMarble,
    overlay: tx.whiteMarbleVein,
  },
  {
    id: "costa-azzurra",
    name: "Costa Azzurra",
    slug: "costa-azzurra",
    hues: ["blue", "white"],
    collection: "Chromia",
    pattern: "Movement",
    finishes: ["Polished"],
    thicknesses: ["20mm"],
    ribbon: null,
    swatch: tx.pureWhite,
    overlay: tx.pureWhiteVein,
  },
  {
    id: "terra-umbria",
    name: "Terra Umbria",
    slug: "terra-umbria",
    hues: ["brown", "dark"],
    collection: "Aurora",
    pattern: "Solid",
    finishes: ["Honed", "Leathered"],
    thicknesses: ["20mm", "30mm"],
    ribbon: null,
    swatch: tx.brown,
    overlay: tx.brownVein,
  },
  {
    id: "stellar-white",
    name: "Stellar White",
    slug: "stellar-white",
    hues: ["white"],
    collection: "Celestia",
    pattern: "Solid",
    finishes: ["Polished", "Honed"],
    thicknesses: ["12mm", "20mm", "30mm"],
    ribbon: null,
    swatch: tx.pureWhite,
    overlay: tx.pureWhiteVein,
  },
];

/* ------------------------------------------------------------------ *
 * Filter option metadata (labels + colors for UI rendering)           *
 * ------------------------------------------------------------------ */

export const HUE_OPTIONS: { value: Hue; label: string; color: string }[] = [
  { value: "white", label: "White", color: "linear-gradient(135deg,#fff,#e5e8ec)" },
  { value: "cream", label: "Cream", color: "linear-gradient(135deg,#f4f0e8,#c9b99a)" },
  { value: "beige", label: "Beige", color: "linear-gradient(135deg,#d8c8a8,#b09868)" },
  { value: "grey",  label: "Grey",  color: "linear-gradient(135deg,#b8bec5,#6c7681)" },
  { value: "dark",  label: "Dark",  color: "linear-gradient(135deg,#1a2430,#0a1018)" },
  { value: "brown", label: "Brown", color: "linear-gradient(135deg,#8a7a5c,#5a4a32)" },
  { value: "blue",  label: "Blue",  color: "linear-gradient(135deg,#112732,#9AA8B6)" },
  { value: "gold",  label: "Gold",  color: "linear-gradient(135deg,#e0d8c0,#a89878)" },
];

export const COLLECTIONS: Collection[] = [
  "Vision Series",
  "Luminara",
  "Celestia",
  "Aurora",
  "Nebula",
  "Kosmic",
  "Chromia",
];

export const PATTERNS: Pattern[] = ["Marble-look", "Veined", "Solid", "Movement"];
export const FINISHES: Finish[] = ["Polished", "Honed", "Leathered"];
export const THICKNESSES: Thickness[] = ["12mm", "20mm", "30mm"];
