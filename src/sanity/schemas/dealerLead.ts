import { defineField, defineType } from "sanity";

/**
 * dealerLead — one document per visitor who left their details on
 * /where-to-buy before seeing the outlets (marketing, 2026-10-26: a form
 * before dealer details, like Aquant's locator). Created by
 * /api/where-to-buy/lead with the visitor's three answers (I am a /
 * interested in / where) and the outlets they were shown first, so sales
 * can follow up. Editors touch only `status` and `notes`.
 */
export default defineType({
  name: "dealerLead",
  title: "Where to Buy Lead",
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
      name: "mobile",
      title: "Mobile",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "mobileVerified",
      title: "Mobile verified by OTP",
      description:
        "No when the lead came in before SMS verification was set up.",
      type: "boolean",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "visitorType",
      title: "I am a",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "interest",
      title: "Interested in",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "location",
      title: "Location",
      description:
        "The PIN code or area as typed, or the visitor's location (to ~1 km).",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "locationMatched",
      title: "Matched as",
      description: "What the search understood the location as.",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "geo",
      title: "Map point",
      type: "geopoint",
      readOnly: true,
    }),
    defineField({
      name: "outletsShown",
      title: "Outlets shown first",
      description: "Nearest first, as the visitor saw them.",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({
      name: "consent",
      title: "Agreed to be contacted",
      type: "boolean",
      readOnly: true,
    }),
    defineField({
      name: "consentText",
      title: "Consent wording",
      type: "text",
      rows: 2,
      readOnly: true,
    }),
    defineField({
      name: "tracking",
      title: "Ad tracking",
      description:
        "utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "referrer",
      title: "Referrer",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "pageUrl",
      title: "Page",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Triage marker — update as you follow up.",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Visited outlet", value: "visited" },
          { title: "Won", value: "won" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedDesc",
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
      who: "visitorType",
      location: "location",
      status: "status",
      date: "submittedAt",
    },
    prepare({ name, who, location, status, date }) {
      const when = date ? new Date(date).toLocaleDateString("en-GB") : "";
      return {
        title: `${name ?? "Lead"}${status ? ` [${status}]` : ""}`,
        subtitle: [who, location, when].filter(Boolean).join(" · "),
      };
    },
  },
});
