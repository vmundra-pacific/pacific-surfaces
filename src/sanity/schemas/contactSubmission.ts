import { defineField, defineType } from "sanity";

/**
 * contactSubmission — one document per submission of the main contact
 * form (/contact). Server-created by /api/contact/submit. Editors
 * should only touch `status` + `notes` as they triage; the rest of
 * the fields are user-supplied and read-only by convention.
 *
 * Lives alongside `jobApplication` and `sampleRequest` under the
 * "Form Submissions" Studio group so the team has one place to look
 * for everything that came in through the site.
 */
export default defineType({
  name: "contactSubmission",
  title: "Contact Submission",
  type: "document",
  fields: [
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "role",
      title: "I am (Role)",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "application",
      title: "Application of Interest",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 5,
      readOnly: true,
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description:
        "Where the contact came from (e.g. partnership card, direct visit). Set by the API when the URL carried a ?type= param.",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Triage marker — update as you respond.",
      options: {
        layout: "radio",
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "In Discussion", value: "in-discussion" },
          { title: "Closed", value: "closed" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
    {
      title: "Status",
      name: "byStatus",
      by: [
        { field: "status", direction: "asc" },
        { field: "submittedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      role: "role",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ name, email, role, status, submittedAt }) {
      const display = name || email || "(no name)";
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      const statusLabel = status ? `[${status}]` : "";
      return {
        title: `${display} ${statusLabel}`.trim(),
        subtitle: [role, date].filter(Boolean).join(" · "),
      };
    },
  },
});
