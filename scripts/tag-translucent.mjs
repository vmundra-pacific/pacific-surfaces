#!/usr/bin/env node
/**
 * tag-translucent.mjs
 *
 * Puts the Translucent Series on /products/translucent.
 *
 * The series ("Crafted to Glow" catalogue, 2026-04) is five existing
 * quartz colours offered for backlighting. Nothing new is created: each
 * existing product gets the "Translucent" ribbon, which is what the page
 * filters on (src/app/(site)/products/_lib/category.ts). With --images,
 * a backlit photograph named in COLOURS is added to its gallery from
 * _input/Translucent/ (the owner is supplying these; none are there yet).
 *
 * Dry run by default: prints what would change and writes nothing.
 *
 *   node scripts/tag-translucent.mjs                 # dry run
 *   node scripts/tag-translucent.mjs --apply         # ribbon only
 *   node scripts/tag-translucent.mjs --apply --seo   # also the meta descriptions below
 *   node scripts/tag-translucent.mjs --apply --images  # also a backlit photo per colour
 *
 * Safe to re-run: a product that already has the ribbon or the backlit
 * image is left as it is. Reads the same .env.local as the other scripts
 * (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * SANITY_API_WRITE_TOKEN).
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "_input", "Translucent");

const flags = new Set(process.argv.slice(2));
const APPLY = flags.has("--apply");
const WITH_SEO = flags.has("--seo");
const WITH_IMAGES = flags.has("--images");

const RIBBON = "Translucent";
/** Fixed key, so a second run finds the image it added the first time. */
const GALLERY_KEY = "translucent-backlit";

/**
 * The five colours, by the slug each already has on the site.
 * `seoDescription` is only written with --seo. It restates what the
 * product page already says and adds the one new fact: the colour is in
 * the Translucent Series. No finishes, sizes or thicknesses are claimed
 * for the backlit use, because the catalogue gives none.
 */
const COLOURS = [
  {
    slug: "bohemia-3018",
    name: "Bohemia (3018)",
    image: "bohemia-3018-backlit.jpg",
    seoDescription:
      "Bohemia (3018) by Pacific Surfaces: dramatic grey quartz with white veining, Nebula Collection. Also in the Translucent Series, made to be backlit.",
  },
  {
    slug: "glacial-silver-3059",
    name: "Glacial Silver (3059)",
    image: "glacial-silver-3059-backlit.jpg",
    seoDescription:
      "Glacial Silver (3059) by Pacific Surfaces: soft silver quartz with subtle veining, Nebula Collection. Also in the Translucent Series, made to be backlit.",
  },
  {
    slug: "latte-luxe-5040",
    name: "Latte Luxe (5040)",
    image: "latte-luxe-5040-backlit.jpg",
    seoDescription:
      "Latte Luxe (5040) by Pacific Surfaces: smooth, creamy beige quartz with subtle veining. Also in the Translucent Series, with a soft glow when backlit.",
  },
  {
    slug: "venice-5041",
    name: "Venice (5041)",
    image: "venice-5041-backlit.jpg",
    seoDescription:
      "Venice (5041) by Pacific Surfaces: blue onyx-inspired quartz with layered sky to ocean tones. Also in the Translucent Series, made to be backlit.",
  },
  {
    slug: "sakura",
    name: "Sakura (5077)",
    image: "sakura-backlit.jpg",
    seoDescription:
      "Sakura (5077) by Pacific Surfaces: soft pastel pink quartz with gentle veining. Also in the Translucent Series, for a calm glow when backlit.",
  },
];

const SEO_KEYWORDS = [
  "translucent quartz",
  "backlit quartz",
  "backlit onyx quartz",
];

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) {
    throw new Error(
      ".env.local not found: run this from a configured checkout"
    );
  }
  const env = {};
  for (const l of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i < 0) continue;
    let v = l.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[l.slice(0, i).trim()] = v;
  }
  return env;
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

async function main() {
  const env = loadEnv();
  if (APPLY && !env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not set in .env.local");
  }
  const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28",
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  console.log(APPLY ? "APPLYING changes" : "DRY RUN (add --apply to write)");
  let missing = 0;

  for (const c of COLOURS) {
    const doc = await client.fetch(
      `*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
        _id, name, ribbons, seoTitle, seoDescription, seoKeywords,
        "galleryKeys": gallery[]._key
      }`,
      { slug: c.slug }
    );
    if (!doc) {
      missing++;
      console.log(`\n${c.name}: NOT FOUND at slug "${c.slug}", skipped`);
      continue;
    }
    console.log(`\n${doc.name}  (${doc._id})`);

    let patch = client.patch(doc._id);
    let changed = false;

    // 1. Ribbon
    const has = (doc.ribbons ?? []).some((r) => norm(r) === norm(RIBBON));
    if (has) {
      console.log("  ribbon: already tagged");
    } else {
      console.log(`  ribbon: add "${RIBBON}"`);
      patch = patch.setIfMissing({ ribbons: [] }).append("ribbons", [RIBBON]);
      changed = true;
    }

    // 2. Backlit photograph into the gallery
    if (WITH_IMAGES) {
      const file = path.join(SRC_DIR, c.image);
      if ((doc.galleryKeys ?? []).includes(GALLERY_KEY)) {
        console.log("  image: backlit image already in gallery");
      } else if (!fs.existsSync(file)) {
        console.log(
          `  image: ${c.image} not found in _input/Translucent, skipped`
        );
      } else {
        console.log(`  image: add ${c.image} to gallery`);
        if (APPLY) {
          const asset = await client.assets.upload(
            "image",
            fs.readFileSync(file),
            { filename: c.image }
          );
          patch = patch.setIfMissing({ gallery: [] }).append("gallery", [
            {
              _key: GALLERY_KEY,
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
              alt: `${c.name} quartz slab backlit, Pacific Surfaces Translucent Series`,
            },
          ]);
        }
        changed = true;
      }
    }

    // 3. Meta description and keywords (only with --seo)
    if (WITH_SEO) {
      if (doc.seoDescription !== c.seoDescription) {
        console.log(`  seoDescription was: ${doc.seoDescription ?? "(empty)"}`);
        console.log(`  seoDescription now: ${c.seoDescription}`);
        patch = patch.set({ seoDescription: c.seoDescription });
        changed = true;
      }
      const have = new Set((doc.seoKeywords ?? []).map((k) => k.toLowerCase()));
      const add = SEO_KEYWORDS.filter((k) => !have.has(k));
      if (add.length) {
        console.log(`  seoKeywords: add ${add.join(", ")}`);
        patch = patch
          .setIfMissing({ seoKeywords: [] })
          .append("seoKeywords", add);
        changed = true;
      }
      console.log(
        `  seoTitle: kept (${doc.seoTitle ?? "(empty: page builds one)"})`
      );
    }

    if (!changed) console.log("  nothing to do");
    else if (APPLY) {
      await patch.commit();
      console.log("  saved");
    }
  }

  if (missing) {
    console.log(
      `\n${missing} colour(s) not found. Check the slugs in COLOURS.`
    );
    process.exitCode = 1;
  }
  console.log(
    APPLY
      ? "\nDone. /products/translucent picks the colours up within a minute."
      : "\nNothing was written."
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
