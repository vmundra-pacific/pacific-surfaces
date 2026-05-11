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
  /**
   * Either:
   *   - `polygon`: a closed polygon in normalised image coordinates
   *     (legacy, eyeballed against the source photo), OR
   *   - `maskUrl`: a path to a PNG mask exported from Photoshop where
   *     opaque / white pixels mark the surface area. Pixel-perfect.
   *
   * Exactly one of the two must be provided per surface. The renderer
   * picks the right loader (polygon → rasteriser, mask → image fetch).
   */
  polygon?: [number, number][];
  maskUrl?: string;
  /**
   * Optional grayscale shadow pass (multiply blend). Painted in
   * Photoshop on top of the mask area: black = strongest shadow,
   * white = no shadow, mid-gray = ambient. Values darken the slab
   * during compositing so the rendered surface inherits the room's
   * light/dark gradients (under-cabinet shadow, lip drop-off, etc.)
   * instead of looking flatly stamped on. Optional — surfaces without
   * a shadow pass still render, just without the lighting integration.
   */
  shadowUrl?: string;
  /**
   * Optional grayscale highlights / reflections pass (screen blend).
   * White = brightest reflection (window, pendant spill, edge sheen);
   * black / transparent = leave the slab alone. Adds the polished
   * sheen and reflective bloom that makes a slab read as installed
   * stone rather than a flat texture. Stack alongside shadowUrl for
   * full lighting integration.
   */
  highlightsUrl?: string;
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

export const DEMO_ROOMS: DemoRoom[] = [
  // -- Mask-based demo rooms (Pacific photography + PSD-exported masks) --
  // Each surface points at a PNG mask in /public/demo-rooms/<id>/. The
  // PSD export workflow is documented in docs/demo-room-export.md.
  // Add more rooms by dropping the assets in /public/demo-rooms/<id>/
  // and appending another entry below — no code changes needed.
  {
    id: "pacific-kitchen-01",
    label: "Pacific kitchen",
    category: "Kitchen",
    src: "/demo-rooms/pacific-kitchen-01/room.jpg",
    thumb: "/demo-rooms/pacific-kitchen-01/room.jpg",
    credit: "Pacific Surfaces",
    surfaces: [
      {
        id: "countertop",
        label: "Countertop",
        maskUrl: "/demo-rooms/pacific-kitchen-01/countertop.png",
        shadowUrl: "/demo-rooms/pacific-kitchen-01/shadow.png",
        highlightsUrl: "/demo-rooms/pacific-kitchen-01/highlights.png",
      },
    ],
  },
  {
    id: "kitchen-02",
    label: "Kitchen 02",
    category: "Kitchen",
    src: "/demo-rooms/kitchen-02/room.png",
    thumb: "/demo-rooms/kitchen-02/thumb.jpg",
    credit: "Pacific Surfaces",
    surfaces: [
      {
        id: "countertop",
        label: "Countertop",
        maskUrl: "/demo-rooms/kitchen-02/mask.png",
        shadowUrl: "/demo-rooms/kitchen-02/shadow.png",
        highlightsUrl: "/demo-rooms/kitchen-02/highlight.png",
      },
    ],
  },
];
