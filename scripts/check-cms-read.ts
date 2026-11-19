/**
 * Checks for the CMS reader (src/cms/client.ts), the fetchers' CMS side
 * (src/cms/read.ts) and the content-changed notice
 * (src/cms/content-changed.ts). It needs no network and no real key: it
 * runs a small stand-in CMS on 127.0.0.1 and uses dummy values.
 *
 *   npm run check:cms-read
 *
 * (that is: npx tsx --conditions=react-server scripts/check-cms-read.ts;
 * the condition lets the server-only modules load outside Next.)
 *
 * Not covered here, because they need Next itself: the 60-second cache
 * of the three per-request reads and the route's revalidation calls.
 */
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";

import {
  buildQueryString,
  contentSource,
  isCmsReadError,
  PROTECTION_BYPASS_HEADER,
  READ_KEY_HEADER,
  READ_KEY_SCHEME,
  readCmsAnswer,
  readCmsPart,
  type ReadOptions,
} from "../src/cms/client";
import {
  CMS_NOTICE_WINDOW_MS,
  checkCmsNotice,
  signCmsNotice,
} from "../src/cms/content-changed";

/* ------------------------------------------------------------------ */
/* A tiny test runner                                                  */
/* ------------------------------------------------------------------ */

let failures = 0;
let passes = 0;

function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passes += 1;
    console.log(`  ok    ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? ` (${detail})` : ""}`);
  }
}

function same(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, `got ${a}, expected ${e}`);
}

async function rejectsWithCmsError(
  name: string,
  run: () => Promise<unknown>
): Promise<void> {
  try {
    const value = await run();
    check(name, false, `resolved with ${JSON.stringify(value)}`);
  } catch (error) {
    check(
      name,
      isCmsReadError(error),
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function resolvesTo(
  name: string,
  run: () => Promise<unknown>,
  expected: unknown
): Promise<void> {
  try {
    same(name, await run(), expected);
  } catch (error) {
    check(name, false, error instanceof Error ? error.message : String(error));
  }
}

/* ------------------------------------------------------------------ */
/* A stand-in CMS                                                      */
/* ------------------------------------------------------------------ */

type Seen = {
  path: string;
  search: string;
  headers: IncomingMessage["headers"];
};
const seen: Seen[] = [];

type StandInAnswer = {
  status: number;
  type?: string;
  body?: string;
  location?: string;
  delayMs?: number;
  /**
   * Send the headers and the first half of the body, then cut the
   * connection: "sized" with a Content-Length, "chunked" without one.
   */
  breakOff?: "sized" | "chunked";
};

/** Answers a check puts in place for a while, by the last part of the path. */
const overrides = new Map<string, StandInAnswer>();

const json = (body: unknown) => ({
  status: 200,
  type: "application/json",
  body: JSON.stringify(body),
});

/** What the stand-in answers, by the last part of the path. */
function standIn(name: string): StandInAnswer {
  const override = overrides.get(name);
  if (override) return override;
  switch (name) {
    case "list":
      return json([{ a: 1 }]);
    case "empty-list":
      return json([]);
    case "null":
      return json(null);
    case "object":
      return json({ a: 1 });
    case "wrapped":
      return json({ docs: [] });
    case "pictures":
      return json([
        {
          mainImage:
            "https://cms.example.com/api/media/file/0123456789abcdef0123456789abcdef.jpg",
          n: 1,
        },
      ]);
    case "login-page":
      return { status: 200, type: "text/html", body: "<html>Log in</html>" };
    case "json-text-as-html":
      return { status: 200, type: "text/html", body: "[]" };
    case "no-type":
      return { status: 200, body: "[]" };
    case "bad-json":
      return { status: 200, type: "application/json", body: "[{oops" };
    case "s401":
      return { status: 401, type: "application/json", body: '{"error":"x"}' };
    case "s403":
      return { status: 403, type: "text/html", body: "<html>No</html>" };
    case "s404":
      return { status: 404, type: "application/json", body: '{"error":"x"}' };
    case "s500":
      return { status: 500, type: "application/json", body: '{"error":"x"}' };
    case "s503":
      return { status: 503, type: "text/html", body: "<html>Busy</html>" };
    case "redirect":
      return { status: 302, location: "https://example.com/login" };
    case "slow":
      return { ...json([1]), delayMs: 1500 };
    case "broken-sized":
      return { ...json([{ a: 1 }, { b: 2 }]), breakOff: "sized" };
    case "broken-chunked":
      return { ...json([{ a: 1 }, { b: 2 }]), breakOff: "chunked" };
    case "sitemap-empty":
      return json({ products: [], posts: [], dates: {} });
    case "sitemap-no-dates":
      return json({ products: [{ slug: "a" }], posts: [] });
    // The read answers the fetchers ask for, each with a plausible shape.
    case "products":
      return json([{ _id: "p1", slug: { _type: "slug", current: "white" } }]);
    case "product":
    case "collection":
    case "blog-post":
    case "space-page":
    case "faq":
    case "job-apply":
      return json(null);
    case "homepage-collections":
      return json([{ _id: "c1", name: "Nebula" }]);
    case "product-tiles":
    case "blog-posts":
    case "resources":
    case "search":
      return json([]);
    case "homepage":
      return json({
        signatureProjects: [{ n: "s" }],
        applicationCards: [{ n: "a" }],
        inspirationImages: [{ n: "i" }],
      });
    case "careers":
      return json({ page: null, jobs: [{ title: "j" }] });
    case "beyond-stone":
      return json({ page: null, collectionSlug: null, products: [] });
    case "legacy-files":
      return json({
        "https://cdn.sanity.io/files/p/d/a.pdf":
          "0123456789abcdef0123456789abcdef.pdf",
      });
    case "sitemap":
      return json({
        products: [{ slug: "white", updatedAt: "2026-01-01T00:00:00Z" }],
        posts: [],
        dates: { home: null },
      });
    default:
      return { status: 404, type: "application/json", body: "{}" };
  }
}

/** The bytes every stand-in file has: 100 of them, so ranges are easy to check. */
const FILE_BYTES = Buffer.from(
  Array.from({ length: 100 }, (_, i) => 48 + (i % 10))
);
const FILE_HASH = {
  ok: "0123456789abcdef0123456789abcdef",
  missing: "ffffffffffffffffffffffffffffffff",
  refused: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  broken: "dddddddddddddddddddddddddddddddd",
  moved: "cccccccccccccccccccccccccccccccc",
  /** Holds its headers for 1.5 s. */
  held: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  /** Sends its headers at once and its body in two halves, 0.6 s apart. */
  slowBody: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

/** Where a stand-in file store sends the "moved" file. */
let movedTo = "https://example.com/login";

/**
 * A stand-in file store: the CMS's file route (/api/media/file/<name>)
 * or a media host (/<name>), answering by the name's hash and honouring
 * a single Range.
 */
function serveFile(
  name: string,
  req: IncomingMessage,
  res: import("node:http").ServerResponse
): void {
  const hash = name.slice(0, 32);
  if (hash === FILE_HASH.missing) {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("<html>Not here</html>");
    return;
  }
  if (hash === FILE_HASH.refused) {
    res.writeHead(401, { "content-type": "text/html" });
    res.end("<html>Log in</html>");
    return;
  }
  if (hash === FILE_HASH.broken) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("broken");
    return;
  }
  if (hash === FILE_HASH.moved) {
    res.writeHead(302, { location: movedTo });
    res.end();
    return;
  }
  if (hash === FILE_HASH.held) {
    const timer = setTimeout(() => {
      res.writeHead(200, {
        "content-type": "image/jpeg",
        "content-length": String(FILE_BYTES.length),
      });
      res.end(FILE_BYTES);
    }, 1500);
    res.on("close", () => clearTimeout(timer));
    return;
  }
  if (hash === FILE_HASH.slowBody) {
    res.writeHead(200, {
      "content-type": "image/jpeg",
      "content-length": String(FILE_BYTES.length),
    });
    res.flushHeaders();
    res.write(FILE_BYTES.subarray(0, 50));
    setTimeout(() => res.end(FILE_BYTES.subarray(50)), 600);
    return;
  }
  const type = name.endsWith(".pdf")
    ? "application/pdf"
    : name.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  const range = /^bytes=(\d+)-(\d*)$/.exec(String(req.headers.range ?? ""));
  const common = {
    "content-type": type,
    "accept-ranges": "bytes",
    etag: '"stand-in"',
    "set-cookie": "session=stand-in",
  };
  if (range) {
    const start = Number(range[1]);
    const end = range[2]
      ? Math.min(Number(range[2]), FILE_BYTES.length - 1)
      : FILE_BYTES.length - 1;
    if (start >= FILE_BYTES.length || end < start) {
      res.writeHead(416, { "content-range": `bytes */${FILE_BYTES.length}` });
      res.end();
      return;
    }
    const part = FILE_BYTES.subarray(start, end + 1);
    res.writeHead(206, {
      ...common,
      "content-length": String(part.length),
      "content-range": `bytes ${start}-${end}/${FILE_BYTES.length}`,
    });
    res.end(req.method === "HEAD" ? undefined : part);
    return;
  }
  res.writeHead(200, {
    ...common,
    "content-length": String(FILE_BYTES.length),
  });
  res.end(req.method === "HEAD" ? undefined : FILE_BYTES);
}

function startStandIn(): Promise<Server> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://stand-in");
    seen.push({
      path: url.pathname,
      search: url.search.slice(1),
      headers: req.headers,
    });
    if (!url.pathname.startsWith("/api/read/")) {
      serveFile(url.pathname.split("/").pop() ?? "", req, res);
      return;
    }
    const answer = standIn(url.pathname.split("/").pop() ?? "");
    if (answer.breakOff) {
      const body = Buffer.from(answer.body ?? "");
      const headers: Record<string, string> = {
        "content-type": answer.type ?? "application/json",
      };
      if (answer.breakOff === "sized") {
        headers["content-length"] = String(body.length);
      }
      res.writeHead(answer.status, headers);
      res.flushHeaders();
      res.write(body.subarray(0, Math.floor(body.length / 2)));
      // Long enough for the reader to have the headers and that part.
      setTimeout(() => res.socket?.destroy(), 150);
      return;
    }
    const send = () => {
      const headers: Record<string, string> = {};
      if (answer.type) headers["content-type"] = answer.type;
      if (answer.location) headers.location = answer.location;
      res.writeHead(answer.status, headers);
      res.end(answer.body ?? "");
    };
    if (answer.delayMs) setTimeout(send, answer.delayMs);
    else send();
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server))
  );
}

/* ------------------------------------------------------------------ */
/* The checks                                                          */
/* ------------------------------------------------------------------ */

