/**
 * Pacific Stone Gallery — square-plaza layout.
 *
 *                          [ North wing — Whites ]
 *                                  ─┬─
 *                  archway (6m)     │
 *   ┌────────────┬─────────────────┴─────────────────┬────────────┐
 *   │            │                                   │            │
 *   │    West    │                                   │    East    │
 *   │   Warm     │          PLAZA (12×12)            │ Grey/Blue  │
 *   │            │         hero slab centre          │            │
 *   │            │                                   │            │
 *   └────────────┴─────────────────┬─────────────────┴────────────┘
 *                                  │
 *                                ─┴─
 *                          [ South wing — Darks ]
 *
 *                            entry at +Z spawn
 *
 * All coordinates metric. Y up, +X east, +Z south. Camera spawns at the
 * south wing entry facing -Z (north).
 *
 * Slabs are free-standing on individual gallery frames (not mounted on
 * walls) — 4–6 per wing, arranged in a grid.
 *
 * Navigation is waypoint-based: every waypoint knows its direct neighbours,
 * and the Showroom renders an arrow badge for each. Click an arrow to glide
 * there. WASD is kept as a secondary free-walk option.
 */

import { slabs as ALL_SLABS, type Slab } from "@/data/slabs";

// ------------------------------ Constants ------------------------------

export const GALLERY = {
  plazaSize: 12, // X and Z span of the central plaza
  wingWidth: 12, // inner X span of N/S wings; inner Z span of E/W wings
  wingDepth: 11, // how far each wing extends beyond the plaza
  ceilingHeight: 5.5,
  wallThickness: 0.15,
  archwayWidth: 6, // opening in each plaza-facing wall
  eyeHeight: 1.65,
  /** Spawn inside the south wing, facing north */
  spawn: [0, 1.65, 14.5] as [number, number, number],
  /** Slab display dimensions */
  slabWidth: 1.2,
  slabHeight: 2.55,
  slabThickness: 0.035,
  frameThickness: 0.07, // metal frame around the slab
  plinthWidth: 1.45,
  plinthHeight: 0.22,
  plinthDepth: 0.42,
} as const;

// ------------------------------ Wings ------------------------------

export type WingId = "north" | "east" | "south" | "west";

export interface Wing {
  id: WingId;
  label: string;
  tagline: string;
  slabIds: string[];
  palette: {
    floor: string;
    wall: string;
    accent: string; // light color for the wing
  };
}

export const WINGS: Record<WingId, Wing> = {
  north: {
    id: "north",
    label: "The Whites",
    tagline: "Calacattas, Bianco, Vision",
    slabIds: [
      "lumina-cristal",
      "calacatta-themis",
      "bianco-luce",
      "stellar-white",
      "vision-bianco",
    ],
    palette: { floor: "#1d2830", wall: "#f1ebe0", accent: "#ffeecc" },
  },
  east: {
    id: "east",
    label: "Greys & Blues",
    tagline: "Maritime neutrals",
    slabIds: [
      "winter-haze-p12",
      "perla-grey",
      "atlantic-deep",
      "abisso-marino",
      "costa-azzurra",
    ],
    palette: { floor: "#1a242c", wall: "#d6dde4", accent: "#b8d0e0" },
  },
  south: {
    id: "south",
    label: "The Darks",
    tagline: "Obsidian, graphite, nero",
    slabIds: [
      "nero-statuario",
      "midnight-obsidian",
      "graphite-matter",
      "sabbia-nera",
      "terra-umbria",
    ],
    palette: { floor: "#14202a", wall: "#2a333c", accent: "#5d6b7a" },
  },
  west: {
    id: "west",
    label: "Warm Earth",
    tagline: "Browns, golds, creams",
    slabIds: [
      "desert-brown-4013",
      "kedar-amazonik",
      "nara-natural",
      "zira-dorado",
      "avorio-chiaro",
      "oro-antico",
    ],
    palette: { floor: "#1d2328", wall: "#e7ddcb", accent: "#dbba87" },
  },
};

export const HERO_SLAB_ID = "calacatta-pacifica";

// ------------------------------ Displays ------------------------------

export interface SlabDisplay {
  id: string; // unique
  slabId: string;
  position: [number, number, number];
  /** Rotation around Y: 0 = facing -Z (north) */
  rotationY: number;
  wing: WingId | "plaza";
  index: number; // numbered badge per wing
}

/** Centre of each wing (inside the wing, not the archway) */
function wingCentre(id: WingId): [number, number, number] {
  const d = GALLERY.plazaSize / 2 + GALLERY.wingDepth / 2;
  switch (id) {
    case "north":
      return [0, 0, -d];
    case "south":
      return [0, 0, d];
    case "east":
      return [d, 0, 0];
    case "west":
      return [-d, 0, 0];
  }
}

/**
 * Layout N slabs inside a wing. The slabs face inward (toward the archway)
 * so visitors walking in from the plaza see them head-on.
 *
 * For N, S wings: slabs are laid out across X, in 1 or 2 rows along Z.
 * For E, W wings: slabs are laid out across Z, in 1 or 2 rows along X.
 */
