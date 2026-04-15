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
            S.documentTypeListItem("blogPost").title("Blog Posts"),
            S.documentTypeListItem("page").title("Pages"),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
