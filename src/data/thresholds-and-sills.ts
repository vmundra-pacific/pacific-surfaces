/**
 * Pacific European Window Sill & Threshold Collection: the products on
 * /products/pacific-european-window-sill-threshold-collection, a category
 * of its own under Products (owner, 2026-10-05: not in the store).
 *
 * Made in granite and in quartz (owner, 2026-10-05: no colour list, "we
 * can do in both granite and quartz"). Everything here comes from what the
 * owner sent on 2026-10-05, and nothing is added to it:
 *  - the crate sheet (Thresholds_and_Window_Sills_Crate_Specs.xlsx): every
 *    size, its thickness, pieces, weight and area per crate, and its notes;
 *  - the catalogue brief: packing, MOQ, HS codes, care and installation,
 *    the variation note and the finishes;
 *  - six section drawings, traced into PROFILES below (x runs 0 at the
 *    back to 1000 at the front, y up, in the drawings' own units: they are
 *    not to a common scale).
 * Which bevels are offered is still open with the owner, so the page says
 * only what the sheet says: edges bevelled.
 */

import type { SpaceCard, SpaceTab } from "@/components/sections/spaces/SpaceBlocks";

export type ProfileGroup = "window-sills" | "door-sills";

export interface SillProfile {
  slug: string;
  name: string;
  group: ProfileGroup;
  /** The section in a sentence. */
  description: string;
  /** Which crate table its sizes are in. */
  sizes: "thresholds" | "sills";
  /** The section as drawn: back (x 0) to front (x 1000), y up. */
  points: [number, number][];
  /** Labels: the text's position and the point its leader runs to. */
  labels: { text: string; at: [number, number]; to: [number, number]; anchor?: "start" | "middle" | "end" }[];
  /** A dashed line inside the section, e.g. the joint of a glued upstand. */
  joint?: [[number, number], [number, number]];
}

export const PROFILES: SillProfile[] = [
  {
    slug: "window-sill-upstand",
    name: "Window sill with upstand",
    group: "window-sills",
    description: "A straight sill with an upstand along the back edge, where it meets the window frame, and a drip groove under the front edge.",
    sizes: "sills",
    points: [[0, 0], [904.4, 0], [904.4, 23.8], [925.8, 23.8], [925.8, 0], [1000, 0], [1000, 73.7], [74.1, 73.7], [74.1, 144.6], [0, 144.6]],
    labels: [
      { text: "Upstand", at: [140, 250], to: [60, 144.6], anchor: "start" },
      { text: "Drip groove", at: [860, -80], to: [915, 12], anchor: "end" },
    ],
  },
  {
    slug: "window-sill-glued-upstand",
    name: "Window sill with glued upstand",
    group: "window-sills",
    description: "The same straight sill with its upstand glued on along the back edge, and a drip groove under the front edge.",
    sizes: "sills",
    points: [[0, 0], [874.8, 0], [874.8, 31.2], [903.5, 31.2], [903.5, 0], [1000, 0], [1000, 95.9], [96.3, 95.9], [96.3, 189.1], [0, 189.1]],
    labels: [
      { text: "Glued upstand", at: [160, 290], to: [70, 189.1], anchor: "start" },
      { text: "Drip groove", at: [830, -80], to: [889, 15], anchor: "end" },
    ],
    joint: [[0, 95.9], [96.3, 95.9]],
  },
  {
    slug: "window-sill-sloped",
    name: "Window sill with sloped top",
    group: "window-sills",
    description: "An upstand at the back, a top cut to a slope across the sill, and a drip groove under the front edge.",
    sizes: "sills",
    points: [[0, 0], [904.4, 0], [904.4, 23.8], [925.8, 23.8], [925.8, 0], [1000, 0], [1000, 144.6], [74, 74.4], [74, 144.6], [0, 144.6]],
    labels: [
      { text: "Upstand", at: [140, 250], to: [60, 144.6], anchor: "start" },
      { text: "Sloped top", at: [560, 240], to: [540, 109.7], anchor: "middle" },
      { text: "Drip groove", at: [860, -80], to: [915, 12], anchor: "end" },
    ],
  },
  {
    slug: "door-sill-stepped",
    name: "Stepped door sill",
    group: "door-sills",
    description: "A raised step at the back, where the door closes, and a sloped tread falling to the front edge.",
    sizes: "thresholds",
    points: [[0, 0], [1000, 0], [1000, 288.3], [436.3, 349.5], [436.3, 522.5], [0, 522.5]],
    labels: [
      { text: "Step", at: [218, 610], to: [218, 522.5], anchor: "middle" },
      { text: "Sloped tread", at: [760, 450], to: [718, 318.9], anchor: "middle" },
    ],
  },
  {
    slug: "door-sill-sloped",
    name: "Sloped door sill",
    group: "door-sills",
    description: "Level at the back, then a straight slope down to a thinner front edge.",
    sizes: "thresholds",
    points: [[0, 0], [1000, 0], [1000, 144.6], [286.7, 287.1], [0, 287.1]],
    labels: [
      { text: "Level", at: [143, 380], to: [143, 287.1], anchor: "middle" },
      { text: "Slope", at: [700, 330], to: [643.4, 215.9], anchor: "middle" },
    ],
  },
  {
    slug: "wheelchair-threshold",
    name: "Wheelchair threshold",
    group: "door-sills",
    description: "Level at the back, then a long curved ramp down to a thin front edge, for a step-free door line.",
    sizes: "thresholds",
    points: [[0, 0], [1000, 0], [1000, 60.3], [973.4, 64.7], [936.4, 70.7], [892.1, 78], [843.9, 85.9], [794.7, 93.9], [747.9, 101.6], [706.5, 108.3], [673.7, 113.6], [649.5, 117.5], [630.9, 120.4], [616.6, 122.6], [605.2, 124.4], [595.3, 125.8], [585.5, 127.2], [574.7, 128.8], [561.3, 130.7], [545.7, 132.9], [529.2, 135.2], [512.2, 137.6], [495.1, 140], [478.2, 142.2], [461.9, 144.4], [446.5, 146.5], [432.4, 148.3], [419.8, 149.9], [408.4, 151.3], [397.9, 152.6], [388.1, 153.8], [378.4, 154.9], [368.8, 156], [358.7, 157], [347.9, 158.1], [336.3, 159.2], [324.2, 160.4], [311.7, 161.5], [299.2, 162.6], [286.7, 163.6], [274.6, 164.6], [263.1, 165.5], [252.4, 166.2], [242.1, 166.8], [231.8, 167.3], [221.7, 167.7], [212.1, 168.1], [203.3, 168.3], [195.5, 168.5], [188.9, 168.7], [183.8, 168.9], [0, 168.9]],
    labels: [
      { text: "Level", at: [92, 270], to: [92, 168.9], anchor: "middle" },
      { text: "Ramp", at: [640, 240], to: [600, 125.1], anchor: "middle" },
    ],
  },
];

