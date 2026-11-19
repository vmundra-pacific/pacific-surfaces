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
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import {
  buildQueryString,
  contentSource,
  isCmsReadError,
  PROTECTION_BYPASS_HEADER,
  READ_KEY_HEADER,
  READ_KEY_SCHEME,
  readCmsAnswer,
  readCmsPart,
  toPictureUrl,
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
      return json([{ mainImage: "cms-media:image-abc-10x10-png", n: 1 }]);
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

function startStandIn(): Promise<Server> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://stand-in");
    seen.push({
      path: url.pathname,
      search: url.search.slice(1),
      headers: req.headers,
    });
    const answer = standIn(url.pathname.split("/").pop() ?? "");
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
    "a picture passes through toPictureUrl unchanged for now",
    () => readCmsAnswer("pictures", {}, list),
    [{ mainImage: "cms-media:image-abc-10x10-png", n: 1 }]
  );
  same(
    "toPictureUrl returns its value",
    toPictureUrl("cms-media:x"),
    "cms-media:x"
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
    await checkFailLoud(base);
    await checkPassingFailures(base);
    await checkFetchers();
    checkNotice();
  } finally {
    server.close();
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
