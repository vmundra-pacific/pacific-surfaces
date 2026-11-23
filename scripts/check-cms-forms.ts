/**
 * Checks for the CMS writer (src/cms/forms.ts): the signing of every
 * door, the bodies the doors receive, when a save is tried once more and
 * when not, and the answers.
 * It needs no network and no real key: it runs a small stand-in CMS on
 * 127.0.0.1 and uses made-up values.
 *
 *   npm run check:cms-forms
 *
 * (that is: npx tsx --conditions=react-server scripts/check-cms-forms.ts;
 * the condition lets the server-only modules load outside Next.)
 *
 * Two routes are called here as they are, against the stand-in CMS: the
 * careers route and the complaint route (its session read replaced by a
 * stand-in, since the real one needs Next itself). The sign-in's session
 * rule (auth.config.ts) is called too, and the complaint page's sending
 * (send-grievance.ts) with stand-in answers. The other routes need Next
 * itself; their imports are checked instead: no form route, customer
 * page or the sign-in loads Sanity any more.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import Module from "node:module";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { NextRequest } from "next/server";

import authConfig from "../src/auth.config";
import { READ_TIMEOUT_MS } from "../src/cms/client";
import {
  callCustomerDoor,
  CmsFormError,
  cmsFormsConfigured,
  cmsJobApplicationUrl,
  FORM_TIMEOUT_MS,
  saveForm,
  saveJobApplication,
  sha256Hex,
  signFormRequest,
  UPLOAD_TIMEOUT_MS,
} from "../src/cms/forms";
import { sendGrievance } from "../src/components/customer/send-grievance";

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

async function rejects(
  run: () => Promise<unknown>
): Promise<CmsFormError | Error | null> {
  try {
    await run();
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

/* ------------------------------------------------------------------ */
/* A stand-in CMS                                                      */
/* ------------------------------------------------------------------ */

/** A made-up secret, for these checks only. */
const SECRET = "made-up-forms-secret-for-checks";
const BYPASS = "made-up-bypass";

type Seen = {
  path: string;
  headers: IncomingMessage["headers"];
  body: Buffer;
  signed: boolean;
};

const seen: Seen[] = [];
/** Answers to give, per path, in turn; the last one repeats. */
const script = new Map<
  string,
  Array<"drop" | "hang" | { status: number; body: unknown }>
>();

function signedRightly(headers: IncomingMessage["headers"], body: Buffer) {
  const timestamp = String(headers["x-cms-timestamp"] ?? "");
  const signature = String(headers["x-cms-signature"] ?? "");
  if (!/^\d{1,15}$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(signature)) {
    return false;
  }
  if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000) return false;
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const want = createHmac("sha256", SECRET)
    .update(`${timestamp}.${bodyHash}`)
    .digest();
  const got = Buffer.from(signature, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

function startStandIn(): Promise<Server> {
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const path = req.url ?? "";
      const signed = signedRightly(req.headers, body);
      seen.push({ path, headers: req.headers, body, signed });
      const queue = script.get(path) ?? [];
      const next = queue.length > 1 ? queue.shift()! : queue[0];
      if (next === "drop") {
        req.socket.destroy();
        return;
      }
      if (next === "hang") return; // never answers
      if (!signed) {
        res.writeHead(401, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "unauthorised" }));
        return;
      }
      const answer = next ?? { status: 404, body: { ok: false } };
      res.writeHead(answer.status, { "content-type": "application/json" });
      res.end(JSON.stringify(answer.body));
    });
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve(server))
  );
}

const created = (reference = "ref-abc", outcome = "created") => ({
  status: 200,
  body: { ok: true, id: 42, reference, outcome },
});

/* ------------------------------------------------------------------ */
/* Multipart, read back                                                */
/* ------------------------------------------------------------------ */

type Part = { headers: string; body: Buffer };