function checkQueryStrings(): void {
  console.log("Query string");
  same(
    "a list is one key per entry",
    buildQueryString({ ids: ["a", "b"] }),
    "ids=a&ids=b"
  );
  const withComma = buildQueryString({ terms: ["3,500*", "white*"] });
  same(
    "a comma inside a value stays inside that value",
    new URLSearchParams(withComma).getAll("terms"),
    ["3,500*", "white*"]
  );
  check(
    "a comma is never a separator",
    !withComma.includes(",") && withComma.includes("terms=3%2C500*"),
    withComma
  );
  same(
    "an empty list is one empty entry",
    buildQueryString({ ids: [] }),
    "ids="
  );
  same(
    "a null or missing value is left out",
    buildQueryString({
      view: "collectionOrType",
      slug: "x",
      productType: null,
      pt: undefined,
    }),
    "slug=x&view=collectionOrType"
  );
  same(
    "a space and a plus survive",
    new URLSearchParams(
      buildQueryString({ pattern: "pacific quartz*", t: "a+b" })
    ).get("pattern"),
    "pacific quartz*"
  );
  same(
    "a plus is not read as a space",
    new URLSearchParams(buildQueryString({ t: "a+b" })).get("t"),
    "a+b"
  );
  same(
    "keys come sorted, list order kept",
    buildQueryString({ view: "ids", ids: ["z", "a"] }),
    "ids=z&ids=a&view=ids"
  );
}

function checkContentSource(): void {
  console.log("CONTENT_SOURCE");
  const before = process.env.CONTENT_SOURCE;
  const cases: [string | undefined, string][] = [
    [undefined, "sanity"],
    ["", "sanity"],
    ["sanity", "sanity"],
    ["cms", "cms"],
    ["CMS", "sanity"],
    [" cms", "sanity"],
    ["true", "sanity"],
  ];
  for (const [value, expected] of cases) {
    if (value === undefined) delete process.env.CONTENT_SOURCE;
    else process.env.CONTENT_SOURCE = value;
    same(
      `${JSON.stringify(value ?? null)} reads ${expected}`,
      contentSource(),
      expected
    );
  }
  if (before === undefined) delete process.env.CONTENT_SOURCE;
  else process.env.CONTENT_SOURCE = before;
}

async function checkFailLoud(base: string): Promise<void> {
  console.log("Fail loud");
  const list: ReadOptions = { expect: "list" };
  process.env.CMS_URL = base;
  process.env.CMS_READ_KEY = "dummy-read-key";
  process.env.CMS_PROTECTION_BYPASS = "dummy-bypass";

  await resolvesTo(
    "a 200 with a JSON list is the answer",
    () => readCmsAnswer("list", {}, list),
    [{ a: 1 }]
  );
  const last = seen[seen.length - 1];
  same(
    "the key is sent",
    last.headers[READ_KEY_HEADER],
    `${READ_KEY_SCHEME} dummy-read-key`
  );
  same(
    "the pass is sent",
    last.headers[PROTECTION_BYPASS_HEADER],
    "dummy-bypass"
  );
  same("the address is /api/read/<answer>", last.path, "/api/read/list");

  await resolvesTo(
    "an empty list is fine where it may be empty",
    () => readCmsAnswer("empty-list", {}, list),
    []
  );
  await resolvesTo(
    "null is fine where it may be null",
    () => readCmsAnswer("null", {}, { expect: "objectOrNull" }),
    null
  );
  await rejectsWithCmsError(
    "an empty list throws where it is never empty",
    () => readCmsAnswer("empty-list", {}, { expect: "list", neverEmpty: true })
  );
  await rejectsWithCmsError("the sitemap with no products throws", () =>
    readCmsPart("sitemap-empty", {}, "products", {
      expect: "list",
      neverEmpty: true,
    })
  );
  await resolvesTo(
    "the sitemap's empty posts are fine",
    () => readCmsPart("sitemap-empty", {}, "posts", { expect: "list" }),
    []
  );
  await rejectsWithCmsError("a missing part throws", () =>
    readCmsPart("sitemap-no-dates", {}, "dates", { expect: "object" })
  );
  await rejectsWithCmsError("a wrapped list throws", () =>
    readCmsAnswer("wrapped", {}, list)
  );
  await rejectsWithCmsError("null throws where a list is expected", () =>
    readCmsAnswer("null", {}, list)
  );
  await rejectsWithCmsError("a login page (200, HTML) throws", () =>
    readCmsAnswer("login-page", {}, list)
  );
  await rejectsWithCmsError("JSON text sent as HTML throws", () =>
    readCmsAnswer("json-text-as-html", {}, list)
  );
  await rejectsWithCmsError("a body with no content type throws", () =>
    readCmsAnswer("no-type", {}, list)
  );
  await rejectsWithCmsError("a body that is not JSON throws", () =>
    readCmsAnswer("bad-json", {}, list)
  );
  await rejectsWithCmsError("401 throws", () =>
    readCmsAnswer("s401", {}, list)
  );
  await rejectsWithCmsError("403 (HTML) throws", () =>
    readCmsAnswer("s403", {}, list)
  );
  await rejectsWithCmsError("404 throws", () =>
    readCmsAnswer("s404", {}, list)
  );
  await rejectsWithCmsError("500 throws", () =>
    readCmsAnswer("s500", {}, list)
  );
  await rejectsWithCmsError("a redirect throws and is not followed", () =>
    readCmsAnswer("redirect", {}, list)
  );
  await rejectsWithCmsError("no answer within the time limit throws", () =>
    readCmsAnswer("slow", {}, { expect: "list", timeoutMs: 300 })
  );
  await resolvesTo(
    "a picture address in an answer is passed on as it is",
    () => readCmsAnswer("pictures", {}, list),
    [
      {
        mainImage:
          "https://cms.example.com/api/media/file/0123456789abcdef0123456789abcdef.jpg",
        n: 1,
      },
    ]
  );

  // A port nothing listens on.
  const closed = await startStandIn();
  const closedPort = (closed.address() as AddressInfo).port;
  await new Promise((resolve) => closed.close(resolve));
  process.env.CMS_URL = `http://127.0.0.1:${closedPort}`;
  await rejectsWithCmsError("a network error throws", () =>
    readCmsAnswer("list", {}, list)
  );

  process.env.CMS_URL = "http://cms.example.com";
  await rejectsWithCmsError("a plain http address elsewhere throws", () =>
    readCmsAnswer("list", {}, list)
  );
  delete process.env.CMS_URL;
  await rejectsWithCmsError("no CMS_URL throws", () =>
    readCmsAnswer("list", {}, list)
  );
  process.env.CMS_URL = base;
  delete process.env.CMS_READ_KEY;
  await rejectsWithCmsError("no CMS_READ_KEY throws", () =>
    readCmsAnswer("list", {}, list)
  );
  process.env.CMS_READ_KEY = "dummy-read-key";
  delete process.env.CMS_PROTECTION_BYPASS;
  await readCmsAnswer("list", {}, list);
  check(
    "with no pass set, no pass header is sent",
    seen[seen.length - 1].headers[PROTECTION_BYPASS_HEADER] === undefined
  );
  process.env.CMS_PROTECTION_BYPASS = "dummy-bypass";
}

