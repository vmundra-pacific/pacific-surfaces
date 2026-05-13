import { defineField, defineType } from "sanity";

/**
 * FAQ document — one per page key (quartz, granites, sustainability,
 * about, etc.). When present, overrides the hardcoded defaults in
 * src/lib/faqs.ts. When missing, the page renders the hardcoded set.
 *
 * Editors create one document per page they want to override; they
 * pick the page from the `pageKey` dropdown.
 */
export default defineType({
  name: "faqPage",
  title: "FAQ Page",
  type: "document",
  fields: [
    defineField({
      name: "pageKey",
      title: "Page",
      type: "string",
      description:
        "Which page these FAQs belong to. Each pageKey can only be used once.",
      options: {
        list: [
          { title: "Quartz Surfaces", value: "quartz" },
          { title: "Granites", value: "granites" },
          { title: "Semi-Precious Stones", value: "semi-precious" },
          { title: "Exotic Collection", value: "exotic" },
          { title: "Integra Sinks", value: "integra" },
          { title: "Centrepiece Couture", value: "centrepiece-couture" },
          {
            title: "Beyond Finish",
            value: "facades-and-finishes",
          },
          { title: "Sustainability", value: "sustainability" },
          { title: "About", value: "about" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "questions",
      title: "Questions & Answers",
      type: "array",
      of: [
        {
          type: "object",
          name: "qa",
          fields: [
            defineField({
              name: "q",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required().min(5),
            }),
            defineField({
              name: "a",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required().min(20),
            }),
          ],
          preview: {
            select: { title: "q", subtitle: "a" },
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "pageKey", subtitle: "questions" },
    prepare({ title, subtitle }) {
      const count = Array.isArray(subtitle) ? subtitle.length : 0;
      return {
        title: `FAQ — ${title || "(no page)"}`,
        subtitle: `${count} question${count === 1 ? "" : "s"}`,
      };
    },
  },
});
