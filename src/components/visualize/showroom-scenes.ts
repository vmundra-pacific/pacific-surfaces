/**
 * Stylised 3D showroom scenes.
 *
 * Each scene is a hand-composed set of primitive boxes + slabs that together
 * evoke an interior — kitchen island, bathroom vanity, fireplace hearth, etc.
 * The surfaces listed in `targets` are meshes whose material can be swapped
 * to the currently selected Pacific slab at runtime.
 *
 * All dimensions are in metres. Y is up, camera starts slightly above eye
 * level to give a hero 3/4 view of the scene.
 */

export interface ShowroomSurface {
  /** Stable id — used to key interactions */
  id: string;
  /** Friendly label for hotspot badges */
  label: string;
  /** Size in metres: [width, height, depth] */
  size: [number, number, number];
  /** Centre position of the surface: [x, y, z] */
  position: [number, number, number];
  /** Optional Y rotation in radians */
  rotationY?: number;
}

export interface ShowroomProp {
  id: string;
  /** Box geometry */
  size: [number, number, number];
  position: [number, number, number];
  /** Hex color */
  color: string;
  /** Optional roughness 0..1 (default 0.85) */
  roughness?: number;
  /** Optional metalness 0..1 (default 0) */
  metalness?: number;
  rotationY?: number;
}

export interface ShowroomScene {
  id: string;
  label: string;
  category: "Kitchen" | "Bathroom" | "Living";
  description: string;
  /** Wall + floor colours */
  palette: {
    floor: string;
    backWall: string;
    sideWall: string;
    accent: string; // cabinet / vanity colour
  };
  /** Ambient base lighting temperature */
  ambient: number;
  /** Camera starting position */
  camera: { position: [number, number, number]; target: [number, number, number] };
  /** Non-interactive box props — cabinets, walls, appliances, plumbing */
  props: ShowroomProp[];
  /** Selectable stone surfaces — these swap material to the active slab */
  targets: ShowroomSurface[];
}

const warmWhite = "#ece6dc";
const coolWhite = "#dfe3e8";
const softWood = "#b89a76";
const darkWood = "#4a382a";
const stoneGrey = "#c4c9cf";
const charcoal = "#2a333c";