function multipartParts(body: Buffer, contentType: string): Part[] {
  const match = /boundary=(.+)$/.exec(contentType);
  if (!match) return [];
  const delimiter = Buffer.from(`--${match[1]}`);
  const parts: Part[] = [];
  let at = body.indexOf(delimiter);
  while (at !== -1) {
    const start = at + delimiter.length;
    if (body.subarray(start, start + 2).toString() === "--") break;
    const next = body.indexOf(delimiter, start);
    if (next === -1) break;
    const raw = body.subarray(start + 2, next - 2); // drop CRLFs
    const split = raw.indexOf("\r\n\r\n");
    parts.push({
      headers: raw.subarray(0, split).toString(),
      body: raw.subarray(split + 4),
    });
    at = next;
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* The checks                                                          */
/* ------------------------------------------------------------------ */

async function checkSigning(): Promise<void> {
  console.log("Signing");
  const body = new TextEncoder().encode('{"fields":{"name":"Test"}}');
  const hash = createHash("sha256").update(body).digest("hex");
  same("the body hash is hex SHA-256", await sha256Hex(body), hash);
  same(
    "the signature is hex HMAC-SHA256 of `${timestamp}.${sha256(body)}`",
    await signFormRequest(SECRET, "1700000000000", body),
    createHmac("sha256", SECRET).update(`1700000000000.${hash}`).digest("hex")
  );
}

async function checkSettings(base: string): Promise<void> {
  console.log("Settings");
  delete process.env.CMS_FORMS_SECRET;
  process.env.CMS_URL = base;
  check("no secret: not configured", !cmsFormsConfigured());
  const before = seen.length;
  const error = await rejects(() => saveForm("contact", { name: "Test" }));
  check(
    "no secret: a save throws and nothing is sent",
    error instanceof CmsFormError &&
      error.message.includes("CMS_FORMS_SECRET") &&
      seen.length === before
  );
  process.env.CMS_FORMS_SECRET = SECRET;
  check("secret and address: configured", cmsFormsConfigured());
  process.env.CMS_URL = "http://cms.example.com";
  check(
    "a plain http address that is not this machine: not configured",
    !cmsFormsConfigured()
  );
  process.env.CMS_URL = base;
  same(
    "the careers email links to the entry in the CMS editor",
    cmsJobApplicationUrl("42"),
    `${base}/admin/collections/job-applications/42`
  );
}

async function checkFormDoor(): Promise<void> {
  console.log("Form doors");
  process.env.CMS_PROTECTION_BYPASS = BYPASS;
  script.set("/api/forms/contact", [created("ref-contact")]);
  const before = seen.length;
  const fields = {
    submittedAt: "2026-11-23T20:00:00.000Z",
    name: "Test Person",
    email: "test@example.com",
    phone: undefined,
    status: "new",
  };
  const saved = await saveForm("contact", fields);
  const sent = seen.slice(before);
  same("one request", sent.length, 1);
  const [request] = sent;
  same("to /api/forms/contact", request?.path, "/api/forms/contact");
  check("signed rightly", request?.signed === true);
  same(
    "carries the protection pass when set",
    request?.headers["x-vercel-protection-bypass"],
    BYPASS
  );
  same("sends JSON", request?.headers["content-type"], "application/json");
  same(
    'the body is {"fields": ...}, an unset field left out',
    JSON.parse(request?.body.toString() ?? "null"),
    {
      fields: {
        submittedAt: "2026-11-23T20:00:00.000Z",
        name: "Test Person",
        email: "test@example.com",
        status: "new",
      },
    }
  );
  same("the answer is read", saved, {
    id: "42",
    reference: "ref-contact",
    outcome: "created",
    retried: false,
  });

  delete process.env.CMS_PROTECTION_BYPASS;
  script.set("/api/forms/newsletter", [
    created("ref-news", "already-subscribed"),
  ]);
  const mark = seen.length;
  const news = await saveForm("newsletter", { email: "test@example.com" });
  check(
    "no protection pass header when it is not set",
    seen[mark]?.headers["x-vercel-protection-bypass"] === undefined
  );
  same(
    "the newsletter outcome is passed on",
    news.outcome,
    "already-subscribed"
  );

  script.set("/api/forms/grievance", [created("ref-gr")]);
  const g = seen.length;
  await saveForm("grievance", { ticketId: "GR-20261123-ABCD" }, "7");
  same(
    "a grievance carries customerId beside fields",
    JSON.parse(seen[g]?.body.toString() ?? "null"),
    { fields: { ticketId: "GR-20261123-ABCD" }, customerId: "7" }
  );
}

async function checkRetry(): Promise<void> {
  console.log("Retry");
  script.set("/api/forms/order", [
    { status: 500, body: { ok: false, error: "failed" } },
    created("PS-TEST-0001"),
  ]);
  let before = seen.length;
  const saved = await saveForm("order", { reference: "PS-TEST-0001" });
  const tries = seen.slice(before);
  same("a 5xx is tried once more", tries.length, 2);
  check(
    "both tries are signed",
    tries.every((t) => t.signed)
  );
  same("and the second answer is used", saved.reference, "PS-TEST-0001");
  check("and it says so", saved.retried === true);

  script.set("/api/forms/sample-request", ["drop", created("ref-sample")]);
  before = seen.length;
  const again = await saveForm("sample-request", { name: "Test" });
  same("no answer is tried once more", seen.length - before, 2);
  same("and the second answer is used", again.reference, "ref-sample");

  script.set("/api/forms/sills-enquiry", [
    { status: 503, body: { ok: false } },
  ]);
  before = seen.length;
  const twice = await rejects(() => saveForm("sills-enquiry", { name: "T" }));
  same("two 5xx: two tries only", seen.length - before, 2);
  check("and then it throws", twice instanceof CmsFormError);

  script.set("/api/forms/sills-enquiry", [
    { status: 504, body: { ok: false } },
    created("ref-sills"),
  ]);
  before = seen.length;
  const gateway = await rejects(() => saveForm("sills-enquiry", { name: "T" }));
  same(
    "a 504 is not tried again (the CMS may still be saving)",
    seen.length - before,
    1
  );
  check("and it throws", gateway instanceof CmsFormError);

  // The website's own time limit, made short for this check only.
  script.set("/api/forms/contact", ["hang", created("ref-late")]);
  const realSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = ((handler: () => void) =>
    realSetTimeout(handler, 200)) as unknown as typeof setTimeout;
  before = seen.length;
  let late: Error | null;
  try {
    late = await rejects(() => saveForm("contact", { name: "T" }));
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
  same(
    "no answer in time is not tried again (the CMS may still be saving)",
    seen.length - before,
    1
  );
  check(
    "and it throws",
    late instanceof CmsFormError && late.message.includes("no answer")
  );

  script.set("/api/forms/order", [
    { status: 503, body: { ok: false } },
    { status: 400, body: { ok: false, error: "invalid", field: "reference" } },
  ]);
  before = seen.length;
  const known = await saveForm("order", { reference: "PS-TEST-0002" });
  same(
    "an order whose second try finds its reference already saved is saved",
    known,
    { id: null, reference: "PS-TEST-0002", outcome: "created", retried: true }
  );
  same("after two tries", seen.length - before, 2);

  script.set("/api/forms/order", [
    { status: 400, body: { ok: false, error: "invalid", field: "reference" } },
  ]);
  const first = await rejects(() =>
    saveForm("order", { reference: "PS-TEST-0003" })
  );
  check(
    "but a first try refused on its reference throws",
    first instanceof CmsFormError && first.field === "reference"
  );

  script.set("/api/forms/where-to-buy-lead", [
    { status: 400, body: { ok: false, error: "invalid", field: "email" } },
  ]);
  before = seen.length;
  const invalid = await rejects(() =>
    saveForm("where-to-buy-lead", { email: "x" })
  );
  same("a 400 is not tried again", seen.length - before, 1);
  check(
    "a 400 throws, naming the field",
    invalid instanceof CmsFormError &&
      invalid.message.includes("email") &&
      invalid.status === 400 &&
      invalid.field === "email"
  );

  script.set("/api/forms/contact", [
    {
      status: 302,
      body: { ok: true, id: 1, reference: "r", outcome: "created" },
    },
  ]);
  before = seen.length;
  const moved = await rejects(() => saveForm("contact", { name: "T" }));
  same("a redirect is not followed or tried again", seen.length - before, 1);
  check("a redirect throws", moved instanceof CmsFormError);

  script.set("/api/forms/contact", [
    { status: 200, body: { ok: true, reference: "r", outcome: "created" } },
  ]);
  const shape = await rejects(() => saveForm("contact", { name: "T" }));
  check("an answer without an id throws", shape instanceof CmsFormError);

  process.env.CMS_FORMS_SECRET = "a-different-made-up-secret";
  script.set("/api/forms/contact", [created()]);
  before = seen.length;
  const refused = await rejects(() => saveForm("contact", { name: "T" }));
  check(
    "a wrong secret: refused with 401, not tried again, and it throws",
    refused instanceof CmsFormError &&
      refused.status === 401 &&
      seen.length - before === 1
  );
  process.env.CMS_FORMS_SECRET = SECRET;
}

async function checkCareersDoor(): Promise<void> {
  console.log("Careers door");
  script.set("/api/forms/job-application", [created("ref-job")]);
  const resumeBytes = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x0d, 0x0a, 0x00, 0xff,
  ]);
  const portfolioBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x2d, 0x2d]);
  const before = seen.length;
  const saved = await saveJobApplication(
    { firstName: "Test", lastName: "Person", status: "new" },
    { name: 'my "cv".pdf', type: "application/pdf", bytes: resumeBytes },
    { name: "work.png", type: "image/png; x=1", bytes: portfolioBytes }
  );
  const request = seen[before];
  same(
    "one request, to /api/forms/job-application",
    [seen.length - before, request?.path],
    [1, "/api/forms/job-application"]
  );
  check(
    "signed over the SHA-256 of the raw multipart body",
    request?.signed === true
  );
  const type = String(request?.headers["content-type"] ?? "");
  check(
    "sent as multipart/form-data",
    type.startsWith("multipart/form-data; boundary=")
  );
  const parts = multipartParts(request?.body ?? Buffer.alloc(0), type);
  same("three parts", parts.length, 3);
  const [fields, resume, portfolio] = parts;
  check(
    'the first is the text part "fields"',
    !!fields &&
      /name="fields"/.test(fields.headers) &&
      !/filename=/.test(fields.headers)
  );
  same(
    "it holds the fields as JSON",
    JSON.parse(fields?.body.toString() ?? "null"),
    {
      firstName: "Test",
      lastName: "Person",
      status: "new",
    }
  );
  check(
    'then the file part "resume", its name made safe',
    !!resume &&
      /name="resume"; filename="my %22cv%22.pdf"/.test(resume.headers) &&
      /Content-Type: application\/pdf/.test(resume.headers)
  );
  check(
    "with its bytes unchanged",
    !!resume && Buffer.compare(resume.body, Buffer.from(resumeBytes)) === 0
  );
  check(
    'then the file part "portfolio", an odd type sent as octet-stream',
    !!portfolio &&
      /name="portfolio"; filename="work.png"/.test(portfolio.headers) &&
      /Content-Type: application\/octet-stream/.test(portfolio.headers) &&
      Buffer.compare(portfolio.body, Buffer.from(portfolioBytes)) === 0
  );
  same("the answer is read", saved.reference, "ref-job");

  script.set("/api/forms/job-application", [created("ref-job", "duplicate")]);
  const mark = seen.length;
  const dup = await saveJobApplication(
    { firstName: "Test" },
    { name: "cv.pdf", type: "", bytes: resumeBytes },
    null
  );
  same("a duplicate is passed on", dup.outcome, "duplicate");
  check("from the first try", dup.retried === false);
  const two = multipartParts(
    seen[mark]?.body ?? Buffer.alloc(0),
    String(seen[mark]?.headers["content-type"] ?? "")
  );
  same("no portfolio: two parts", two.length, 2);
  check(
    "a file with no type is sent as octet-stream",
    /Content-Type: application\/octet-stream/.test(two[1]?.headers ?? "")
  );

  script.set("/api/forms/job-application", [
    "drop",
    created("ref-job", "duplicate"),
  ]);
  const again = await saveJobApplication(
    { firstName: "Test" },
    { name: "cv.pdf", type: "", bytes: resumeBytes },
    null
  );
  check(
    "a duplicate from the second try says so (the first may have saved it)",
    again.outcome === "duplicate" && again.retried === true
  );

  script.set("/api/forms/job-application", [
    { status: 400, body: { ok: false, error: "invalid", field: "resume" } },
  ]);
  const refused = await rejects(() =>
    saveJobApplication(
      { firstName: "Test" },
      { name: "cv.doc", type: "", bytes: resumeBytes },
      null
    )
  );
  check(
    "a CV refused by its bytes throws, naming the field resume",
    refused instanceof CmsFormError &&
      refused.status === 400 &&
      refused.field === "resume"
  );
}

