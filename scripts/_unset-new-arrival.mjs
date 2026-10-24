/**
 * One-off, 2026-10-24 (owner: "Ashford, Lumina Cristal is not new
 * arrivals" / "yes" to removing the badge in Sanity). Takes "New Arrival"
 * off the ribbons of Ashford (3052) and Lumina Cristal (P28), published
 * documents and any drafts. Everything else on them is left as it is; the
 * ribbons before and after are printed for rollback.
 *
 *   node --env-file=.env.local scripts/_unset-new-arrival.mjs [--commit]
 */
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const docs = await client.fetch(
  `*[_type == "product" && (slug.current match "ashford*" || lower(slug.current) match "lumina-cristal*")]{_id, name, "slug": slug.current, ribbons}`
);
for (const d of docs) {
  const next = (d.ribbons ?? []).filter((r) => r.trim().toLowerCase() !== "new arrival");
  console.log(d._id, "|", d.name, "|", d.slug, "| before:", JSON.stringify(d.ribbons), "| after:", JSON.stringify(next));
  if (COMMIT && next.length !== (d.ribbons ?? []).length) {
    await client.patch(d._id).set({ ribbons: next }).commit();
    console.log("  patched");
  }
}
if (!COMMIT) console.log("dry run: add --commit to write");
