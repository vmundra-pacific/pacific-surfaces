import { defineField, defineType } from "sanity";

export default defineType({
  name: "inspirationImage",
  title: "Inspiration Image",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Caption",
      type: "string",
      description: 'e.g. "Calacatta · Kitchen Island"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Kitchens", value: "Kitchens" },
          { title: "Baths", value: "Baths" },
          { title: "Floors & Walls", value: "Floors & Walls" },
          { title: "Commercial", value: "Commercial" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "product",
      title: "Featured Product",
      type: "reference",
      to: [{ type: "product" }],
      description: "Link to the product shown in this image",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category",
      media: "image",
    },
  },
});
