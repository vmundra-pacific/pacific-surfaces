import "server-only";
import { cache } from "react";

/**
 * The website's reader for the Pacific CMS.
 *
 * Every content read the site makes from the CMS goes through
 * `readCmsAnswer` or `readCmsPart` here; the fetchers in `./read.ts` are
 * the only callers. The CMS answers fixed, named reads at
 * `GET ${CMS_URL}/api/read/<answer>`, and each body is exactly what the
 * matching Sanity query returned: a bare array, object or null.
 *
 * Settings, read on the server at call time, never with a NEXT_PUBLIC_
 * name, so they stay out of every browser bundle:
 * - CONTENT_SOURCE: "cms" reads the CMS. Unset, or any other value, reads
 *   Sanity as before.
 * - CMS_URL: the CMS's address (https; plain http only for this machine).
 * - CMS_READ_KEY: the API key of the website's reader login in the CMS.
 * - CMS_PROTECTION_BYPASS: the deployment-protection pass, sent when
 *   set.
 *
 * This file uses nothing but `fetch`, so it also runs in the two share
 * image routes, which run on the edge.
 */

/* ------------------------------------------------------------------ */
/* The content source                                                  */
/* ------------------------------------------------------------------ */

export type ContentSource = "sanity" | "cms";

/**
 * Which store the site reads its content from. Only the exact value
 * "cms" picks the CMS; unset, empty or anything else is "sanity".
 */
export function contentSource(): ContentSource {
  return process.env.CONTENT_SOURCE === "cms" ? "cms" : "sanity";
}

/* ------------------------------------------------------------------ */
/* Request settings, kept in one place                                 */
/* ------------------------------------------------------------------ */

/** The header that carries the reader login's API key. */
export const READ_KEY_HEADER = "authorization";
/** What comes before the key in that header. */
export const READ_KEY_SCHEME = "users API-Key";
/** The header that carries the deployment-protection pass. */
export const PROTECTION_BYPASS_HEADER = "x-vercel-protection-bypass";
/** How long one read may take before it counts as failed. */
export const READ_TIMEOUT_MS = 10_000;
/** The cache tag of the per-request reads; the revalidate route clears it. */
export const CMS_CACHE_TAG = "cms";

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

/**
 * A CMS read that did not give a usable answer. Pages let it propagate,
 * so a failed rebuild is not saved: the page is not stored with an
 * empty or fallback section.
 *
 * `passing` says whether the failure may clear up by itself: no answer
 * within the time limit, the CMS out of reach, a 5xx, or an answer that
 * broke off while it was read. Anything else is a fault in how the site
 * or the CMS is set up: 401, 403, 404, a redirect, an answer that is not
 * JSON, an answer of the wrong kind, an empty answer where one is never
 * empty, or a missing or wrong setting.
 */
export class CmsReadError extends Error {
  readonly answer: string;
  readonly status: number | null;
  readonly passing: boolean;
  constructor(
    answer: string,
    reason: string,
    status: number | null = null,
    passing = false
  ) {
    super(`CMS read${answer ? ` "${answer}"` : ""} failed: ${reason}`);
    this.name = "CmsReadError";
    this.answer = answer;
    this.status = status;
    this.passing = passing;
  }
}

export function isCmsReadError(error: unknown): error is CmsReadError {
  return (
    error instanceof CmsReadError ||
    (error instanceof Error && error.name === "CmsReadError")
  );
}

/**
 * For a call site that catches a failed read and shows something softer
 * instead. A set-up fault is passed on, so the page is not cached with
 * the softer version. A failure that may pass (a timeout, the CMS out of
 * reach, a 5xx) is not: the call site shows its softer version, as it
 * does when Sanity fails. With Sanity as the source nothing changes.
 */
export function throwIfCmsFailure(error: unknown): void {
  if (isCmsReadError(error) && error.passing !== true) throw error;
}

/* ------------------------------------------------------------------ */
/* The query string                                                    */
/* ------------------------------------------------------------------ */

export type ReadQuery = Readonly<
  Record<string, string | readonly string[] | null | undefined>
>;

/**
 * The query string of one read. A list is sent as one key per entry
 * (`ids=a&ids=b`), never joined with commas, so a value that holds a
 * comma stays one value. An empty list is sent as one empty entry
 * (`ids=`), which the CMS reads as an empty list. A null or missing
 * value is left out. Keys are sorted, so the same read always has the
 * same address.
 */
