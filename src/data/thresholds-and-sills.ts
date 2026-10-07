/**
 * Pacific European Window Sill & Threshold Collection: the products on
 * /products/pacific-european-window-sill-threshold-collection, a category
 * of its own under Products (owner, 2026-10-05: not in the store).
 *
 * The products are the team's product list ("Windowsills - Threshold",
 * 2026-10-06), shown as drawings (owner: not the photographs). They are made in
 * three granites and four quartz colours: the palette of the owner's
 * European Program catalogue ("Pacific Surfaces - Windowsills and
 * Thresholds.pdf", 2026-10-06), in SILL_COLOURS. The rest comes from what
 * the owner sent on 2026-10-05, and nothing is added to it:
 *  - the crate sheet (Thresholds_and_Window_Sills_Crate_Specs.xlsx): every
 *    popular size, its thickness, pieces, weight and area per crate;
 *  - the catalogue brief: packing, MOQ, HS codes, care and installation,
 *    the variation note and the finishes;
 *  - the sections in SECTIONS, drawn to match Pacific's photograph of
 *    each piece (owner, 2026-10-06: the supplier's sections did not match
 *    the photographs). x runs 0 at the back to 1000 at the front, y up,
 *    each in its own proportions: they are not to a common scale.
 */

import type { SpaceCard, SpaceTab } from "@/components/sections/sills/SillsBlocks";

/** A section as a line drawing (components/sections/SillProfileDrawing). */
export interface SillProfile {
  slug: string;
  name: string;
  /** The section as drawn: back (x 0) to front (x 1000), y up. */
  points: [number, number][];
  /** Labels: the text's position and the point its leader runs to. */
  labels: { text: string; at: [number, number]; to: [number, number]; anchor?: "start" | "middle" | "end" }[];
  /** A dashed line inside the section, e.g. the joint of a glued upstand. */
  joint?: [[number, number], [number, number]];
  /** Which version of the product it is, where there are two. */
  variant?: string;
}

/** A flat piece t units thick with every edge bevelled by c, top and bottom. */
const flat = (t: number, c: number): [number, number][] => [
  [c, 0],
  [1000 - c, 0],
  [1000, c],
  [1000, t - c],
  [1000 - c, t],
  [c, t],
  [0, t - c],
  [0, c],
];

/** A flat piece's section in its own proportions, for drawing one size of
 *  it (the collection list): its width across, its thickness up. */
export function flatSection(slug: string, name: string, width: number, thickness: number): SillProfile {
  const t = Math.min(1000, Math.max(40, (thickness / width) * 1000));
  return { slug, name, points: flat(t, Math.min(14, t * 0.15)), labels: [] };
}

