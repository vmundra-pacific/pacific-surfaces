"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "@/sanity/schemas";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export default defineConfig({
  name: "pacific-surfaces",
  title: "Pacific Surfaces",
  projectId,
  dataset,
  apiVersion,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.divider(),
            S.documentTypeListItem("product").title("Products"),
            S.documentTypeListItem("collection").title("Collections"),
            S.documentTypeListItem("category").title("Categories"),
            S.divider(),
            S.documentTypeListItem("signatureProject").title(
              "Signature Projects"
            ),
            S.documentTypeListItem("applicationCard").title(
              "Application Cards"
            ),
            S.documentTypeListItem("inspirationImage").title(
              "Inspiration Gallery"
            ),
            S.documentTypeListItem("dealer").title("Dealers"),
            S.divider(),
            S.documentTypeListItem("resource").title("Resources"),
            S.divider(),
            S.listItem()
              .title("Careers Page")
              .child(
                S.document().schemaType("careersPage").documentId("careersPage")
              ),
            S.documentTypeListItem("jobOpening").title("Job Openings"),
            S.documentTypeListItem("jobApplication").title("Job Applications"),
            S.divider(),
            S.listItem()
              .title("Sustainability Page")
              .child(
                S.document()
                  .schemaType("sustainabilityPage")
                  .documentId("sustainabilityPage")
              ),
            S.listItem()
              .title("Façades and Finishes Page")
              .child(
                S.document()
                  .schemaType("facadesAndFinishesPage")
                  .documentId("facadesAndFinishesPage")
              ),
            S.divider(),
            S.documentTypeListItem("faqPage").title("FAQ Pages"),
            S.divider(),
            S.documentTypeListItem("blogPost").title("Blog Posts"),
            S.documentTypeListItem("page").title("Pages"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
