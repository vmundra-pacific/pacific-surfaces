#!/usr/bin/env node
/**
 * One-shot migration: compress every Sanity-hosted video that is
 * actually referenced by a published document, replace it in place
 * (uploads a fresh asset, patches every reference to point at the new
 * one), and report the byte savings.
 *
 * Why
 * ---
 * Lighthouse mobile was logging 146 MB total page weight on the home
 * page, with the top four resources all being Sanity .mp4 originals
 * uploaded straight from someone's camera roll. Sanity's CDN doesn't
 * transform video like it does images, so the only way to make those
 * smaller is to re-encode and re-upload.
 *
 * Behavior
 * --------
 * 1. Query every video file asset (sanity.fileAsset, mimeType video/*).
 * 2. Build a map of which assets are referenced by which documents
 *    (applicationCard.videoFile, applicationCard.frames[].videoFile,
 *    signatureProject.videoFile, careersPage.heroVideo, etc.).
 * 3. For each referenced asset over MIN_BYTES, download via the
 *    asset's URL, run it through ffmpeg with our standard settings,
 *    upload the result, and patch every document reference.
 * 4. Old assets are NOT deleted — clean up in Sanity Studio after
 *    you've verified the new ones look right.
 *
 * Settings
 * --------
 *   - 1280x720 max (anything larger is downscaled; smaller stays as-is)
 *   - libx264 -preset fast -crf 26
 *   - faststart so the moov atom is at the front (smoother streaming)
 *   - audio: 96 kbps AAC stereo
 *
 * Run from the project root:
 *   node --env-file=.env.local scripts/compress-sanity-videos.mjs
 *
 * Add --dry to print the plan without writing anything.
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
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. Run via: node --env-file=.env.local scripts/compress-sanity-videos.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const MIN_BYTES = 5 * 1024 * 1024; // skip anything under 5 MB
const MAX_W = 1280;
const CRF = 26;

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ---------- helpers ----------

function fmtMB(b) {
  return (b / 1024 / 1024).toFixed(1) + " MB";
}

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

async function compressVideo(inPath, outPath) {
  // -vf "scale='min(MAX_W,iw)':-2" downscales only if wider than MAX_W,
  // and keeps height a multiple of 2 (libx264 requirement).
  const vf = `scale='min(${MAX_W},iw)':-2:flags=lanczos`;
  await runFfmpeg([
    "-y",
    "-i", inPath,
    "-vf", vf,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", String(CRF),
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "96k",
    "-movflags", "+faststart",
    "-loglevel", "error",
    outPath,
  ]);
}

// ---------- main ----------

console.log(`\nMode: ${DRY ? "DRY RUN" : "WRITE"}\n`);

// 1. All video file assets
const allAssets = await client.fetch(
  `*[_type=="sanity.fileAsset" && mimeType match "video*"]{
    _id, originalFilename, mimeType, size, url
  }`
);

// 2. Documents that reference a videoFile in any of the known shapes.
// Add to the projection here if you introduce new shapes (e.g. heroVideo).
const refDocs = await client.fetch(
  `*[!(_type match "sanity.") && (
    defined(videoFile.asset._ref) ||
    defined(heroVideo.asset._ref) ||
    count(frames[defined(videoFile.asset._ref)]) > 0
  )]{
    _id, _type,
    "videoRef": videoFile.asset._ref,
    "heroRef": heroVideo.asset._ref,
    "frameRefs": frames[]{ "ref": videoFile.asset._ref }
  }`
);

// Build asset -> [{docId, path}, ...] reverse index
const refsByAsset = new Map();
const addRef = (assetId, docId, path) => {
  if (!assetId) return;
  if (!refsByAsset.has(assetId)) refsByAsset.set(assetId, []);
  refsByAsset.get(assetId).push({ docId, path });
};
for (const d of refDocs) {
  if (d.videoRef) addRef(d.videoRef, d._id, "videoFile.asset._ref");
  if (d.heroRef) addRef(d.heroRef, d._id, "heroVideo.asset._ref");
  (d.frameRefs || []).forEach((f, i) => {
    if (f?.ref) addRef(f.ref, d._id, `frames[${i}].videoFile.asset._ref`);
  });
}

const referenced = allAssets.filter((a) => refsByAsset.has(a._id));
const candidates = referenced.filter((a) => (a.size || 0) >= MIN_BYTES);
const totalBefore = candidates.reduce((s, a) => s + (a.size || 0), 0);

console.log(`Found ${allAssets.length} video assets, ${referenced.length} referenced, ${candidates.length} over ${fmtMB(MIN_BYTES)} (will compress).`);
console.log(`Total bytes to compress: ${fmtMB(totalBefore)}\n`);

if (candidates.length === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

let totalAfter = 0;

for (const asset of candidates) {
  console.log(`\n--- ${asset.originalFilename} (${fmtMB(asset.size)}) ---`);
  const refs = refsByAsset.get(asset._id);
  console.log(`  Referenced by ${refs.length} location(s):`);
  refs.forEach((r) => console.log(`    ${r.docId} :: ${r.path}`));

  if (DRY) {
    console.log("  [dry] would download, compress, upload, patch.");
    continue;
  }

  const work = mkdtempSync(join(tmpdir(), "sanity-vid-"));
  const inFile = join(work, "in.mp4");
  const outFile = join(work, "out.mp4");

  console.log("  downloading…");
  await downloadTo(asset.url, inFile);

  console.log("  compressing…");
  await compressVideo(inFile, outFile);

  const newSize = statSync(outFile).size;
  console.log(`  compressed: ${fmtMB(newSize)} (${((newSize / asset.size) * 100).toFixed(0)}% of original)`);

  if (newSize >= asset.size) {
    console.log("  compressed file is bigger than original — skipping replace.");
    unlinkSync(inFile);
    unlinkSync(outFile);
    continue;
  }

  console.log("  uploading new asset…");
  const newName = (asset.originalFilename || "video.mp4").replace(/(\.\w+)?$/, "-optimized$1");
  const newAsset = await client.assets.upload("file", readFileSync(outFile), {
    filename: newName,
    contentType: "video/mp4",
  });
  console.log(`  new asset _id: ${newAsset._id}`);

  console.log("  patching document references…");
  // Group refs by docId so each doc is patched in one transaction.
  const byDoc = new Map();
  for (const r of refs) {
    if (!byDoc.has(r.docId)) byDoc.set(r.docId, []);
    byDoc.get(r.docId).push(r.path);
  }
  for (const [docId, paths] of byDoc) {
    let patch = client.patch(docId);
    for (const p of paths) patch = patch.set({ [p]: newAsset._id });
    await patch.commit();
    console.log(`    patched ${docId} (${paths.length} ref${paths.length === 1 ? "" : "s"})`);
  }

  totalAfter += newSize;
  unlinkSync(inFile);
  unlinkSync(outFile);
}

console.log(`\n=== Done ===`);
console.log(`Before: ${fmtMB(totalBefore)}`);
console.log(`After:  ${fmtMB(totalAfter)}`);
console.log(`Saved:  ${fmtMB(totalBefore - totalAfter)} (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);
console.log(`\nOld assets still exist in Sanity. Delete them via Studio → Media when ready (or rerun with a delete pass).`);
