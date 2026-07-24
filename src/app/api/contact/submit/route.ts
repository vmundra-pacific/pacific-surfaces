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

  try {
    const body = (await req.json()) as ContactBody;

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const address = (body.address ?? "").trim();
    const role = (body.role ?? "").trim();
    const application = (body.application ?? "").trim();
    const message = (body.message ?? "").trim();
    const source = (body.source ?? "").trim();

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

  subject: `🌐 New Website Enquiry - ${name}`,

  html: `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">

      <h2 style="color:#1f2937">
        New Website Enquiry
      </h2>

      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
        <tr>
          <td><strong>Name</strong></td>
          <td>${name}</td>
        </tr>

        <tr>
          <td><strong>Email</strong></td>
          <td>${email}</td>
        </tr>

        <tr>
          <td><strong>Phone</strong></td>
          <td>${phone || "-"}</td>
        </tr>

        <tr>
          <td><strong>Address</strong></td>
          <td>${address || "-"}</td>
        </tr>

        <tr>
          <td><strong>Role</strong></td>
          <td>${role || "-"}</td>
        </tr>

        <tr>
          <td><strong>Application</strong></td>
          <td>${application || "-"}</td>
        </tr>

        <tr>
          <td><strong>Source</strong></td>
          <td>${source || "-"}</td>
        </tr>
      </table>

      <h3>Message</h3>

      <p>${message || "No message provided."}</p>

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
