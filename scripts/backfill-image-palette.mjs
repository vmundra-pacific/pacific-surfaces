/**
 * One-time backfill: compute and store a dominant colour on every
 * Sanity image asset referenced by a product mainImage that doesn't
 * already have palette metadata.
 *
 * Why this exists
 * ---------------
 * Sanity auto-computes a colour palette for every NEW upload, but
 * older assets (uploaded before metadata extraction was enabled, or
 * imported via dataset migration) have an empty `metadata.palette`.
 * The catalogue's hue filter classifies products by that palette, so
 * legacy assets fall through to a fragile name-keyword fallback.
 *
 * This script:
 *   1. Finds every product with a mainImage whose asset is missing
 *      `metadata.palette.dominant.background`.
 *   2. For each unique asset, downloads a small (64×64) PNG from the
 *      Sanity CDN.
 *   3. Resizes it to 1×1 with sharp — which uses Lanczos to produce
 *      a perceptually-meaningful average pixel — and reads the RGB.
 *   4. Patches the asset document in place: sets only the missing
 *      palette field, leaves dimensions / lqip / etc. untouched.
 *
 * Idempotent — re-running only touches assets that still don't have
 * palette metadata. Safe to abort and resume.
 *
 * Usage
 * -----
 *   1. Ensure devDeps installed:
 *        npm install --save-dev sharp
 *   2. Add a write-scope API token to .env.local:
 *        SANITY_API_WRITE_TOKEN=sk...   (create at sanity.io/manage)
 *   3. Run:
 *        npm run backfill:palette
 *
 * Dry run: pass `--dry` to log what *would* be patched without
 * actually mutating Sanity.
 */

import { createClient } from "@sanity/client";
import sharp from "sharp";

const DRY_RUN = process.argv.includes("--dry");
// --force recomputes and overwrites palette metadata for EVERY product
// mainImage, even if the asset already has a `dominant.background`
// field. Use when Sanity's auto-extracted palette is wrong and you
// want our 1×1 average to take over.
const FORCE = process.argv.includes("--force");

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

// One round-trip pulls every product mainImage's asset id, the
// public CDN URL, and a flag for whether palette is already present.
const query = `
  *[_type == "product" && defined(mainImage.asset)] {
    _id,
    name,
    "assetId": mainImage.asset._ref,
    "assetUrl": mainImage.asset->url,
    "hasPalette": defined(mainImage.asset->metadata.palette.dominant.background),
    "existingMetadata": mainImage.asset->metadata
  }
`;

const products = await client.fetch(query);
const targets = FORCE ? products : products.filter((p) => !p.hasPalette);

console.log(
  `Found ${products.length} products with mainImage. ${targets.length} ${FORCE ? "to overwrite (force mode)" : "need backfill"}${DRY_RUN ? " (dry run)" : ""}.`
);

// Multiple products can share an asset (rare, but possible). De-dup
// by asset id so we don't re-download or re-patch.
const byAsset = new Map();
for (const p of targets) {
  if (!byAsset.has(p.assetId)) byAsset.set(p.assetId, p);
}
const uniqueAssets = [...byAsset.values()];

console.log(`Unique assets to process: ${uniqueAssets.length}\n`);

let done = 0;
let failed = 0;

for (const p of uniqueAssets) {
  const label = `[${done + failed + 1}/${uniqueAssets.length}] ${p.name}`;
  try {
    // 64×64 PNG — small enough to download fast, large enough that
    // the 1×1 downsample is stable across re-runs.
    const url = `${p.assetUrl}?w=64&h=64&fit=crop&fm=png`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ✗ ${label} — HTTP ${res.status}`);
      failed++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());

    // Lanczos-resampled 1×1 → average colour. Force 3-channel RGB
    // so we always get exactly 3 bytes back regardless of source
    // colourspace.
    const px = await sharp(buf)
      .resize(1, 1, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer();
    const [r, g, b] = px;
    const hex =
      "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

    if (DRY_RUN) {
      console.log(`  • ${label} → ${hex}  (would patch)`);
      done++;
      continue;
    }

    // Read-modify-write so we don't clobber other metadata fields
    // (dimensions, lqip, exif). We only insert/extend palette.dominant.
    const existing = p.existingMetadata ?? {};
    const nextMetadata = {
      ...existing,
      palette: {
        ...(existing.palette ?? {}),
        dominant: {
          ...(existing.palette?.dominant ?? {}),
          background: hex,
        },
      },
    };

    await client.patch(p.assetId).set({ metadata: nextMetadata }).commit();
    console.log(`  ✓ ${label} → ${hex}`);
    done++;
  } catch (err) {
    console.warn(`  ✗ ${label} — ${err?.message ?? err}`);
    failed++;
  }
}

console.log(
  `\nDone. ${done} patched, ${failed} failed${DRY_RUN ? " (dry run — no writes)" : ""}.`
);
