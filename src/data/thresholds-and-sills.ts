/**
 * Thresholds, window sills, shower jambs and the small pieces cut with
 * them — the products on /products/pacific-european-window-sill-threshold-collection.
 *
 * The pieces and their standard sizes follow the owner's reference (Bauce
 * Bruno's "Thresholds and Showerjambs" range), in inches as listed there,
 * by the owner's choice (2026-10-05); the page shows millimetres beside
 * them. The descriptions are our own. Each piece is shown as a 2D line
 * drawing, a plan and a section (owner, 2026-10-05: black lines on white,
 * not renders), drawn by components/sections/CutPieceDrawing from
 * `drawing` below; `shownIn` names a design the piece is cut from.
 * Photographs of finished sills are in SILL_PHOTOS, further down.
 */

/** An edge treatment as drawn, in inches. */
export type Edge =
  | { kind: "square" }
  | { kind: "bevel"; size: number } // 45 degrees, `size` each way
  | { kind: "slope"; run: number; lip: number } // a long incline, leaving a lip
  | { kind: "round"; r: number }; // half bullnose: a quarter round on top

const SQUARE: Edge = { kind: "square" };

export interface CutPiece {
  slug: string;
  name: string;
  /** The edge treatment, in a line. */
  profile: string;
  /** Standard sizes in inches. A two-number `range` is "from–to". */
  length: number[];
  width?: number[];
  widthRange?: [number, number];
  thickness: number[];
  /** How the piece is drawn: a strip's two long edges, or a corner
   *  piece's bevelled front. */
  drawing: { kind: "strip"; back: Edge; front: Edge } | { kind: "corner"; bevel: number };
  shownIn: { name: string; href: string };
}

const SHOWN = {
  silverHaven: { name: "Silver Haven", href: "/products/silver-haven-p17" },
  cinderFlow: { name: "Cinder Flow", href: "/products/cinder-flow-p19" },
  himalayanVein: { name: "Himalayan Vein", href: "/products/himalayan-vein-p14" },
  luminaCristal: { name: "Lumina Cristal", href: "/products/Lumina-Cristal-P28" },
  alabasterNoir: { name: "Alabaster Noir", href: "/products/alabaster-noir-3003" },
} as const;

export const CUT_PIECES: CutPiece[] = [
  {
    slug: "threshold-1-bevel",
    name: "Threshold, one bevel",
    profile: "One long edge polished or honed and finished with a bevel.",
    length: [36],
    widthRange: [1.5, 3],
    thickness: [3 / 8],
    drawing: { kind: "strip", back: SQUARE, front: { kind: "bevel", size: 0.2 } },
    shownIn: SHOWN.silverHaven,
  },
  {
    slug: "threshold-2-bevels",
    name: "Threshold, two bevels",
    profile: "Both long edges cut to a steep 45° bevel.",
    length: [24, 36, 50, 60, 72],
    width: [2, 3, 4, 5, 6],
    thickness: [3 / 8, 5 / 8, 3 / 4],
    drawing: { kind: "strip", back: { kind: "bevel", size: 0.3 }, front: { kind: "bevel", size: 0.3 } },
    shownIn: SHOWN.cinderFlow,
  },
  {
    slug: "threshold-hollywood",
    name: "Hollywood threshold, one or two edges",
    profile: "One or both long edges cut to a long, shallow incline.",
    length: [36, 48, 60, 72],
    width: [4, 5, 6],
    thickness: [5 / 8, 3 / 4],
    drawing: { kind: "strip", back: { kind: "slope", run: 1, lip: 0.12 }, front: { kind: "slope", run: 1, lip: 0.12 } },
    shownIn: SHOWN.himalayanVein,
  },
  {
    slug: "window-sill",
    name: "Window sill",
    profile: "Both long edges polished or honed, with a small bevel. For interior sills.",
    length: [48, 72, 84],
    width: [6],
    thickness: [5 / 8, 3 / 4],
    drawing: { kind: "strip", back: { kind: "bevel", size: 0.08 }, front: { kind: "bevel", size: 0.08 } },
    shownIn: SHOWN.luminaCristal,
  },
  {
    slug: "shower-jamb",
    name: "Shower jamb",
    profile: "Both long edges polished or honed, with a small bevel, to line the sides of a shower opening.",
    length: [76, 84, 90],
    width: [6],
    thickness: [5 / 8, 3 / 4],
    drawing: { kind: "strip", back: { kind: "bevel", size: 0.08 }, front: { kind: "bevel", size: 0.08 } },
    shownIn: SHOWN.alabasterNoir,
  },
  {
    slug: "corner-shelf",
    name: "Corner shelf",
    profile: "Two sides polished or honed and the front edge bevelled.",
    length: [9],
    thickness: [5 / 8, 3 / 4],
    drawing: { kind: "corner", bevel: 0.25 },
    shownIn: SHOWN.cinderFlow,
  },
  {
    slug: "corner-seat",
    name: "Corner seat",
    profile: "One side polished or honed and the front edge bevelled.",
    length: [18],
    thickness: [3 / 4, 1.25],
    drawing: { kind: "corner", bevel: 0.3 },
    shownIn: SHOWN.alabasterNoir,
  },
  {
    slug: "shower-bench",
    name: "Shower bench",
    profile: "One long edge polished or honed to a half bullnose.",
    length: [30],
    width: [12],
    thickness: [3 / 4],
    drawing: { kind: "strip", back: SQUARE, front: { kind: "round", r: 0.375 } },
    shownIn: SHOWN.silverHaven,
  },
];