async function checkCustomerDoors(): Promise<void> {
  console.log("Customer doors");
  script.set("/api/customers/sign-in", [
    {
      status: 200,
      body: {
        ok: true,
        customer: { id: 7, name: "Test", email: "t@example.com" },
      },
    },
  ]);
  const before = seen.length;
  const answer = await callCustomerDoor("sign-in", {
    email: "t@example.com",
    password: "made-up-password",
  });
  same("sign-in: the answer is passed on", answer, {
    ok: true,
    customer: { id: 7, name: "Test", email: "t@example.com" },
  });
  same(
    "sign-in: to /api/customers/sign-in",
    seen[before]?.path,
    "/api/customers/sign-in"
  );
  check("sign-in: signed rightly", seen[before]?.signed === true);

  script.set("/api/customers/sign-in", [{ status: 200, body: { ok: false } }]);
  same(
    "sign-in: {ok:false} is passed on",
    await callCustomerDoor("sign-in", {
      email: "x@example.com",
      password: "y",
    }),
    { ok: false }
  );
  script.set("/api/customers/grievance", [
    { status: 404, body: { ok: false } },
  ]);
  same(
    "grievance: a 404 with {ok:false} is not found",
    await callCustomerDoor("grievance", { customerId: "7", ticketId: "GR-X" }),
    { ok: false }
  );
  process.env.CMS_FORMS_SECRET = "a-different-made-up-secret";
  const refused = await rejects(() =>
    callCustomerDoor("profile", { customerId: "7" })
  );
  check(
    "a refused signature (401) throws, never read as {ok:false}",
    refused instanceof CmsFormError && refused.status === 401
  );
  process.env.CMS_FORMS_SECRET = SECRET;
}

