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
      name: "videoFile",
      title: "Project Video (Upload)",
      description:
        "Optional. Upload a short looping clip — MP4 or WebM, kept tight (≤15s) and compressed (a few MB). When present, the project card plays this video instead of the static image. Auto-loops, muted, no controls. Sanity's default upload limit is 100MB.",
      type: "file",
      options: {
        accept: "video/mp4,video/webm,video/quicktime",
        storeOriginalFilename: true,
      },
    }),
    defineField({
      name: "videoUrl",
      title: "Project Video URL (advanced)",
      type: "string",
      description:
        "Alternative to the upload above. Paste a video URL — either a path under /public (e.g. /videos/malabar.mp4) or a full external URL. Use this if you'd rather host the video yourself than upload it to Sanity. Ignored when the upload field is set.",
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