export const PROFILE_GROUPS: { id: ProfileGroup; title: string; lead: string }[] = [
  {
    id: "window-sills",
    title: "Window sills",
    lead: "Sills with an upstand at the back and a drip groove under the front edge.",
  },
  {
    id: "door-sills",
    title: "Door sills and thresholds",
    lead: "For the door line: a stepped or sloped sill, or a ramp for step-free access.",
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

/** What the pieces are cut from: either range, in any of its colours. */
export const MATERIALS = [
  { name: "Granite", note: "Any colour in the Pacific granite range, for interiors and exteriors.", href: "/products/granites" },
  { name: "Quartz", note: "Any colour in the Pacific quartz range, for interiors only.", href: "/products/quartz" },
];

export const FINISHES = [
  { name: "Polished", note: "A mirror gloss that deepens the colour." },
  { name: "Honed", note: "Ground smooth to a flat, matt face." },
  { name: "Leather", note: "Brushed to a soft, tactile texture with a low sheen." },
];

export const PACKING = "Wooden crate packing. Cut to size and custom lengths available.";
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
  { src: `${PHOTO}/granite-sill-brown.jpg`, alt: "A brown granite window sill with a picture frame on it", width: 2592, height: 1872, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-bullnose.jpg`, alt: "A black granite sill with a rounded front edge above a radiator", width: 1500, height: 1000, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-exterior.jpg`, alt: "A granite sill outside, under a brown window frame", width: 2400, height: 1600, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-white-corner.jpg`, alt: "A black and white granite sill turning a corner of the room", width: 1024, height: 768, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-rose.jpg`, alt: "A pink and grey granite sill above a radiator", width: 600, height: 450, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/quartz-sill-brooklyn.jpg`, alt: "A white and grey quartz window sill in a high-rise window", width: 3948, height: 3584, material: "Quartz", kind: "fitted" },
  { src: `${PHOTO}/sills-range.jpg`, alt: "Sills in granite and quartz laid side by side", width: 1409, height: 1969, material: "Granite and quartz", kind: "cut" },
  { src: `${PHOTO}/granite-sill-red.jpg`, alt: "A red granite sill with a rounded front edge", width: 2111, height: 1415, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sill-black.jpg`, alt: "A black granite sill with a rounded front edge", width: 2111, height: 1415, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sills-black-stack.jpg`, alt: "Black granite sills stacked edge to edge", width: 2111, height: 1416, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sills-black-row.jpg`, alt: "Black granite sills laid out in a row", width: 2111, height: 1415, material: "Granite", kind: "cut" },
];

/** The widths offered at each length, for the sizes-at-a-glance grid. */
export function sizeGrid(rows: CrateRow[]) {
  const lengths = Array.from(new Set(rows.map((r) => r.length))).sort((a, b) => a - b);
  const widths = Array.from(new Set(rows.map((r) => r.width))).sort((a, b) => a - b);
  const has = (l: number, w: number) => rows.find((r) => r.length === l && r.width === w);
  return { lengths, widths, has };
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
    lead: "Window sills, door sills and thresholds in granite and quartz: six profiles, cut to size, edge-bevelled and crated for export.",
    image: `${PHOTO}/hero-charcoal-sill.webp`,
    alt: "A charcoal granite window sill running the length of a window above the sea",
  },

  tabs: [
    {
      label: "Granite and quartz",
      heading: "Cut from Pacific granite and quartz",
      body: [
        "Any colour in the Pacific granite range, inside or out, or in the quartz range for interiors.",
        "The same slabs are cut for floors, worktops and walls, so a sill or a threshold can match the stone around it.",
      ],
      image: `${PHOTO}/granite-sill-black.jpg`,
      alt: "A black granite window sill",
    },
    {
      label: "Six profiles",
      heading: "From the window to the door",
      body: [
        "Three window sills with an upstand at the back and a drip groove under the front edge: straight, with a glued upstand, or with a sloped top.",
        "Three pieces for the door line: a stepped door sill, a sloped door sill and a wheelchair threshold.",
      ],
      image: `${PHOTO}/granite-sills-black-row.jpg`,
      alt: "Black granite sills laid out in a row",
    },
    {
      label: "Standard sizes",
      heading: "Sills from 88 to 220 cm",
      body: [
        "Window sills in six lengths from 88 to 220 cm, 15 to 40 cm deep and 2 cm thick, with 220 × 30 cm in 3 cm.",
        "Thresholds and door sills at 103 cm, 3 to 15 cm wide, and at 120 cm, 3 to 6 cm wide, from 2 to 6 cm thick. Other lengths are cut to size.",
      ],
      image: `${PHOTO}/sills-range.jpg`,
      alt: "Sills in granite and quartz laid side by side",
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
      image: `${PHOTO}/granite-sills-black-stack.jpg`,
      alt: "Black granite sills stacked edge to edge, their bevelled edges showing",
    },
  ] satisfies SpaceTab[],

  plan: {
    heading: "Planning a project?",
    body: "Send us the window and door schedule with the profiles, lengths and depths. We reply with a quote and a crate plan for the container.",
    cta: { label: "Get a quote", href: "/contact#enquiry" },
    image: `${PHOTO}/granite-sill-black-bullnose.jpg`,
    alt: "A black granite sill with a rounded front edge above a radiator",
  },

  materials: { src: `${PHOTO}/sills-range.jpg`, alt: "Sills in granite and quartz laid side by side" },

  gallery: {
    heading: "Sills, fitted and finished",
    tags: ["All", "Fitted", "Finished pieces"],
  },

  faqs: [
    {
      question: "Which profiles are in the collection?",
      answer:
        "Three window sills (with an upstand, with a glued upstand, and with a sloped top), each with a drip groove under the front edge, and three pieces for the door line: a stepped door sill, a sloped door sill and a wheelchair threshold.",
    },
    {
      question: "What are the standard sizes?",
      answer:
        "Window sills in 88, 101, 126, 151, 176 and 220 cm lengths, 15 to 40 cm deep. Thresholds and door sills at 103 cm (3 to 15 cm wide) and 120 cm (3 to 6 cm wide). Thicknesses run from 2 to 6 cm by size, and other lengths are cut to size.",
    },
    {
      question: "Which materials and finishes are available?",
      answer: "Granite and quartz, in any colour of either range. Finishes are polished, honed and leather. Quartz is for interior use only.",
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
