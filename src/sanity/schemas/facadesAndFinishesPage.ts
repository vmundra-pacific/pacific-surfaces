import { defineField, defineType } from "sanity";

/**
 * facadesAndFinishesPage — singleton holding all editor-managed
 * copy and media for /products/facades-and-finishes.
 *
 * Layout consumed:
 *   1. Hero — full-screen video/image background, centred copy.
 *   2. Intro split — left tall image, right column with image + heading + body.
 *   3. Features — centred "Transform Stones Into Art" eyebrow / headline + 3 numbered cards.
 *   4. Grid — every product tagged to the source Sanity Collection.
 *
 * Finish entries (Polished, Honed, etc.) are NOT stored here —
 * they're regular Sanity `product` documents tagged to a
 * `collection` whose slug matches `collectionSlug` below
 * (default "facades-and-finishes"). Editors create a Product per
 * finish and tag the collection.
 */
export default defineType({
  name: "facadesAndFinishesPage",
  title: "Façades and Finishes Page",
  type: "document",
  groups: [
    { name: "hero", title: "1 · Hero" },
    { name: "intro", title: "2 · Intro Split" },
    { name: "features", title: "3 · Transform Stones Into Art" },
    { name: "grid", title: "4 · Grid" },
  ],
  fields: [
    /* ─── 1. Hero ──────────────────────────────────────── */
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
      group: "hero",
      initialValue: "Fusion of Aesthetics, Functionality & Innovation",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      group: "hero",
      initialValue: "Stone Finishes Beyond Imagination",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 3,
      group: "hero",
      description:
        "Optional. Sub-paragraph below the headline. Leave blank for the eyebrow + headline only treatment.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      group: "hero",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroVideoUrl",
      title: "Hero Background Video URL",
      type: "string",
      group: "hero",
      description:
        "Optional. /public path or external URL. Plays muted-looped behind the hero. Wins over Hero Background Image.",
      initialValue: "/videos/natural-stone-finishes.mp4",
    }),

    /* ─── 2. Intro split ───────────────────────────────── */
    defineField({
      name: "introLeftImage",
      title: "Intro — Left Image (large, tall)",
      type: "image",
      group: "intro",
      options: { hotspot: true },
      description:
        "The wide image on the left of the intro split. Recommend ~3:4 portrait. Ignored if Intro — Left Video URL is set.",
    }),
    defineField({
      name: "introLeftVideoUrl",
      title: "Intro — Left Video URL",
      type: "string",
      group: "intro",
      description:
        "Optional. Path to a /public video (e.g. /videos/stone-finishes-2.mp4) or external URL. Plays muted-looped in the large left slot. Wins over Intro — Left Image when set.",
      initialValue: "/videos/stone-finishes-2.mp4",
    }),
    defineField({
      name: "introRightImage",
      title: "Intro — Right Image (smaller, on top)",
      type: "image",
      group: "intro",
      options: { hotspot: true },
      description:
        "The smaller image at the top-right of the intro split. Recommend ~3:2 landscape. Ignored if Intro — Right Image URL is set OR Intro — Right Video URL is set.",
    }),
    defineField({
      name: "introRightImageUrl",
      title: "Intro — Right Image URL (advanced)",
      type: "string",
      group: "intro",
      description:
        "Alternative to the Sanity image upload above — paste a /public path (e.g. /stone-finishes-slider-01.webp) or external URL. Useful when the asset already lives in /public.",
      initialValue: "/stone-finishes-slider-01.webp",
    }),
    defineField({
      name: "introRightVideoUrl",
      title: "Intro — Right Video URL",
      type: "string",
      group: "intro",
      description:
        "Optional. Plays in the smaller right slot when set. Wins over both right-side image fields.",
    }),
    defineField({
      name: "introSubheading",
      title: "Intro — Right-Column Subheading",
      type: "string",
      group: "intro",
      initialValue: "From Smooth Satin to Rugged Splendor",
    }),
    defineField({
      name: "introBody",
      title: "Intro — Right-Column Paragraph",
      type: "text",
      rows: 4,
      group: "intro",
      initialValue:
        "Explore a world of special textures and modern finishing where each piece is crafted to elevate your living experience. Welcome to a world where every surface is a canvas for your dreams.",
    }),

    /* ─── 3. Features ─────────────────────────────────── */
    defineField({
      name: "featuresEyebrow",
      title: "Features — Eyebrow",
      type: "string",
      group: "features",
      initialValue: "Transform Stones Into Art",
    }),
    defineField({
      name: "featuresHeadline",
      title: "Features — Headline / Tagline",
      type: "text",
      rows: 3,
      group: "features",
      initialValue:
        "Discover the transformative power of precision stone finishes that blend art and nature seamlessly.",
    }),
    defineField({
      name: "features",
      title: "Features — Numbered Cards",
      type: "array",
      group: "features",
      description:
        "The three numbered cards below the Transform Stones Into Art tagline. Title + body per card. Number is auto-generated from order.",
      of: [
        {
          type: "object",
          name: "feature",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 5,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
          },
        },
      ],
      initialValue: [
        {
          _type: "feature",
          title: "Your Creative Partner",
          body: "In a world where architecture and design evolve constantly, we serve as your reliable partner. Our commitment to delivering excellence is unwavering, making us the go-to choice for architects and designers seeking groundbreaking building materials.",
        },
        {
          _type: "feature",
          title: "Texture Matters",
          body: "Texture isn't just about touch; it's about visual depth and character. Our special textures add depth, intrigue, and personality to your interiors. From natural stone-inspired patterns to geometric marvels, every texture tells a unique story.",
        },
        {
          _type: "feature",
          title: "Quality Craftsmanship",
          body: "Crafted with precision, our surfaces are a testament to quality and durability. We understand the demands of modern living and have designed our products to withstand the test of time.",
        },
      ],
    }),

    /* ─── 4. Grid ─────────────────────────────────────── */
    defineField({
      name: "gridEyebrow",
      title: "Grid — Eyebrow",
      type: "string",
      group: "grid",
      initialValue: "All Finishes",
    }),
    defineField({
      name: "gridHeadline",
      title: "Grid — Headline",
      type: "string",
      group: "grid",
      initialValue: "Choose your finish.",
    }),
    defineField({
      name: "gridDescription",
      title: "Grid — Description",
      type: "string",
      group: "grid",
      initialValue:
        "Tap any tile to open a high-resolution view. Scroll to zoom in on the texture.",
    }),
    defineField({
      name: "collectionSlug",
      title: "Source Collection Slug",
      type: "string",
      group: "grid",
      description:
        'Slug of the Sanity Collection that holds finish products. Defaults to "stone-finishes" — the existing collection on the Pacific dataset. Update only if the collection is renamed or moved.',
      initialValue: "stone-finishes",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Façades and Finishes Page" };
    },
  },
});
