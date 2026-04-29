import { defineField, defineType } from "sanity";
import { ComputedHueField } from "../components/ComputedHueField";
import { ComputedPatternField } from "../components/ComputedPatternField";

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
      name: "roomScenes",
      title: "Room Scene Photos",
      description:
        "Lifestyle shots showing the product installed in kitchens, bathrooms, etc.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
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
      // Read-only display showing the hue(s) the catalogue would tag
      // this product with right now. Computed live from the other
      // fields by ComputedHueField; the stored value is empty and
      // ignored. Set just below the Ribbons field so editors see the
      // computed result immediately above the Hue Override input —
      // makes it obvious when an override is needed.
      name: "computedHue",
      title: "Computed Hue",
      type: "string",
      readOnly: true,
      description:
        "Live preview of how the catalogue's hue filter will tag this slab. Driven by the editor override below if set; otherwise auto-classified from the main image's dominant colour, falling back to keyword matching on the product name. Update the Hue Override field below to correct mis-tags.",
      components: {
        input: ComputedHueField,
      },
    }),
    defineField({
      name: "manualHues",
      title: "Hue Override",
      description:
        'Optional. Add one or more hues to tag this slab with. Common values: white, cream, beige, grey, dark, brown, blue, gold, pink. You can also add custom values (e.g. "lavender", "sage") — they\'ll appear as new filter chips on the catalogue once any product uses them. Hue overrides win over the auto-classified hue from the main-image colour.',
      type: "array",
      of: [{ type: "string" }],
      options: {
        // No `list` here — that lets editors type custom values
        // alongside the predefined ones. Common values are still
        // discoverable via the description above.
        layout: "tags",
      },
    }),
    defineField({
      // Live preview of the pattern bucket the catalogue's Pattern
      // filter will tag this slab with. Same pattern as the
      // Computed Hue field above — read-only, recomputed on every
      // form change. Sits directly above the Pattern Override
      // field below so editors can see the auto result and the
      // override side-by-side.
      name: "computedPattern",
      title: "Computed Pattern",
      type: "string",
      readOnly: true,
      description:
        "Live preview of how the catalogue's Pattern filter will tag this slab. Driven by the editor override below if set; otherwise auto-classified by keyword on the product / collection name. Update Pattern Override to correct mis-tags.",
      components: {
        input: ComputedPatternField,
      },
    }),
    defineField({
      name: "manualPattern",
      title: "Pattern Override",
      description:
        'Optional. Override the auto-derived Pattern classification. Common values: Marble-look, Movement, Solid, Veined. You can also type custom patterns (e.g. "Speckled", "Geometric") — they\'ll surface as a filter chip on the catalogue once any product uses them. Auto-derivation looks for keywords in the name (vein → Veined; solid/pure/stellar → Solid; movement/flow/wave → Movement; otherwise Marble-look).',
      // Plain string — no `options.list` so editors can type any
      // value, predefined or custom.
      type: "string",
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
      name: "hdFile",
      title: "HD Image File",
      description:
        "High-resolution image file architects / designers can download for proposals. Optional — if left blank, the website falls back to a mailto request.",
      type: "image",
      options: { storeOriginalFilename: true },
    }),
    defineField({
      name: "specSheet",
      title: "Spec Sheet (PDF)",
      description:
        "Downloadable spec sheet for this product. Optional — if left blank, the website falls back to a mailto request.",
      type: "file",
      options: {
        accept: "application/pdf",
        storeOriginalFilename: true,
      },
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
  groups: [{ name: "seo", title: "SEO" }],
  preview: {
    select: {
      title: "name",
      subtitle: "collection.name",
      media: "mainImage",
    },
  },
});
