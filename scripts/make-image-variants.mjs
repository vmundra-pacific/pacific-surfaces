/**
 * Smaller copies of our own large store photographs.
 *
 * Why (Lighthouse, 2026-10-20): the single-basin vanity top page moved
 * 19.5 MB on a phone, 14 MB of it photographs served at full size into
 * 96 px thumbnails and phone-width frames, and the page's title waited
 * 37 s behind them. The site's image loader serves our /public files as
 * they are (owner, 2026-09-30: no recompression), so a file needs ready
 * copies at the widths the layout asks for.
 *
 * Rules, keeping the owner's "no compression" in force:
 *  - WebP at quality 95 for photographs and renders; lossless WebP for
 *    any image with transparency (the colour-preview mask, shadow and
 *    highlight layers), so compositing sees exact pixels.
 *  - Never wider than the original. The full width is offered too, as a
 *    WebP copy, or as the original when that is already WebP.
 *  - The originals stay where they are; nothing that links to them breaks.
 *
 * Writes public/store-basins/_w/<path>-<width>.webp and the lookup the
 * loader reads, src/data/image-variants.json. Run it again after adding
 * or replacing a store photograph:
 *
 *   node scripts/make-image-variants.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve("public");
const DIRS = ["store-basins"];
// Folders no page uses any more (the triple-basin top was dropped on 2026-10-10).
const SKIP = new Set(["_w", "triple-basin-scene"]);
// Widths that cover Next's srcset steps without a file for every one:
// thumbnails, phone frames, laptop frames, wide frames.
const WIDTHS = [256, 640, 1080, 1920];
const RASTER = /\.(png|jpe?g|webp)$/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (RASTER.test(e.name)) out.push(p);
  }
  return out;
}

const manifest = {};
let written = 0;
let bytes = 0;
for (const dir of DIRS) {
  const root = path.join(PUBLIC, dir);
  for (const file of walk(root)) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const src = `/${dir}/${rel}`;
    const meta = await sharp(file).metadata();
    const lossless = Boolean(meta.hasAlpha);
    const stem = rel.replace(RASTER, "");
    const set = {};
    for (const w of [...WIDTHS.filter((x) => x < meta.width), meta.width]) {
      if (w === meta.width && /\.webp$/i.test(file)) {
        set[w] = src; // already WebP at full size: use it as it is
        continue;
      }
      const outRel = `${dir}/_w/${stem}-${w}.webp`;
      const outPath = path.join(PUBLIC, outRel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const fresh = fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= fs.statSync(file).mtimeMs;
      if (!fresh) {
        await sharp(file)
          .resize({ width: w, kernel: "lanczos3" })
          .webp(lossless ? { lossless: true, effort: 6 } : { quality: 95, effort: 6, smartSubsample: true })
          .toFile(outPath);
        written++;
      }
      bytes += fs.statSync(outPath).size;
      set[w] = `/${outRel}`;
    }
    manifest[src] = set;
  }
}

const out = path.resolve("src/data/image-variants.json");
fs.writeFileSync(out, JSON.stringify(manifest, null, 1) + "\n");
console.log(`${Object.keys(manifest).length} images, ${written} copies written, ${(bytes / 1048576).toFixed(1)} MB of copies in total`);
