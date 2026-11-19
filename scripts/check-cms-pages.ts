/**
 * A page check for the site reading its content from the CMS
 * (CONTENT_SOURCE=cms): no page loads a CMS picture's full original where
 * one of its ready-made copies belongs. Run it against a running site:
 *
 *   npx tsx scripts/check-cms-pages.ts <site address> [path ...] [--sitemap]
 *
 * for example `npx tsx scripts/check-cms-pages.ts http://localhost:3005`.
 * With no paths it checks a fixed set of pages; `--sitemap` adds every
 * page the site's sitemap lists.
 *
 * On each page it reads the pictures the browser loads from the HTML
 * itself: every img src and srcset, source srcset, video poster, image
 * preload (href and imagesrcset), and CSS url(...) in style attributes
 * and style elements. It fails if one of them is a bare picture original,
 * a path ending `<32 hex>.<ext>`, rather than a copy (`-w<width>.webp`) or
 * a share card (`-share.jpg`). An address on this site's /api/cdn/m/ is
 * judged by its name like any other, so a full original served through it
 * fails too; its copies, share cards, PDFs and videos pass.
 * The server payload in the page's scripts is not read: it carries the
 * answers' addresses as they come, by design.
 *
 * Exit 0 when every page passes, 1 when any fails or cannot be read.
 */

/** Pages checked when none are named. */
const DEFAULT_PATHS = [
  "/",
  "/products",
  "/catalogue",
  "/products/quartz",
  "/products/facades-and-finishes",
  "/blog",
  "/resources",
  "/careers",
  "/spaces/kitchens",
  "/spaces/outdoor",
  "/shop",
  "/shop/vanity-tops",
  "/visualize",
  "/applications/flooring",
];

/** A picture original's name: `<32 hex>.<picture extension>`. */
const PICTURE_ORIGINAL_RE = /^[0-9a-f]{32}\.(?:jpe?g|png|gif|webp|avif|tiff?)$/;

export type PictureUse = {
  /** Where on the page: "img src", "srcset", "poster", "preload", "css url". */
  where: string;
  /** The address as written, entities decoded. */
  address: string;
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, code) => {
    const c = String(code);
    if (c[0] === "#") {
      const n =
        c[1] === "x" || c[1] === "X" ? parseInt(c.slice(2), 16) : +c.slice(1);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[c.toLowerCase()] ?? whole;
  });
}

/** The attributes of one start tag, names lower-cased, values decoded. */
function attributesOf(tag: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const re =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  // Skip the tag name.
  const body = tag.replace(/^<\s*[a-z0-9-]+/i, "").replace(/\/?>$/, "");
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    attributes.set(m[1].toLowerCase(), decodeEntities(value));
  }
  return attributes;
}

/** The addresses in a srcset, which may themselves hold commas. */
export function srcsetAddresses(srcset: string): string[] {
  const addresses: string[] = [];
  let i = 0;
  while (i < srcset.length) {
    while (i < srcset.length && /[\s,]/.test(srcset[i])) i += 1;
    let address = "";
    while (i < srcset.length && !/\s/.test(srcset[i])) address += srcset[i++];
    // A candidate with no descriptor may end with the list's comma.
    address = address.replace(/,+$/, "");
    if (address) addresses.push(address);
    // Skip the descriptors, up to the comma that ends the candidate.
    while (i < srcset.length && srcset[i] !== ",") i += 1;
  }
  return addresses;
}

function cssUrls(css: string): string[] {
  const urls: string[] = [];
  const re = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const value = m[1] ?? m[2] ?? m[3] ?? "";
    if (value) urls.push(value);
  }
  return urls;
}

