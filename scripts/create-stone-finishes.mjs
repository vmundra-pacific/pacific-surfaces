#!/usr/bin/env node
/**
 * create-stone-finishes.mjs
 *
 * Resume-capable companion to migrate-stone-finishes.mjs. Skips the
 * delete step (assumes the Stone Finishes collection is already empty)
 * and creates products from _input/Natural Stone Finishes/. Progress
 * is persisted to scripts/_state/create-stone-finishes.json so the
 * script can be re-invoked after an interruption and pick up where
 * it left off.
 *
 * Usage:
 *   node scripts/create-stone-finishes.mjs           # process all remaining
 *   node scripts/create-stone-finishes.mjs --limit 5 # process next 5
 *   node scripts/create-stone-finishes.mjs --reset   # clear state, start over
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
  "create-stone-finishes.json"
);

const ALT = (family, n) =>
  `${family} natural stone finish, variant ${n} — Pacific Surfaces Facades and Finishes.`;

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
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    let n = 0;
    for (const f of files) {
      n++;
      out.push({
        family: ent.name.trim(),
        variant: pad2(n),
        file: path.join(dir, f),
        name: `${ent.name.trim()} - ${pad2(n)}`,
      });
    }
  }
  return out;
}

function loadState() {
  if (RESET || !fs.existsSync(STATE_FILE)) return { done: [] };
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
}
function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function main() {
  // Find collection id
  const [col] = await client.fetch(
    `*[_type == "collection" && (name match "Stone Finish*" || name match "stone finish*")]{_id, name}`
  );
  if (!col) throw new Error("Stone Finishes collection not found");

  const plan = walk();
  const state = loadState();
  const remaining = plan.filter((p) => !state.done.includes(p.name));
  console.log(
    `Plan total: ${plan.length}, already done: ${state.done.length}, remaining: ${remaining.length}`
  );

  let processed = 0;
  for (const item of remaining) {
    if (processed >= LIMIT) break;
    const buf = fs.readFileSync(item.file);
    const asset = await client.assets.upload("image", buf, {
      filename: path.basename(item.file),
    });
    const doc = {
      _type: "product",
      name: item.name,
      slug: { _type: "slug", current: slugify(item.name) },
      visible: true,
      productType: "granite-finish",
      collection: { _type: "reference", _ref: col._id },
      mainImage: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: ALT(item.family, item.variant),
      },
    };
    const created = await client.create(doc);
    state.done.push(item.name);
    saveState(state);
    processed++;
    console.log(
      `[${state.done.length}/${plan.length}] ${item.name} -> ${created._id}`
    );
  }
  console.log(
    `Done batch. Processed ${processed}. Total done: ${state.done.length}/${plan.length}.`
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