function layoutWingSlabs(wing: Wing): SlabDisplay[] {
  const n = wing.slabIds.length;
  const [cx, , cz] = wingCentre(wing.id);

  // Orientation: face the plaza (archway). Back row stands further from archway.
  const outward = wing.id === "north" || wing.id === "south";
  const facingPlazaY =
    wing.id === "north"
      ? 0 // face +Z (toward plaza)
      : wing.id === "south"
        ? Math.PI // face -Z
        : wing.id === "east"
          ? -Math.PI / 2 // face -X
          : Math.PI / 2; // face +X

  // Rows / cols grid
  const cols = Math.min(n, 3);
  const rows = Math.ceil(n / cols);

  // Spacing between slab centres — keep breathing room
  const spacingAcross = outward
    ? (GALLERY.wingWidth - 2.5) / Math.max(cols, 2)
    : (GALLERY.wingWidth - 2.5) / Math.max(cols, 2);
  const spacingDepth = 3.2;

  const out: SlabDisplay[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Offsets relative to wing centre
    const colsInRow = Math.min(cols, n - row * cols);
    const acrossOffset =
      (col - (colsInRow - 1) / 2) * spacingAcross;
    // depth offset: row 0 = near archway, row 1 = further
    const depthSign = wing.id === "south" || wing.id === "east" ? -1 : 1;
    const depthOffset = (row - (rows - 1) / 2) * spacingDepth * depthSign;

    let px: number;
    let pz: number;
    if (outward) {
      // N/S: slabs spread across X, rows along Z
      px = cx + acrossOffset;
      pz = cz + depthOffset;
    } else {
      // E/W: slabs spread across Z, rows along X
      px = cx + depthOffset;
      pz = cz + acrossOffset;
    }

    out.push({
      id: `${wing.id}-${i}`,
      slabId: wing.slabIds[i],
      position: [px, GALLERY.slabHeight / 2 + GALLERY.plinthHeight, pz],
      rotationY: facingPlazaY,
      wing: wing.id,
      index: i + 1,
    });
  }
  return out;
}

/** Hero slab in the plaza centre */
const HERO_DISPLAY: SlabDisplay = {
  id: "plaza-hero",
  slabId: HERO_SLAB_ID,
  position: [0, GALLERY.slabHeight / 2 + GALLERY.plinthHeight + 0.25, 0],
  rotationY: Math.PI, // face toward entry (south)
  wing: "plaza",
  index: 0,
};

export const SLAB_DISPLAYS: SlabDisplay[] = [
  HERO_DISPLAY,
  ...layoutWingSlabs(WINGS.north),
  ...layoutWingSlabs(WINGS.east),
  ...layoutWingSlabs(WINGS.south),
  ...layoutWingSlabs(WINGS.west),
];

// ------------------------------ Waypoints ------------------------------

export interface Waypoint {
  id: string;
  label: string;
  /** Camera position (eye height) */
  position: [number, number, number];
  /** Where camera looks when first arriving */
  lookAt: [number, number, number];
  /** IDs of waypoints reachable from here */
  neighbors: string[];
}

const eh = GALLERY.eyeHeight;
const halfP = GALLERY.plazaSize / 2;

export const WAYPOINTS: Waypoint[] = [
  {
    id: "entry",
    label: "Entry",
    position: [0, eh, 14.5],
    lookAt: [0, eh, 0],
    neighbors: ["south-gate"],
  },
  {
    id: "south-gate",
    label: "Darks — entrance",
    position: [0, eh, halfP + 1],
    lookAt: [0, eh, 0],
    neighbors: ["entry", "south-centre", "plaza"],
  },
  {
    id: "south-centre",
    label: "Darks — centre",
    position: [0, eh, halfP + GALLERY.wingDepth * 0.55],
    lookAt: [0, eh, halfP + GALLERY.wingDepth - 2],
    neighbors: ["south-gate"],
  },
  {
    id: "plaza",
    label: "Plaza",
    position: [0, eh, 2.2],
    lookAt: [0, eh, 0],
    neighbors: ["north-gate", "east-gate", "west-gate", "south-gate"],
  },
  {
    id: "north-gate",
    label: "Whites — entrance",
    position: [0, eh, -halfP - 1],
    lookAt: [0, eh, -halfP - GALLERY.wingDepth],
    neighbors: ["plaza", "north-centre"],
  },
  {
    id: "north-centre",
    label: "Whites — centre",
    position: [0, eh, -halfP - GALLERY.wingDepth * 0.55],
    lookAt: [0, eh, -halfP - GALLERY.wingDepth],
    neighbors: ["north-gate"],
  },
  {
    id: "east-gate",
    label: "Greys & Blues — entrance",
    position: [halfP + 1, eh, 0],
    lookAt: [halfP + GALLERY.wingDepth, eh, 0],
    neighbors: ["plaza", "east-centre"],
  },
  {
    id: "east-centre",
    label: "Greys & Blues — centre",
    position: [halfP + GALLERY.wingDepth * 0.55, eh, 0],
    lookAt: [halfP + GALLERY.wingDepth, eh, 0],
    neighbors: ["east-gate"],
  },
  {
    id: "west-gate",
    label: "Warm Earth — entrance",
    position: [-halfP - 1, eh, 0],
    lookAt: [-halfP - GALLERY.wingDepth, eh, 0],
    neighbors: ["plaza", "west-centre"],
  },
  {
    id: "west-centre",
    label: "Warm Earth — centre",
    position: [-halfP - GALLERY.wingDepth * 0.55, eh, 0],
    lookAt: [-halfP - GALLERY.wingDepth, eh, 0],
    neighbors: ["west-gate"],
  },
];

export function getWaypoint(id: string): Waypoint | undefined {
  return WAYPOINTS.find((w) => w.id === id);
}

// ------------------------------ Slab helpers ------------------------------

export function getSlab(id: string): Slab | null {
  return ALL_SLABS.find((s) => s.id === id) ?? null;
}
