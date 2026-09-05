import { defineField, defineType } from "sanity";

/**
 * orderRequest — one document per order placed through the store.
 *
 * There is no payment step: the customer builds a cart, submits their
 * details, and the team contacts them to confirm quantities, freight
 * and price. This document is the record of that request, and the
 * email sent at the same time is the prompt to act on it.
 *
 * Server-created by /api/order/submit. Sits with contactSubmission,
 * sampleRequest and jobApplication under "Form Submissions".
 */
export default defineType({
  name: "orderRequest",
  title: "Order Request",
  type: "document",
  fields: [
    defineField({
      name: "reference",
      title: "Reference",
      type: "string",
      description:
        "Short code quoted to the customer on the confirmation screen.",
      readOnly: true,
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Quoted", value: "quoted" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "new",
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
      name: "company",
      title: "Company",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customerType",
      title: "Customer Type",
      type: "string",
      options: {
        list: [
          { title: "Home owner", value: "homeowner" },
          { title: "Professional", value: "professional" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "address",
      title: "Delivery Address",
      type: "text",
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          name: "orderLine",
          fields: [
            { name: "name", title: "Product", type: "string" },
            { name: "slug", title: "Slug", type: "string" },
            { name: "collection", title: "Collection", type: "string" },
            {
              name: "colour",
              title: "Colour",
              type: "string",
              description: "The Pacific design the piece is made from.",
            },
            {
              name: "length",
              title: "Length (in)",
              type: "string",
              description:
                "A standard size, or a value the customer typed for a piece cut to order.",
            },
            { name: "width", title: "Width (in)", type: "string" },
            { name: "height", title: "Height (in)", type: "string" },
            { name: "basins", title: "Number of basins", type: "string" },
            { name: "finish", title: "Finish", type: "string" },
            { name: "quantity", title: "Quantity", type: "number" },
          ],
          preview: {
            select: {
              title: "name",
              quantity: "quantity",
              colour: "colour",
              length: "length",
              width: "width",
              height: "height",
              basins: "basins",
              finish: "finish",
            },
            prepare({
              title,
              quantity,
              colour,
              length,
              width,
              height,
              basins,
              finish,
            }) {
              const size = [length, width, height].filter(Boolean).join(" x ");
              const options = [
                colour,
                size ? `${size} in` : null,
                basins ? `${basins} basin${basins === "1" ? "" : "s"}` : null,
                finish,
              ]
                .filter(Boolean)
                .join(" · ");
              return {
                title: `${quantity ?? 1} × ${title ?? "Product"}`,
                subtitle: options || undefined,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "totalPieces",
      title: "Total Pieces",
      type: "number",
      readOnly: true,
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
      name: "name",
      reference: "reference",
      pieces: "totalPieces",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ name, reference, pieces, status, submittedAt }) {
      const when = submittedAt
        ? new Date(submittedAt).toLocaleDateString()
        : "";
      return {
        title: `${reference ?? "Order"} — ${name ?? "Unknown"}`,
        subtitle: [
          `${pieces ?? 0} piece${pieces === 1 ? "" : "s"}`,
          status ?? "new",
          when,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
