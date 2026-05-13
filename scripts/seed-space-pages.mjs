#!/usr/bin/env node
/**
 * scripts/seed-space-pages.mjs
 *
 * Idempotent seeder for spacePage documents — creates one stub doc
 * per slug if it doesn't already exist. Leaves existing docs untouched
 * so editor uploads are safe.
 */
import fs from "node:fs";
import { createClient } from "@sanity/client";

// Lightweight .env.local loader (no dotenv dependency)
try {
  const raw = fs.readFileSync(".env.local", "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
} catch {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const SLUGS = ["hospitality", "outdoor"];

async function main() {
  for (const slug of SLUGS) {
    const existing = await client.fetch(
      `*[_type == "spacePage" && slug == $slug][0]{_id}`,
      { slug }
    );
    if (existing?._id) {
      console.log(`OK  ${slug}  -> already exists (${existing._id})`);
      continue;
    }
    const doc = await client.create({ _type: "spacePage", slug });
    console.log(`NEW ${slug}  -> created ${doc._id}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
