import { defineField, defineType } from "sanity";

export default defineType({
  name: "dealer",
  title: "Dealer",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Dealer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Dealer Type",
      type: "string",
      options: {
        list: [
          { title: "Showroom", value: "Showroom" },
          { title: "Fabricator", value: "Fabricator" },
          { title: "Retail", value: "Retail" },
          { title: "Distributor", value: "Distributor" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "website",
      title: "Website URL",
      type: "url",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "mapPin",
      title: "Map Pin Position",
      type: "object",
      description: "Position on the world map (percentage from top-left)",
      fields: [
        { name: "left", title: "Left %", type: "string" },
        { name: "top", title: "Top %", type: "string" },
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "city",
    },
  },
});