/** Picture and file addresses (src/lib/media-url.ts) and the helpers that use them. */
async function checkMediaUrls(): Promise<void> {
  console.log("Picture and file addresses");
  const before = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const m = await import("../src/lib/media-url");
  const { default: imageLoader } = await import("../src/lib/image-loader");
  const { sanityImg, sanityProxyUrl, sanityImageProxyUrl } =
    await import("../src/lib/sanity-img");
  const { zoomImageUrl } = await import("../src/lib/zoom-image");
  const { rewriteToProxy } =
    await import("../src/components/visualize/slab-texture");

  const h = "0123456789abcdef0123456789abcdef";
  const names: [string, boolean][] = [
    [`${h}.jpg`, true],
    [`${h}.jpeg`, true],
    [`${h}.avif`, true],
    [`${h}.pdf`, true],
    [`${h}-w256.webp`, true],
    [`${h}-w3840.webp`, true],
    [`${h}-share.jpg`, true],
    [`${h.slice(1)}.jpg`, false],
    [`${h.toUpperCase()}.jpg`, false],
    [`${h}-w300.webp`, false],
    [`${h}-w4000.webp`, false],
    [`${h}-big.webp`, false],
    [`${h}-w640-share.jpg`, false],
    [`${h}`, false],
    [`${h}.j`, false],
    [`${h}.jpegxl`, false],
    [`a/${h}.jpg`, false],
    [`../${h}.jpg`, false],
    [`${h}.jpg/..`, false],
  ];
  for (const [name, ok] of names) {
    check(
      `the name ${JSON.stringify(name)} is ${ok ? "accepted" : "refused"}`,
      m.MEDIA_NAME_RE.test(name) === ok
    );
  }
  same(
    "a width becomes the copy at or above it",
    [1, 256, 257, 390, 640, 750, 1170, 2048, 3840, 5000].map(m.mediaWidthFor),
    [256, 256, 384, 640, 640, 828, 1290, 2560, 3840, 3840]
  );

  // With no media host set: the CMS's own host always goes through /api/cdn/m/.
  const onCms = `https://cms.example.com/api/media/file/${h}.jpg`;
  check("the CMS's file route is CMS media", m.isCmsMedia(onCms));
  check(
    "this site's /api/cdn/m/ is CMS media",
    m.isCmsMedia(`/api/cdn/m/${h}.png`)
  );
  check(
    "a query after the name is ignored",
    m.isCmsMedia(`/api/media/file/${h}.jpg?x=1`)
  );
  for (const other of [
    `https://media.example.com/${h}.jpg`,
    `/api/media/file/sub/${h}.jpg`,
    `/api/cdn/images/p/d/${h}.jpg`,
    `https://cdn.sanity.io/images/p/d/${h}-10x10.jpg`,
    "/images/stone.jpg",
    "data:image/png;base64,AAAA",
    "",
  ]) {
    check(`${JSON.stringify(other)} is not CMS media`, !m.isCmsMedia(other));
  }
  same(
    "a width on the CMS host",
    m.cmsImg(onCms, { w: 700 }),
    `/api/cdn/m/${h}-w828.webp`
  );
  same(
    "the share card on the CMS host",
    m.cmsImg(onCms, { share: true }),
    `/api/cdn/m/${h}-share.jpg`
  );
  same(
    "no width keeps the original, through /api/cdn/m/",
    m.cmsImg(onCms),
    `/api/cdn/m/${h}.jpg`
  );
  same("toProxy on the CMS host", m.toProxy(onCms), `/api/cdn/m/${h}.jpg`);
  same(
    "a copy asked for at another width is cut again from its hash",
    m.cmsImg(`/api/cdn/m/${h}-w2560.webp`, { w: 640 }),
    `/api/cdn/m/${h}-w640.webp`
  );
  same(
    "a copy asked for with no width stays that copy",
    m.cmsImg(`/api/cdn/m/${h}-w2560.webp`),
    `/api/cdn/m/${h}-w2560.webp`
  );
  same(
    "above the largest copy: the largest",
    m.cmsImg(onCms, { w: 9000 }),
    `/api/cdn/m/${h}-w3840.webp`
  );
  const pdfOnCms = `https://cms.example.com/api/media/file/${h}.pdf`;
  same(
    "a PDF keeps its name at any width",
    m.cmsImg(pdfOnCms, { w: 640 }),
    `/api/cdn/m/${h}.pdf`
  );
  same(
    "a PDF has no share card",
    m.cmsImg(pdfOnCms, { share: true }),
    `/api/cdn/m/${h}.pdf`
  );
  same(
    "a video keeps its name",
    m.cmsImg(`https://cms.example.com/api/media/file/${h}.mp4`, { w: 1080 }),
    `/api/cdn/m/${h}.mp4`
  );
  same(
    "an address that is not CMS media is unchanged",
    m.cmsImg("/images/stone.jpg", { w: 640 }),
    "/images/stone.jpg"
  );
  same("no media host: no origin", m.mediaOrigin(), null);
  same(
    "a file name goes through /api/cdn/m/",
    m.cmsFileAddress(`${h}.pdf`),
    `/api/cdn/m/${h}.pdf`
  );

  same(
    "the image loader cuts a CMS picture before the local branch",
    imageLoader({ src: `/api/cdn/m/${h}.jpg`, width: 390 }),
    `/api/cdn/m/${h}-w640.webp`
  );
  same(
    "the image loader leaves Sanity as it was",
    imageLoader({
      src: "https://cdn.sanity.io/images/p/d/x-10x10.jpg",
      width: 640,
    }),
    "https://cdn.sanity.io/images/p/d/x-10x10.jpg?w=640&q=100&fit=max&auto=format"
  );
  same(
    "the image loader leaves other local files as they were",
    imageLoader({ src: "/no-such-file.jpg", width: 640 }),
    "/no-such-file.jpg?w=640"
  );
  same(
    "sanityImg on a CMS picture",
    sanityImg(onCms, { w: 720 }),
    `/api/cdn/m/${h}-w828.webp`
  );
  // A crop box asks for a copy that covers it for a picture twice as
  // wide as tall: the copy at or above max(w, 2 x h).
  same(
    "sanityImg on a CMS picture with a square crop covers it",
    sanityImg(onCms, { w: 1024, h: 1024, fit: "crop", q: 100 }),
    `/api/cdn/m/${h}-w2560.webp`
  );
  same(
    "sanityImg on a CMS picture with a tall crop asks for twice its height",
    sanityImg(onCms, { w: 216, h: 264, fit: "crop" }),
    `/api/cdn/m/${h}-w640.webp`
  );
  same(
    "a 240x180 crop box gets the 384 copy",
    sanityImg(onCms, { w: 240, h: 180, fit: "crop" }),
    `/api/cdn/m/${h}-w384.webp`
  );
  same(
    "a wide crop box asks for its width",
    m.cmsImg(onCms, { w: 1200, h: 300, crop: true }),
    `/api/cdn/m/${h}-w1290.webp`
  );
  same(
    "a crop box with only a height",
    m.cmsImg(onCms, { h: 300, crop: true }),
    `/api/cdn/m/${h}-w640.webp`
  );
  same(
    "a height without crop is not used",
    m.cmsImg(onCms, { w: 240, h: 900 }),
    `/api/cdn/m/${h}-w256.webp`
  );
  same(
    "sanityImg without fit crop ignores the height",
    sanityImg(onCms, { w: 240, h: 900 }),
    `/api/cdn/m/${h}-w256.webp`
  );
  same(
    "sanityImg leaves Sanity as it was",
    sanityImg("https://cdn.sanity.io/images/p/d/x-10x10.jpg", { w: 720 }),
    "https://cdn.sanity.io/images/p/d/x-10x10.jpg?w=720&q=90&fit=max&auto=format"
  );
  same(
    "sanityProxyUrl moves a CMS-host video to /api/cdn/m/",
    sanityProxyUrl(`https://cms.example.com/api/media/file/${h}.mp4`),
    `/api/cdn/m/${h}.mp4`
  );
  same(
    "sanityProxyUrl leaves Sanity files as they were",
    sanityProxyUrl("https://cdn.sanity.io/files/p/d/x.mp4"),
    "/api/cdn/files/p/d/x.mp4"
  );
  same(
    "zoom uses the largest copy",
    zoomImageUrl(onCms),
    `/api/cdn/m/${h}-w3840.webp`
  );
  same(
    "zoom leaves Sanity as it was",
    zoomImageUrl("https://cdn.sanity.io/images/p/d/x-10x10.jpg"),
    "https://cdn.sanity.io/images/p/d/x-10x10.jpg?auto=format&q=80"
  );
  same(
    "the visualiser draws the largest copy through /api/cdn/m/",
    rewriteToProxy(onCms),
    `/api/cdn/m/${h}-w3840.webp`
  );
  same(
    "the visualiser leaves Sanity as it was",
    rewriteToProxy("https://cdn.sanity.io/images/p/d/x-10x10.jpg"),
    "/api/cdn/images/p/d/x-10x10.jpg"
  );

  // With the media folder set (its full address, as the CMS's answers
  // carry it): pictures load from it directly.
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://media.example.com/media/";
  const folder = "https://media.example.com/media";
  const onMedia = `${folder}/${h}.jpg`;
  same("the setting is kept as the folder", m.mediaBaseUrl(), folder);
  check("the media folder is CMS media", m.isCmsMedia(onMedia));
  same("the media host's origin", m.mediaOrigin(), "https://media.example.com");
  same(
    "a width in the media folder",
    m.cmsImg(onMedia, { w: 1080 }),
    `${folder}/${h}-w1080.webp`
  );
  same(
    "the share card in the media folder",
    m.cmsImg(onMedia, { share: true }),
    `${folder}/${h}-share.jpg`
  );
  same("no width in the media folder: unchanged", m.cmsImg(onMedia), onMedia);
  same(
    "toProxy in the media folder",
    m.toProxy(onMedia),
    `/api/cdn/m/${h}.jpg`
  );
  same(
    "a PDF in the media folder is the original",
    m.cmsImg(`${folder}/${h}.pdf`, { w: 640 }),
    `${folder}/${h}.pdf`
  );
  same(
    "the CMS host still goes through /api/cdn/m/",
    m.cmsImg(onCms, { w: 1080 }),
    `/api/cdn/m/${h}-w1080.webp`
  );
  same(
    "a file name in the media folder",
    m.cmsFileAddress(`${h}.pdf`),
    `${folder}/${h}.pdf`
  );
  for (const other of [
    `https://media.example.com/${h}.jpg`,
    `https://media.example.com/other/${h}.jpg`,
    `https://media.example.com/media/sub/${h}.jpg`,
    `https://media.example.com/mediax/${h}.jpg`,
    `https://media.example.com.evil.example/media/${h}.jpg`,
    `${folder}/${h}-w300.webp`,
  ]) {
    check(`${JSON.stringify(other)} is not CMS media`, !m.isCmsMedia(other));
  }
  // A setting without the folder's path does not match the answers'
  // addresses: nothing is recognised, and each picture stays its original.
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://media.example.com";
  check(
    "a setting without the folder's path does not recognise <folder>/<name>",
    !m.isCmsMedia(onMedia)
  );
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = folder;
  same(
    "sanityImageProxyUrl takes a media-folder picture to /api/cdn/m/",
    sanityImageProxyUrl(onMedia),
    `/api/cdn/m/${h}.jpg`
  );
  same(
    "sanityProxyUrl leaves a media-folder video where it is",
    sanityProxyUrl(`${folder}/${h}.mp4`),
    `${folder}/${h}.mp4`
  );
  same(
    "the image loader in the media folder",
    imageLoader({ src: onMedia, width: 1170 }),
    `${folder}/${h}-w1290.webp`
  );
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "ftp://media.example.com";
  same("a media host that is not http(s) is ignored", m.mediaBaseUrl(), null);

  if (before === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = before;
}

/**
 * Each place the site shows a CMS picture or file (the design's picture
 * table), in both address forms: with the media folder set, and with
 * only the CMS's own file route. A Sanity address gets what that place
 * asked Sanity for. Canvas uses must be same-origin (/api/cdn/m/) in
 * both forms.
 */
async function checkCallSites(): Promise<void> {
  console.log("Each place a picture is shown, in both address forms");
  const before = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const beforeSource = process.env.CONTENT_SOURCE;
  const c = await import("../src/lib/picture-choices");
  const { default: imageLoader } = await import("../src/lib/image-loader");
  const { sanityImg, sanityProxyUrl } = await import("../src/lib/sanity-img");
  const { zoomImageUrl } = await import("../src/lib/zoom-image");
  const { toProxy } = await import("../src/lib/media-url");
  const { rewriteToProxy } =
    await import("../src/components/visualize/slab-texture");
  const { absoluteImage } = await import("../src/components/global/JsonLd");
  const { resourceHintOrigin } = await import("../src/cms/media");
  const { default: robots } = await import("../src/app/robots");

  const h = "0123456789abcdef0123456789abcdef";
  const folder = "https://media.example.com/media";
  const forms = [
    {
      form: "CMS host",
      setting: undefined,
      at: (name: string) => `https://cms.example.com/api/media/file/${name}`,
      // Where a page loads a copy from: this site's pass-through.
      shown: (name: string) => `/api/cdn/m/${name}`,
    },
    {
      form: "media folder",
      setting: folder,
      at: (name: string) => `${folder}/${name}`,
      shown: (name: string) => `${folder}/${name}`,
    },
  ] as const;

  for (const { form, setting, at, shown } of forms) {
    if (setting) process.env.NEXT_PUBLIC_MEDIA_BASE_URL = setting;
    else delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    const pic = at(`${h}.jpg`);
    const site = (name: string) => `/api/cdn/m/${name}`;
    const cases: [string, unknown, unknown][] = [
      [
        "every <Image> (the loader) at 390",
        imageLoader({ src: pic, width: 390 }),
        shown(`${h}-w640.webp`),
      ],
      [
        "every <Image> (the loader) at 3840",
        imageLoader({ src: pic, width: 3840 }),
        shown(`${h}-w3840.webp`),
      ],
      [
        "sanityImg at w 720 (product cards)",
        sanityImg(pic, { w: 720 }),
        shown(`${h}-w828.webp`),
      ],
      [
        "sanityImg at w 120 (search results)",
        sanityImg(pic, { w: 120 }),
        shown(`${h}-w256.webp`),
      ],
      [
        "sanityImg, a 1024 square crop (the visualiser's favourites)",
        sanityImg(pic, { w: 1024, h: 1024, fit: "crop", q: 100 }),
        shown(`${h}-w2560.webp`),
      ],
      [
        "sanityImg at w 1600 (product and blog heroes)",
        sanityImg(pic, { w: 1600 }),
        shown(`${h}-w1920.webp`),
      ],
      [
        "the zoom and its preloads",
        zoomImageUrl(pic),
        shown(`${h}-w3840.webp`),
      ],
      [
        "facades: the lightbox keeps the answer's copy",
        c.finishFullImageUrl({
          fullImage: at(`${h}-w2560.webp`),
          mainImage: pic,
        }),
        shown(`${h}-w2560.webp`),
      ],
      [
        "signature projects: the video poster",
        c.thumbUrl(pic),
        shown(`${h}-w828.webp`),
      ],
      [
        "applications: a tile's CSS background, loaded directly",
        c.tileBackgroundUrl(pic),
        shown(`${h}-w1290.webp`),
      ],
      [
        "the visualiser's dock thumbnail",
        c.slabPickerThumbUrl(pic),
        shown(`${h}-w384.webp`),
      ],
      [
        "vanity tops: the swatch (canvas, same origin)",
        c.swatchUrl(pic),
        site(`${h}-w256.webp`),
      ],
      [
        "the basin preview at 900 (canvas, same origin)",
        c.slabUrl(pic, 900),
        site(`${h}-w1080.webp`),
      ],
      [
        "the visualiser's texture (canvas, same origin)",
        rewriteToProxy(pic),
        site(`${h}-w3840.webp`),
      ],
      [
        "the finish lightbox's main picture",
        c.lightboxImageUrl(pic),
        shown(`${h}-w3840.webp`),
      ],
      [
        "the finish lightbox's thumbnails",
        c.lightboxThumbUrl(pic),
        shown(`${h}-w256.webp`),
      ],
      [
        "the catalogue reader's cover",
        c.resourcePosterUrl(pic),
        shown(`${h}-w1080.webp`),
      ],
      [
        "a blog post's inline image",
        c.cmsInlineSources(pic),
        {
          src: shown(`${h}-w1920.webp`),
          srcSet: [640, 1080, 1920]
            .map((w) => `${shown(`${h}-w${w}.webp`)} ${w}w`)
            .join(", "),
        },
      ],
      [
        "a blog post's inline image is found by its asset",
        c.cmsInlineImage({ asset: { url: pic, width: 1600, height: 900 } }),
        { url: pic, width: 1600, height: 900 },
      ],
      [
        "a video keeps its file",
        sanityProxyUrl(at(`${h}.mp4`)),
        shown(`${h}.mp4`),
      ],
      [
        "the catalogue reader's PDF (same origin, for its byte ranges)",
        c.resourcePdfUrl(at(`${h}.pdf`)),
        site(`${h}.pdf`),
      ],
      [
        "a download link (same origin, for its file name and ranges)",
        toProxy(at(`${h}.pdf`)),
        site(`${h}.pdf`),
      ],
      [
        "structured data: an absolute address",
        absoluteImage(pic),
        setting
          ? `${folder}/${h}.jpg`
          : `https://pacific-surfaces.com/api/cdn/m/${h}.jpg`,
      ],
    ];
    for (const [where, actual, expected] of cases) {
      same(`${form}: ${where}`, actual, expected);
    }
  }

  // A Sanity address: what each place asked Sanity for, unchanged.
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const S = "https://cdn.sanity.io/images/p/d/x-2000x1000.jpg";
  const sanityCases: [string, unknown, unknown][] = [
    [
      "the loader",
      imageLoader({ src: S, width: 640 }),
      `${S}?w=640&q=100&fit=max&auto=format`,
    ],
    [
      "sanityImg",
      sanityImg(S, { w: 720 }),
      `${S}?w=720&q=90&fit=max&auto=format`,
    ],
    ["the zoom", zoomImageUrl(S), `${S}?auto=format&q=80`],
    [
      "the facades lightbox",
      c.finishFullImageUrl({
        fullImage: `${S}?w=2400&fit=max&auto=format`,
        mainImage: S,
      }),
      `${S}?w=2400&fit=max&auto=format`,
    ],
    [
      "the facades lightbox with no full image",
      c.finishFullImageUrl({ fullImage: null, mainImage: S }),
      S,
    ],
    ["the video poster", c.thumbUrl(S), `${S}?w=800&fit=max&q=70&auto=format`],
    [
      "a tile background",
      c.tileBackgroundUrl(S),
      "/api/cdn/images/p/d/x-2000x1000.jpg?w=1200&fit=max&q=70&fm=webp",
    ],
    [
      "the dock thumbnail",
      c.slabPickerThumbUrl(S),
      `${S}?w=240&h=180&fit=crop&q=70&auto=format`,
    ],
    [
      "the vanity swatch",
      c.swatchUrl(S),
      "/api/cdn/images/p/d/x-2000x1000.jpg?w=120&q=90&fit=max&fm=webp",
    ],
    ["no vanity swatch", c.swatchUrl(null), undefined],
    ["the finish lightbox", c.lightboxImageUrl(S), S],
    ["the finish lightbox's thumbnails", c.lightboxThumbUrl(S), S],
    ["the catalogue reader's cover", c.resourcePosterUrl(S), S],
    [
      "the catalogue reader's cover, a local file",
      c.resourcePosterUrl("/catalogues/cover.webp"),
      "/catalogues/cover.webp",
    ],
    ["no cover", c.resourcePosterUrl(undefined), undefined],
    [
      "the catalogue reader's PDF",
      c.resourcePdfUrl("https://cdn.sanity.io/files/p/d/x.pdf"),
      "https://cdn.sanity.io/files/p/d/x.pdf",
    ],
    [
      "the catalogue reader's PDF, a local file",
      c.resourcePdfUrl("/catalogues/x.pdf"),
      "/catalogues/x.pdf",
    ],
    ["no PDF", c.resourcePdfUrl(undefined), undefined],
    [
      "the basin preview",
      c.slabUrl(S, 900),
      "/api/cdn/images/p/d/x-2000x1000.jpg?w=900&fit=max&q=100",
    ],
    [
      "the visualiser's texture",
      rewriteToProxy(S),
      "/api/cdn/images/p/d/x-2000x1000.jpg",
    ],
    [
      "a blog post's inline image is not a CMS one",
      c.cmsInlineImage({ asset: { _ref: "image-x-2000x1000-jpg" } }),
      null,
    ],
    [
      "a blog post's inline image with a Sanity address is not a CMS one",
      c.cmsInlineImage({ asset: { _ref: "image-x-2000x1000-jpg", url: S } }),
      null,
    ],
    [
      "a Sanity file link",
      toProxy("https://cdn.sanity.io/files/p/d/x.pdf"),
      "https://cdn.sanity.io/files/p/d/x.pdf",
    ],
    ["structured data", absoluteImage(S), S],
    [
      "structured data, a local file",
      absoluteImage("/images/x.jpg"),
      "https://pacific-surfaces.com/images/x.jpg",
    ],
    [
      "a local file in the dock",
      c.slabPickerThumbUrl("/images/x.jpg"),
      "/images/x.jpg",
    ],
  ];
  for (const [where, actual, expected] of sanityCases) {
    same(`Sanity: ${where}`, actual, expected);
  }

  // The layout's hints and robots.txt, with the source unset: as before.
  delete process.env.CONTENT_SOURCE;
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = folder;
  same(
    "source unset: the hints go to Sanity, media folder or not",
    resourceHintOrigin(),
    "https://cdn.sanity.io"
  );
  same("source unset: robots.txt is as before", robots(), {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/cdn/files/", "/api/cdn/images/"],
        disallow: ["/api/", "/studio/", "/_archive/"],
      },
    ],
    sitemap: "https://pacific-surfaces.com/sitemap.xml",
  });
  process.env.CONTENT_SOURCE = "cms";
  same(
    "source cms: the hints go to the media host",
    resourceHintOrigin(),
    "https://media.example.com"
  );
  same("source cms: robots.txt allows /api/cdn/m/ too", robots().rules, [
    {
      userAgent: "*",
      allow: ["/", "/api/cdn/files/", "/api/cdn/images/", "/api/cdn/m/"],
      disallow: ["/api/", "/studio/", "/_archive/"],
    },
  ]);
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  same("source cms with no media folder: no hint", resourceHintOrigin(), null);

  if (before === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = before;
  if (beforeSource === undefined) delete process.env.CONTENT_SOURCE;
  else process.env.CONTENT_SOURCE = beforeSource;
}

