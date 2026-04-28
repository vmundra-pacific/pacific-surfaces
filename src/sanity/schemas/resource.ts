import { defineField, defineType } from "sanity";

/**
 * Resource — downloadable PDF asset (catalogs, palettes, technical
 * sheets, fabrication manuals, etc.) shown on the /resources page.
 *
 * Editors create one Resource per downloadable file, pick a category
 * to control which section it lands in on the page, optionally set a
 * cover thumbnail, and toggle `visible` to publish/unpublish without
 * deleting. The resources page sorts by `category` then `order` so
 * editors can reorder within a section without renaming things.
 */
export default defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "Shown as the card heading. e.g. 'Quartz Color Palette'.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "Which section the card appears under on the /resources page. New categories automatically get their own section once at least one resource is published with that category.",
      type: "string",
      options: {
        list: [
          { title: "Quartz Curations", value: "quartz" },
          { title: "Indian Edition", value: "indian" },
          { title: "Granite Curations", value: "granite" },
          { title: "Semi-Precious & Exotic", value: "semiprecious" },
          { title: "Sinks (Integra)", value: "sinks" },
          { title: "Ecosurfaces", value: "ecosurfaces" },
          { title: "Cut-to-Size & Architectural", value: "cuttosize" },
          { title: "Technical Details", value: "technical" },
          { title: "Care & Maintenance", value: "care" },
          { title: "Sustainability", value: "sustainability" },
          { title: "Brand & Marketing", value: "brand" },
          { title: "Fabrication Guides", value: "fabrication" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional short blurb shown under the title on the card.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "thumbnail",
      title: "Cover Thumbnail",
      description:
        "Optional preview image shown on the card. Leave blank to fall back to the file-icon style.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pdfFile",
      title: "PDF File",
      description: "The downloadable document.",
      type: "file",
      options: {
        accept: "application/pdf",
        storeOriginalFilename: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      description:
        "Lower numbers appear first within the same category. Leave blank for default ordering.",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "visible",
      title: "Visible",
      description:
        "Untick to hide this resource without deleting it. Useful for drafts.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Category, then Order",
      name: "categoryOrder",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "thumbnail",
    },
  },
});