export const SECTIONS = {
  /** A flat board, 2 cm on 20 cm, as in the photograph. */
  windowSill: {
    slug: "section-window-sill",
    name: "Window sill",
    points: flat(100, 14),
    labels: [{ text: "Bevelled edges", at: [700, 230], to: [993, 93], anchor: "middle" }],
  },
  /** The photograph's block: 8 cm high at the back (the upstand), 5 cm at
   *  the front, 16 cm deep (the dealer's dimensioned view), a drip groove
   *  under the front edge. Here with a straight top. */
  windowThresholdStraight: {
    slug: "section-window-threshold-straight",
    name: "Window threshold, straight top",
    variant: "Straight top",
    points: [[0, 0], [870, 0], [870, 38], [905, 38], [905, 0], [1000, 0], [1000, 312], [95, 312], [95, 410], [0, 410]],
    labels: [
      { text: "Upstand", at: [190, 470], to: [48, 410], anchor: "start" },
      { text: "Drip groove", at: [850, -62], to: [887, 20], anchor: "end" },
    ],
  },
  /** The same block with its top falling from the upstand to the front. */
  windowThresholdSloped: {
    slug: "section-window-threshold-sloped",
    name: "Window threshold, sloped top",
    variant: "Sloped top",
    points: [[0, 0], [870, 0], [870, 38], [905, 38], [905, 0], [1000, 0], [1000, 312], [95, 420], [95, 500], [0, 500]],
    labels: [
      { text: "Upstand", at: [190, 560], to: [48, 500], anchor: "start" },
      { text: "Sloped top", at: [640, 470], to: [600, 360], anchor: "middle" },
      { text: "Drip groove", at: [850, -62], to: [887, 20], anchor: "end" },
    ],
  },
  /** A plain bar, 2 cm on 7 cm, as in the photograph. */
  threshold: {
    slug: "section-threshold",
    name: "Threshold",
    points: flat(286, 20),
    labels: [{ text: "Bevelled edges", at: [700, 400], to: [990, 276], anchor: "middle" }],
  },
  /** As in the photograph: level over most of the width, one bevel along
   *  the front edge; 2 cm on 7 cm. */
  singleBevel: {
    slug: "section-single-bevel",
    name: "Single bevelled threshold",
    points: [[0, 0], [1000, 0], [1000, 100], [640, 286], [0, 286]],
    labels: [
      { text: "Level", at: [320, 380], to: [320, 286], anchor: "middle" },
      { text: "Bevel", at: [880, 340], to: [820, 193], anchor: "middle" },
    ],
  },
  /** The same bevel on both long edges, level in the middle. */
  doubleBevel: {
    slug: "section-double-bevel",
    name: "Double bevelled threshold",
    points: [[0, 0], [1000, 0], [1000, 100], [700, 286], [300, 286], [0, 100]],
    labels: [
      { text: "Level", at: [500, 380], to: [500, 286], anchor: "middle" },
      { text: "Bevel", at: [880, 340], to: [850, 193], anchor: "middle" },
    ],
  },
  /** As in the photograph: a low top rounded across its width, thin at
   *  both edges; 2 cm at the crest on 12 cm. */
  wheelchair: {
    slug: "section-wheelchair",
    name: "Wheelchair threshold",
    points: [[0, 0], [1000, 0], [1000, 45.0], [950, 68.2], [900, 88.9], [850, 107.2], [800, 123.1], [750, 136.5], [700, 147.5], [650, 156.0], [600, 162.1], [550, 165.8], [500, 167.0], [450, 165.8], [400, 162.1], [350, 156.0], [300, 147.5], [250, 136.5], [200, 123.1], [150, 107.2], [100, 88.9], [50, 68.2], [0, 45.0]],
    labels: [{ text: "Rounded top", at: [500, 270], to: [500, 167], anchor: "middle" }],
  },
} satisfies Record<string, SillProfile>;

export type ProductGroup = "window" | "door";

export interface SillProduct {
  slug: string;
  name: string;
  group: ProductGroup;
  /** The piece in a sentence. */
  description: string;
  /** An option on it, as the team's list names it. */
  option?: string;
  /** Its section, or one for each top it comes with. */
  sections: SillProfile[];
  /** How long its 3D drawing runs, in widths of its section: shortened, not
   *  to scale, but long enough that a sill reads as a board and a threshold
   *  as a bar. */
  drawLength: number;
  /** The popular sizes it comes in, where the crate sheet lists them. */
  sizes?: "sills" | "thresholds";
}