/**
 * /api/cdn/m/<name> (src/cms/media-proxy.ts), the share card fetch
 * (src/cms/media.ts) and the old-address redirect (src/cms/legacy-files.ts).
 */
async function checkMediaProxy(base: string): Promise<void> {
  console.log("/api/cdn/m/, share cards and old addresses");
  const { proxyCmsMedia } = await import("../src/cms/media-proxy");
  const { cmsShareImage } = await import("../src/cms/media");
  const { legacyTarget } = await import("../src/cms/legacy-files");
  const beforeMedia = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  process.env.CMS_URL = base;
  process.env.CMS_PROTECTION_BYPASS = "dummy-bypass";
  process.env.CMS_READ_KEY = "dummy-read-key";
  const readKey = `${READ_KEY_SCHEME} dummy-read-key`;
  const h = FILE_HASH.ok;
  process.env.CONTENT_SOURCE = "cms";
  const ask = (
    name: string,
    headers: Record<string, string> = {},
    method: "GET" | "HEAD" = "GET"
  ) =>
    proxyCmsMedia(
      new Request(`http://site.example/api/cdn/m/${encodeURIComponent(name)}`, {
        method,
        headers,
      }),
      name,
      method
    );

  // Refusals: nothing is fetched.
  for (const [label, name] of [
    ["a bad name", "not-a-name.jpg"],
    ["a name that is too short", `${h.slice(2)}.jpg`],
    ["a path", `x/${h}.jpg`],
    ["a dot-dot", `../${h}.jpg`],
    ["a dot-dot after the name", `${h}.jpg/../../etc`],
    ["an unknown suffix", `${h}-w300.webp`],
    ["another unknown suffix", `${h}-big.jpg`],
    ["an upper-case name", `${h.toUpperCase()}.jpg`],
  ] as const) {
    const before = seen.length;
    const response = await ask(name);
    check(
      `${label} is refused with 404, and nothing is fetched`,
      response.status === 404 && seen.length === before,
      `status ${response.status}`
    );
  }

  // With CONTENT_SOURCE unset: not found, as before the route existed.
  delete process.env.CONTENT_SOURCE;
  let before = seen.length;
  const unset = await ask(`${h}.jpg`);
  check(
    "with CONTENT_SOURCE unset, a good name is 404 and nothing is fetched",
    unset.status === 404 &&
      (await unset.text()) === "Not found." &&
      seen.length === before
  );
  process.env.CONTENT_SOURCE = "cms";

  // From the CMS's file route, with the pass.
  before = seen.length;
  let response = await ask(`${h}.jpg`);
  let sent = seen.slice(before);
  const body = Buffer.from(await response.arrayBuffer());
  check(
    "a file from the CMS is 200",
    response.status === 200,
    `status ${response.status}`
  );
  same("its bytes are the file's", body.toString(), FILE_BYTES.toString());
  same(
    "it was asked for at the CMS's file route",
    sent.map((x) => x.path),
    [`/api/media/file/${h}.jpg`]
  );
  same(
    "the pass goes to the CMS",
    sent[0]?.headers[PROTECTION_BYPASS_HEADER],
    "dummy-bypass"
  );
  same(
    "the reader key goes to the CMS (its file route answers no one else)",
    sent[0]?.headers[READ_KEY_HEADER],
    readKey
  );
  same(
    "the bytes are asked for as stored",
    sent[0]?.headers["accept-encoding"],
    "identity"
  );
  same(
    "its type is passed on",
    response.headers.get("content-type"),
    "image/jpeg"
  );
  same(
    "its length is passed on",
    response.headers.get("content-length"),
    "100"
  );
  same("ranges are offered", response.headers.get("accept-ranges"), "bytes");
  same(
    "it is kept a year",
    response.headers.get("cache-control"),
    "public, max-age=31536000, s-maxage=31536000, immutable"
  );
  check("no cookie comes through", response.headers.get("set-cookie") === null);
  check("nothing else comes through", response.headers.get("etag") === null);

  response = await ask(`${h}.pdf`, { range: "bytes=10-19" });
  const part = Buffer.from(await response.arrayBuffer());
  same("a Range is answered 206", response.status, 206);
  same(
    "with its Content-Range",
    response.headers.get("content-range"),
    "bytes 10-19/100"
  );
  same("with its Content-Length", response.headers.get("content-length"), "10");
  same(
    "with just those bytes",
    part.toString(),
    FILE_BYTES.subarray(10, 20).toString()
  );
  same(
    "with the file's type",
    response.headers.get("content-type"),
    "application/pdf"
  );
  same(
    "the Range was passed on",
    seen[seen.length - 1]?.headers.range,
    "bytes=10-19"
  );
  response = await ask(`${h}.pdf`, { range: "bytes=500-" });
  same("a Range past the end is 416", response.status, 416);
  same(
    "with the file's size",
    response.headers.get("content-range"),
    "bytes */100"
  );
  response = await ask(`${h}-w640.webp`, {}, "HEAD");
  check(
    "HEAD gives the headers and no body",
    response.status === 200 &&
      response.headers.get("content-length") === "100" &&
      (await response.arrayBuffer()).byteLength === 0
  );
  response = await ask(`${FILE_HASH.missing}-share.jpg`);
  same("a 404 is passed on", response.status, 404);
  same("as this site's own text", await response.text(), "Not found.");
  for (const [label, hash] of [
    ["a refusal (401, a login page)", FILE_HASH.refused],
    ["a 500", FILE_HASH.broken],
    ["a redirect", FILE_HASH.moved],
  ] as const) {
    response = await ask(`${hash}.jpg`);
    const text = await response.text();
    check(
      `${label} becomes an empty 502`,
      response.status === 502 && text === "",
      `status ${response.status}, ${JSON.stringify(text)}`
    );
  }
  // The upstream has a time limit for its headers, not for its body.
  const { MEDIA_HEADERS_TIMEOUT_MS } = await import("../src/cms/media-proxy");
  same(
    "the upstream has 10 s to start answering",
    MEDIA_HEADERS_TIMEOUT_MS,
    10_000
  );
  const askWithin = (name: string, ms: number) =>
    proxyCmsMedia(
      new Request(`http://site.example/api/cdn/m/${name}`),
      name,
      "GET",
      ms
    );
  let started = Date.now();
  response = await askWithin(`${FILE_HASH.held}.jpg`, 300);
  let took = Date.now() - started;
  check(
    "an upstream that holds its headers past the limit is dropped: an empty 502",
    response.status === 502 && (await response.text()) === "" && took < 1200,
    `status ${response.status} after ${took} ms`
  );
  same("with no cache", response.headers.get("cache-control"), "no-store");
  started = Date.now();
  response = await askWithin(`${FILE_HASH.slowBody}.jpg`, 300);
  let slowBytes = "";
  try {
    slowBytes = Buffer.from(await response.arrayBuffer()).toString();
  } catch (error) {
    slowBytes = `failed: ${error instanceof Error ? error.message : error}`;
  }
  took = Date.now() - started;
  check(
    "a body slower than the limit still arrives whole (the timer is cleared)",
    response.status === 200 &&
      slowBytes === FILE_BYTES.toString() &&
      took >= 500,
    `status ${response.status}, ${slowBytes.slice(0, 40)}, ${took} ms`
  );

  delete process.env.CMS_PROTECTION_BYPASS;
  before = seen.length;
  await ask(`${h}.jpg`);
  check(
    "with no pass set, no pass is sent",
    seen[before]?.headers[PROTECTION_BYPASS_HEADER] === undefined
  );
  same(
    "with no pass set, the reader key still is",
    seen[before]?.headers[READ_KEY_HEADER],
    readKey
  );
  process.env.CMS_PROTECTION_BYPASS = "dummy-bypass";
  delete process.env.CMS_READ_KEY;
  before = seen.length;
  response = await ask(`${h}.jpg`);
  check(
    "with no reader key set, the CMS's file route is not asked (404)",
    response.status === 404 && seen.length === before,
    `status ${response.status}`
  );
  same(
    "and a share card from it is none",
    await cmsShareImage(`/api/cdn/m/${h}.jpg`),
    undefined
  );
  check("nothing was fetched for it", seen.length === before);
  process.env.CMS_READ_KEY = "dummy-read-key";

  // From the media folder: no pass and no key.
  const mediaHost = await startStandIn();
  const mediaBase = `http://127.0.0.1:${(mediaHost.address() as AddressInfo).port}`;
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = `${mediaBase}/media`;
  before = seen.length;
  response = await ask(`${h}-w1080.webp`, { range: "bytes=0-9" });
  sent = seen.slice(before);
  same(
    "with the media folder set, the file comes from <folder>/<name>",
    sent.map((x) => x.path),
    [`/media/${h}-w1080.webp`]
  );
  check(
    "the media host never sees the pass",
    sent[0]?.headers[PROTECTION_BYPASS_HEADER] === undefined
  );
  check(
    "the media host never sees the reader key",
    sent[0]?.headers[READ_KEY_HEADER] === undefined
  );
  same("a Range from the media host is 206", response.status, 206);
  same(
    "with its Content-Range",
    response.headers.get("content-range"),
    "bytes 0-9/100"
  );
  await response.arrayBuffer();

  // Share cards for the share images.
  const share = await cmsShareImage(`${mediaBase}/media/${h}.png`);
  same(
    "a share card from the media folder",
    share,
    `data:image/jpeg;base64,${FILE_BYTES.toString("base64")}`
  );
  same(
    "asked for by its share name, in the folder",
    seen[seen.length - 1]?.path,
    `/media/${h}-share.jpg`
  );
  check(
    "the media host never sees the pass for a share card",
    seen[seen.length - 1]?.headers[PROTECTION_BYPASS_HEADER] === undefined
  );
  check(
    "the media host never sees the reader key for a share card",
    seen[seen.length - 1]?.headers[READ_KEY_HEADER] === undefined
  );
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const shareOnCms = await cmsShareImage(
    `https://cms.example.com/api/media/file/${h}.jpg`
  );
  same(
    "a share card from the CMS's file route",
    shareOnCms,
    `data:image/jpeg;base64,${FILE_BYTES.toString("base64")}`
  );
  same(
    "fetched from CMS_URL, whatever host the address names",
    seen[seen.length - 1]?.path,
    `/api/media/file/${h}-share.jpg`
  );
  same(
    "with the pass",
    seen[seen.length - 1]?.headers[PROTECTION_BYPASS_HEADER],
    "dummy-bypass"
  );
  same(
    "and the reader key",
    seen[seen.length - 1]?.headers[READ_KEY_HEADER],
    readKey
  );
  // The share images' choice of picture, in both forms and for Sanity.
  const { shareBackground } = await import("../src/cms/media");
  same(
    "the share image draws a CMS-host picture's share card",
    await shareBackground(`https://cms.example.com/api/media/file/${h}.jpg`),
    `data:image/jpeg;base64,${FILE_BYTES.toString("base64")}`
  );
  same(
    "fetched by its share name",
    seen[seen.length - 1]?.path,
    `/api/media/file/${h}-share.jpg`
  );
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = `${mediaBase}/media`;
  same(
    "the share image draws a media-folder picture's share card",
    await shareBackground(`${mediaBase}/media/${h}.jpg`),
    `data:image/jpeg;base64,${FILE_BYTES.toString("base64")}`
  );
  same(
    "from the folder, by its share name",
    seen[seen.length - 1]?.path,
    `/media/${h}-share.jpg`
  );
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  before = seen.length;
  same(
    "the share image cuts a Sanity picture as before",
    await shareBackground("https://cdn.sanity.io/images/p/d/x-2000x1000.jpg"),
    "https://cdn.sanity.io/images/p/d/x-2000x1000.jpg?w=1200&h=630&q=80&fit=crop&auto=format"
  );
  same(
    "no picture, no share background",
    await shareBackground(null),
    undefined
  );
  check("nothing was fetched for those", seen.length === before);
  same(
    "a missing share card gives none",
    await cmsShareImage(`/api/cdn/m/${FILE_HASH.missing}.jpg`),
    undefined
  );
  same(
    "a refused share card gives none",
    await cmsShareImage(`/api/cdn/m/${FILE_HASH.refused}.jpg`),
    undefined
  );
  same(
    "a PDF has no share card",
    await cmsShareImage(`/api/cdn/m/${h}.pdf`),
    undefined
  );
  before = seen.length;
  same(
    "a Sanity picture is not fetched here",
    await cmsShareImage("https://cdn.sanity.io/images/p/d/x-10x10.jpg"),
    undefined
  );
  check("nothing was fetched for it", seen.length === before);

  // With nothing set: not found.
  delete process.env.CMS_URL;
  response = await ask(`${h}.jpg`);
  same(
    "with neither the media host nor CMS_URL set, 404",
    response.status,
    404
  );
  process.env.CMS_URL = base;

  // A redirect is never followed: the file store's 302 points at a second
  // stand-in on another origin, which serves a file to anyone. It must
  // receive no request at all, so neither the pass nor the key can reach
  // it, whatever headers a followed request would carry.
  const trapSeen: string[] = [];
  const trap = createServer((req, res) => {
    trapSeen.push(`${req.method} ${req.url}`);
    res.writeHead(200, {
      "content-type": "image/jpeg",
      "content-length": String(FILE_BYTES.length),
    });
    res.end(req.method === "HEAD" ? undefined : FILE_BYTES);
  });
  await new Promise<void>((resolve) =>
    trap.listen(0, "127.0.0.1", () => resolve())
  );
  movedTo = `http://127.0.0.1:${(trap.address() as AddressInfo).port}/${h}.jpg`;
  const moved = FILE_HASH.moved;
  for (const [form, folder] of [
    ["the CMS's file route", undefined],
    ["the media folder", `${mediaBase}/media`],
  ] as const) {
    if (folder) process.env.NEXT_PUBLIC_MEDIA_BASE_URL = folder;
    else delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    before = seen.length;
    response = await ask(`${moved}.jpg`);
    await response.arrayBuffer();
    check(
      `from ${form}, a redirect becomes an empty 502`,
      response.status === 502 && seen.length === before + 1,
      `status ${response.status}`
    );
    response = await ask(`${moved}.jpg`, {}, "HEAD");
    check(
      `from ${form}, a redirect on HEAD becomes a 502`,
      response.status === 502,
      `status ${response.status}`
    );
    same(
      `from ${form}, a redirected share card gives none`,
      await cmsShareImage(`/api/cdn/m/${moved}.jpg`),
      undefined
    );
    same(`from ${form}, the redirect's target was never asked`, trapSeen, []);
  }
  delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  movedTo = "https://example.com/login";
  await new Promise((resolve) => trap.close(resolve));
  await new Promise((resolve) => mediaHost.close(resolve));

  // Old Sanity addresses.
  const old =
    "https://cdn.sanity.io/images/zg1p4qgs/production/1111111111111111111111111111111111111111-1760x2336.jpg";
  const oldPdf =
    "https://cdn.sanity.io/files/zg1p4qgs/production/2222222222222222222222222222222222222222.pdf";
  const files = {
    [old]: `${h}.jpg`,
    [oldPdf]: `${h}.pdf`,
    "https://cdn.sanity.io/x": "../etc",
  };
  same(
    "an old picture address goes to its original",
    legacyTarget(files, old, null),
    `/api/cdn/m/${h}.jpg`
  );
  same(
    "with w, to the copy at or above it",
    legacyTarget(files, old, "1200"),
    `/api/cdn/m/${h}-w1290.webp`
  );
  same(
    "a w that is not a number is ignored",
    legacyTarget(files, old, "big"),
    `/api/cdn/m/${h}.jpg`
  );
  same(
    "an old PDF address goes to the PDF, w or not",
    legacyTarget(files, oldPdf, "640"),
    `/api/cdn/m/${h}.pdf`
  );
  same(
    "an unknown address is left to Sanity",
    legacyTarget(files, `${old}x`, null),
    null
  );
  same(
    "a name that is not a CMS name is left to Sanity",
    legacyTarget(files, "https://cdn.sanity.io/x", null),
    null
  );
  same("no list leaves it to Sanity", legacyTarget(null, old, null), null);
  same(
    "an inherited key is not a match",
    legacyTarget(files, "constructor", null),
    null
  );
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://media.example.com/media";
  same(
    "with the media folder set, it goes there",
    legacyTarget(files, old, "640"),
    `https://media.example.com/media/${h}-w640.webp`
  );
  if (beforeMedia === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = beforeMedia;
  delete process.env.CONTENT_SOURCE;
}

/**
 * The guard against settings that do not match: a picture original in an
 * answer that this site would not recognise in its media folder, or that
 * is on a host other than CMS_URL's, is logged once per host, naming only
 * the host. The answer is passed on unchanged.
 */
async function checkPictureHostGuard(base: string): Promise<void> {
  console.log("Pictures on a host the settings do not expect");
  const beforeMedia = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  process.env.CMS_URL = base;
  process.env.CMS_READ_KEY = "dummy-read-key";
  const h = "0123456789abcdef0123456789abcdef";
  const cmsHost = new URL(base).host;
  const warned: string[] = [];
  const realWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warned.push(args.map(String).join(" "));
  };
  let n = 0;
  const readWith = async (addresses: string[]) => {
    n += 1;
    const name = `guard-${n}`;
    const body = addresses.map((mainImage) => ({ mainImage }));
    overrides.set(name, json(body));
    try {
      return await readCmsAnswer(name, {}, { expect: "list" });
    } finally {
      overrides.delete(name);
    }
  };
  const warnedFor = async (
    setting: string | undefined,
    addresses: string[]
  ) => {
    if (setting) process.env.NEXT_PUBLIC_MEDIA_BASE_URL = setting;
    else delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    const from = warned.length;
    const value = await readWith(addresses);
    return { value, lines: warned.slice(from) };
  };
  try {
    // The lead case: the setting is the host without the folder's path.
    // The answer's address starts with it, yet no helper recognises it.
    let r = await warnedFor("https://media-a.example.com", [
      `https://media-a.example.com/media/${h}.jpg`,
    ]);
    check(
      "a setting without the folder's path: one warning, naming the host",
      r.lines.length === 1 && r.lines[0].includes("media-a.example.com"),
      JSON.stringify(r.lines)
    );
    check(
      "the warning names no file, path or key",
      r.lines.every(
        (line) =>
          !line.includes(h) &&
          !line.includes("/media/") &&
          !line.includes("dummy-read-key")
      ),
      JSON.stringify(r.lines)
    );
    same("the answer is passed on unchanged", r.value, [
      { mainImage: `https://media-a.example.com/media/${h}.jpg` },
    ]);
    r = await warnedFor("https://media-a.example.com", [
      `https://media-a.example.com/media/${"1".repeat(32)}.png`,
    ]);
    same("the same host again: no second warning", r.lines, []);
    r = await warnedFor(undefined, [
      `https://media-b.example.com/media/${h}.jpg`,
    ]);
    check(
      "no media folder set: a picture on a media host is warned about",
      r.lines.length === 1 && r.lines[0].includes("media-b.example.com"),
      JSON.stringify(r.lines)
    );
    r = await warnedFor(undefined, [
      `https://other-cms.example.com/api/media/file/${h}.jpg`,
    ]);
    check(
      "the CMS's file route on a host other than CMS_URL's is warned about",
      r.lines.length === 1 && r.lines[0].includes("other-cms.example.com"),
      JSON.stringify(r.lines)
    );
    r = await warnedFor("https://media-c.example.com/media", [
      `https://media-c.example.com/media/${h}.jpg`,
      `https://media-c.example.com/media/${h}.avif`,
    ]);
    same("pictures in the media folder set: no warning", r.lines, []);
    r = await warnedFor("https://media-c.example.com/media", [
      `https://media-c.example.com/media/sub/${h}.jpg`,
    ]);
    check(
      "a picture in a sub-folder of the media folder is warned about",
      r.lines.length === 1 && r.lines[0].includes("media-c.example.com"),
      JSON.stringify(r.lines)
    );
    r = await warnedFor(undefined, [
      `${base.replace(/\/$/, "")}/api/media/file/${h}.jpg`,
    ]);
    same(`pictures on CMS_URL's host (${cmsHost}): no warning`, r.lines, []);
    r = await warnedFor(undefined, [
      "https://cdn.sanity.io/images/p/d/1111111111111111111111111111111111111111-10x10.jpg",
      `https://media-d.example.com/media/${h}-w2560.webp`,
      `https://media-d.example.com/media/${h}.pdf`,
      "https://images.unsplash.com/photo-1?w=800",
    ]);
    same(
      "Sanity, a ready-made copy, a PDF, another site: no warning",
      r.lines,
      []
    );
    // The guard never throws: a read whose guard threw would fail.
    const settled = async (addresses: string[]) => {
      try {
        return await warnedFor(undefined, addresses);
      } catch (error) {
        return { value: `the read failed: ${String(error)}`, lines: [] };
      }
    };
    const refused = `http://[x/media/${h}.jpg`;
    const after = `https://media-e.example.com/media/${h}.jpg`;
    let s = await settled([refused, after]);
    same(
      "an address new URL refuses: the answer is passed on unchanged",
      s.value,
      [{ mainImage: refused }, { mainImage: after }]
    );
    check(
      "an address new URL refuses is skipped, and a picture after it is still warned about",
      s.lines.length === 1 && s.lines[0].includes("media-e.example.com"),
      JSON.stringify(s.lines)
    );
    console.warn = () => {
      throw new Error("the warning cannot be written");
    };
    const unwritten = `https://media-f.example.com/media/${h}.jpg`;
    s = await settled([unwritten]);
    same(
      "a warning that cannot be written: the answer is passed on unchanged",
      s.value,
      [{ mainImage: unwritten }]
    );
  } finally {
    console.warn = realWarn;
    if (beforeMedia === undefined)
      delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    else process.env.NEXT_PUBLIC_MEDIA_BASE_URL = beforeMedia;
  }
}

