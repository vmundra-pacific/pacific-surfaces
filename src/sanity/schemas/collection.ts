import { defineField, defineType } from "sanity";

export default defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Collection Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Collection Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
    defineField({
      name: "tag",
      title: "Tag / Badge",
      type: "string",
      description:
        'e.g. "Signature", "New", "Silica-Free" — shown on the homepage card',
    }),
    defineField({
      name: "headline",
      title: "Homepage Headline",
      type: "string",
      description:
        'Short headline for homepage showcase, e.g. "The Centrepiece."',
    }),
    defineField({
      name: "finishCount",
      title: "Finish Count Label",
      type: "string",
      description: 'e.g. "24 Finishes" or "Recycled Content"',
    }),
    defineField({
      name: "showcaseLayout",
      title: "Showcase Layout",
      type: "string",
      options: {
        list: [
          { title: "Wide (8 columns)", value: "wide" },
          { title: "Narrow (4 columns)", value: "narrow" },
        ],
      },
      initialValue: "narrow",
      description: "Controls card width on the homepage grid",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
});
