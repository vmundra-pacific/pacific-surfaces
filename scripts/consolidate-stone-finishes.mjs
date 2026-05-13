#!/usr/bin/env node
/**
 * consolidate-stone-finishes.mjs
 *
 * Replaces the 54 variant-level "Stone Finishes" products (one per
 * image, "<Family> - 01", "<Family> - 02"...) with 19 family-level
 * products, each carrying the full set of images: first image as
 * mainImage, the rest in the gallery. Each image (main + gallery)
 * gets its own descriptive alt text.
 *
 * Resumable: progress for the create phase is persisted to
 * scripts/_state/consolidate-stone-finishes.json. The delete phase
 * runs in a single transaction (fast) and re-runs are idempotent.
 *
 * Usage:
 *   node scripts/consolidate-stone-finishes.mjs           # process all remaining
 *   node scripts/consolidate-stone-finishes.mjs --limit 3 # next 3 families
 *   node scripts/consolidate-stone-finishes.mjs --reset   # clear state
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i++;
    } else args.set(key, true);
  }
}
const LIMIT = args.has("limit") ? Number(args.get("limit")) : Infinity;
const RESET = args.get("reset") === true;

const SRC_DIR = path.resolve(ROOT, "_input/Natural Stone Finishes");
const STATE_FILE = path.join(
  ROOT,
  "scripts",
  "_state",
  "consolidate-stone-finishes.json"
);

// Alt-text templates. Main shot is the canonical view; gallery shots
// are additional angles / variants of the same finish.
const ALT_MAIN = (family) =>
  `${family} natural stone finish — Pacific Surfaces Facades and Finishes.`;
const ALT_GALLERY = (family, n) =>
  `${family} natural stone finish, view ${n} — Pacific Surfaces Facades and Finishes.`;

function loadEnv() {
  const env = {};
  for (const l of fs
    .readFileSync(path.join(ROOT, ".env.local"), "utf-8")
    .split(/\r?\n/)) {
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i < 0) continue;
    let v = l.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[l.slice(0, i).trim()] = v;
  }
  return env;
}
const env = loadEnv();

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk() {
  const out = [];
  for (const ent of fs.readdirSync(SRC_DIR, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const dir = path.join(SRC_DIR, ent.name);
    const files = fs
      .readdirSync(dir)
      .filter((f) => IMG.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => path.join(dir, f));
    if (files.length === 0) continue;
    out.push({ family: ent.name.trim(), files });
  }
  return out;
}

function loadState() {
  if (RESET || !fs.existsSync(STATE_FILE)) return { phase: "delete", done: [] };
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
}
function saveState(s) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

async function main() {
  const [col] = await client.fetch(
    `*[_type=="collection" && (name match "Stone Finish*" || name match "stone finish*")]{_id, name}`
  );
  if (!col) throw new Error("Stone Finishes collection not found");

  const state = loadState();

  // Phase 1: delete every product currently under the collection.
  // Single transaction, idempotent (re-runs are no-ops once cleared).
  if (state.phase === "delete") {
    const existing = await client.fetch(
      `*[_type=="product" && collection._ref==$cid]{_id, name}`,
      { cid: col._id }
    );
    console.log(`Deleting ${existing.length} existing products...`);
    if (existing.length > 0) {
      const tx = client.transaction();
      for (const p of existing) tx.delete(p._id);
      await tx.commit();
    }
    state.phase = "create";
    state.done = [];
    saveState(state);
    console.log("-> Delete phase done.");
  }

  // Phase 2: create one product per family, with gallery.
  const plan = walk();
  const remaining = plan.filter((p) => !state.done.includes(p.family));
  console.log(
    `Families total: ${plan.length}, done: ${state.done.length}, remaining: ${remaining.length}`
  );

  let processed = 0;
  for (const fam of remaining) {
    if (processed >= LIMIT) break;

    // Upload main image (first file)
    const mainBuf = fs.readFileSync(fam.files[0]);
    const mainAsset = await client.assets.upload("image", mainBuf, {
      filename: path.basename(fam.files[0]),
    });

    // Upload gallery images (remaining files)
    const galleryEntries = [];
    for (let i = 1; i < fam.files.length; i++) {
      const buf = fs.readFileSync(fam.files[i]);
      const asset = await client.assets.upload("image", buf, {
        filename: path.basename(fam.files[i]),
      });
      galleryEntries.push({
        _key: `gallery-${pad2(i)}-${asset._id.slice(0, 8)}`,
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: ALT_GALLERY(fam.family, pad2(i + 1)),
      });
    }

    const doc = {
      _type: "product",
      name: fam.family,
      slug: { _type: "slug", current: slugify(fam.family) },
      visible: true,
      productType: "granite-finish",
      collection: { _type: "reference", _ref: col._id },
      mainImage: {
        _type: "image",
        asset: { _type: "reference", _ref: mainAsset._id },
        alt: ALT_MAIN(fam.family),
      },
      ...(galleryEntries.length > 0 ? { gallery: galleryEntries } : {}),
    };
    const created = await client.create(doc);
    state.done.push(fam.family);
    saveState(state);
    processed++;
    console.log(
      `[${state.done.length}/${plan.length}] ${fam.family} (+${fam.files.length - 1} gallery) -> ${created._id}`
    );
  }
  console.log(
    `Done batch. Processed ${processed}. Total: ${state.done.length}/${plan.length}.`
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  console.error(e.stack);
  process.exit(1);
});
