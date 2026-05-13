#!/usr/bin/env node
/**
 * migrate-stone-finishes.mjs
 *
 * Replace every product currently referencing the "Stone Finishes"
 * collection in Sanity with a fresh set sourced from a local folder
 * of images.
 *
 * USAGE
 *   # Dry-run (no Sanity writes, prints exactly what would happen)
 *   node scripts/migrate-stone-finishes.mjs
 *
 *   # For real (delete + create)
 *   node scripts/migrate-stone-finishes.mjs --commit
 *
 *   # Custom source folder (default: _input/Natural Stone Finishes)
 *   node scripts/migrate-stone-finishes.mjs --src "_input/Natural Stone Finishes"
 *
 * STRUCTURE EXPECTED
 *   <src>/
 *     Bush Hammered/      <- folder name = product family name
 *       image-1.jpg       <- becomes "Bush Hammered - 01"
 *       image-2.jpg       <- becomes "Bush Hammered - 02"
 *     Honed/
 *       only.jpg          <- becomes "Honed - 01"
 *     ...
 *
 * NEW PRODUCT FIELDS SET
 *   name          = "<Family> - 01" (zero-padded for sort)
 *   slug.current  = slugified(name)
 *   visible       = true
 *   collection    = reference to existing "Stone Finishes" doc
 *   productType   = "granite-finish"  (matches schema enum)
 *   mainImage     = uploaded asset reference + alt text
 *
 * ALT TEXT
 *   Generated as: "<Family> natural stone finish, variant NN — Pacific
 *   Surfaces Facades and Finishes." Adjust ALT_TEMPLATE below to taste.
 *
 * SAFETY
 *   - Dry-run mode by default (no writes).
 *   - Backs up every product about to be deleted to
 *     scripts/_backup/stone-finishes-<timestamp>.json
 *   - Requires SANITY_API_WRITE_TOKEN in .env.local.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---------- args / config ----------

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i++;
    } else {
      args.set(key, true);
    }
  }
}

const COMMIT = args.get("commit") === true;
const SRC_DIR = path.resolve(
  ROOT,
  args.get("src") ?? "_input/Natural Stone Finishes"
);

const ALT_TEMPLATE = (family, n) =>
  `${family} natural stone finish, variant ${n} — Pacific Surfaces Facades and Finishes.`;

// ---------- env ----------

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("ERROR: .env.local not found at", envPath);
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28";
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "ERROR: missing one of NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN in .env.local"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ---------- helpers ----------

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
function isImage(file) {
  return IMAGE_EXTS.has(path.extname(file).toLowerCase());
}

// ---------- 1. find Stone Finishes collection ----------

async function findStoneFinishesCollection() {
  const docs = await client.fetch(
    `*[_type == "collection" && (name match "Stone Finish*" || name match "stone finish*")]{_id, name}`
  );
  if (docs.length === 0) {
    throw new Error('No collection named "Stone Finishes" found in Sanity.');
  }
  if (docs.length > 1) {
    console.warn(
      "WARN: multiple matching collections, using first:",
      docs.map((d) => `${d.name} (${d._id})`).join(", ")
    );
  }
  return docs[0];
}

// ---------- 2. list & back up existing products ----------

async function listExistingProducts(collectionId) {
  return client.fetch(
    `*[_type == "product" && collection._ref == $cid]{_id, name, "slug": slug.current, productType}`,
    { cid: collectionId }
  );
}

function backupProducts(products) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(
    ROOT,
    "scripts",
    "_backup",
    `stone-finishes-${ts}.json`
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(products, null, 2));
  return out;
}

// ---------- 3. walk source folder ----------

function walkSource() {
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Source folder not found: ${SRC_DIR}`);
  }
  const entries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
  const families = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folder = path.join(SRC_DIR, entry.name);
    const files = fs
      .readdirSync(folder)
      .filter(isImage)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (files.length === 0) continue;
    families.push({
      family: entry.name.trim(),
      files: files.map((f) => path.join(folder, f)),
    });
  }
  return families;
}

// ---------- 4. main ----------

async function main() {
  console.log("=".repeat(72));
  console.log(`Stone Finishes migration  [${COMMIT ? "COMMIT" : "DRY RUN"}]`);
  console.log("=".repeat(72));
  console.log("Source folder:", SRC_DIR);
  console.log("Sanity project:", projectId, "dataset:", dataset);
  console.log();

  // 1. Find collection
  const collection = await findStoneFinishesCollection();
  console.log(
    `-> Stone Finishes collection: "${collection.name}" (${collection._id})`
  );

  // 2. List existing
  const existing = await listExistingProducts(collection._id);
  console.log(`-> Existing products in this collection: ${existing.length}`);
  for (const p of existing) {
    console.log(`     - ${p.name} (${p._id})`);
  }

  if (existing.length > 0) {
    const backupPath = backupProducts(existing);
    console.log(`-> Backup written: ${backupPath}`);
  }

  // 3. Walk source
  const families = walkSource();
  console.log(`-> Source families: ${families.length}`);
  let totalNew = 0;
  for (const f of families) {
    console.log(`     - ${f.family}: ${f.files.length} image(s)`);
    totalNew += f.files.length;
  }
  console.log(`-> Total new products to create: ${totalNew}`);
  console.log();

  if (!COMMIT) {
    console.log("Dry run complete. Re-run with --commit to apply.");
    return;
  }

  // 4. Delete existing
  if (existing.length > 0) {
    console.log(`Deleting ${existing.length} existing products...`);
    const tx = client.transaction();
    for (const p of existing) tx.delete(p._id);
    await tx.commit();
    console.log("-> Deleted.");
  }

  // 5. Upload + create
  console.log(`Creating ${totalNew} new products...`);
  let created = 0;
  for (const fam of families) {
    let n = 0;
    for (const file of fam.files) {
      n++;
      const variant = pad2(n);
      const productName = `${fam.family} - ${variant}`;
      const altText = ALT_TEMPLATE(fam.family, variant);

      // Upload image asset
      const buf = fs.readFileSync(file);
      const asset = await client.assets.upload("image", buf, {
        filename: path.basename(file),
      });

      // Create product doc
      const doc = {
        _type: "product",
        name: productName,
        slug: { _type: "slug", current: slugify(productName) },
        visible: true,
        productType: "granite-finish",
        collection: { _type: "reference", _ref: collection._id },
        mainImage: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          alt: altText,
        },
      };
      const result = await client.create(doc);
      created++;
      console.log(
        `     [${created}/${totalNew}] ${productName} -> ${result._id}`
      );
    }
  }

  console.log();
  console.log(`Done. Created ${created} products under "${collection.name}".`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});