export const SHOWROOM_SCENES: ShowroomScene[] = [
  // --------------------------------------------------------------------- Kitchen
  {
    id: "kitchen-island",
    label: "Open kitchen · island",
    category: "Kitchen",
    description: "Walk around a Pacific island and see both the top and the waterfall run.",
    palette: {
      floor: softWood,
      backWall: warmWhite,
      sideWall: "#e6ded1",
      accent: warmWhite,
    },
    ambient: 0.55,
    camera: { position: [4.2, 2.1, 4.6], target: [0, 1, 0] },
    props: [
      // Back counter base cabinets
      { id: "back-cabinet-left", size: [2, 0.9, 0.6], position: [-1.5, 0.45, -2.4], color: warmWhite, roughness: 0.7 },
      { id: "back-cabinet-right", size: [2, 0.9, 0.6], position: [1.5, 0.45, -2.4], color: warmWhite, roughness: 0.7 },
      // Upper cabinets
      { id: "upper-left", size: [2, 0.7, 0.36], position: [-1.5, 2.2, -2.55], color: warmWhite, roughness: 0.7 },
      { id: "upper-right", size: [2, 0.7, 0.36], position: [1.5, 2.2, -2.55], color: warmWhite, roughness: 0.7 },
      // Range hood
      { id: "hood", size: [0.9, 0.6, 0.45], position: [0, 2.25, -2.5], color: charcoal, roughness: 0.4, metalness: 0.3 },
      // Range
      { id: "range", size: [0.9, 0.04, 0.6], position: [0, 0.92, -2.4], color: charcoal, roughness: 0.2, metalness: 0.5 },
      // Island base
      { id: "island-base", size: [2.4, 0.9, 1.1], position: [0, 0.45, 0.3], color: warmWhite, roughness: 0.7 },
      // Pendant lights
      { id: "pendant-1", size: [0.18, 0.3, 0.18], position: [-0.6, 2.7, 0.3], color: "#d9cdb8", roughness: 0.3, metalness: 0.6 },
      { id: "pendant-2", size: [0.18, 0.3, 0.18], position: [0.6, 2.7, 0.3], color: "#d9cdb8", roughness: 0.3, metalness: 0.6 },
    ],
    targets: [
      {
        id: "island-top",
        label: "Island top",
        size: [2.6, 0.06, 1.3],
        position: [0, 0.93, 0.3],
      },
      {
        id: "back-counter",
        label: "Back counter",
        size: [5.4, 0.06, 0.65],
        position: [0, 0.93, -2.4],
      },
      // Backsplash band
      {
        id: "backsplash",
        label: "Backsplash",
        size: [5.4, 0.75, 0.03],
        position: [0, 1.68, -2.72],
      },
    ],
  },

  // --------------------------------------------------------------------- Bathroom
  {
    id: "bath-vanity",
    label: "Spa bathroom · vanity",
    category: "Bathroom",
    description: "A floating vanity and shower niche — see how veining reads at both scales.",
    palette: {
      floor: "#d8d4cf",
      backWall: coolWhite,
      sideWall: "#cfd4da",
      accent: "#d4c7b2",
    },
    ambient: 0.6,
    camera: { position: [3.6, 1.95, 4.2], target: [0, 1.1, 0] },
    props: [
      // Floating vanity cabinet
      { id: "vanity-cab", size: [2.4, 0.5, 0.55], position: [0, 0.9, -2.35], color: darkWood, roughness: 0.55 },
      // Mirror
      { id: "mirror", size: [2.2, 1.0, 0.04], position: [0, 2.0, -2.68], color: "#aebac6", roughness: 0.08, metalness: 0.9 },
      // Faucets
      { id: "faucet-1", size: [0.08, 0.35, 0.08], position: [-0.5, 1.35, -2.55], color: "#8c959d", roughness: 0.2, metalness: 0.8 },
      { id: "faucet-2", size: [0.08, 0.35, 0.08], position: [0.5, 1.35, -2.55], color: "#8c959d", roughness: 0.2, metalness: 0.8 },
      // Basins (recessed — boxes below counter level)
      { id: "basin-1", size: [0.5, 0.08, 0.35], position: [-0.5, 1.14, -2.4], color: "#ffffff", roughness: 0.15 },
      { id: "basin-2", size: [0.5, 0.08, 0.35], position: [0.5, 1.14, -2.4], color: "#ffffff", roughness: 0.15 },
      // Shower wall (side)
      { id: "shower-wall", size: [0.04, 2.4, 1.5], position: [-2.7, 1.2, -1.5], color: "#eef1f4", roughness: 0.3 },
    ],
    targets: [
      {
        id: "vanity-top",
        label: "Vanity top",
        size: [2.6, 0.05, 0.65],
        position: [0, 1.18, -2.35],
      },
      {
        id: "shower-surround",
        label: "Shower surround",
        size: [1.6, 2.4, 0.04],
        position: [-1.8, 1.2, -2.7],
      },
    ],
  },

  // --------------------------------------------------------------------- Living
  {
    id: "living-hearth",
    label: "Living · fireplace",
    category: "Living",
    description: "A full-height fireplace surround. The single slab reads from across the room.",
    palette: {
      floor: "#b3987a",
      backWall: "#efe9df",
      sideWall: "#e5e0d5",
      accent: "#3a4550",
    },
    ambient: 0.5,
    camera: { position: [3.8, 1.7, 4.4], target: [0, 1.4, 0] },
    props: [
      // Mantel shelf
      { id: "mantel", size: [2.6, 0.1, 0.35], position: [0, 1.55, -2.3], color: "#f3ede3", roughness: 0.6 },
      // Fire box opening (dark inset)
      { id: "firebox", size: [1.2, 0.7, 0.1], position: [0, 0.9, -2.46], color: "#0a0c0f", roughness: 0.9 },
      // Hearth stone base
      { id: "hearth-base", size: [2.8, 0.15, 0.6], position: [0, 0.075, -2.1], color: "#b9b3ab", roughness: 0.7 },
      // Sofa suggestion
      { id: "sofa-base", size: [2.4, 0.5, 0.9], position: [0, 0.25, 1.8], color: "#556070", roughness: 0.9 },
      { id: "sofa-back", size: [2.4, 0.75, 0.25], position: [0, 0.62, 2.15], color: "#556070", roughness: 0.9 },
    ],
    targets: [
      {
        id: "surround",
        label: "Fireplace surround",
        size: [2.8, 3.0, 0.04],
        position: [0, 1.5, -2.52],
      },
      {
        id: "hearth-top",
        label: "Hearth top",
        size: [2.8, 0.04, 0.6],
        position: [0, 0.17, -2.1],
      },
    ],
  },
];