/**
 * Which failures a softening call site passes on. A set-up fault
 * (401, 403, 404, a redirect, an answer that is not JSON or of the
 * wrong kind, an empty answer where one is never empty, a missing
 * setting) is passed on; a timeout, a network error or a 5xx falls back
 * to the call site's softer version, as a Sanity failure does.
 */
async function checkPassingFailures(base: string): Promise<void> {
  console.log("Set-up faults against failures that may pass");
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "dummyproject";
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= "dummy";
  const { throwIfCmsFailure } = await import("../src/cms/client");
  const list: ReadOptions = { expect: "list" };
  process.env.CMS_URL = base;
  process.env.CMS_READ_KEY = "dummy-read-key";

  const failureOf = async (run: () => Promise<unknown>): Promise<unknown> => {
    try {
      await run();
    } catch (error) {
      return error;
    }
    return new Error("it did not fail");
  };
  const passedOn = (error: unknown): boolean => {
    if (!isCmsReadError(error)) return false;
    try {
      throwIfCmsFailure(error);
    } catch {
      return true;
    }
    return false;
  };

  const setUpFaults: [string, () => Promise<unknown>][] = [
    ["401", () => readCmsAnswer("s401", {}, list)],
    ["403", () => readCmsAnswer("s403", {}, list)],
    ["404", () => readCmsAnswer("s404", {}, list)],
    ["a redirect", () => readCmsAnswer("redirect", {}, list)],
    ["a login page (200, HTML)", () => readCmsAnswer("login-page", {}, list)],
    [
      "JSON text sent as HTML",
      () => readCmsAnswer("json-text-as-html", {}, list),
    ],
    ["a body that is not JSON", () => readCmsAnswer("bad-json", {}, list)],
    ["a wrapped list", () => readCmsAnswer("wrapped", {}, list)],
    [
      "an empty list where it is never empty",
      () =>
        readCmsAnswer("empty-list", {}, { expect: "list", neverEmpty: true }),
    ],
    [
      "a missing part",
      () => readCmsPart("sitemap-no-dates", {}, "dates", { expect: "object" }),
    ],
  ];
  for (const [name, run] of setUpFaults) {
    check(`${name} is passed on`, passedOn(await failureOf(run)));
  }
  delete process.env.CMS_URL;
  check(
    "no CMS_URL is passed on",
    passedOn(await failureOf(() => readCmsAnswer("list", {}, list)))
  );
  process.env.CMS_URL = base;

  const mayPass: [string, () => Promise<unknown>][] = [
    ["500", () => readCmsAnswer("s500", {}, list)],
    ["503 (HTML)", () => readCmsAnswer("s503", {}, list)],
    [
      "no answer within the time limit",
      () => readCmsAnswer("slow", {}, { expect: "list", timeoutMs: 300 }),
    ],
  ];
  for (const [name, run] of mayPass) {
    const error = await failureOf(run);
    check(
      `${name} falls back`,
      isCmsReadError(error) && !passedOn(error),
      error instanceof Error ? error.message : String(error)
    );
  }
  // A body that breaks off once the headers are in: the read itself
  // fails, not the connection, and it may pass like a network error.
  for (const kind of ["sized", "chunked"] as const) {
    const error = await failureOf(() =>
      readCmsAnswer(`broken-${kind}`, {}, list)
    );
    check(
      `a body that breaks off mid-way (${kind}) falls back`,
      isCmsReadError(error) && error.passing === true && !passedOn(error),
      error instanceof Error ? error.message : String(error)
    );
    check(
      `it failed while the body was read (${kind}), after a 200`,
      isCmsReadError(error) &&
        error.status === 200 &&
        /the answer could not be read/.test(error.message),
      error instanceof Error ? error.message : String(error)
    );
  }
  const closed = await startStandIn();
  const closedPort = (closed.address() as AddressInfo).port;
  await new Promise((resolve) => closed.close(resolve));
  process.env.CMS_URL = `http://127.0.0.1:${closedPort}`;
  const network = await failureOf(() => readCmsAnswer("list", {}, list));
  check(
    "a network error falls back",
    isCmsReadError(network) && !passedOn(network)
  );
  process.env.CMS_URL = base;

  // Through two real call sites, with CONTENT_SOURCE=cms.
  const { getFaqs, FAQ_DEFAULTS } = await import("../src/lib/faqs");
  const { spaceColours } = await import("../src/lib/space-colours");
  process.env.CONTENT_SOURCE = "cms";
  const faqWith = async (answer: StandInAnswer) => {
    overrides.set("faq", answer);
    try {
      return { value: await getFaqs("quartz") };
    } catch (error) {
      return { error };
    } finally {
      overrides.delete("faq");
    }
  };
  const faq401 = await faqWith(standIn("s401"));
  check(
    "getFaqs passes a 401 on",
    "error" in faq401 && isCmsReadError(faq401.error)
  );
  const faqHtml = await faqWith(standIn("login-page"));
  check(
    "getFaqs passes a login page on",
    "error" in faqHtml && isCmsReadError(faqHtml.error)
  );
  const faq500 = await faqWith(standIn("s500"));
  same(
    "getFaqs falls back to its defaults on a 500",
    "value" in faq500 ? faq500.value : faq500.error,
    FAQ_DEFAULTS.quartz
  );
  process.env.CMS_URL = `http://127.0.0.1:${closedPort}`;
  let networkValue: unknown;
  try {
    networkValue = await getFaqs("quartz");
  } catch (error) {
    networkValue = error;
  }
  same(
    "getFaqs falls back to its defaults on a network error",
    networkValue,
    FAQ_DEFAULTS.quartz
  );
  process.env.CMS_URL = base;

  const tilesWith = async (answer: StandInAnswer) => {
    overrides.set("product-tiles", answer);
    try {
      return { value: await spaceColours(["a"]) };
    } catch (error) {
      return { error };
    } finally {
      overrides.delete("product-tiles");
    }
  };
  const tiles403 = await tilesWith(standIn("s403"));
  check(
    "the space colours pass a 403 on",
    "error" in tiles403 && isCmsReadError(tiles403.error)
  );
  const tiles503 = await tilesWith(standIn("s503"));
  same(
    "the space colours fall back to none on a 503",
    "value" in tiles503 ? tiles503.value : String(tiles503.error),
    []
  );
  delete process.env.CONTENT_SOURCE;
}

