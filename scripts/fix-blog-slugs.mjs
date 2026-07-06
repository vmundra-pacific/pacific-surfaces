/**
 * One-time cleanup: regenerate URL-safe slugs for every blog post
 * whose stored slug isn't already URL-safe.
 *
 * Why
 * ---
 * Sanity's slug field auto-sources from the title via a "Generate"
 * button, but if an editor types a slug manually (or imports posts
 * from another CMS), the slug.current may keep raw spaces, colons,
 * apostrophes, parens — characters Next.js URL routing can't match
 * against, producing 404s on `/blog/<slug>`.
 *
 * What it does
 * ------------
 *   1. Pulls every blogPost _id, title, and current slug.
 *   2. Slugifies the title into a URL-safe form:
 *        - lowercase
 *        - non-alphanumerics → hyphens
 *        - collapse consecutive hyphens
 *        - trim leading/trailing hyphens
 *   3. If the existing slug already matches the slugified title,
 *      leaves the post alone.
 *   4. Otherwise patches `slug.current` on the document. The slug
 *      field's `_type` ("slug") is preserved.
 *
 * Idempotent — re-running after a successful pass touches zero
 * posts because every slug already matches its slugified title.
 *
 * Usage
 * -----
 *   npm run fix:blog-slugs:dry   # preview every change, no mutation
 *   npm run fix:blog-slugs       # actually patch
 */

import { createClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET — load via `node --env-file=.env.local …`."
  );
  process.exit(1);
}
if (!token && !DRY_RUN) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN. Create one at sanity.io/manage and add it to .env.local. Or pass --dry to preview."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-28",
  useCdn: false,
  token,
});

/**
 * Generate a URL-safe slug from a title. Mirrors the algorithm
 * Sanity Studio uses internally (and most CMSs):
 *   - normalise to NFKD + strip diacritics so accented characters
 *     map to plain ASCII (e.g. "café" → "cafe")
 *   - lowercase
 *   - replace any run of non [a-z0-9] characters with a single hyphen
 *   - trim hyphens from the ends
 */
function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96); // match Sanity's maxLength
}

const query = `
  *[_type == "blogPost"] {
    _id,
    title,
    slug
  }
`;

const posts = await client.fetch(query);
console.log(`Scanning ${posts.length} blog posts…`);

let patched = 0;
let scanned = 0;

for (const post of posts) {
  scanned++;
  const currentSlug = post.slug?.current ?? "";
  const desiredSlug = slugify(post.title || "");
  if (!desiredSlug) {
    console.log(`\n• "${post.title}" (${post._id}) — empty slug computed; SKIP`);
    continue;
  }
  if (currentSlug === desiredSlug) continue;

  console.log(`\n• "${post.title}" (${post._id})`);
  console.log(`    "${currentSlug}" → "${desiredSlug}"`);

  if (DRY_RUN) {
    patched++;
    continue;
  }
  await client
    .patch(post._id)
    .set({ slug: { _type: "slug", current: desiredSlug } })
    .commit();
  patched++;
}

console.log(
  `\nScanned ${scanned} posts. ${DRY_RUN ? "Would patch" : "Patched"} ${patched}.`
);
if (DRY_RUN && patched > 0) {
  console.log("\nDry run only — re-run without --dry to apply the changes.");
}
