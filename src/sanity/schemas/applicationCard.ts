import { defineField, defineType } from "sanity";

export default defineType({
  name: "applicationCard",
  title: "Application Card",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'e.g. "01 · Kitchen"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "section",
      title: "Homepage Section",
      description:
        "Which of the four homepage Application sections this card's image/video should appear in. If left blank, the website will fall back to matching by label text or display order.",
      type: "string",
      options: {
        list: [
          { title: "01 · Kitchen — Countertops & Islands", value: "kitchen" },
          { title: "02 · Bath — Vanities & Shower Walls", value: "bath" },
          {
            title: "03 · Architecture — Wall Cladding & Façades",
            value: "architecture",
          },
          {
            title: "04 · Commercial — Hospitality & Healthcare",
            value: "commercial",
          },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Countertops & Islands"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Card Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "videoFile",
      title: "Card Video (Upload)",
      description:
        "Optional. Upload a video clip — MP4 or WebM, kept short (≤30s) and compressed (a few MB). When present, the section plays this video instead of the static image. Auto-loops, muted, no controls. Note: Sanity's default upload limit is 100MB; if your file is bigger, compress first or use the URL field below.",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
        storeOriginalFilename: true,
      },
    }),
    defineField({
      name: "videoUrl",
      title: "Card Video URL (advanced)",
      type: "string",
      description:
        "Alternative to the upload above. Paste a video URL — either a path under /public (e.g. /videos/kitchen.mp4) or a full external URL. Use this if you'd rather host the video yourself than upload it to Sanity. Ignored when the upload field is set.",
    }),
    /**
     * Multi-frame slideshow. Currently only consumed by the
     * Commercial homepage section, which crossfades through the
     * frames as the user scrolls. Hidden on non-Commercial cards
     * to keep their forms focused.
     *
     * If left empty, the Commercial section falls back to a single
     * source (videoFile/videoUrl/image) with subtle tinted crossfade
     * — the legacy behaviour.
     */
    defineField({
      name: "frames",
      title: "Slideshow Frames (Commercial section)",
      description:
        "Add up to 4 frames that cycle as the user scrolls past this section. Each frame can be a video upload, a video URL, or a still image, plus an optional sub-label (e.g. 'Hospitality', 'Healthcare') shown below the headline as 'Now: X'. Leave empty to use the single Card Image / Video above.",
      type: "array",
      of: [
        {
          type: "object",
          name: "frame",
          title: "Frame",
          fields: [
            defineField({
              name: "label",
              title: "Sub-Label",
              type: "string",
              description:
                'Short caption shown below the headline (e.g. "Hospitality", "Healthcare"). Optional.',
            }),
            defineField({
              name: "videoFile",
              title: "Frame Video (Upload)",
              type: "file",
              options: {
                accept: "video/mp4,video/webm,video/quicktime",
                storeOriginalFilename: true,
              },
            }),
            defineField({
              name: "videoUrl",
              title: "Frame Video URL (advanced)",
              type: "string",
              description:
                "Alternative to upload. Paste a /videos/* path or full URL.",
            }),
            defineField({
              name: "image",
              title: "Frame Image (fallback)",
              type: "image",
              options: { hotspot: true },
              description: "Used when no video is set on this frame.",
            }),
          ],
          preview: {
            select: {
              title: "label",
              media: "image",
            },
            prepare({ title, media }) {
              return {
                title: title || "Frame",
                media,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
      hidden: ({ document }) =>
        (document?.section as string | undefined) !== "commercial",
    }),
    defineField({
      name: "link",
      title: "Link URL",
      type: "string",
      description: "Internal path like /products or external URL",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "label",
      media: "image",
    },
  },
});