/**
 * The components that show a picture through their own helper still call
 * it where the picture is drawn: the lightbox and the reader's cover are
 * drawn only in the browser, so no page check sees them. Read from the
 * source text; the helpers themselves are checked above.
 */
function checkHelperWiring(): void {
  console.log("Each component calls its picture helper");
  const uses: [string, string][] = [
    [
      "src/components/ui/finish-lightbox.tsx",
      "src={lightboxImageUrl(currentSrc)}",
    ],
    [
      "src/components/sections/ResourcesContent.tsx",
      "poster={resourcePosterUrl(resource.thumbnail)}",
    ],
    [
      "src/components/visualize/SlabPicker.tsx",
      "src={slabPickerThumbUrl(s.photoUrl)}",
    ],
    [
      "src/app/(site)/products/[slug]/opengraph-image.tsx",
      "const bgImage = await shareBackground(product.mainImage);",
    ],
  ];
  for (const [file, call] of uses) {
    const text = readFileSync(join(__dirname, "..", file), "utf8");
    check(`${file} has ${call}`, text.includes(call));
  }
}

/**
 * The page check (scripts/check-cms-pages.ts): which picture addresses
 * in a page's HTML count as bare originals.
 */
async function checkPageScanner(): Promise<void> {
  console.log("The page check's reading of a page");
  const { bareOriginalsIn, isBareOriginal, srcsetAddresses, pictureUses } =
    await import("./check-cms-pages");
  const h = "0123456789abcdef0123456789abcdef";
  const g = "fedcba9876543210fedcba9876543210";
  const media = "https://media.example.com/media";
  const html = `<!doctype html><html><head>
<link rel="preload" as="image" href="${media}/${h}-w3840.webp" fetchPriority="high">
<link rel="preload" as="image" imageSrcSet="${media}/${g}.png 1x, ${media}/${h}-w1080.webp 2x">
<link rel="preload" as="image" href="/api/cdn/m/${g}.jpg">
<link rel="stylesheet" href="/_next/static/css/${h}.css">
<style>.a{background:url("${media}/${g}.avif")}.b{background:url(/api/cdn/m/${g}.jpg)}</style>
</head><body>
<img src="${media}/${h}.jpg" alt="">
<img src="${media}/${h}-w640.webp" srcset="${media}/${h}-w640.webp 640w, ${media}/${h}.jpeg 1080w, ${media}/${h}-w1920.webp 1920w" alt="">
<img src="/api/cdn/m/${h}.jpg" alt="">
<img src="/api/cdn/m/${h}-w640.webp" srcset="/api/cdn/m/${h}-w640.webp 640w, /api/cdn/m/${h}.png 1080w" alt="">
<img src="/api/cdn/m/${h}-share.jpg" alt="">
<picture><source srcset="/api/cdn/m/${g}.webp 1x, /api/cdn/m/${g}-w1920.webp 2x"><img src="/api/cdn/m/${g}-w1080.webp" alt=""></picture>
<img src="https://cdn.sanity.io/images/p/d/x-10x10.jpg?rect=0,0,5,5&amp;w=640" srcset="https://cdn.sanity.io/images/p/d/x-10x10.jpg?rect=0,0,5,5&amp;w=640 640w,https://cdn.sanity.io/images/p/d/x-10x10.jpg?rect=0,0,5,5&amp;w=1080 1080w" alt="">
<img src="/_next/image?url=${encodeURIComponent(`${media}/${g}.webp`)}&amp;w=640&amp;q=75" alt="">
<img src='${media}/${g}.jpg?v=1&amp;x=2' alt="">
<div style="background-image:url(&quot;https://cms.example.com/api/media/file/${g}.jpg&quot;)"></div>
<div style="background-image:url(${media}/${h}-w1290.webp)"></div>
<video poster="${media}/${h}.png"><source src="${media}/${h}.mp4" type="video/mp4"></video>
<a href="${media}/${h}.jpg">The original, as a link</a>
<a href="/api/cdn/m/${h}.pdf" download>A PDF</a>
<script>self.__next_f.push([1,"{\\"mainImage\\":\\"${media}/${h}.jpg\\"}"])</script>
<script>var t = '<img src="${media}/${g}.gif" style="background:url(${media}/${g}.png)">';</script>
<script src="/_next/static/chunks/${h}.js"></script>
</body></html>`;
  same(
    "a srcset whose addresses hold commas",
    srcsetAddresses("a.jpg?rect=0,0,5,5 640w, b.jpg 1080w,c.jpg"),
    ["a.jpg?rect=0,0,5,5", "b.jpg", "c.jpg"]
  );
  same(
    "the bare originals on a planted page, and only those",
    bareOriginalsIn(html, "http://site.example/page").map(
      (x) => `${x.where} ${x.address}`
    ),
    [
      `preload ${media}/${g}.png`,
      `preload /api/cdn/m/${g}.jpg`,
      `img src ${media}/${h}.jpg`,
      `srcset ${media}/${h}.jpeg`,
      `img src /api/cdn/m/${h}.jpg`,
      `srcset /api/cdn/m/${h}.png`,
      `srcset /api/cdn/m/${g}.webp`,
      `img src /_next/image?url=${encodeURIComponent(`${media}/${g}.webp`)}&w=640&q=75`,
      `img src ${media}/${g}.jpg?v=1&x=2`,
      `poster ${media}/${h}.png`,
      `css url https://cms.example.com/api/media/file/${g}.jpg`,
      `css url ${media}/${g}.avif`,
      `css url /api/cdn/m/${g}.jpg`,
    ]
  );
  same(
    "an address on /api/cdn/m/ is judged by its name: only the originals fail",
    [
      `/api/cdn/m/${h}.jpg`,
      `https://site.example/api/cdn/m/${h}.png`,
      `/api/cdn/m/${h}-w640.webp`,
      `/api/cdn/m/${h}-share.jpg`,
      `/api/cdn/m/${h}.pdf`,
      `/api/cdn/m/${h}.mp4`,
    ].filter((x) => isBareOriginal(x, "http://site.example/page")),
    [`/api/cdn/m/${h}.jpg`, `https://site.example/api/cdn/m/${h}.png`]
  );
  check(
    "the server payload in scripts is not read",
    !pictureUses(html).some((x) => x.address.includes('\\"'))
  );
  same(
    "a page of copies only passes",
    bareOriginalsIn(
      `<img src="${media}/${h}-w640.webp" srcset="/api/cdn/m/${h}-w1080.webp 1x"><div style="background:url(/api/cdn/m/${h}-w1290.webp)"></div><img src="/api/cdn/m/${h}-share.jpg"><video poster="/api/cdn/m/${h}-w1080.webp"></video>`
    ),
    []
  );
}

