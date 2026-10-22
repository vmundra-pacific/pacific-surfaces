import { defineField, defineType } from "sanity";

/**
 * sillsEnquiry — one document per quote request from the Window Sills &
 * Thresholds landing page (owner, 2026-10-22: a separate form for the
 * page the ads run to, so every lead is known to be for sills). Created
 * by /api/sills-enquiry; it records which button opened the form and the
 * ad's tracking tags. Editors touch only `status` and `notes`.
 */
export default defineType({
  name: "sillsEnquiry",
  title: "Window Sill Enquiry",
  type: "document",
  fields: [
    defineField({ name: "submittedAt", title: "Submitted At", type: "datetime", readOnly: true }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({ name: "company", title: "Company", type: "string", readOnly: true }),
    defineField({ name: "location", title: "Country / city", type: "string", readOnly: true }),
    defineField({ name: "role", title: "I am", type: "string", readOnly: true }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({ name: "material", title: "Material", type: "string", readOnly: true }),
    defineField({ name: "quantity", title: "Quantity", type: "string", readOnly: true }),
    defineField({ name: "message", title: "Message", type: "text", rows: 5, readOnly: true }),
    defineField({
      name: "openedFrom",
      title: "Opened from",
      description: "The button that opened the form: hero, floating, plan, direct link.",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "tracking",
      title: "Ad tracking",
      description: "utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "referrer", title: "Referrer", type: "string", readOnly: true }),
    defineField({ name: "pageUrl", title: "Page", type: "string", readOnly: true }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Quoted", value: "quoted" },
          { title: "Won", value: "won" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({ name: "notes", title: "Internal notes", type: "text", rows: 4 }),
  ],
  orderings: [
    { title: "Newest first", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", location: "location", status: "status", date: "submittedAt", tracking: "tracking" },
    prepare({ name, location, status, date, tracking }) {
      const when = date ? new Date(date).toLocaleDateString("en-GB") : "";
      const camp = /utm_campaign=([^\s]+)/.exec(tracking ?? "")?.[1];
      return {
        title: name ?? "Enquiry",
        subtitle: [location, when, status, camp ? `ad: ${camp}` : null].filter(Boolean).join(" · "),
      };
    },
  },
});
