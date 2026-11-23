import "server-only";
import {
  cmsBaseUrl,
  PROTECTION_BYPASS_HEADER,
  protectionBypass,
} from "./client";

/**
 * The website's writer for the Pacific CMS: every form entry, CV and
 * customer sign-in goes through `saveForm`, `saveJobApplication` or
 * `callCustomerDoor` here.
 *
 * The CMS has two kinds of door, both `POST`:
 * - `${CMS_URL}/api/forms/<kind>`: saves one form entry;
 * - `${CMS_URL}/api/customers/<action>`: the customer login and the
 *   customer pages' reads.
 *
 * Every request is signed. Headers:
 * - `x-cms-timestamp`: milliseconds since 1970, as text;
 * - `x-cms-signature`: the hex HMAC-SHA256, keyed with CMS_FORMS_SECRET,
 *   of `${timestamp}.${sha256 hex of the raw request body bytes}`;
 * - `x-vercel-protection-bypass`: CMS_PROTECTION_BYPASS, when set.
 * The CMS refuses a time more than five minutes off.
 *
 * A request that gets no answer, or a 5xx, is sent once more, newly
 * signed. Anything else that is not the expected answer throws a
 * `CmsFormError`; the route then answers the visitor as it does when a
 * save fails.
 *
 * Settings, read on the server at call time, never with a NEXT_PUBLIC_
 * name: CMS_URL, CMS_FORMS_SECRET, CMS_PROTECTION_BYPASS. With no
 * CMS_FORMS_SECRET every call throws.
 *
 * Only `fetch` and Web Crypto are used, so the sign-in (imported by the
 * middleware through auth.config.ts) also loads on the edge.
 */

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const CMS_TIMESTAMP_HEADER = "x-cms-timestamp";
export const CMS_SIGNATURE_HEADER = "x-cms-signature";
/** How long one try of a JSON door may take. */
export const FORM_TIMEOUT_MS = 15_000;
/** How long one try of the careers door may take: it carries the files. */
export const UPLOAD_TIMEOUT_MS = 60_000;

/** The form doors, named as the CMS names them. */
export type FormKind =
  | "contact"
  | "order"
  | "sample-request"
  | "sills-enquiry"
  | "where-to-buy-lead"
  | "job-application"
  | "newsletter"
  | "grievance";

/** The customer doors. */
export type CustomerAction = "sign-in" | "profile" | "grievances" | "grievance";

function formsSecret(): string | undefined {
  return process.env.CMS_FORMS_SECRET?.trim() || undefined;
}

/** Are CMS_URL and CMS_FORMS_SECRET both set and usable? */
export function cmsFormsConfigured(): boolean {
  return !("problem" in cmsBaseUrl()) && !!formsSecret();
}

