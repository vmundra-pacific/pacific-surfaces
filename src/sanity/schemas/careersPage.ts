import { defineField, defineType } from "sanity";

/**
 * careersPage — singleton document holding all editor-managed copy
 * for the /careers page (everything except the job openings, which
 * are their own document type).
 *
 * Setup as a singleton in the Studio sidebar (see sanity.config.ts)
 * so editors never see a list — clicking "Careers Page" opens the
 * single document directly. The component falls back to sensible
 * defaults if any field is left blank, so the page never breaks
 * during editorial migration.
 */
export default defineType({
  name: "careersPage",
  title: "Careers Page",
  type: "document",
  // Singleton — only one instance ever exists with this fixed _id.
  // The Studio config pins this document to the "Careers Page"
  // sidebar entry directly so editors never create duplicates.
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
      description:
        'The small all-caps line above the hero headline (e.g. "Careers").',
      initialValue: "Careers",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      description: "The large hero title.",
      initialValue: "An Environment That Supports Your Progress",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 4,
      description: "Paragraph below the hero headline.",
      initialValue:
        "Pacific is built on the belief that great environments help people thrive. Our products are designed to elevate spaces across the globe, creating settings that are functional, expressive, and welcoming. For our team and partners, we nurture a culture of openness and growth.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional. Static background image behind the hero copy. If a video URL is also set, the video wins.",
    }),
    defineField({
      name: "heroVideoUrl",
      title: "Hero Background Video URL",
      type: "string",
      description:
        "Optional. Path to a /public video (e.g. /videos/careers-hero.mp4) or external URL. Plays muted + looped behind the hero copy. Wins over Hero Background Image when both are set.",
      initialValue: "/videos/careers-hero.mp4",
    }),
    defineField({
      name: "values",
      title: "Why Work With Us — Values",
      type: "array",
      description:
        'The three (or more) value pillars shown below the hero. Each card has a title and a short description. Defaults to the brand-standard "A Place to Grow / A Culture That Inspires / A Future We Build Together" trio if left empty.',
      of: [
        {
          type: "object",
          name: "value",
          title: "Value",
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
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
    }),
    defineField({
      name: "openPositionsHeading",
      title: "Open Positions — Section Heading",
      type: "string",
      description:
        'Heading shown above the Job Title + Location search bar. Defaults to "Open Positions".',
      initialValue: "Open Positions",
    }),
    defineField({
      name: "openPositionsDescription",
      title: "Open Positions — Section Description",
      type: "string",
      description: "One-line description below the section heading.",
      initialValue: "Explore career opportunities across our global offices.",
    }),
    defineField({
      name: "applyHeading",
      title: "Apply Section — Heading",
      type: "string",
      description: 'Heading above the application form (e.g. "Apply Now").',
      initialValue: "Apply Now",
    }),
    defineField({
      name: "applyDescription",
      title: "Apply Section — Description",
      type: "text",
      rows: 2,
      description: "Short prompt above the form fields.",
      initialValue:
        "Send us your information and resume. We'll review your application and get back to you soon.",
    }),
    defineField({
      name: "ctaHeading",
      title: "Closing CTA — Heading",
      type: "string",
      description:
        'Heading for the closing "Don\'t see the right role?" block.',
      initialValue: "Don't see the right position?",
    }),
    defineField({
      name: "ctaDescription",
      title: "Closing CTA — Description",
      type: "text",
      rows: 2,
      initialValue:
        "Send us your resume and let us know your interest. We'd love to consider you for future opportunities.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Careers Page" };
    },
  },
});
