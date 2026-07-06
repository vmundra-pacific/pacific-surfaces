/**
 * One-time cleanup: strip "1.5 cm" thickness and "mat"/"matte" finish
 * from every product where they're present.
 *
 * Why
 * ---
 * Pacific deprecated the 1.5 cm thickness option and the matte finish.
 * Editorially, every product still listing those needs to drop them.
 * Doing this by hand in Studio across N products is tedious; this
 * script does the cleanup as a single batch pass.
 *
 * What it does
 * ------------
 *   1. Pulls every product where:
 *        - thickness array contains "1.5 cm" (any case / spacing variant), OR
 *        - finishes array contains "mat" or "matte" (any case)
 *   2. For each match, computes the cleaned arrays (removed values
 *      filtered out, original ordering preserved for the rest).
 *   3. Patches the product in place — only the changed array is set,
 *      every other field stays untouched.
 *
 * Idempotent — re-running after a successful pass touches zero
 * products because the matched values are gone.
 *
 * Usage
 * -----
 *   npm run cleanup:thickness-finish:dry      # preview, no mutation
 *   npm run cleanup:thickness-finish          # actually patch
 *
 * Auth
 * ----
 * Reads project + dataset from .env.local. SANITY_API_WRITE_TOKEN must
 * be present (Editor scope) for the patch step. --dry doesn't need it.
 */

import { createClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET — load them via `node --env-file=.env.local …` (handled by the npm script)."
  );
  process.exit(1);
}
if (!token && !DRY_RUN) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN. Create a token with Editor scope at https://sanity.io/manage and add it to .env.local. Or run with --dry to preview."
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

// Match "1.5 cm" with or without spaces, in any case.
// Examples that match: "1.5 cm", "1.5cm", "1.5 CM", "  1.5 cm  "
function isFifteenMm(value) {
  if (typeof value !== "string") return false;
  const normalised = value.trim().toLowerCase().replace(/\s+/g, "");
  return normalised === "1.5cm";
}

// Match "mat" or "matte" in any case (the schema option is "matte"
// but legacy / Wix-migrated rows may carry "mat").
function isMatteFinish(value) {
  if (typeof value !== "string") return false;
  const normalised = value.trim().toLowerCase();
  return normalised === "mat" || normalised === "matte";
}

// Pull every product. We filter client-side because GROQ array filters
// over loose strings would need exact matches; doing it in JS lets us
// catch case + whitespace variants.
const query = `
  *[_type == "product"] {
    _id,
    name,
    thickness,
    finishes
  }
`;

const products = await client.fetch(query);

console.log(`Scanning ${products.length} products…`);

let patchedCount = 0;
let scannedCount = 0;

for (const product of products) {
  scannedCount++;
  const thickness = Array.isArray(product.thickness) ? product.thickness : [];
  const finishes = Array.isArray(product.finishes) ? product.finishes : [];

  const cleanedThickness = thickness.filter((v) => !isFifteenMm(v));
  const cleanedFinishes = finishes.filter((v) => !isMatteFinish(v));

  const thicknessChanged = cleanedThickness.length !== thickness.length;
  const finishesChanged = cleanedFinishes.length !== finishes.length;

  if (!thicknessChanged && !finishesChanged) continue;

  const patch = {};
  if (thicknessChanged) patch.thickness = cleanedThickness;
  if (finishesChanged) patch.finishes = cleanedFinishes;

  console.log(
    `\n• ${product.name} (${product._id})`,
    thicknessChanged
      ? `\n    thickness: [${thickness.join(", ")}] → [${cleanedThickness.join(", ")}]`
      : "",
    finishesChanged
      ? `\n    finishes:  [${finishes.join(", ")}] → [${cleanedFinishes.join(", ")}]`
      : ""
  );

  if (DRY_RUN) {
    patchedCount++;
    continue;
  }

  await client.patch(product._id).set(patch).commit({ autoGenerateArrayKeys: true });
  patchedCount++;
}

console.log(
  `\nScanned ${scannedCount} products. ${
    DRY_RUN ? "Would patch" : "Patched"
  } ${patchedCount}.`
);

if (DRY_RUN && patchedCount > 0) {
  console.log("\nThis was a dry run. Re-run without --dry to apply the changes.");
}
