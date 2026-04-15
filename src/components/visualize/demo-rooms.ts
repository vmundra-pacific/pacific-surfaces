/**
 * Curated demo rooms for the visualiser.
 *
 * For the "easy" version of the feature, each demo room ships with one or
 * more **hand-curated polygons** that trace the countertop / vanity / hearth.
 * When the user loads a demo, they see numbered hotspots over each polygon
 * and can tap to select a surface — no ML, no flood fill, 100% deterministic.
 *
 * Points are normalised to the photo's natural dimensions (0..1 on each axis)
 * so the same data works regardless of rendered size.
 *
 * NOTE: Polygons are eyeballed approximations of each Unsplash reference.
 * When Pacific's own photography replaces these, polygons should be re-traced
 * against the new source material — a 5-min job per scene.
 */

export interface DemoSurface {
  id: string;
  label: string;
  /** Closed polygon in normalised image coordinates */
  polygon: [number, number][];
}

export interface DemoRoom {
  id: string;
  label: string;
  category: "Kitchen" | "Bathroom" | "Living" | "Commercial";
  src: string;
  thumb: string;
  credit: string;
  surfaces: DemoSurface[];
}

const U = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const DEMO_ROOMS: DemoRoom[] = [
  {
    id: "kitchen-island-marble",
    label: "Open kitchen · island",
    category: "Kitchen",
    src: U("photo-1556909114-f6e7ad7d3136", 1800),
    thumb: U("photo-1556909114-f6e7ad7d3136", 480),
    credit: "Sidekix Media",
    surfaces: [
      {
        id: "island",
        label: "Island top",
        polygon: [
          [0.28, 0.52],
          [0.82, 0.5],
          [0.88, 0.62],
          [0.22, 0.64],
        ],
      },
      {
        id: "counter",
        label: "Back counter",
        polygon: [
          [0.06, 0.42],
          [0.24, 0.4],
          [0.26, 0.48],
          [0.05, 0.5],
        ],
      },
    ],
  },
  {
    id: "kitchen-bright",
    label: "Bright galley kitchen",
    category: "Kitchen",
    surfaces: [
      {
        id: "counter",
        label: "Worktop",
        polygon: [
          [0.22, 0.58],
          [0.92, 0.56],
          [0.94, 0.68],
          [0.2, 0.7],
        ],
      },
    ],
    src: U("photo-1556912173-3bb406ef7e77", 1800),
    thumb: U("photo-1556912173-3bb406ef7e77", 480),
    credit: "Sidekix Media",
  },
  {
    id: "kitchen-warm",
    label: "Warm wood kitchen",
    category: "Kitchen",
    src: U("photo-1588854337115-1c67d9247e4d", 1800),
    thumb: U("photo-1588854337115-1c67d9247e4d", 480),
    credit: "Naomi Hébert",
    surfaces: [
      {
        id: "right-counter",
        label: "Right counter",
        polygon: [
          [0.58, 0.54],
          [0.99, 0.52],
          [0.99, 0.64],
          [0.58, 0.66],
        ],
      },
      {
        id: "left-counter",
        label: "Left counter",
        polygon: [
          [0.38, 0.58],
          [0.56, 0.56],
          [0.56, 0.66],
          [0.4, 0.7],
        ],
      },
    ],
  },
  {
    id: "bath-vanity-stone",
    label: "Stone vanity",
    category: "Bathroom",
    src: U("photo-1552321554-5fefe8c9ef14", 1800),
    thumb: U("photo-1552321554-5fefe8c9ef14", 480),
    credit: "Christian Mackie",
    surfaces: [
      {
        id: "vanity",
        label: "Vanity top",
        polygon: [
          [0.2, 0.56],
          [0.8, 0.54],
          [0.84, 0.66],
          [0.18, 0.68],
        ],
      },
    ],
  },
  {
    id: "bath-modern",
    label: "Modern wet room",
    category: "Bathroom",
    src: U("photo-1600607687939-ce8a6c25118c", 1800),
    thumb: U("photo-1600607687939-ce8a6c25118c", 480),
    credit: "R Architecture",
    surfaces: [
      {
        id: "vanity",
        label: "Vanity",
        polygon: [
          [0.18, 0.52],
          [0.62, 0.5],
          [0.64, 0.62],
          [0.18, 0.64],
        ],
      },
    ],
  },
  {
    id: "living-fireplace",
    label: "Fireplace surround",
    category: "Living",
    src: U("photo-1616486338812-3dadae4b4ace", 1800),
    thumb: U("photo-1616486338812-3dadae4b4ace", 480),
    credit: "Spacejoy",
    surfaces: [
      {
        id: "hearth",
        label: "Fireplace hearth",
        polygon: [
          [0.28, 0.58],
          [0.72, 0.58],
          [0.72, 0.84],
          [0.28, 0.84],
        ],
      },
    ],
  },
];
