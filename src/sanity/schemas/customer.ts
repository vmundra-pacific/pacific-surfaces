import { defineField, defineType } from "sanity";

export default defineType({
  name: "customer",
  title: "Customer",
  type: "document",

  // Keeps passwordHash out of the main form body, tucked into a
  // collapsed "Security" group — it still needs to be settable here
  // when onboarding a customer manually (paste the output of
  // `scripts/hash-password.ts`), but it shouldn't be the first thing
  // an editor sees or casually edits.
  groups: [{ name: "security", title: "Security" }],

  fields: [
    defineField({
      name: "name",
      title: "Customer Name",
      type: "string",
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: Rule => Rule.required().email(),
    }),

    defineField({
      name: "passwordHash",
      title: "Password Hash",
      type: "string",
      group: "security",
      description:
        "Bcrypt hash only — never a plaintext password. Generate one with `npx tsx scripts/hash-password.ts <password>` and paste the result here. Never share this value.",
    }),

    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),

    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),

    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});