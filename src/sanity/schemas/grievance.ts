import { defineField, defineType } from "sanity";

export default defineType({
  name: "grievance",
  title: "Grievances",
  type: "document",

  fields: [
    defineField({
      name: "ticketId",
      title: "Ticket ID",
      type: "string",
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: "customer",
      title: "Customer",
      type: "reference",
      to: [{ type: "customer" }],
    }),

    defineField({
      name: "subject",
      title: "Subject",
      type: "string",
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Product Quality",
          "Delivery",
          "Installation",
          "Service",
          "Billing",
          "Warranty",
          "Other",
        ],
      },
    }),

    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          "Low",
          "Medium",
          "High",
          "Critical",
        ],
      },
      initialValue: "Medium",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
    }),

    defineField({
      name: "attachments",
      title: "Attachments",
      type: "array",
      of: [
        {
          type: "image",
        },
      ],
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "Open",
      options: {
        list: [
          "Open",
          "In Progress",
          "Waiting for Customer",
          "Resolved",
          "Closed",
        ],
      },
    }),

    defineField({
      name: "adminReply",
      title: "Admin Reply",
      type: "text",
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});