/** The store product for a piece in a material (data/store.ts sells them
 *  at /shop/<slug>). Window sills come in granite too; every other piece
 *  is quartz only. */
export type PieceMaterial = "Quartz" | "Granite";

export const PIECE_MATERIALS: Record<string, PieceMaterial[]> = {
  "window-sill": ["Quartz", "Granite"],
};

export const materialsFor = (piece: CutPiece): PieceMaterial[] => PIECE_MATERIALS[piece.slug] ?? ["Quartz"];

export const storeSlug = (piece: CutPiece, material: PieceMaterial) =>
  `${material.toLowerCase()}-${piece.slug}`;

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
  { src: `${PHOTO}/quartz-sill-brooklyn.jpg`, alt: "A white and grey quartz window sill in a high-rise window", width: 3948, height: 3584, material: "Quartz", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-kitchen.jpg`, alt: "A black and white granite sill along a kitchen window", width: 1536, height: 2048, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-brown.jpg`, alt: "A brown granite window sill with a picture frame on it", width: 2592, height: 1872, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-bullnose.jpg`, alt: "A black granite sill with a rounded front edge above a radiator", width: 1500, height: 1000, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-exterior.jpg`, alt: "A granite sill outside, under a brown window frame", width: 2400, height: 1600, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-black-white-corner.jpg`, alt: "A black and white granite sill turning a corner of the room", width: 1024, height: 768, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/granite-sill-rose.jpg`, alt: "A pink and grey granite sill above a radiator", width: 600, height: 450, material: "Granite", kind: "fitted" },
  { src: `${PHOTO}/sills-range.jpg`, alt: "Sills in granite and quartz laid side by side", width: 1409, height: 1969, material: "Granite and quartz", kind: "cut" },
  { src: `${PHOTO}/granite-sill-red.jpg`, alt: "A red granite sill with a rounded front edge", width: 2111, height: 1415, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sill-black.jpg`, alt: "A black granite sill with a rounded front edge", width: 2111, height: 1415, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sills-black-stack.jpg`, alt: "Black granite sills stacked edge to edge", width: 2111, height: 1416, material: "Granite", kind: "cut" },
  { src: `${PHOTO}/granite-sills-black-row.jpg`, alt: "Black granite sills laid out in a row", width: 2111, height: 1415, material: "Granite", kind: "cut" },
];

/** 0.375 -> "3/8″", 1.25 -> "1 1/4″", 36 -> "36″". */
export function inches(v: number): string {
  const eighths = Math.round(v * 8);
  const whole = Math.floor(eighths / 8);
  let num = eighths % 8;
  let den = 8;
  while (num && num % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  const frac = num ? `${num}/${den}` : "";
  return `${[whole || "", frac].filter(Boolean).join(" ") || "0"}″`;
}

/** The same without the inch mark, for option lists: "3/8", "1 1/4". */
export const inchValue = (v: number) => inches(v).replace("″", "");

/** Inches to millimetres, to 0.1 mm under 50 mm and whole above. */
export function mm(v: number): string {
  const x = v * 25.4;
  return x < 50 ? `${(Math.round(x * 10) / 10).toString()} mm` : `${Math.round(x)} mm`;
}