/** A made-up customer id, shaped like every CMS id. */
const CUSTOMER = "0b6f3c1e-4d2a-4c8e-9f1a-2b3c4d5e6f70";

/** Runs some code with the routes' error log silenced. */
async function quietly<T>(run: () => Promise<T>): Promise<T> {
  const realError = console.error;
  console.error = () => undefined;
  try {
    return await run();
  } finally {
    console.error = realError;
  }
}

async function checkGrievanceResent(): Promise<void> {
  console.log("A complaint sent again");
  const fields = {
    ticketId: "GR-20261123-AB12",
    subject: "Chipped edge",
    category: "Delivery",
    priority: "Medium",
    description: "The edge was chipped on arrival.",
    status: "Open",
    createdAt: "2026-11-23T20:00:00.000Z",
  };
  const readBack = (subject: string, description: string) => ({
    status: 200,
    body: {
      ok: true,
      grievance: {
        id: "9d1c2b3a-0000-4000-8000-000000000001",
        ticketId: fields.ticketId,
        customer: CUSTOMER,
        subject,
        description,
        status: "Open",
      },
    },
  });
  const refusedTicket = {
    status: 400,
    body: { ok: false, error: "invalid", field: "ticketId" },
  };

  script.set("/api/forms/grievance", [
    { status: 500, body: { ok: false, error: "failed" } },
    refusedTicket,
  ]);
  script.set("/api/customers/grievance", [
    readBack(fields.subject, fields.description),
  ]);
  let before = seen.length;
  let answer: unknown = null;
  const thrown = await rejects(async () => {
    answer = await saveForm("grievance", fields, CUSTOMER);
  });
  same(
    "a complaint whose second try finds its ticket already saved, with the same subject and description, is saved",
    [answer, thrown?.message ?? null],
    [{ id: null, reference: null, outcome: "created", retried: true }, null]
  );
  const asked = seen
    .slice(before)
    .find((s) => s.path === "/api/customers/grievance");
  same(
    "it reads the complaint back by the customer and the ticket",
    asked ? JSON.parse(asked.body.toString()) : null,
    { customerId: CUSTOMER, ticketId: fields.ticketId }
  );

  script.set("/api/forms/grievance", [
    { status: 503, body: { ok: false } },
    refusedTicket,
  ]);
  script.set("/api/customers/grievance", [
    readBack("Another complaint", fields.description),
  ]);
  const clash = await rejects(() => saveForm("grievance", fields, CUSTOMER));
  check(
    "a ticket number already used by a different complaint still fails",
    clash instanceof CmsFormError && clash.field === "ticketId"
  );

  script.set("/api/forms/grievance", ["drop", refusedTicket]);
  script.set("/api/customers/grievance", [
    readBack(fields.subject, "Another description"),
  ]);
  const otherText = await rejects(() =>
    saveForm("grievance", fields, CUSTOMER)
  );
  check(
    "a complaint with the same subject but another description still fails",
    otherText instanceof CmsFormError && otherText.field === "ticketId"
  );

  script.set("/api/forms/grievance", [
    { status: 502, body: { ok: false } },
    refusedTicket,
  ]);
  script.set("/api/customers/grievance", [
    { status: 404, body: { ok: false } },
  ]);
  const notFound = await rejects(() => saveForm("grievance", fields, CUSTOMER));
  check(
    "a ticket the customer's own complaints do not hold still fails",
    notFound instanceof CmsFormError && notFound.field === "ticketId"
  );

  script.set("/api/forms/grievance", [refusedTicket]);
  script.set("/api/customers/grievance", [
    readBack(fields.subject, fields.description),
  ]);
  before = seen.length;
  const first = await rejects(() => saveForm("grievance", fields, CUSTOMER));
  check(
    "a first try refused on its ticket still fails",
    first instanceof CmsFormError && first.field === "ticketId"
  );
  check(
    "and nothing is read back",
    seen.slice(before).every((s) => s.path !== "/api/customers/grievance")
  );
}