export const SILL_PRODUCTS: SillProduct[] = [
  {
    slug: "window-sill",
    name: "Window sill",
    group: "window",
    description: "A flat sill, cut to size, with its edges bevelled.",
    option: "Double bevelled available",
    sections: [SECTIONS.windowSill],
    drawLength: 3.2,
    sizes: "sills",
  },
  {
    slug: "window-threshold",
    name: "Window threshold",
    group: "window",
    description: "An upstand at the back and a drip groove under the front edge, with a straight or a sloped top.",
    option: "Straight or sloped top",
    sections: [SECTIONS.windowThresholdStraight, SECTIONS.windowThresholdSloped],
    drawLength: 2.6,
  },
  {
    slug: "threshold",
    name: "Threshold",
    group: "door",
    description: "A flat threshold for the door line, cut to size, with its edges bevelled.",
    sections: [SECTIONS.threshold],
    drawLength: 6,
    sizes: "thresholds",
  },
  {
    slug: "single-bevelled-threshold",
    name: "Single bevelled threshold",
    group: "door",
    description: "Level along the back, with one long edge bevelled down to the front.",
    sections: [SECTIONS.singleBevel],
    drawLength: 5,
  },
  {
    slug: "double-bevelled-threshold",
    name: "Double bevelled threshold",
    group: "door",
    description: "Level in the middle, with both long edges bevelled.",
    sections: [SECTIONS.doubleBevel],
    drawLength: 5,
  },
  {
    slug: "wheelchair-threshold",
    name: "Wheelchair threshold",
    group: "door",
    description: "A low top, rounded across its width, for step-free access between floors.",
    sections: [SECTIONS.wheelchair],
    drawLength: 4.5,
  },
];

export const PRODUCT_GROUPS: { id: ProductGroup; title: string; lead: string }[] = [
  {
    id: "window",
    title: "For the window",
    lead: "A flat window sill, and a window threshold with an upstand and a drip groove.",
  },
  {
    id: "door",
    title: "For the door line",
    lead: "Flat, single bevelled and double bevelled thresholds, and a wheelchair threshold for step-free access.",
  },
];

/* ---- crate sheet ----------------------------------------------------------
 * Exactly as supplied: size (length x width, cm), thickness (cm), pieces per
 * crate, approximate net stone weight per crate (kg) and area per crate (m²).
 * ---------------------------------------------------------------------- */

export interface CrateRow {
  length: number;
  width: number;
  thickness: number;
  pieces: number;
  kg: number;
  m2: number;
}

const row = (length: number, width: number, thickness: number, pieces: number, kg: number, m2: number): CrateRow => ({
  length,
  width,
  thickness,
  pieces,
  kg,
  m2,
});

export const THRESHOLD_SIZES: CrateRow[] = [
  row(103, 3, 2, 250, 494, 7.72),
  row(103, 4, 2, 200, 521, 8.24),
  row(103, 5, 2, 150, 496, 7.72),
  row(103, 6, 2, 125, 513, 7.72),
  row(103, 7, 2, 125, 588, 9.01),
  row(103, 8, 2, 175, 915, 14.42),
  row(103, 9, 2, 150, 900, 13.9),
  row(103, 12, 2, 125, 948, 15.45),
  row(103, 13, 2, 100, 823, 13.39),
  row(103, 14, 2, 100, 892, 14.42),
  row(103, 15, 3, 64, 949, 9.89),
  row(120, 3, 3, 160, 553, 5.76),
  row(120, 4, 4, 96, 576, 4.61),
  row(120, 5, 5, 60, 576, 3.6),
  row(120, 6, 6, 40, 553, 2.88),
];

export const SILL_SIZES: CrateRow[] = [
  row(88, 20, 2, 35, 406, 6.16),
  row(88, 25, 2, 35, 493, 7.7),
  row(101, 20, 2, 35, 450, 7.07),
  row(101, 25, 2, 35, 566, 8.84),
  row(101, 30, 2, 35, 679, 10.61),
  row(126, 20, 2, 35, 541, 8.82),
  row(126, 25, 2, 35, 706, 11.03),
  row(126, 30, 2, 35, 847, 13.23),
  row(151, 20, 2, 35, 656, 10.57),
  row(151, 30, 2, 35, 1015, 15.86),
  row(176, 20, 2, 35, 788, 12.32),
  row(176, 25, 2, 35, 986, 15.4),
  row(220, 15, 2, 35, 739, 11.55),
  row(220, 20, 2, 35, 986, 15.4),
  row(220, 25, 2, 35, 938, 19.25),
  row(220, 30, 3, 1, 63, 0.66),
  row(220, 40, 2, 1, 56, 0.88),
];

