/**
 * Checks for the CMS writer (src/cms/forms.ts): the signing of every
 * door, the bodies the doors receive, the one retry, and the answers.
 * It needs no network and no real key: it runs a small stand-in CMS on
 * 127.0.0.1 and uses made-up values.
 *
 *   npm run check:cms-forms
 *
 * (that is: npx tsx --conditions=react-server scripts/check-cms-forms.ts;
 * the condition lets the server-only modules load outside Next.)
 *
 * Not covered here, because they need Next itself: the routes.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import {
  callCustomerDoor,
  CmsFormError,
  cmsFormsConfigured,
  cmsJobApplicationUrl,
  saveForm,
  saveJobApplication,
  sha256Hex,
  signFormRequest,
} from "../src/cms/forms";

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
  Array<"drop" | { status: number; body: unknown }>
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
    invalid instanceof CmsFormError && invalid.message.includes("email")
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
  const two = multipartParts(
    seen[mark]?.body ?? Buffer.alloc(0),
    String(seen[mark]?.headers["content-type"] ?? "")
  );
  same("no portfolio: two parts", two.length, 2);
  check(
    "a file with no type is sent as octet-stream",
    /Content-Type: application\/octet-stream/.test(two[1]?.headers ?? "")
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
  } finally {
    server.close();
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