async function checkSessions(): Promise<void> {
  console.log("Sessions (auth.config.ts)");
  type JwtArgs = Parameters<typeof authConfig.callbacks.jwt>[0];
  const jwt = (args: {
    token: Record<string, unknown>;
    user?: { id: string };
  }) =>
    authConfig.callbacks.jwt({ account: null, ...args } as unknown as JwtArgs);

  const signedIn = await jwt({ token: { sub: "x" }, user: { id: CUSTOMER } });
  check(
    "a sign-in through the CMS gives a marked session with the CMS id",
    !!signedIn && signedIn.id === CUSTOMER && signedIn.src === "cms"
  );
  const later = await jwt({ token: { ...(signedIn ?? {}) } });
  check(
    "a marked session with a CMS id is kept",
    !!later && later.id === CUSTOMER && later.src === "cms"
  );
  const old = await jwt({ token: { id: CUSTOMER, sub: CUSTOMER } });
  same(
    "a session without the mark is ended, even when its id is shaped like a CMS id (Studio made such ids)",
    old,
    null
  );
  const oldShape = await jwt({ token: { id: "customer-abc123", src: "cms" } });
  same(
    "a session whose id is not shaped like a CMS id is ended",
    oldShape,
    null
  );
  const oddSignIn = await jwt({ token: {}, user: { id: "customer-abc123" } });
  same(
    "a sign-in with an id not shaped like a CMS id gives no session",
    oddSignIn,
    null
  );
}

