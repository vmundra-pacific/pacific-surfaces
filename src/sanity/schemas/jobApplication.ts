import { defineField, defineType } from "sanity";

/**
 * jobApplication — one document per submission of the careers form.
 *
 * Created server-side by /api/careers/apply when a candidate submits.
 * The route uploads the resume to Sanity assets first, then writes
 * this document referencing the asset. All fields are server-set —
 * editors should treat them as read-only data and only update the
 * `status` and optional `notes` fields as they review.
 *
 * The status field is the lifecycle marker: new → reviewed →
 * shortlisted / rejected. Filtering the Studio list by status gives
 * the hiring team an instant inbox / triaged view.
 */
export default defineType({
  name: "jobApplication",
  title: "Job Application",
  type: "document",
  // Server creates these documents; editors should only touch
  // status / notes. Marking the data fields readOnly keeps
  // Studio honest.
  fields: [
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
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
      name: "currentLocation",
      title: "Current Location",
      type: "string",
      description:
        "City / region the candidate is currently based in. Captured separately from Address so HR can quickly see relocation/commute fit.",
      readOnly: true,
    }),
    defineField({
      name: "age",
      title: "Age",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "totalExperience",
      title: "Total Experience",
      type: "string",
      description:
        'Candidate-entered total work experience — e.g. "5 years", "Fresher", "8+ years in sales".',
      readOnly: true,
    }),
    defineField({
      name: "department",
      title: "Department of Interest",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "appliedFor",
      title: "Applied For (Role)",
      type: "string",
      description:
        "Role title the candidate was viewing when they applied. Empty when the candidate used the closing CTA / general inquiry.",
      readOnly: true,
    }),
    defineField({
      name: "resume",
      title: "Resume",
      type: "file",
      description: "PDF / Doc / Docx of the candidate's resume.",
      readOnly: true,
    }),
    defineField({
      name: "comments",
      title: "Candidate Comments / Remarks",
      type: "text",
      rows: 4,
      description:
        "Free-form text the candidate added to their application (notice period, portfolio links, preferred locations, etc.).",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Hiring lifecycle marker — update as you review.",
      options: {
        layout: "radio",
        list: [
          { title: "New", value: "new" },
          { title: "Reviewed", value: "reviewed" },
          { title: "Shortlisted", value: "shortlisted" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      rows: 4,
      description:
        "Free-form internal notes — not visible to the candidate. Use for review comments, follow-up reminders, etc.",
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
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      appliedFor: "appliedFor",
      department: "department",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({
      firstName,
      lastName,
      email,
      appliedFor,
      department,
      status,
      submittedAt,
    }) {
      const name =
        [firstName, lastName].filter(Boolean).join(" ") || email || "(no name)";
      const role = appliedFor || department || "General";
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      const statusLabel = status ? `[${status}]` : "";
      return {
        title: `${name} ${statusLabel}`.trim(),
        subtitle: [role, date].filter(Boolean).join(" · "),
      };
    },
  },
});