/** The sheet's notes, both tabs. */
export const CRATE_NOTES = [
  "Pieces per crate can be changed to suit the order.",
  "Weight per crate is the approximate net stone weight and leaves out the crate timber; it varies with colour and material.",
  "Area per crate = pieces per crate × length × width.",
  "Every piece is finished, cut to size and edge-bevelled.",
];

/* ---- the catalogue brief -------------------------------------------------- */

/** What the pieces are cut from, by name; SILL_COLOURS has the swatches. */
export const MATERIALS = [
  { name: "Granite", note: "Warangal Black, Steel Grey and G20, polished or leather, for interiors and exteriors." },
  { name: "Quartz", note: "Super White, Arva White, Desert Silk and Cappuccino, polished, honed or leather, for interiors only." },
];

export const FINISHES = [
  { name: "Polished", note: "A mirror gloss that deepens the colour." },
  { name: "Honed", note: "Ground smooth to a flat, matt face. Quartz only." },
  { name: "Leather", note: "Brushed to a soft, tactile texture with a low sheen." },
];

export const PACKING = "Wooden crate packing. Cut to size and custom lengths available.";

/* ---- material test results ------------------------------------------------
 * The owner's test tables (2026-10-07): values and methods exactly as given;
 * only the wording of the parameters is set in sentence case ("Mohs", not
 * "Moh's"). Quartz holds for every colour of the quartz range at 2 cm; the
 * granite figures are from a Warangal Black sample.
 * ---------------------------------------------------------------------- */

export interface MaterialTest {
  parameter: string;
  result: string;
  method: string;
}

export const MATERIAL_TESTS: {
  title: string;
  scope: string;
  groups: { title: string; tests: MaterialTest[] }[];
  note?: string;
}[] = [
  {
    title: "Quartz",
    scope: "Thickness 2 cm · every colour in the quartz range",
    groups: [
      {
        title: "Mechanical testing",
        tests: [
          { parameter: "Water absorption, % by mass", result: "0.04", method: "ASTM C 97" },
          { parameter: "Apparent density, g/cm³", result: "2.406", method: "ASTM C 97" },
          { parameter: "Mohs hardness", result: "7", method: "ASTM C 1895" },
          { parameter: "Flexural strength, MPa: dry condition", result: "66.2", method: "ASTM C 880" },
          { parameter: "Flexural strength, MPa: wet condition", result: "78.5", method: "ASTM C 880" },
          { parameter: "Coefficient of linear thermal expansion, °C⁻¹", result: "4.8 × 10⁻⁶", method: "ASTM C 372" },
          { parameter: "Abrasion resistance, Ha", result: "31.1", method: "ASTM C 241" },
        ],
      },
      {
        title: "Chemical testing",
        tests: [{ parameter: "Resistance to staining", result: "Not affected", method: "ASTM C 1378" }],
      },
    ],
  },
  {
    title: "Granite",
    scope: "Colour: Warangal Black",
    groups: [
      {
        title: "Mechanical testing",
        tests: [
          { parameter: "Water absorption, % by mass", result: "0.06", method: "EN 13755:2004" },
          { parameter: "Apparent density, kg/m³", result: "3141.8", method: "EN 1936:2006" },
          { parameter: "Open porosity, %", result: "0.94", method: "EN 1936:2006" },
          { parameter: "Flexural strength, MPa", result: "34.2", method: "EN 12372:2006" },
          { parameter: "Compressive strength, MPa", result: "195.8", method: "EN 1926:2006" },
          { parameter: "Abrasion resistance (groove length), mm", result: "0.90", method: "EN 14157:2016" },
        ],
      },
    ],
    note: "Granite is a natural stone, so its properties vary between blocks and batches; the values shown are indicative, from a Warangal Black sample.",
  },
];
export const MOQ = "1 container load (approx. 21 to 26.5 MT net). Sizes can be mixed in the container.";
export const HS_CODES = [
  { material: "Granite and natural stone", code: "68022390" },
  { material: "Quartz", code: "68101990" },
];
export const CARE =
  "Seal polished granite before grouting. Quartz is for interior use only. Use a suitable adhesive or thin-set for the substrate and leave a grout joint suited to the installation.";