export function buildQueryString(query: ReadQuery): string {
  const parts: string[] = [];
  for (const name of Object.keys(query).sort()) {
    const value = query[name];
    if (value === undefined || value === null) continue;
    const values: readonly string[] =
      typeof value === "string" ? [value] : value.length === 0 ? [""] : value;
    for (const item of values) {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(item)}`);
    }
  }
  return parts.join("&");
}

/* ------------------------------------------------------------------ */
/* Pictures                                                            */
/* ------------------------------------------------------------------ */

/*
 * A CMS answer gives every picture and file as a full address already,
 * so answers are passed on as they come. How an address becomes the one
 * a page loads (a ready-made copy, or this site's /api/cdn/m/) is
 * decided in one place, src/lib/media-url.ts.
 */

/* ------------------------------------------------------------------ */
/* Reading                                                             */
/* ------------------------------------------------------------------ */

/**
 * CMS_URL without a trailing slash, or why it cannot be used: it must be
 * set and be an https address (plain http only for this machine).
 */
export function cmsBaseUrl(): { base: string } | { problem: string } {
  const address = process.env.CMS_URL?.trim();
  if (!address) return { problem: "CMS_URL is not set" };
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return { problem: "CMS_URL is not an address" };
  }
  const thisMachine = ["localhost", "127.0.0.1", "[::1]"].includes(
    url.hostname
  );
  if (url.protocol !== "https:" && !(url.protocol === "http:" && thisMachine)) {
    return { problem: "CMS_URL must be an https address" };
  }
  return { base: address.replace(/\/+$/, "") };
}

/** The deployment-protection pass, when set. */
export function protectionBypass(): string | undefined {
  return process.env.CMS_PROTECTION_BYPASS?.trim() || undefined;
}

/** The reader login's API key, when set. */
export function cmsReadKey(): string | undefined {
  return process.env.CMS_READ_KEY?.trim() || undefined;
}

type CmsSettings = { base: string; key: string; bypass: string | undefined };

function cmsSettings(answer: string): CmsSettings {
  const address = cmsBaseUrl();
  const key = cmsReadKey();
  if ("problem" in address) {
    throw new CmsReadError(answer, address.problem);
  }
  if (!key) throw new CmsReadError(answer, "CMS_READ_KEY is not set");
  return { base: address.base, key, bypass: protectionBypass() };
}

const isJsonType = (type: string | null): boolean => {
  const media = (type ?? "").split(";")[0].trim().toLowerCase();
  return media === "application/json" || media.endsWith("+json");
};

/**
 * The body of one answer, as text. Anything but a 200 with a JSON body
 * throws: a login page, 401, 403, 404, 500, a redirect, HTML, a network
 * error, or no answer within the time limit. Kept per render (React
 * `cache`), so the fetchers that take parts of one answer share one call.
 */
const fetchAnswerText = cache(
  async (answer: string, search: string, timeoutMs: number) => {
    const { base, key, bypass } = cmsSettings(answer);
    const url = `${base}/api/read/${encodeURIComponent(answer)}${
      search ? `?${search}` : ""
    }`;
    const headers: Record<string, string> = {
      accept: "application/json",
      [READ_KEY_HEADER]: `${READ_KEY_SCHEME} ${key}`,
    };
    if (bypass) headers[PROTECTION_BYPASS_HEADER] = bypass;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const lateOr = (reason: string) =>
      controller.signal.aborted ? `no answer within ${timeoutMs} ms` : reason;
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method: "GET",
          headers,
          redirect: "manual",
          signal: controller.signal,
        });
      } catch {
        throw new CmsReadError(
          answer,
          lateOr("the CMS could not be reached"),
          null,
          true
        );
      }
      if (response.status !== 200) {
        await response.body?.cancel().catch(() => undefined);
        throw new CmsReadError(
          answer,
          `status ${response.status}`,
          response.status,
          response.status >= 500
        );
      }
      if (!isJsonType(response.headers.get("content-type"))) {
        await response.body?.cancel().catch(() => undefined);
        throw new CmsReadError(answer, "the answer is not JSON", 200);
      }
      try {
        return await response.text();
      } catch {
        throw new CmsReadError(
          answer,
          lateOr("the answer could not be read"),
          200,
          true
        );
      }
    } finally {
      clearTimeout(timer);
    }
  }
);

/** What an answer, or a part of one, must be. */
export type AnswerKind = "list" | "object" | "objectOrNull" | "textOrNull";

export type ReadOptions = {
  /** What the answer must be; anything else throws. */
  expect: AnswerKind;
  /**
   * Only for the reads that are never empty when the CMS is working (the
   * whole catalogue, the home page's collection cards, the sitemap's
   * products): an empty list throws.
   */
  neverEmpty?: boolean;
  /** The time limit; the default is READ_TIMEOUT_MS. */
  timeoutMs?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isKind(value: unknown, kind: AnswerKind): boolean {
  switch (kind) {
    case "list":
      return Array.isArray(value);
    case "object":
      return isRecord(value);
    case "objectOrNull":
      return value === null || isRecord(value);
    case "textOrNull":
      return value === null || typeof value === "string";
  }
}

function checked(
  answer: string,
  label: string,
  value: unknown,
  options: ReadOptions
): unknown {
  if (!isKind(value, options.expect)) {
    throw new CmsReadError(answer, `${label} is not ${options.expect}`);
  }
  if (options.neverEmpty && Array.isArray(value) && value.length === 0) {
    throw new CmsReadError(answer, `${label} is empty`);
  }
  return value;
}

async function readBody(
  answer: string,
  query: ReadQuery,
  options: ReadOptions
): Promise<unknown> {
  const text = await fetchAnswerText(
    answer,
    buildQueryString(query),
    options.timeoutMs ?? READ_TIMEOUT_MS
  );
  try {
    return JSON.parse(text);
  } catch {
    throw new CmsReadError(answer, "the answer is not JSON", 200);
  }
}

/** One CMS answer, checked. */
export async function readCmsAnswer<T>(
  answer: string,
  query: ReadQuery,
  options: ReadOptions
): Promise<T> {
  const body = await readBody(answer, query, options);
  return checked(answer, "the answer", body, options) as T;
}

/**
 * One part of a CMS answer that holds several (`homepage`, `careers`,
 * `beyond-stone`, `sitemap`): the answer must be an object that has the
 * part, and the part must be what `options.expect` says.
 */
export async function readCmsPart<T>(
  answer: string,
  query: ReadQuery,
  part: string,
  options: ReadOptions
): Promise<T> {
  const body = await readBody(answer, query, options);
  if (!isRecord(body)) {
    throw new CmsReadError(answer, "the answer is not object");
  }
  if (!Object.prototype.hasOwnProperty.call(body, part)) {
    throw new CmsReadError(answer, `the answer has no "${part}"`);
  }
  return checked(answer, `"${part}"`, body[part], options) as T;
}
