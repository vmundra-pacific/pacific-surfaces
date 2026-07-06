import { defineField, defineType } from "sanity";

/**
 * newsletterSubscriber — one document per footer newsletter signup.
 * Server-created by /api/newsletter/subscribe. Lives under "Form
 * Submissions → Newsletter Subscribers" in Studio.
 *
 * `email` is indexed unique-ish by convention — the API checks for an
 * existing doc with the same email before creating a new one, so the
 * doc list represents distinct subscribers rather than a log of
 * resubmission attempts.
 */
export default defineType({
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    defineField({
      name: "submittedAt",
      title: "Subscribed At",
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
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Subscribed", value: "subscribed" },
          { title: "Unsubscribed", value: "unsubscribed" },
        ],
      },
      initialValue: "subscribed",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      firstName: "firstName",
      email: "email",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ firstName, email, status, submittedAt }) {
      const display = email || firstName || "(no email)";
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      const statusLabel = status === "unsubscribed" ? "[unsubscribed]" : "";
      return {
        title: `${display} ${statusLabel}`.trim(),
        subtitle: [firstName, date].filter(Boolean).join(" · "),
      };
    },
  },
});