export const VARIATION =
  "Natural stone varies in colour, shade, veining and finish from piece to piece and batch to batch. Quartz may show slight variation between production batches. Colours shown are indicative, so please approve a physical sample before ordering. Technical values are typical and may vary by colour, material and batch.";
/** Pacific's certificates on file ("whatever we have", owner). */
export const CERTIFICATES = ["ISO 9001:2015", "CE", "NSF/ANSI 51", "Kosher", "EPD"];

/** The crate drawing sent with the brief. */
export const CRATE_DRAWING = { src: "/images/thresholds-and-sills/crate-drawing.webp", width: 1536, height: 1024 };

/**
 * Photographs of window sills, sent by the owner on 2026-10-05: one in
 * quartz (filed as "Brooklyn", which is not a design in the catalogue, so
 * it is captioned by material only) and granite, fitted and as cut pieces.
 * Served exactly as supplied, no recompression. One more photo in the set
 * carried a Flickr link in its metadata and is left out until its source
 * is confirmed. Width and height are the files' own, for layout.
 */
export interface SillPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  material: "Quartz" | "Granite" | "Granite and quartz";
  /** In a room, or the cut piece on its own. */
  kind: "fitted" | "cut";
}

const PHOTO = "/images/thresholds-and-sills";

export const SILL_PHOTOS: SillPhoto[] = [
  { src: `${PHOTO}/granite-sill-kitchen.jpg`, alt: "A black and white granite sill along a kitchen window", width: 1536, height: 2048, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-bullnose.jpg`, alt: "A black granite sill with a rounded front edge above a radiator", width: 1500, height: 1000, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-exterior.jpg`, alt: "A granite sill outside, under a brown window frame", width: 2400, height: 1600, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-white-corner.jpg`, alt: "A black and white granite sill turning a corner of the room", width: 1024, height: 768, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-rose.jpg`, alt: "A pink and grey granite sill above a radiator", width: 600, height: 450, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/quartz-sill-brooklyn.jpg`, alt: "A white and grey quartz window sill in a high-rise window", width: 3948, height: 3584, material: "Quartz", kind: "fitted" },
];

export interface SillColour {
  name: string;
  image: string;
}

/** The colour palette of the European Program catalogue (owner, 2026-10-06:
 *  "only 3 colors in granites and 4 in quartz"), with the finishes each
 *  material comes in there. The swatches are the catalogue's own images,
 *  taken out of the PDF without re-encoding. */
export const SILL_COLOURS: { material: string; finishes: string[]; note?: string; colours: SillColour[] }[] = [
  {
    material: "Granite",
    finishes: ["Polished", "Leather"],
    note: "Natural stone: each block is unique. Shade, grain and veining vary from piece to piece and batch to batch.",
    colours: [
      { name: "Warangal Black", image: `${PHOTO}/colours/warangal-black.jpg` },
      { name: "Steel Grey", image: `${PHOTO}/colours/steel-grey.jpg` },
      { name: "G20", image: `${PHOTO}/colours/g20.jpg` },
    ],
  },
  {
    material: "Quartz",
    finishes: ["Polished", "Honed", "Leather"],
    colours: [
      { name: "Super White", image: `${PHOTO}/colours/super-white.png` },
      { name: "Arva White", image: `${PHOTO}/colours/arva-white.jpg` },
      { name: "Desert Silk", image: `${PHOTO}/colours/desert-silk.jpg` },
      { name: "Cappuccino", image: `${PHOTO}/colours/cappuccino.jpg` },
    ],
  },
];

export interface SillPiece {
  id: string;
  product: SillProduct;
  colour: SillColour;
  material: string;
  finishes: string[];
  size: CrateRow;
}

/** Quartz is made 2 and 3 cm thick (the European Program catalogue). */
const QUARTZ_MAX_CM = 3;

const slugOf = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Every popular size of each product that has them, in each colour it can
 *  be cut in: the rows of the collection list (after the dealer catalogue
 *  the owner liked, 2026-10-06). */
export function sillPieces(): SillPiece[] {
  const pieces: SillPiece[] = [];
  for (const product of SILL_PRODUCTS) {
    if (!product.sizes) continue;
    for (const size of product.sizes === "sills" ? SILL_SIZES : THRESHOLD_SIZES) {
      for (const g of SILL_COLOURS) {
        if (g.material === "Quartz" && size.thickness > QUARTZ_MAX_CM) continue;
        for (const colour of g.colours) {
          pieces.push({
            id: `${product.slug}-${slugOf(colour.name)}-${size.length}x${size.width}x${size.thickness}`,
            product,
            colour,
            material: g.material,
            finishes: g.finishes,
            size,
          });
        }
      }
    }
  }
  return pieces;
}

/** The popular sizes as they are ordered: each length, shortest first,
 *  with the sizes (width and thickness) it comes in, narrowest first. */
export function sizesByLength(rows: CrateRow[]) {
  const lengths = Array.from(new Set(rows.map((r) => r.length))).sort((a, b) => a - b);
  return lengths.map((length) => ({
    length,
    sizes: rows.filter((r) => r.length === length).sort((a, b) => a.width - b.width),
  }));
}

/** "7.72" as "7.72", 13.9 as "13.90": the sheet's two decimals. */
export const m2 = (v: number) => v.toFixed(2);

/* ---- the page, laid out like the kitchens page ----------------------------
 * Copy and media for /products/pacific-european-window-sill-threshold-
 * collection in the "<Space> by Pacific Surfaces" layout (owner,
 * 2026-10-05: "make the page something similar like the Pacific kitchens").
 * The hero is the owner's own image; the rest are the sill photographs
 * above and the crate drawing.
 * ---------------------------------------------------------------------- */

const FLOOR = "/images/flooring";

export const SILLS_PAGE = {
  hero: {
    title: "Pacific European Window Sill & Threshold Collection",
    lead: "Window sills, window thresholds and door thresholds in granite and quartz, in popular sizes or custom sizes, edge-bevelled and crated for export.",
    image: `${PHOTO}/hero-charcoal-sill.webp`,
    alt: "A charcoal granite window sill running the length of a window above the sea",
  },

  tabs: [
    {
      label: "Granite and quartz",
      heading: "Cut from Pacific granite and quartz",
      body: [
        "Three granites, Warangal Black, Steel Grey and G20, inside or out, and four quartz colours for interiors: Super White, Arva White, Desert Silk and Cappuccino.",
        "The same slabs are cut for floors, worktops and walls, so a sill or a threshold can match the stone around it.",
      ],
      image: `${PHOTO}/granite-sill-kitchen.jpg`,
      alt: "A granite sill along a kitchen window",
    },
    {
      label: "Products",
      heading: "From the window to the door",
      body: [
        "For the window: a flat window sill, double bevelled on request, and a window threshold with an upstand and a drip groove, its top straight or sloped.",
        "For the door line: a flat threshold, a single or a double bevelled threshold, and a wheelchair threshold for step-free access.",
      ],
      image: `${PHOTO}/products-drawings.png`,
      alt: "The products drawn in 3D: window sill, window threshold, threshold, single and double bevelled thresholds, and wheelchair threshold",
      contain: true,
    },
    {
      label: "Popular sizes",
      heading: "Sills from 88 to 220 cm",
      body: [
        "Window sills in six lengths from 88 to 220 cm, 15 to 40 cm deep and 2 cm thick, with 220 × 30 cm in 3 cm.",
        "Thresholds and door sills at 103 cm, 3 to 15 cm wide, and at 120 cm, 3 to 6 cm wide, from 2 to 6 cm thick. Custom sizes are cut to your drawings.",
      ],
      image: `${PHOTO}/granite-sill-black-white-corner.jpg`,
      alt: "A granite sill cut to turn the corner of a bay window",
    },
    {
      label: "Crated for export",
      heading: "Packed in wooden crates",
      body: [
        "Every size has its crate: 35 sills to a crate for most sill sizes, up to 250 thresholds for the narrowest.",
        "The minimum order is one container load, about 21 to 26.5 tonnes net, and sizes can be mixed in it.",
      ],
      image: CRATE_DRAWING.src,
      alt: "Drawing of the wooden export crate in isometric, front, side and top views",
      contain: true,
    },
    {
      label: "Finished edges",
      heading: "Finished, cut to size, edge-bevelled",
      body: [
        "Every piece leaves finished and cut to size, its edges bevelled, ready to set.",
        "Set it on a suitable adhesive or thin-set for the substrate, with a grout joint suited to the installation; seal polished granite before grouting.",
      ],
      image: `${PHOTO}/quartz-sill-brooklyn.jpg`,
      alt: "The finished front edge of a quartz window sill",
    },
  ] satisfies SpaceTab[],

  plan: {
    heading: "Planning a project?",
    body: "Send us the window and door schedule with the profiles, lengths and depths. We reply with a quote and a crate plan for the container.",
    cta: { label: "Get a quote", href: "/contact#enquiry" },
    image: `${PHOTO}/granite-sill-black-bullnose.jpg`,
    alt: "A black granite sill with a rounded front edge above a radiator",
  },

  gallery: {
    heading: "Sills, fitted and finished",
    tags: ["All"],
  },

  faqs: [
    {
      question: "Which products are in the collection?",
      answer:
        "Two for the window, a flat window sill (double bevelled on request) and a window threshold with an upstand and a drip groove, its top straight or sloped; and four for the door line: a flat threshold, a single and a double bevelled threshold, and a wheelchair threshold.",
    },
    {
      question: "What are the popular sizes?",
      answer:
        "Window sills in 88, 101, 126, 151, 176 and 220 cm lengths, 15 to 40 cm deep. Thresholds and door sills at 103 cm (3 to 15 cm wide) and 120 cm (3 to 6 cm wide). Thicknesses run from 2 to 6 cm by size, and custom sizes are cut to your drawings.",
    },
    {
      question: "Which materials and finishes are available?",
      answer:
        "Granite in Warangal Black, Steel Grey and G20, polished or leather, and quartz in Super White, Arva White, Desert Silk and Cappuccino, polished, honed or leather. Quartz is for interior use only.",
    },
    {
      question: "How are they packed, and what is the minimum order?",
      answer:
        "In wooden crates, with a set number of pieces per crate for each size (changeable to suit the order). The minimum order is one container load, about 21 to 26.5 tonnes net, and sizes can be mixed.",
    },
    {
      question: "What are the HS codes?",
      answer: "Granite and natural stone: 68022390. Quartz: 68101990.",
    },
    {
      question: "How should they be installed?",
      answer: CARE,
    },
  ],

  spaces: {
    heading: "Pacific Surfaces for every space",
    cards: [
      { title: "Kitchens by Pacific Surfaces", href: "/spaces/kitchens", image: "/images/spaces/kitchen-hero.webp", alt: "A Pacific kitchen with a stone island" },
      { title: "Bathrooms by Pacific Surfaces", href: "/spaces/bathrooms", image: "/projects/bathrooms/bathtub.webp", alt: "A freestanding bath beside a stone-clad shower" },
      { title: "Flooring by Pacific Surfaces", href: "/applications/flooring", image: `${FLOOR}/card-courtyard.webp`, alt: "A courtyard floored in granite" },
      { title: "Hotels by Pacific Surfaces", href: "/spaces/hospitality", image: "/projects/cladding/tiffany.webp", alt: "A restaurant booth against a green stone wall" },
    ] satisfies SpaceCard[],
  },
};