async function checkGrievanceRoute(): Promise<void> {
  console.log("The complaint route");
  // The session read is replaced by a stand-in that gives one signed-in
  // customer; the real one needs Next itself.
  const authPath = join(process.cwd(), "src/auth.ts");
  const stub = new Module(authPath);
  stub.filename = authPath;
  stub.loaded = true;
  stub.exports = { auth: async () => ({ user: { id: CUSTOMER } }) };
  (Module as unknown as { _cache: Record<string, Module> })._cache[authPath] =
    stub;
  const route = await import("../src/app/api/customer/grievance/route");
  const send = () =>
    quietly(() =>
      route.POST(
        new Request("http://localhost/api/customer/grievance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            subject: "Chipped edge",
            description: "The edge was chipped on arrival.",
          }),
        })
      )
    );

  script.set("/api/forms/grievance", [
    { status: 400, body: { ok: false, error: "invalid", field: "customerId" } },
  ]);
  const unknown = await send();
  same(
    "a customer the CMS does not know (any more) is answered 401",
    unknown.status,
    401
  );

  script.set("/api/forms/grievance", [
    { status: 400, body: { ok: false, error: "invalid", field: "subject" } },
  ]);
  same("any other refusal is still a 500", (await send()).status, 500);

  script.set("/api/forms/grievance", [created("ref-gr-route")]);
  const ok = await send();
  same("a saved complaint is a 200", ok.status, 200);
}

async function checkGrievancePage(): Promise<void> {
  console.log("The complaint page (NewGrievanceForm)");
  const draft = {
    subject: "Chipped edge",
    category: "Delivery",
    priority: "Medium",
    description: "The edge was chipped on arrival.",
  };
  /** Sends the draft against one made-up answer of the route. */
  const sendWith = async (answer: Response) => {
    const signOuts: unknown[] = [];
    const asked: string[] = [];
    const sent = await sendGrievance(
      draft,
      async (options) => {
        signOuts.push(options);
      },
      async (input) => {
        asked.push(String(input));
        return answer;
      }
    ).catch(() => ({ kind: "threw" }));
    return { sent, signOuts, asked };
  };

  // A body that is not JSON: reading it would throw.
  const refused = new Response("not json", { status: 401 });
  const signedOut = await sendWith(refused);
  same(
    "a 401 from the complaint route signs the customer out and sends him to the sign-in page",
    [signedOut.sent, signedOut.signOuts],
    [{ kind: "signed-out" }, [{ callbackUrl: "/customer/login" }]]
  );
  check("and the 401's body is not read", !refused.bodyUsed);
  same("the complaint page sends to the complaint route", signedOut.asked, [
    "/api/customer/grievance",
  ]);

  const failed = await sendWith(
    Response.json({ error: "Could not submit." }, { status: 500 })
  );
  same(
    "any other refusal shows its message and does not sign out",
    [failed.sent, failed.signOuts.length],
    [{ kind: "error", message: "Could not submit." }, 0]
  );
  const saved = await sendWith(
    Response.json({ success: true, ticketId: "GR-20261123-AB12" })
  );
  same(
    "a saved complaint does not sign out",
    [saved.sent, saved.signOuts.length],
    [{ kind: "saved" }, 0]
  );

  const form = readFileSync(
    join(process.cwd(), "src/components/customer/NewGrievanceForm.tsx"),
    "utf8"
  );
  check(
    "the complaint page sends through sendGrievance with next-auth's signOut",
    /import \{ signOut \} from "next-auth\/react";/.test(form) &&
      /await sendGrievance\([^)]*,\s*signOut\s*\)/.test(form) &&
      !/fetch\(/.test(form)
  );
}

