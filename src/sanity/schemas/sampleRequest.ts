import { defineField, defineType } from "sanity";

/**
 * sampleRequest — one document per OrderSampleModal submission. The
 * same modal handles two flows distinguished by `mode`:
 *   - "sample"  → user wants a physical sample (address required)
 *   - "enquire" → user is asking a question (message required, no
 *                 address needed)
 *
 * Server-created by /api/sample-request/submit. Lives alongside
 * `contactSubmission` and `jobApplication` under the "Form
 * Submissions" Studio group.
 */
export default defineType({
  name: "sampleRequest",
  title: "Sample Request / Enquiry",
  type: "document",
  fields: [
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "mode",
      title: "Mode",
      type: "string",
      options: {
        list: [
          { title: "Sample Request", value: "sample" },
          { title: "Enquiry", value: "enquire" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "productName",
      title: "Product Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "productCategory",
      title: "Product Category",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Customer Name",
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
      name: "projectType",
      title: "Project Type",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "text",
      rows: 2,
      description: "Only collected for sample-mode submissions.",
      readOnly: true,
    }),
    defineField({
      name: "notes",
      title: "Notes / Message",
      type: "text",
      rows: 5,
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Triage marker — update as you process.",
      options: {
        layout: "radio",
        list: [
          { title: "New", value: "new" },
          { title: "Shipped", value: "shipped" },
          { title: "Responded", value: "responded" },
          { title: "Closed", value: "closed" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "internalNotes",
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
      title: "By Mode",
      name: "byMode",
      by: [
        { field: "mode", direction: "asc" },
        { field: "submittedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      name: "name",
      email: "email",
      mode: "mode",
      productName: "productName",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ name, email, mode, productName, status, submittedAt }) {
      const display = name || email || "(no name)";
      const modeLabel = mode === "enquire" ? "Enquiry" : "Sample";
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
        subtitle: [modeLabel, productName, date].filter(Boolean).join(" · "),
      };
    },
  },
});