/** The address of one application in the CMS editor, or null. */
export function cmsJobApplicationUrl(id: string): string | null {
  const address = cmsBaseUrl();
  if ("problem" in address) return null;
  return `${address.base}/admin/collections/job-applications/${encodeURIComponent(id)}`;
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

/**
 * A door that did not give the expected answer. The message names the
 * door and the reason (a status, a field name), never a value sent.
 */
export class CmsFormError extends Error {
  readonly door: string;
  readonly status: number | null;
  constructor(door: string, reason: string, status: number | null = null) {
    super(`CMS door "${door}" failed: ${reason}`);
    this.name = "CmsFormError";
    this.door = door;
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/* Signing                                                             */
/* ------------------------------------------------------------------ */

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

/** The hex SHA-256 of some bytes. */
export async function sha256Hex(body: Uint8Array): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", body as BufferSource));
}

/**
 * The signature of one request: the hex HMAC-SHA256, keyed with the
 * secret, of `${timestamp}.${sha256 hex of the body}`.
 */
export async function signFormRequest(
  secret: string,
  timestamp: string,
  body: Uint8Array
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${await sha256Hex(body)}`)
  );
  return toHex(signed);
}

/* ------------------------------------------------------------------ */
/* Sending                                                             */
/* ------------------------------------------------------------------ */

type Prepared = { body: Uint8Array; contentType: string };

type DoorAnswer = { status: number; json: unknown };

/**
 * One signed POST, sent once more on no answer or a 5xx. Gives the
 * status and the JSON body (null when the body is not JSON).
 */
async function postSigned(
  path: string,
  door: string,
  prepared: Prepared,
  timeoutMs: number
): Promise<DoorAnswer> {
  const address = cmsBaseUrl();
  if ("problem" in address) throw new CmsFormError(door, address.problem);
  const secret = formsSecret();
  if (!secret) throw new CmsFormError(door, "CMS_FORMS_SECRET is not set");
  const url = `${address.base}${path}`;
  const bypass = protectionBypass();

  let lastReason = "";
  let lastStatus: number | null = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const timestamp = String(Date.now());
    const headers: Record<string, string> = {
      accept: "application/json",
      "content-type": prepared.contentType,
      [CMS_TIMESTAMP_HEADER]: timestamp,
      [CMS_SIGNATURE_HEADER]: await signFormRequest(
        secret,
        timestamp,
        prepared.body
      ),
    };
    if (bypass) headers[PROTECTION_BYPASS_HEADER] = bypass;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers,
          body: prepared.body as BodyInit,
          redirect: "manual",
          cache: "no-store",
          signal: controller.signal,
        });
      } catch {
        lastReason = controller.signal.aborted
          ? `no answer within ${timeoutMs} ms`
          : "the CMS could not be reached";
        lastStatus = null;
        continue; // a network failure: try once more
      }
      if (response.status >= 500) {
        await response.body?.cancel().catch(() => undefined);
        lastReason = `status ${response.status}`;
        lastStatus = response.status;
        continue; // a server failure: try once more
      }
      let json: unknown = null;
      try {
        json = JSON.parse(await response.text());
      } catch {
        json = null;
      }
      return { status: response.status, json };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new CmsFormError(door, `${lastReason}, twice`, lastStatus);
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function jsonBody(value: unknown): Prepared {
  return {
    body: encoder.encode(JSON.stringify(value)),
    contentType: "application/json",
  };
}

/* ------------------------------------------------------------------ */
/* The form doors                                                      */
/* ------------------------------------------------------------------ */

/**
 * What a form door answers on success. `id` is the CMS's id of the row:
 * it stays on the server and is never sent to the browser. `reference`
 * is a random text kept on the row; the cart shows it, Where to Buy signs
 * it into its cookie.
 */
export type FormSaved = { id: string; reference: string; outcome: string };

function readSaved(door: string, answer: DoorAnswer): FormSaved {
  const { status, json } = answer;
  if (status === 200 && isObject(json) && json.ok === true) {
    const id = json.id;
    const reference = json.reference;
    const outcome = json.outcome;
    if (
      (typeof id === "string" || typeof id === "number") &&
      String(id) !== "" &&
      typeof reference === "string" &&
      reference !== "" &&
      typeof outcome === "string"
    ) {
      return { id: String(id), reference, outcome };
    }
    throw new CmsFormError(door, "the answer is not of the agreed shape", 200);
  }
  const field =
    isObject(json) && typeof json.field === "string"
      ? ` (field ${json.field.slice(0, 64)})`
      : "";
  throw new CmsFormError(door, `status ${status}${field}`, status);
}

/** The form fields, as the route wrote them to Sanity, without `_type`. */
export type FormFields = Record<string, unknown>;

/**
 * Saves one form entry: `POST ${CMS_URL}/api/forms/<kind>` with
 * `{"fields": {...}}`, plus `customerId` beside `fields` for a grievance.
 * Throws a `CmsFormError` when it is not saved.
 */
export async function saveForm(
  kind: Exclude<FormKind, "job-application" | "grievance">,
  fields: FormFields
): Promise<FormSaved>;
export async function saveForm(
  kind: "grievance",
  fields: FormFields,
  customerId: string
): Promise<FormSaved>;
export async function saveForm(
  kind: Exclude<FormKind, "job-application">,
  fields: FormFields,
  customerId?: string
): Promise<FormSaved> {
  const door = `forms/${kind}`;
  const payload = kind === "grievance" ? { fields, customerId } : { fields };
  const answer = await postSigned(
    `/api/forms/${kind}`,
    door,
    jsonBody(payload),
    FORM_TIMEOUT_MS
  );
  return readSaved(door, answer);
}

/** A file to send on: its bytes, name and claimed type. */
export type FormFile = {
  name: string;
  type: string;
  bytes: Uint8Array;
};

/** A file name made safe for a multipart header, as browsers do it. */
function headerFileName(name: string): string {
  const cleaned = name
    .replace(/"/g, "%22")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
    .slice(0, 255);
  return cleaned || "file";
}

/** A content type made safe for a multipart header. */
function headerContentType(type: string): string {
  return /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(type)
    ? type
    : "application/octet-stream";
}

function randomBoundary(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `----pacific-form-${toHex(bytes.buffer)}`;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/**
 * The careers door's body: `multipart/form-data` with a text part
 * `fields` (JSON), a file part `resume` and, when given, a file part
 * `portfolio`. Built here as bytes, so the signature covers exactly
 * what is sent.
 */
export function jobApplicationBody(
  fields: FormFields,
  resume: FormFile,
  portfolio: FormFile | null
): Prepared {
  const boundary = randomBoundary();
  const parts: Uint8Array[] = [
    encoder.encode(
      `--${boundary}\r\nContent-Disposition: form-data; name="fields"\r\n\r\n${JSON.stringify(fields)}\r\n`
    ),
  ];
  const addFile = (name: string, file: FormFile) => {
    parts.push(
      encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${headerFileName(file.name)}"\r\nContent-Type: ${headerContentType(file.type)}\r\n\r\n`
      ),
      file.bytes,
      encoder.encode("\r\n")
    );
  };
  addFile("resume", resume);
  if (portfolio) addFile("portfolio", portfolio);
  parts.push(encoder.encode(`--${boundary}--\r\n`));
  return {
    body: concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/**
 * Saves one job application with its CV and, when given, its portfolio
 * file. The answer's outcome is "duplicate" when the CMS already holds
 * the same application (it then stores nothing new).
 */
export async function saveJobApplication(
  fields: FormFields,
  resume: FormFile,
  portfolio: FormFile | null
): Promise<FormSaved> {
  const door = "forms/job-application";
  const answer = await postSigned(
    "/api/forms/job-application",
    door,
    jobApplicationBody(fields, resume, portfolio),
    UPLOAD_TIMEOUT_MS
  );
  return readSaved(door, answer);
}

/* ------------------------------------------------------------------ */
/* The customer doors                                                  */
/* ------------------------------------------------------------------ */

/**
 * Calls one customer door: `POST ${CMS_URL}/api/customers/<action>` with
 * a JSON body. Gives the CMS's answer when it is `{"ok": true, ...}` or
 * `{"ok": false}`; throws a `CmsFormError` on a refused signature (401),
 * a failure that did not clear on the second try, or any other answer.
 */
export async function callCustomerDoor(
  action: CustomerAction,
  payload: Record<string, string>
): Promise<{ ok: true; [key: string]: unknown } | { ok: false }> {
  const door = `customers/${action}`;
  const { status, json } = await postSigned(
    `/api/customers/${action}`,
    door,
    jsonBody(payload),
    FORM_TIMEOUT_MS
  );
  if (status === 200 && isObject(json) && json.ok === true) {
    return json as { ok: true; [key: string]: unknown };
  }
  // `{"ok": false}` is an answer (wrong password, not found), but never
  // from a refused signature or a redirect (a login page, say).
  const answered = status === 200 || (status >= 400 && status !== 401);
  if (answered && isObject(json) && json.ok === false) {
    return { ok: false };
  }
  throw new CmsFormError(door, `status ${status}`, status);
}
