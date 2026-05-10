import { defineField, defineType } from "sanity";

/**
 * learnTopic — one document per /learn/<topic> page that has body
 * sections needing images. Editor uploads up to four section images;
 * the page renders them in order, falling back to gradient
 * placeholders when a section image isn't set.
 *
 * Editor flow:
 *   1. /studio → Learn Topics → +Add → enter the slug exactly as it
 *      appears in the URL (e.g. "what-is-quartz", "maintenance-quartz",
 *      "warranty-quartz").
 *   2. Upload Section 1 / 2 / 3 / 4 images in order, matching the
 *      section headings on the page.
 *   3. Publish.
 *
 * Common slugs:
 *   - what-is-<product>          (e.g. what-is-quartz, what-is-granites,
 *                                what-is-semi-precious, what-is-vision,
 *                                what-is-facades-and-finishes,
 *                                what-is-centrepiece-couture,
 *                                what-is-exotic, what-is-vanity)
 *   - maintenance-<product>      (same eight)
 *   - warranty-quartz            (only Quartz carries a warranty page)
 *
 * Body content (headings + paragraphs) lives in the page.tsx file —
 * this schema controls images only.
 */
export default defineType({
  name: "learnTopic",
  title: "Learn Topic",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Topic Slug",
      type: "string",
      description:
        "URL slug exactly as it appears in /learn/<slug>. Examples: what-is-quartz, maintenance-granites, warranty-quartz.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "section1Image",
      title: "Section 1 Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "section2Image",
      title: "Section 2 Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "section3Image",
      title: "Section 3 Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "section4Image",
      title: "Section 4 Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { slug: "slug", media: "section1Image" },
    prepare({ slug, media }) {
      return {
        title: slug ? `Learn — ${slug}` : "Learn — (slug missing)",
        subtitle: slug ? `/learn/${slug}` : "Set the slug",
        media,
      };
    },
  },
});