async function checkCareersRoute(): Promise<void> {
  console.log("The careers route");
  // The route also loads the content reads, which need these two names
  // set; made-up values, nothing is read here.
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= "madeup0";
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= "made-up";
  const route = await import("../src/app/api/careers/apply/route");
  let visitor = 0;
  const apply = async (extra: Record<string, string> = {}) => {
    visitor += 1;
    const form = new FormData();
    const fields = {
      firstName: "Test",
      lastName: "Person",
      email: "test@example.com",
      phone: "0000000000",
      ...extra,
    };
    for (const [name, value] of Object.entries(fields)) form.set(name, value);
    form.set(
      "resume",
      new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "cv.pdf", {
        type: "application/pdf",
      })
    );
    const response = await quietly(() =>
      route.POST(
        new NextRequest("http://localhost/api/careers/apply", {
          method: "POST",
          body: form,
          headers: { "x-forwarded-for": `203.0.113.${visitor}` },
        })
      )
    );
    const body = (await response.json()) as { error?: string };
    return { status: response.status, error: body.error };
  };
  const LINK_MESSAGE =
    "Portfolio link must be a valid URL starting with http:// or https://.";
  const sentFields = (mark: number): Record<string, unknown> | null => {
    const request = seen
      .slice(mark)
      .find((s) => s.path === "/api/forms/job-application");
    if (!request) return null;
    const parts = multipartParts(
      request.body,
      String(request.headers["content-type"] ?? "")
    );
    return JSON.parse(parts[0]?.body.toString() ?? "null");
  };

  // 20 + 478 + 2 = 500 characters as pasted; the space makes it 502.
  const longLink = `https://example.com/${"a".repeat(478)} b`;
  script.set("/api/forms/job-application", [
    { status: 400, body: { ok: false, error: "invalid", field: "resume" } },
  ]);
  let mark = seen.length;
  const long = await apply({ portfolioUrl: longLink });
  same(
    "a portfolio link over 500 characters once its spaces are %20 is refused with the link's message, not cut",
    long,
    { status: 400, error: LINK_MESSAGE }
  );
  same("and nothing is sent to the CMS", seen.length - mark, 0);

  // 20 + 476 + 2 = 498 characters as pasted; the space makes it 500.
  mark = seen.length;
  await apply({ portfolioUrl: `https://example.com/${"a".repeat(476)} b` });
  const whole = `https://example.com/${"a".repeat(476)}%20b`;
  same(
    "a link of exactly 500 characters once its spaces are %20 is sent whole",
    [sentFields(mark)?.portfolioUrl, whole.length],
    [whole, 500]
  );

  const refusal = async (field: string) => {
    script.set("/api/forms/job-application", [
      { status: 400, body: { ok: false, error: "invalid", field } },
    ]);
    return apply();
  };
  same(
    "a CMS refusal of the applicant's email is a 400 with the email message",
    await refusal("email"),
    { status: 400, error: "A valid email address is required." }
  );
  same(
    "a CMS refusal of the CV is a 400 with the CV message",
    await refusal("resume"),
    { status: 400, error: "Resume must be a PDF, DOC, or DOCX file." }
  );
  for (const field of [
    "firstName",
    "lastName",
    "phone",
    "address",
    "currentLocation",
    "age",
    "totalExperience",
    "department",
    "appliedFor",
    "comments",
    "portfolio",
    "portfolioUrl",
  ]) {
    const answer = await refusal(field);
    check(
      `a CMS refusal of the applicant's own field ${field} is a 400`,
      answer.status === 400,
      `got ${answer.status}`
    );
  }
  for (const field of ["fields", "body", "status", "submittedAt"]) {
    same(
      `a CMS refusal of ${field}, not the applicant's to fix, is the usual 500`,
      await refusal(field),
      { status: 500, error: "Something went wrong. Please try again later." }
    );
  }
}

