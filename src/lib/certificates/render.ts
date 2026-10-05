import "server-only";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CERTIFICATES, type CertificateId } from "./registry";
import { WATERMARK_TILE_PNG_BASE64 } from "./watermark";

/**
 * Renders certificate pages to watermarked images on the server.
 *
 * The browser never receives the PDF: pdf.js rasterises each page here
 * with @napi-rs/canvas, the watermark tile is painted over it, and only
 * the resulting WebP leaves the server. Text in the image cannot be
 * selected or copied, and there is no original file to save.
 *
 * "Live from Drive": the PDF is fetched from Drive through Next's data
 * cache and revalidated hourly, and rendered pages are memoised for the
 * same hour, so replacing a file in Drive shows on the site within an
 * hour without a redeploy.
 */

const REVALIDATE_SECONDS = 3600;

/** Rendered width in pixels — sharp on a laptop, readable when zoomed. */
const PAGE_WIDTH = 1600;

/** Base-14 fonts for PDFs that reference them without embedding. Traced
 *  into the deployment by `outputFileTracingIncludes` in next.config.ts. */
const STANDARD_FONTS =
  path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") +
  "/";

export interface CertificatePageSize {
  width: number;
  height: number;
}

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjsPromise: Promise<PdfJs> | null = null;
/* pdf.js loads its own worker with a dynamic import, so it has to run from
   node_modules as shipped, not bundled. It is imported by file path past
   the bundler (webpackIgnore) rather than by listing the whole package in
   serverExternalPackages: that setting also reached the catalogue
   Flipbook's client-side worker URL and broke the build. Traced into the
   deployment by `outputFileTracingIncludes` in next.config.ts. */
const PDFJS_ENTRY = pathToFileURL(
  path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.mjs"),
).href;
const loadPdfJs = () =>
  (pdfjsPromise ??= import(/* webpackIgnore: true */ PDFJS_ENTRY) as Promise<PdfJs>);

async function fetchPdf(id: CertificateId): Promise<Uint8Array> {
  const { driveFileId } = CERTIFICATES[id];
  const res = await fetch(
    `https://drive.usercontent.google.com/download?id=${driveFileId}&export=download`,
    { next: { revalidate: REVALIDATE_SECONDS, tags: [`certificate:${id}`] } },
  );
  if (!res.ok) throw new Error(`Drive responded ${res.status} for ${id}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  // If the file stops being shared, Drive answers 200 with an HTML
  // sign-in page rather than an error, so check what actually came back.
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
    throw new Error(`Drive did not return a PDF for ${id}`);
  }
  return bytes;
}

/** Returns the loading task, not the document: in pdf.js 6 teardown lives
 *  on the task (`task.destroy()`), and the document proxy has none. */
async function openDocument(id: CertificateId) {
  const pdfjs = await loadPdfJs();
  return pdfjs.getDocument({
    data: await fetchPdf(id),
    standardFontDataUrl: STANDARD_FONTS,
    useSystemFonts: false,
  });
}

/* Memoised for the revalidation window, per warm server instance. */
const memo = new Map<string, { at: number; value: unknown }>();
async function remember<T>(key: string, make: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < REVALIDATE_SECONDS * 1000) {
    return hit.value as T;
  }
  const value = await make();
  memo.set(key, { at: Date.now(), value });
  return value;
}

/** Page count and each page's size in PDF points. */
export function getCertificatePages(
  id: CertificateId,
): Promise<CertificatePageSize[]> {
  return remember(`pages:${id}`, async () => {
    const task = await openDocument(id);
    try {
      const doc = await task.promise;
      const pages: CertificatePageSize[] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        const { width, height } = (await doc.getPage(n)).getViewport({
          scale: 1,
        });
        pages.push({ width: Math.round(width), height: Math.round(height) });
      }
      return pages;
    } finally {
      await task.destroy();
    }
  });
}

/** One page as a watermarked WebP. Throws RangeError for a page that
 *  does not exist, so the route can answer 404 rather than 502. */
export function renderCertificatePage(
  id: CertificateId,
  pageNumber: number,
): Promise<Buffer> {
  return remember(`page:${id}:${pageNumber}`, async () => {
    const [{ createCanvas, loadImage }, task] = await Promise.all([
      import("@napi-rs/canvas"),
      openDocument(id),
    ]);
    try {
      const doc = await task.promise;
      if (pageNumber < 1 || pageNumber > doc.numPages) {
        throw new RangeError(`${id} has no page ${pageNumber}`);
      }
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: PAGE_WIDTH / base.width });
      const canvas = createCanvas(
        Math.round(viewport.width),
        Math.round(viewport.height),
      );
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // pdf.js types its render target as the DOM canvas; @napi-rs/canvas
      // implements the same 2D API, which is what the Node build expects.
      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      const tile = await loadImage(
        Buffer.from(WATERMARK_TILE_PNG_BASE64, "base64"),
      );
      const pattern = ctx.createPattern(tile, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return await canvas.encode("webp", 82);
    } finally {
      await task.destroy();
    }
  });
}