/** Each fetcher with CONTENT_SOURCE=cms: the answer and query it asks for. */
async function checkFetchers(): Promise<void> {
  console.log("Fetchers, CONTENT_SOURCE=cms");
  // The Sanity client module needs these names set to load; nothing is sent to Sanity.
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "dummyproject";
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= "dummy";
  const cms = await import("../src/cms/read");

  type Case = [string, () => Promise<unknown>, string, unknown?];
  const cases: Case[] = [
    [
      "productsCatalogue",
      () => cms.productsCatalogue(),
      "products?view=catalogue",
    ],
    [
      "productsByCollectionOrType",
      () =>
        cms.productsByCollectionOrType({ slug: "nebula", productType: null }),
      "products?slug=nebula&view=collectionOrType",
    ],
    [
      "productsByCollectionOrType with a type",
      () =>
        cms.productsByCollectionOrType({
          slug: "quartz",
          productType: "quartz-slab",
        }),
      "products?productType=quartz-slab&slug=quartz&view=collectionOrType",
    ],
    [
      "productsForCategory",
      () =>
        cms.productsForCategory({ cids: ["c1", "c2"], pt: null, refiled: [] }),
      "products?cids=c1&cids=c2&refiled=&view=category",
    ],
    [
      "productsForCategory with a type",
      () =>
        cms.productsForCategory({
          cids: ["c1"],
          pt: "granite-slab",
          refiled: ["a", "b"],
        }),
      "products?cids=c1&pt=granite-slab&refiled=a&refiled=b&view=category",
    ],
    [
      "productsWithAnyRibbon",
      () => cms.productsWithAnyRibbon(),
      "products?ribbons=any&view=category",
    ],
    [
      "productSlugs",
      () => cms.productSlugs(),
      "products?view=catalogue",
      [{ slug: { _type: "slug", current: "white" } }],
    ],
    ["product", () => cms.product("white"), "product?slug=white"],
    [
      "productForShareImage",
      () => cms.productForShareImage("white"),
      "product?slug=white",
    ],
    [
      "productTiles",
      () => cms.productTiles(["a", "b"]),
      "product-tiles?slugs=a&slugs=b",
    ],
    [
      "homepageCollections",
      () =>
        cms.homepageCollections({
          quartzCollections: ["Nebula", "Pacific Quartz"],
          indiaQuartz: ["x"],
        }),
      "homepage-collections?indiaQuartz=x&quartzCollections=Nebula&quartzCollections=Pacific%20Quartz",
      [{ _id: "c1", name: "Nebula" }],
    ],
    [
      "collection",
      () => cms.collection("nebula"),
      "collection?slug=nebula&view=bySlug",
    ],
    [
      "collectionShort",
      () => cms.collectionShort("nebula"),
      "collection?slug=nebula&view=bySlugShort",
    ],
    [
      "collectionByMatch",
      () => cms.collectionByMatch("quartz*"),
      "collection?pattern=quartz*&view=byMatch",
    ],
    ["blogPostsAll", () => cms.blogPostsAll(), "blog-posts?view=all"],
    ["blogPostsRecent", () => cms.blogPostsRecent(), "blog-posts?view=recent"],
    ["blogPostSlugs", () => cms.blogPostSlugs(), "blog-posts?view=slugs"],
    ["blogPost", () => cms.blogPost("a-post"), "blog-post?slug=a-post"],
    [
      "blogPostForShareImage",
      () => cms.blogPostForShareImage("a-post"),
      "blog-post?slug=a-post",
    ],
    [
      "homepageSignatureProjects",
      () => cms.homepageSignatureProjects(),
      "homepage",
      [{ n: "s" }],
    ],
    [
      "homepageApplicationCards",
      () => cms.homepageApplicationCards(),
      "homepage",
      [{ n: "a" }],
    ],
    [
      "homepageInspirationImages",
      () => cms.homepageInspirationImages(),
      "homepage",
      [{ n: "i" }],
    ],
    ["resources", () => cms.resources(), "resources"],
    ["careersPage", () => cms.careersPage(), "careers", null],
    ["careersJobs", () => cms.careersJobs(), "careers", [{ title: "j" }]],
    ["beyondStonePage", () => cms.beyondStonePage(), "beyond-stone", null],
    [
      "beyondStoneCollectionSlug",
      () => cms.beyondStoneCollectionSlug(),
      "beyond-stone",
      null,
    ],
    [
      "beyondStoneProducts",
      () => cms.beyondStoneProducts("stone-finishes"),
      "beyond-stone?slug=stone-finishes",
      [],
    ],
    ["spacePage", () => cms.spacePage("outdoor"), "space-page?slug=outdoor"],
    ["faq", () => cms.faq("quartz"), "faq?key=quartz"],
    [
      "sitemapProducts",
      () => cms.sitemapProducts(),
      "sitemap",
      [{ slug: "white", updatedAt: "2026-01-01T00:00:00Z" }],
    ],
    ["sitemapPosts", () => cms.sitemapPosts(), "sitemap", []],
    ["sitemapDates", () => cms.sitemapDates(), "sitemap", { home: null }],
    [
      "jobApply",
      () => cms.jobApply("Sales Manager"),
      "job-apply?title=Sales%20Manager",
    ],
    [
      "legacyFiles",
      () => cms.legacyFiles(),
      "legacy-files",
      {
        "https://cdn.sanity.io/files/p/d/a.pdf":
          "0123456789abcdef0123456789abcdef.pdf",
      },
    ],
  ];

  process.env.CONTENT_SOURCE = "cms";
  for (const [name, run, expected, expectedValue] of cases) {
    const before = seen.length;
    try {
      const value = await run();
      const asked = seen
        .slice(before)
        .map(
          (s) =>
            `${s.path.replace("/api/read/", "")}${s.search ? `?${s.search}` : ""}`
        );
      same(`${name} asks ${expected}`, asked, [expected]);
      if (expectedValue !== undefined)
        same(`${name} gives the page's shape`, value, expectedValue);
    } catch (error) {
      check(
        `${name} asks ${expected}`,
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // The reads that are never empty when the CMS is working.
  overrides.set("homepage-collections", json([]));
  await rejectsWithCmsError("homepageCollections throws when empty", () =>
    cms.homepageCollections({ quartzCollections: ["Nebula"], indiaQuartz: [] })
  );
  overrides.delete("homepage-collections");
  overrides.set("products", json([]));
  await rejectsWithCmsError("productsCatalogue throws when empty", () =>
    cms.productsCatalogue()
  );
  await rejectsWithCmsError("productSlugs throws when empty", () =>
    cms.productSlugs()
  );
  await resolvesTo(
    "productsByCollectionOrType may be empty",
    () => cms.productsByCollectionOrType({ slug: "x", productType: null }),
    []
  );
  overrides.delete("products");
  overrides.set("product-tiles", json([]));
  await resolvesTo(
    "productTiles may be empty",
    () => cms.productTiles(["a"]),
    []
  );
  overrides.delete("product-tiles");

  // With the default source, no fetcher reaches the CMS.
  delete process.env.CONTENT_SOURCE;
  const before = seen.length;
  const pending = [
    cms.productsCatalogue(),
    cms.homepageSignatureProjects(),
    cms.faq("quartz"),
    cms.legacyFiles(),
  ];
  pending.forEach((p) => p.catch(() => undefined));
  await new Promise((resolve) => setTimeout(resolve, 300));
  check(
    "with CONTENT_SOURCE unset the fetchers do not call the CMS",
    seen.length === before
  );

  const failure = new Error("x");
  failure.name = "CmsReadError";
  let passedOn = false;
  try {
    cms.throwIfCmsFailure(failure);
  } catch {
    passedOn = true;
  }
  let keptOther = true;
  try {
    cms.throwIfCmsFailure(new Error("a Sanity error"));
  } catch {
    keptOther = false;
  }
  check("throwIfCmsFailure passes a CMS failure on", passedOn);
  check("throwIfCmsFailure leaves any other error to the call site", keptOther);
}

function checkNotice(): void {
  console.log("Content-changed notice");
  const secret = "dummy-shared-secret-for-this-check-only";
  const now = Date.UTC(2026, 10, 19, 12, 0, 0);
  const timestamp = String(now);
  const body = JSON.stringify({
    source: "cms",
    collection: "products",
    id: "abc",
    at: now,
  });
  const signature = signCmsNotice(secret, timestamp, body);
  type Notice = Parameters<typeof checkCmsNotice>[0];
  const base: Notice = { timestamp, signature, body, secret, now };
  const reason = (input: Partial<Notice>) => {
    const result = checkCmsNotice({ ...base, ...input });
    return result.ok ? "ok" : result.reason;
  };

  same("a good notice is accepted", reason({}), "ok");
  same(
    "the signature is the hex HMAC-SHA256 of `${timestamp}.${body}`",
    signature,
    createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
  );
  same(
    "the same bytes as a Buffer are accepted",
    reason({ body: Buffer.from(body) }),
    "ok"
  );
  same(
    "upper-case hex is accepted",
    reason({ signature: signature.toUpperCase() }),
    "ok"
  );
  same(
    "a wrong signature is refused",
    reason({ signature: signCmsNotice("another-secret", timestamp, body) }),
    "wrong signature"
  );
  same(
    "a changed body is refused",
    reason({ body: body.replace("abc", "abd") }),
    "wrong signature"
  );
  same(
    "a changed timestamp is refused",
    reason({ timestamp: String(now + 1) }),
    "wrong signature"
  );
  same(
    "a notice just inside five minutes is accepted",
    reason({
      timestamp: String(now - CMS_NOTICE_WINDOW_MS),
      signature: signCmsNotice(
        secret,
        String(now - CMS_NOTICE_WINDOW_MS),
        body
      ),
    }),
    "ok"
  );
  const old = String(now - CMS_NOTICE_WINDOW_MS - 1);
  same(
    "an old notice is refused",
    reason({ timestamp: old, signature: signCmsNotice(secret, old, body) }),
    "out of time"
  );
  const ahead = String(now + CMS_NOTICE_WINDOW_MS + 1);
  same(
    "a notice from the future is refused",
    reason({ timestamp: ahead, signature: signCmsNotice(secret, ahead, body) }),
    "out of time"
  );
  same(
    "a missing timestamp is refused",
    reason({ timestamp: null }),
    "missing header"
  );
  same(
    "a missing signature is refused",
    reason({ signature: null }),
    "missing header"
  );
  same(
    "a timestamp that is not digits is refused",
    reason({ timestamp: "12.5" }),
    "malformed header"
  );
  same(
    "a timestamp written as a date is refused",
    reason({ timestamp: "2026-11-19T12:00:00Z" }),
    "malformed header"
  );
  same(
    "a short signature is refused",
    reason({ signature: signature.slice(0, 62) }),
    "malformed header"
  );
  same(
    "a long signature is refused",
    reason({ signature: `${signature}00` }),
    "malformed header"
  );
  same(
    "a signature that is not hex is refused",
    reason({ signature: `${signature.slice(0, 63)}g` }),
    "malformed header"
  );
  same(
    "an empty signature is refused",
    reason({ signature: "" }),
    "malformed header"
  );
  same(
    "with no secret set every notice is refused",
    reason({ secret: undefined }),
    "no secret"
  );
  same(
    "with an empty secret every notice is refused",
    reason({ secret: "" }),
    "no secret"
  );
}

async function main(): Promise<void> {
  const server = await startStandIn();
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
  try {
    checkQueryStrings();
    checkContentSource();
    await checkMediaUrls();
    await checkCallSites();
    checkHelperWiring();
    await checkPageScanner();
    await checkFailLoud(base);
    await checkPassingFailures(base);
    await checkPictureHostGuard(base);
    await checkMediaProxy(base);
    await checkFetchers();
    checkNotice();
  } finally {
    server.close();
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
