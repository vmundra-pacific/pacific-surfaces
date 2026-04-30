import { defineField, defineType } from "sanity";

/**
 * sustainabilityPage — singleton holding all editor-managed copy
 * for /sustainability. Mirrors the careersPage pattern: every
 * field has a sensible default in the React component so the page
 * never breaks during editorial migration.
 *
 * Wired as a singleton in Studio (see sanity.config.ts) so editors
 * see a single "Sustainability Page" entry rather than a list.
 */
export default defineType({
  name: "sustainabilityPage",
  title: "Sustainability Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "initiatives", title: "Energy & Water Initiatives" },
    { name: "ecosurfaces", title: "Ecosurfaces Callout" },
    { name: "pillars", title: "Commitment Pillars" },
    { name: "green", title: "Green Development" },
    { name: "sdgs", title: "Sustainable Development Goals" },
    { name: "cta", title: "Closing CTA" },
  ],
  fields: [
    /* --- Hero ----------------------------------------------------- */
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
      group: "hero",
      initialValue: "Harmony in Business",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      group: "hero",
      initialValue: "A Greener Future",
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body — Paragraphs",
      type: "array",
      group: "hero",
      description:
        "One entry per paragraph. Each renders as a paragraph in the hero. The first paragraph reads as the lead.",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description:
        "Optional. Full-bleed background behind the hero headline. If a video URL is also set, the video wins.",
    }),
    defineField({
      name: "heroVideoUrl",
      title: "Hero Background Video URL",
      type: "string",
      group: "hero",
      description:
        "Optional. Path to a /public video (e.g. /videos/sustainability-hero.mp4) or external URL. Plays muted + looped behind the hero. Wins over Hero Background Image when set.",
      initialValue: "/videos/sustainability-hero.mp4",
    }),

    /* --- Energy + water initiatives ------------------------------- */
    defineField({
      name: "initiatives",
      title: "Energy & Water Initiatives",
      type: "array",
      group: "initiatives",
      description:
        "Three (or more) renewable / conservation initiatives, each with a title, paragraph, and optional image. Currently: Windmill, Solar, Water.",
      of: [
        {
          type: "object",
          name: "initiative",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 5,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", media: "image" },
          },
        },
      ],
    }),

    /* --- Ecosurfaces callout -------------------------------------- */
    defineField({
      name: "ecosurfacesEyebrow",
      title: "Ecosurfaces — Eyebrow",
      type: "string",
      group: "ecosurfaces",
      initialValue: "Safe, Sustainable & Stunning",
    }),
    defineField({
      name: "ecosurfacesHeadline",
      title: "Ecosurfaces — Headline",
      type: "string",
      group: "ecosurfaces",
      initialValue: "Ecosurfaces",
    }),
    defineField({
      name: "ecosurfacesDescription",
      title: "Ecosurfaces — Description",
      type: "text",
      rows: 2,
      group: "ecosurfaces",
      initialValue:
        "Revolutionary Surfaces crafted with people and environment in mind.",
    }),
    defineField({
      name: "ecosurfacesLink",
      title: "Ecosurfaces — Link URL",
      type: "string",
      group: "ecosurfaces",
      description:
        'Where the "Learn More" button on the Ecosurfaces card points.',
      initialValue: "/products/ecosurfaces",
    }),
    defineField({
      name: "ecosurfacesImage",
      title: "Ecosurfaces — Background Image",
      type: "image",
      group: "ecosurfaces",
      options: { hotspot: true },
      description:
        "Optional. Sits behind the Ecosurfaces callout card with a soft scrim. Without this, the card shows a placeholder background.",
    }),
    defineField({
      name: "ecosurfacesVideoUrl",
      title: "Ecosurfaces — Background Video URL",
      type: "string",
      group: "ecosurfaces",
      description:
        "Optional. Path to a /public video or external URL. Plays muted + looped behind the callout. Wins over the image when both are set.",
    }),

    /* --- Commitment pillars --------------------------------------- */
    defineField({
      name: "pillarsHeadline",
      title: "Pillars — Headline",
      type: "string",
      group: "pillars",
      initialValue:
        "We are committed to protecting and sustaining the environment.",
      description:
        "The line above the four pillar tiles. Defaults to the brand-standard commitment statement.",
    }),
    defineField({
      name: "pillars",
      title: "Pillars — Tiles",
      type: "array",
      group: "pillars",
      description:
        "The 4-up grid below the headline. Currently: carbon footprint, water, renewable resources, recycled materials.",
      of: [{ type: "string" }],
      initialValue: [
        "Reducing Carbon Footprint",
        "Reducing Our Water Wastage",
        "Use of Renewable Resources",
        "Use of Recycled Materials",
      ],
    }),

    /* --- Green Development ---------------------------------------- */
    defineField({
      name: "greenEyebrow",
      title: "Green Development — Eyebrow",
      type: "string",
      group: "green",
      initialValue: "Green Development",
    }),
    defineField({
      name: "greenHeadline",
      title: "Green Development — Headline",
      type: "string",
      group: "green",
      initialValue: "Building a Sustainable Tomorrow",
    }),
    defineField({
      name: "greenBody",
      title: "Green Development — Paragraphs",
      type: "array",
      group: "green",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "greenImage",
      title: "Green Development — Image",
      type: "image",
      group: "green",
      options: { hotspot: true },
      description:
        "Optional. Sits alongside the Green Development copy in a split layout. Empty → renders a tasteful placeholder so the section's two-column grid stays balanced.",
    }),
    defineField({
      name: "greenVideoUrl",
      title: "Green Development — Video URL",
      type: "string",
      group: "green",
      description:
        "Optional. Plays in the image slot when set. Path under /public or external URL.",
    }),

    /* --- SDGs ----------------------------------------------------- */
    defineField({
      name: "sdgsHeadline",
      title: "SDGs — Section Headline",
      type: "string",
      group: "sdgs",
      initialValue: "Sustainable Development Goals (SDGs)",
    }),
    defineField({
      name: "sdgsIntro",
      title: "SDGs — Intro Paragraph",
      type: "text",
      rows: 6,
      group: "sdgs",
    }),
    defineField({
      name: "sdgs",
      title: "SDGs — Cards",
      type: "array",
      group: "sdgs",
      description:
        "The numbered SDG cards. Each entry is one of the UN SDGs Pacific aligns with, plus a short paragraph describing how.",
      of: [
        {
          type: "object",
          name: "sdg",
          fields: [
            defineField({
              name: "title",
              title: "SDG Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 5,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
    }),

    /* --- Closing CTA ---------------------------------------------- */
    defineField({
      name: "ctaHeadline",
      title: "Closing CTA — Headline",
      type: "string",
      group: "cta",
      initialValue: "Let's Talk Stone",
    }),
    defineField({
      name: "ctaDescription",
      title: "Closing CTA — Description",
      type: "text",
      rows: 2,
      group: "cta",
      initialValue:
        "Talk to our team about a project, a sample request, or our sustainability programme.",
    }),
    defineField({
      name: "ctaButtonLabel",
      title: "Closing CTA — Button Label",
      type: "string",
      group: "cta",
      initialValue: "Get in Touch",
    }),
    defineField({
      name: "ctaButtonHref",
      title: "Closing CTA — Button Link",
      type: "string",
      group: "cta",
      initialValue: "/contact",
    }),
    defineField({
      name: "ctaImage",
      title: "Closing CTA — Background Image",
      type: "image",
      group: "cta",
      options: { hotspot: true },
      description:
        "Optional. Sits behind the closing CTA at low opacity for atmosphere. Empty → the CTA renders as a clean dark section.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Sustainability Page" };
    },
  },
});
