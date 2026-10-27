/**
 * Smaller copies of our own large photographs.
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
 * 2026-10-27 (Core Web Vitals, owner: faster and lighter with nothing
 * visibly changed): the rest of the site's photography too. The homepage
 * alone sent a 1.5 MB PNG into a phone-width slot and 0.8 MB of
 * certification PNGs into 384 px badges. Outside store-basins only files
 * over MIN_BYTES get copies; smaller ones gain too little to be worth
 * the extra files.
 *
 * Writes public/<dir>/_w/<path>-<width>.webp and the lookup the loader
 * reads, src/data/image-variants.json. Run it again after adding or
 * replacing a photograph in one of DIRS:
 *
 *   node scripts/make-image-variants.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve("public");
const DIRS = ["store-basins", "images", "certifications", "benefits", "team", "projects"];
// Every store-basins file gets copies (the colour preview composites its
// layers through them); elsewhere only files bigger than this.
const MIN_BYTES = 100 * 1024;
// Folders no page uses any more (the triple-basin top was dropped on 2026-10-10).
const SKIP = new Set(["_w", "triple-basin-scene"]);
// Widths that cover Next's srcset steps without a file for every one:
// thumbnails, phone frames, laptop frames, wide frames.
const STORE_WIDTHS = [256, 640, 1080, 1920];
// Elsewhere also badges (384) and phone frames at 2x and 3x (828, 1290).
// An original wider than 1920 px is its own full-width entry, served as
// before, rather than getting a full-width copy: those sizes only reach
// large desktop screens and the copies would add ~50 MB to the repository.
const WIDTHS = [256, 384, 640, 828, 1080, 1290, 1920];
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
    if (dir !== "store-basins" && fs.statSync(file).size <= MIN_BYTES) continue;
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const src = `/${dir}/${rel}`;
    const meta = await sharp(file).metadata();
    const lossless = Boolean(meta.hasAlpha);
    const stem = rel.replace(RASTER, "");
    const store = dir === "store-basins";
    const set = {};
    for (const w of [...(store ? STORE_WIDTHS : WIDTHS).filter((x) => x < meta.width), meta.width]) {
      if (w === meta.width && (/\.webp$/i.test(file) || (!store && w > 1920))) {
        set[w] = src; // full size: the original as it is
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
