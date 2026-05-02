#!/usr/bin/env node
/**
 * One-shot: extract a poster JPG from every applicationCard /
 * signatureProject that has a videoFile but no `image`, upload the
 * poster to Sanity, and patch the document so `image` references the
 * new asset.
 *
 * Why
 * ---
 * On phone the homepage drops <video> elements (saves bandwidth) and
 * tries to render the `image` instead. Cards in Sanity that only have
 * a videoFile uploaded — no companion still — were rendering as the
 * placeholder gradient because `image` was null. This script gives
 * every video-only card an automatically-generated still so the
 * mobile fallback has something to paint.
 *
 * Settings
 * --------
 *   - Frame extracted at t=1.5s (avoids any black/fade-in opening
 *     frame; gives content a beat to settle).
 *   - JPG quality 4 (ffmpeg's q:v scale, where 2 is best, 31 is worst —
 *     4 is "high quality, sensible file size").
 *   - Uploaded with filename `<original-base>-poster.jpg`.
 *
 * Idempotency
 * -----------
 * Skips any document that already has `image` populated. Safe to
 * re-run; only fills in missing posters.
 *
 * Run from project root:
 *   node --env-file=.env.local scripts/extract-video-thumbnails.mjs
 *
 * Add --dry to print the plan without writing.
 */

import { createClient } from "@sanity/client";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-28";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const DRY = process.argv.includes("--dry");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`));
    });
  });
}

async function extractPoster(inPath, outPath) {
  await runFfmpeg([
    "-y",
    "-ss", "00:00:01.5",
    "-i", inPath,
    "-frames:v", "1",
    "-q:v", "4",
    "-loglevel", "error",
    outPath,
  ]);
}

console.log(`\nMode: ${DRY ? "DRY RUN" : "WRITE"}\n`);

// Find every applicationCard + signatureProject that has a videoFile
// but no image. Resolve the videoFile asset's url + originalFilename
// so we can download + name the poster sensibly.
const docs = await client.fetch(
  `*[(_type=="applicationCard" || _type=="signatureProject") &&
     defined(videoFile.asset._ref) &&
     !defined(image.asset._ref)
   ]{
    _id,
    _type,
    "label": coalesce(label, name, title),
    "videoUrl": videoFile.asset->url,
    "videoName": videoFile.asset->originalFilename,
    "videoMime": videoFile.asset->mimeType
  }`
);

console.log(`${docs.length} document(s) need a poster image:\n`);
docs.forEach((d) => console.log(`  [${d._type}] ${d.label || d._id}`));

if (docs.length === 0) {
  console.log("\nNothing to do — every document with a videoFile already has an image.");
  process.exit(0);
}

if (DRY) {
  console.log("\n[dry] would download each video, extract a frame at t=1.5s, upload as image asset, and patch the document.");
  process.exit(0);
}

let processed = 0;

for (const d of docs) {
  console.log(`\n--- ${d.label || d._id} ---`);

  if (!d.videoUrl) {
    console.log("  no resolvable videoUrl — skipping");
    continue;
  }

  const work = mkdtempSync(join(tmpdir(), "thumb-"));
  const inFile = join(work, "in.mp4");
  const outFile = join(work, "poster.jpg");

  try {
    console.log("  downloading source video…");
    await downloadTo(d.videoUrl, inFile);

    console.log("  extracting poster frame…");
    await extractPoster(inFile, outFile);

    const sz = statSync(outFile).size;
    console.log(`  poster: ${(sz / 1024).toFixed(1)} KB`);

    console.log("  uploading…");
    const baseName = (d.videoName || "video").replace(/\.[^.]+$/, "");
    const newAsset = await client.assets.upload(
      "image",
      readFileSync(outFile),
      {
        filename: `${baseName}-poster.jpg`,
        contentType: "image/jpeg",
      }
    );
    console.log(`  new image asset: ${newAsset._id}`);

    console.log("  patching document image field…");
    await client
      .patch(d._id)
      .set({
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: newAsset._id },
        },
      })
      .commit();
    console.log("  done.");
    processed++;
  } catch (err) {
    console.error(`  FAILED: ${err instanceof Error ? err.message : err}`);
  } finally {
    try {
      unlinkSync(inFile);
    } catch {}
    try {
      unlinkSync(outFile);
    } catch {}
  }
}

console.log(`\n=== Done ===`);
console.log(`Processed ${processed}/${docs.length} documents.`);
console.log(`Mobile homepage will now render these stills instead of an empty placeholder for video-only cards.`);
