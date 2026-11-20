/**
 * The Translucent Series: five existing quartz colours offered for
 * backlighting (owner, 2026-11-20: they are the same colours as the
 * catalogue entries below, not separate products).
 *
 * `description` is the wording of the "Crafted to Glow" catalogue
 * (2026-04), unedited. Backlit photographs and renders are to follow
 * from the owner; none are shown until then.
 */
export interface TranslucentColour {
  /** Slug of the existing product page, /products/<slug>. */
  slug: string;
  name: string;
  description: string;
}

export const TRANSLUCENT_COLOURS: TranslucentColour[] = [
  {
    slug: "bohemia-3018",
    name: "Bohemia",
    description:
      "A bold expression of artistic movement, Bohemia features dynamic veining with layered tonal contrasts. When backlit, it reveals a dramatic interplay of light and shadow—perfect for statement-making interiors.",
  },
  {
    slug: "glacial-silver-3059",
    name: "Glacial Silver",
    description:
      "Cool, serene, and sophisticated. Glacial Silver showcases soft silver undertones with fluid veining that comes alive under illumination—ideal for contemporary, minimal spaces.",
  },
  {
    slug: "latte-luxe-5040",
    name: "Latte Luxe",
    description:
      "Warmth meets understated luxury. Latte Luxe blends creamy beige tones with subtle veining, creating a soft, inviting glow when backlit.",
  },
  {
    slug: "venice-5041",
    name: "Venice",
    description:
      "Inspired by timeless European elegance, Venice features flowing, classic patterns. Backlighting enhances its depth, making it ideal for premium hospitality and luxury spaces.",
  },
  {
    slug: "sakura",
    name: "Sakura",
    description:
      "Delicate and expressive, Sakura carries soft blush tones with gentle veining. When illuminated, it creates a calming, ethereal ambiance.",
  },
];

/** Product slugs in the series, for the /products/translucent listing. */
export const TRANSLUCENT_SLUGS = TRANSLUCENT_COLOURS.map((c) => c.slug);
