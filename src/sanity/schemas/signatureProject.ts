import { defineField, defineType } from "sanity";

export default defineType({
  name: "signatureProject",
  title: "Signature Project",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Project Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location Label",
      type: "string",
      description: 'e.g. "Villa · Mumbai" or "Hotel · Warsaw"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Project Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "link",
      title: "Link URL",
      type: "url",
      description: "Optional link to a case study or external page",
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
      subtitle: "location",
      media: "image",
    },
  },
});