function checkTimeLimits(): void {
  console.log("Time limits of the server code that waits on the CMS");
  const limits: Array<[string, number]> = [
    ["src/app/api/contact/submit/route.ts", 60],
    ["src/app/api/order/submit/route.ts", 60],
    ["src/app/api/sample-request/submit/route.ts", 60],
    ["src/app/api/sills-enquiry/route.ts", 60],
    ["src/app/api/where-to-buy/lead/route.ts", 60],
    ["src/app/api/newsletter/subscribe/route.ts", 60],
    ["src/app/api/customer/grievance/route.ts", 110],
    ["src/app/api/careers/apply/route.ts", 150],
    ["src/app/api/auth/[...nextauth]/route.ts", 60],
    ["src/app/customer/dashboard/page.tsx", 60],
    ["src/app/customer/profile/page.tsx", 60],
    ["src/app/customer/grievance/page.tsx", 60],
    ["src/app/customer/grievance/[ticketId]/page.tsx", 60],
  ];
  const declared = (file: string) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    const match = /^export const maxDuration = (\d+);$/m.exec(source);
    return match ? Number(match[1]) : null;
  };
  for (const [file, seconds] of limits) {
    same(`${file} may run ${seconds} seconds`, declared(file), seconds);
  }

  // The longest each one may wait on the CMS, in seconds, from the time
  // limits of src/cms: a read is tried once; a door is tried at most
  // twice, the first try ending before its limit.
  const read = READ_TIMEOUT_MS / 1000;
  const door = (2 * FORM_TIMEOUT_MS) / 1000;
  const upload = (2 * UPLOAD_TIMEOUT_MS) / 1000;
  const SPARE = 10;
  const waits: Array<[string, string, number]> = [
    ["src/app/api/contact/submit/route.ts", "its form door", door],
    ["src/app/api/order/submit/route.ts", "its form door", door],
    ["src/app/api/sample-request/submit/route.ts", "its form door", door],
    ["src/app/api/sills-enquiry/route.ts", "its form door", door],
    ["src/app/api/where-to-buy/lead/route.ts", "its form door", door],
    ["src/app/api/newsletter/subscribe/route.ts", "its form door", door],
    [
      "src/app/api/customer/grievance/route.ts",
      "the complaint door and the read back",
      2 * door,
    ],
    [
      "src/app/api/careers/apply/route.ts",
      "the role look-up and the careers door",
      read + upload,
    ],
    ["src/app/api/auth/[...nextauth]/route.ts", "the sign-in door", door],
    ["src/app/customer/dashboard/page.tsx", "its customer door", door],
    ["src/app/customer/profile/page.tsx", "its customer door", door],
    ["src/app/customer/grievance/page.tsx", "its customer door", door],
    [
      "src/app/customer/grievance/[ticketId]/page.tsx",
      "its customer door",
      door,
    ],
  ];
  for (const [file, what, seconds] of waits) {
    const limit = declared(file);
    check(
      `${file} may run at least ${SPARE} seconds longer than ${what} may take (${seconds} s)`,
      limit !== null && limit >= seconds + SPARE,
      `its limit is ${limit}`
    );
  }
  same(
    "the middleware (edge) sets no time limit",
    declared("src/middleware.ts"),
    null
  );
}

function checkImports(): void {
  console.log(
    "No Sanity left in the forms, the sign-in and the customer pages"
  );
  const files = [
    "src/app/api/contact/submit/route.ts",
    "src/app/api/order/submit/route.ts",
    "src/app/api/sample-request/submit/route.ts",
    "src/app/api/sills-enquiry/route.ts",
    "src/app/api/where-to-buy/lead/route.ts",
    "src/app/api/careers/apply/route.ts",
    "src/app/api/newsletter/subscribe/route.ts",
    "src/app/api/customer/grievance/route.ts",
    "src/auth.config.ts",
    "src/app/customer/dashboard/page.tsx",
    "src/app/customer/profile/page.tsx",
    "src/app/customer/grievance/page.tsx",
    "src/app/customer/grievance/[ticketId]/page.tsx",
    "src/app/api/cdn/[...path]/route.ts",
  ];
  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    check(
      `${file} loads no Sanity module`,
      !/from\s+["'](@sanity\/|@\/sanity\/|next-sanity)/.test(source)
    );
  }
  const careers = readFileSync(
    join(process.cwd(), "src/app/api/careers/apply/route.ts"),
    "utf8"
  );
  check(
    "the careers email carries no Sanity link",
    !/sanity\.(studio|io)/.test(careers)
  );
  check("/studio is gone", !existsSync(join(process.cwd(), "src/app/studio")));
  check(
    "sanity.config.ts is gone",
    !existsSync(join(process.cwd(), "sanity.config.ts"))
  );
}

async function main(): Promise<void> {
  const server = await startStandIn();
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await checkSigning();
    await checkSettings(base);
    await checkFormDoor();
    await checkRetry();
    await checkCareersDoor();
    await checkCustomerDoors();
    await checkGrievanceResent();
    await checkSessions();
    await checkGrievanceRoute();
    await checkGrievancePage();
    await checkCareersRoute();
    checkTimeLimits();
    checkImports();
  } finally {
    server.closeAllConnections();
    server.close();
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
