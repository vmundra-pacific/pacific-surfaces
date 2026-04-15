import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
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
      name: "visible",
      title: "Visible",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "descriptionHtml",
      title: "Description (HTML from Wix)",
      type: "text",
      description: "Original HTML description from Wix migration",
      hidden: true,
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Text",
        },
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt Text",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "object",
      fields: [
        { name: "amount", type: "number", title: "Amount" },
        {
          name: "currency",
          type: "string",
          title: "Currency",
          initialValue: "INR",
        },
      ],
    }),
    defineField({
      name: "collection",
      title: "Collection",
      type: "reference",
      to: [{ type: "collection" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      description: "e.g. 137 x 79 inches",
    }),
    defineField({
      name: "finishes",
      title: "Available Finishes",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Polished", value: "polished" },
          { title: "Matte", value: "matte" },
          { title: "Suede", value: "suede" },
          { title: "Velvet", value: "velvet" },
          { title: "Honed", value: "honed" },
          { title: "Leathered", value: "leathered" },
        ],
      },
    }),
    defineField({
      name: "thickness",
      title: "Thickness Options",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. 1.5 cm, 2 cm, 3 cm",
    }),
    defineField({
      name: "application",
      title: "Application",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Countertops", value: "countertops" },
          { title: "Island Tops", value: "island-tops" },
          { title: "Vanity Top", value: "vanity-top" },
          { title: "Wall Cladding", value: "wall-cladding" },
          { title: "Flooring", value: "flooring" },
          { title: "Backsplash", value: "backsplash" },
          { title: "Table Top", value: "table-top" },
        ],
      },
    }),
    defineField({
      name: "careAndMaintenance",
      title: "Care & Maintenance",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "ribbons",
      title: "Ribbons / Badges",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Patented", value: "Patented" },
          { title: "New Arrival", value: "New Arrival" },
          { title: "Eco Surface", value: "Eco Surface" },
          { title: "Luxury Drop", value: "Luxury Drop" },
          { title: "Top Color", value: "Top Color" },
        ],
      },
    }),
    defineField({
      name: "productType",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Quartz Slab", value: "quartz-slab" },
          { title: "Granite Slab", value: "granite-slab" },
          { title: "Quartz Sink", value: "quartz-sink" },
          { title: "Granite Finish", value: "granite-finish" },
          { title: "Semi-Precious Stone", value: "semi-precious" },
          { title: "Luxury", value: "luxury" },
        ],
      },
    }),
    defineField({
      name: "wixProductId",
      title: "Wix Product ID",
      type: "string",
      description: "Original product ID from Wix (for migration tracking)",
      readOnly: true,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      group: "seo",
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      of: [{ type: "string" }],
      group: "seo",
    }),
  ],
  groups: [
    { name: "seo", title: "SEO" },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "collection.name",
      media: "mainImage",
    },
  },
});
