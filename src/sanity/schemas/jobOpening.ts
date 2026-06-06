import { defineField, defineType } from "sanity";

/**
 * jobOpening — one document per open role on the careers page.
 *
 * Each opening becomes an entry in the Job Title + Location dropdown
 * search on /careers. When a candidate selects matching values and
 * hits GO, this document's title / location / department / description
 * fields drive the result card. Unpublished or `visible: false`
 * documents are filtered out by the page's GROQ query, so removing
 * a role is a one-click toggle.
 *
 * applyEmail is optional — when set, it overrides the global careers
 * inbox for applications routed to this specific role. Useful when
 * a regional office wants its own intake.
 */
export default defineType({
  name: "jobOpening",
  title: "Job Opening",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Role Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description:
        'e.g. "Bangalore", "North America", "Hosur, Tamil Nadu". Used to populate the Location dropdown — matching values across multiple roles will collapse to a single dropdown option.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      description:
        'e.g. "Sales", "Marketing", "Finance". Shown as a tag on the role card.',
      options: {
        list: [
          { title: "Sales", value: "Sales" },
          { title: "Marketing", value: "Marketing" },
          { title: "Digital Marketing", value: "Digital Marketing" },
          { title: "Events / Marketing", value: "Events/Marketing" },
          { title: "Finance", value: "Finance" },
          { title: "Operations", value: "Operations" },
          { title: "Procurement", value: "Procurement" },
          { title: "Architecture & Design", value: "Architecture & Design" },
          { title: "Design / Creative", value: "Design/Creative" },
          { title: "Business Development", value: "Business Development" },
          { title: "Human Resources", value: "Human Resources" },
          { title: "Other", value: "Other" },
        ],
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
      description:
        "2-4 sentence summary shown on the role card. Keep it scannable — candidates use it to decide whether to apply.",
      validation: (Rule) => Rule.required().min(40),
    }),
    defineField({
      name: "experience",
      title: "Experience Required",
      type: "string",
      description:
        'Short phrase shown as a tag on the role card. Examples: "10+ years", "7+ years", "2+ years", "Fresher with MBA".',
    }),
    defineField({
      name: "responsibilities",
      title: "Key Responsibilities",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Bullet points shown on the role card under the description. Each entry is one bullet — keep them short and action-led (e.g. \"Drive city-level revenue across dealer + architect channels\").",
    }),
    defineField({
      name: "applyEmail",
      title: "Application Inbox (override)",
      type: "string",
      description:
        "Optional. Email address that should receive applications for this specific role. If left blank, applications go to the global CAREERS_INBOX_EMAIL set in environment variables.",
      validation: (Rule) => Rule.email().error("Must be a valid email address"),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description:
        "Lower numbers appear first in the dropdowns and result list. Use 0–9 for top-priority roles, 10+ for the rest. Leave blank to fall back to alphabetical title order.",
    }),
    defineField({
      name: "visible",
      title: "Visible on Careers Page",
      type: "boolean",
      description:
        "Toggle off to remove from the public careers page without deleting the document. Useful for paused / filled roles.",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "location",
      department: "department",
      visible: "visible",
    },
    prepare({ title, subtitle, department, visible }) {
      const parts: string[] = [];
      if (subtitle) parts.push(subtitle);
      if (department) parts.push(department);
      return {
        title: visible === false ? `${title} (hidden)` : title,
        subtitle: parts.join(" · "),
      };
    },
  },
});
