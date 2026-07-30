/**
 * POST /api/contact/submit
 *
 * Receives a JSON body from ContactContent and persists it as a
 * `contactSubmission` document in Sanity. Editors triage in Studio
 * under "Form Submissions → Contact Submissions".
 *
 * Required env vars:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET
 *   - SANITY_API_WRITE_TOKEN   (must have create permission)
 */
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import {
  rateLimit,
  getClientIp,
  FORM_RATE_LIMIT,
} from "@/lib/rate-limit";
import { escapeHtml, clampField, FIELD_LIMITS } from "@/lib/escape";

export const runtime = "nodejs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

const sanityClient =
  projectId && dataset && writeToken
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2026-03-28",
        useCdn: false,
        token: writeToken,
      })
    : null;

    const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  application?: string;
  message?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS ||
  !process.env.COMPANY_EMAIL
) {
  return NextResponse.json(
    { error: "Email service is not configured." },
    { status: 503 }
  );
}

  // Throttle before doing any work: this endpoint sends mail through a
  // shared mailbox with a finite daily quota and writes a Sanity
  // document, so an unthrottled flood costs both deliverability and
  // money. Shared quota with the other public form endpoints.
  const limit = rateLimit(
    `form:${getClientIp(req)}`,
    FORM_RATE_LIMIT.limit,
    FORM_RATE_LIMIT.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = (await req.json()) as ContactBody;

    // Clamp every field to a sane maximum. Previously unbounded, so a
    // single request could push a multi-megabyte document into Sanity.
    const name = clampField(body.name, FIELD_LIMITS.name);
    const email = clampField(body.email, FIELD_LIMITS.email);
    const phone = clampField(body.phone, FIELD_LIMITS.phone);
    const address = clampField(body.address, FIELD_LIMITS.address);
    const role = clampField(body.role, FIELD_LIMITS.shortText);
    const application = clampField(body.application, FIELD_LIMITS.shortText);
    const message = clampField(body.message, FIELD_LIMITS.message);
    const source = clampField(body.source, FIELD_LIMITS.shortText);

    // Minimal validation — name + email are the core identity.
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }
    await transporter.sendMail({
  from: `"Pacific Website" <${process.env.SMTP_USER}>`,
  to: process.env.COMPANY_EMAIL,
  replyTo: email,

  // `name` is safe unescaped in the Subject header: nodemailer encodes
  // header values, and the email regex below already rejects the CR/LF
  // needed for header injection.
  subject: `🌐 New Website Enquiry - ${name}`,

  // Every interpolated value below is attacker-controlled and MUST be
  // escaped. Without this, a submitted field containing markup was
  // injected verbatim into the email that lands in the staff inbox —
  // allowing spoofed content, tracking pixels and phishing links inside
  // a message that appears to come from our own website.
  html: `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">

      <h2 style="color:#1f2937">
        New Website Enquiry
      </h2>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
        <tr>
          <td><strong>Name</strong></td>
          <td>${escapeHtml(name)}</td>
        </tr>

        <tr>
          <td><strong>Email</strong></td>
          <td>${escapeHtml(email)}</td>
        </tr>

        <tr>
          <td><strong>Phone</strong></td>
          <td>${escapeHtml(phone) || "-"}</td>
        </tr>

        <tr>
          <td><strong>Address</strong></td>
          <td>${escapeHtml(address) || "-"}</td>
        </tr>

        <tr>
          <td><strong>Role</strong></td>
          <td>${escapeHtml(role) || "-"}</td>
        </tr>

        <tr>
          <td><strong>Application</strong></td>
          <td>${escapeHtml(application) || "-"}</td>
        </tr>

        <tr>
          <td><strong>Source</strong></td>
          <td>${escapeHtml(source) || "-"}</td>
        </tr>
      </table>

      <h3>Message</h3>

      <p>${escapeHtml(message) || "No message provided."}</p>

    </div>
  `,
});

    let doc = null;

  if (sanityClient) {
  doc = await sanityClient.create({
    _type: "contactSubmission",
    submittedAt: new Date().toISOString(),
    name,
    email,
    phone: phone || undefined,
    address: address || undefined,
    role: role || undefined,
    application: application || undefined,
    message: message || undefined,
    source: source || undefined,
    status: "new",
  });
}

    return NextResponse.json({ success: true, id: doc?._id });
  } catch (error) {
    // Log the real error server-side; never leak internals to clients.
    console.error("[contact/submit] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