/** Every picture the browser loads from the page's HTML (not its scripts). */
export function pictureUses(html: string): PictureUse[] {
  const uses: PictureUse[] = [];
  // Script bodies hold the server payload; take them out first.
  const page = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");
  const tagRe = /<(img|source|video|link)\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(page))) {
    const name = m[1].toLowerCase();
    const a = attributesOf(m[0]);
    if (name === "img") {
      const src = a.get("src");
      if (src) uses.push({ where: "img src", address: src });
      for (const x of srcsetAddresses(a.get("srcset") ?? "")) {
        uses.push({ where: "srcset", address: x });
      }
    } else if (name === "source") {
      for (const x of srcsetAddresses(a.get("srcset") ?? "")) {
        uses.push({ where: "srcset", address: x });
      }
    } else if (name === "video") {
      const poster = a.get("poster");
      if (poster) uses.push({ where: "poster", address: poster });
    } else if (
      (a.get("rel") ?? "").toLowerCase().split(/\s+/).includes("preload") &&
      (a.get("as") ?? "").toLowerCase() === "image"
    ) {
      const href = a.get("href");
      if (href) uses.push({ where: "preload", address: href });
      for (const x of srcsetAddresses(a.get("imagesrcset") ?? "")) {
        uses.push({ where: "preload", address: x });
      }
    }
  }
  const styleAttrRe = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  while ((m = styleAttrRe.exec(page))) {
    for (const x of cssUrls(decodeEntities(m[1] ?? m[2] ?? ""))) {
      uses.push({ where: "css url", address: x });
    }
  }
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  while ((m = styleRe.exec(page))) {
    for (const x of cssUrls(m[1])) uses.push({ where: "css url", address: x });
  }
  return uses;
}

/**
 * True for a bare picture original: its path ends `<32 hex>.<ext>`,
 * wherever it is, this site's /api/cdn/m/ included. An optimiser address
 * (/_next/image?url=...) is judged by the address it wraps.
 */
export function isBareOriginal(
  address: string,
  pageUrl = "http://site.invalid/"
): boolean {
  let url: URL;
  try {
    url = new URL(address, pageUrl);
  } catch {
    return false;
  }
  if (url.pathname === "/_next/image") {
    const inner = url.searchParams.get("url");
    return inner ? isBareOriginal(inner, pageUrl) : false;
  }
  const name = url.pathname.split("/").pop() ?? "";
  return PICTURE_ORIGINAL_RE.test(name);
}

/** The bare picture originals a page's HTML loads. */
export function bareOriginalsIn(html: string, pageUrl?: string): PictureUse[] {
  return pictureUses(html).filter((use) =>
    isBareOriginal(use.address, pageUrl)
  );
}

async function fetchText(
  url: string
): Promise<{ status: number; text: string }> {
  const response = await fetch(url, { redirect: "follow" });
  return { status: response.status, text: await response.text() };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const site = args.find((x) => !x.startsWith("--") && /^https?:\/\//.test(x));
  if (!site) {
    console.error(
      "Usage: npx tsx scripts/check-cms-pages.ts <site address> [path ...] [--sitemap]"
    );
    process.exit(2);
  }
  const base = site.replace(/\/+$/, "");
  const named = args.filter((x) => x.startsWith("/"));
  const paths = new Set(named.length ? named : DEFAULT_PATHS);
  if (args.includes("--sitemap")) {
    const { status, text } = await fetchText(`${base}/sitemap.xml`);
    if (status !== 200) {
      console.error(`sitemap.xml: status ${status}`);
      process.exit(1);
    }
    for (const m of text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      try {
        const u = new URL(m[1]);
        paths.add(`${u.pathname}${u.search}`);
      } catch {
        // not an address
      }
    }
  }
  let failed = 0;
  let pictures = 0;
  for (const path of paths) {
    const pageUrl = `${base}${path}`;
    let page: { status: number; text: string };
    try {
      page = await fetchText(pageUrl);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${path}: could not be read (${String(error)})`);
      continue;
    }
    if (page.status !== 200) {
      failed += 1;
      console.log(`FAIL  ${path}: status ${page.status}`);
      continue;
    }
    const uses = pictureUses(page.text);
    pictures += uses.length;
    const bare = uses.filter((use) => isBareOriginal(use.address, pageUrl));
    if (bare.length === 0) {
      console.log(`ok    ${path} (${uses.length} pictures)`);
      continue;
    }
    failed += 1;
    console.log(`FAIL  ${path}: ${bare.length} bare picture original(s)`);
    for (const use of bare.slice(0, 10)) {
      console.log(`        ${use.where}: ${use.address}`);
    }
  }
  console.log(
    `\n${paths.size} pages, ${pictures} pictures, ${failed} page(s) failed`
  );
  process.exit(failed === 0 ? 0 : 1);
}

if (/check-cms-pages\.ts$/.test(process.argv[1] ?? "")) void main();
