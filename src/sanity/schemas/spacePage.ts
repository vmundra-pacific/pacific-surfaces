import { defineField, defineType } from "sanity";

/**
 * spacePage — one document per per-space landing page (/spaces/kitchens,
 * /spaces/bathrooms, /spaces/architecture, /spaces/commercial,
 * /spaces/hospitality, /spaces/outdoor). The page's copy (eyebrows,
 * headlines, body, CTA labels and hrefs) is hardcoded in the page.tsx
 * files because that copy is treated as brand structure rather than
 * editorial. THIS schema lets editors upload the four section images
 * per space without touching code.
 *
 * Editor flow:
 *   1. /studio → Space Pages → +Add → pick the space.
 *   2. Upload Section 1–4 images in order.
 *   3. Publish.
 *
 * The /spaces/<slug>/page.tsx route fetches `spacePage` by slug at
 * render time. If a doc doesn't exist or a section image is empty,
 * the page falls back to the gradient placeholder block.
 */
export default defineType({
  name: "spacePage",
  title: "Space Page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Space",
      type: "string",
      options: {
        list: [
          { title: "Kitchens", value: "kitchens" },
          { title: "Bathrooms", value: "bathrooms" },
          { title: "Architecture", value: "architecture" },
          { title: "Commercial", value: "commercial" },
          { title: "Hospitality", value: "hospitality" },
          { title: "Outdoor & Wet Areas", value: "outdoor" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      description:
        "Pick which /spaces/<slug> page this document configures. One document per space.",
    }),
    defineField({
      name: "section1Image",
      title: "Section 1 Image",
      type: "image",
      options: { hotspot: true },
      description:
        "First feature section. Kitchens=Quartz Worktops · Bathrooms=Vanity Tops · Architecture=Façades · Commercial=Reception & Bar Tops · Hospitality=Bar Tops & Service Counters · Outdoor=Pool Surrounds.",
    }),
    defineField({
      name: "section2Image",
      title: "Section 2 Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Second feature section. Kitchens=Granite Islands · Bathrooms=Wall Cladding · Architecture=Large-format Quartz · Commercial=Hospitality Surfaces · Hospitality=Reception & Front-of-House · Outdoor=Outdoor Kitchens.",
    }),
    defineField({
      name: "section3Image",
      title: "Section 3 Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Third feature section. Kitchens=Integra Sinks · Bathrooms=Integra Basins · Architecture=Feature Walls · Commercial=Granite Counters · Hospitality=Guestroom Bathrooms · Outdoor=Terraces & Cladding.",
    }),
    defineField({
      name: "section4Image",
      title: "Section 4 Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Fourth feature section. Kitchens=Splashbacks & Cladding · Bathrooms=Shower Trays · Architecture=Granite Cladding · Commercial=Statement Surfaces · Hospitality=Restaurant Feature Walls · Outdoor=Wet Rooms & Spa.",
    }),
  ],
  preview: {
    select: { slug: "slug", media: "section1Image" },
    prepare({ slug, media }) {
      const titles: Record<string, string> = {
        kitchens: "Kitchens",
        bathrooms: "Bathrooms",
        architecture: "Architecture",
        commercial: "Commercial",
        hospitality: "Hospitality",
        outdoor: "Outdoor & Wet Areas",
      };
      return {
        title: `Space — ${titles[slug as string] ?? "Unconfigured"}`,
        subtitle: slug ? `/spaces/${slug}` : "Pick a space",
        media,
      };
    },
  },
});
