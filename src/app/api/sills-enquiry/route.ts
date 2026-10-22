/**
 * POST /api/sills-enquiry
 *
 * The quote form of the Window Sills & Thresholds landing page (owner,
 * 2026-10-22: a separate form for the page the ads run to). Saves a
 * `sillsEnquiry` document (Studio: Form Submissions → Window Sill
 * Enquiries) and emails the company inbox with its own subject, so these
 * leads never mix with the general contact form. Same guards as
 * /api/contact/submit: rate limit, clamped fields, escaped email.
 */
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { rateLimit, getClientIp, FORM_RATE_LIMIT } from "@/lib/rate-limit";
import { escapeHtml, clampField, FIELD_LIMITS } from "@/lib/escape";

export const runtime = "nodejs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const writeToken = process.env.SANITY_API_WRITE_TOKEN;

const sanityClient =
  projectId && dataset && writeToken
    ? createClient({ projectId, dataset, apiVersion: "2026-03-28", useCdn: false, token: writeToken })
    : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

interface Body {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  role?: string;
  products?: string[];
  material?: string;
  quantity?: string;
  message?: string;
  openedFrom?: string;
  tracking?: string;
  referrer?: string;
  pageUrl?: string;
  /** Honeypot: people never fill it. */
  website?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.COMPANY_EMAIL) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const limit = rateLimit(`form:${getClientIp(req)}`, FORM_RATE_LIMIT.limit, FORM_RATE_LIMIT.windowMs);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = (await req.json()) as Body;
    // A bot filled the hidden field: accept quietly, keep nothing.
    if (body.website) return NextResponse.json({ success: true });

    const name = clampField(body.name, FIELD_LIMITS.name);
    const email = clampField(body.email, FIELD_LIMITS.email);
    const phone = clampField(body.phone, FIELD_LIMITS.phone);
    const company = clampField(body.company, FIELD_LIMITS.shortText);
    const location = clampField(body.location, FIELD_LIMITS.address);
    const role = clampField(body.role, FIELD_LIMITS.shortText);
    const products = (Array.isArray(body.products) ? body.products : [])
      .slice(0, 12)
      .map((p) => clampField(p, FIELD_LIMITS.shortText))
      .filter(Boolean);
    const material = clampField(body.material, FIELD_LIMITS.shortText);
    const quantity = clampField(body.quantity, FIELD_LIMITS.shortText);
    const message = clampField(body.message, FIELD_LIMITS.message);
    const openedFrom = clampField(body.openedFrom, FIELD_LIMITS.shortText);
    const tracking = clampField(body.tracking, FIELD_LIMITS.address);
    const referrer = clampField(body.referrer, FIELD_LIMITS.address);
    const pageUrl = clampField(body.pageUrl, FIELD_LIMITS.address);

    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!phone) return NextResponse.json({ error: "Phone is required." }, { status: 400 });

    // Save first: the document is the record, a mail failure must not lose it.
    let doc = null;
    if (sanityClient) {
      doc = await sanityClient.create({
        _type: "sillsEnquiry",
        submittedAt: new Date().toISOString(),
        name,
        email,
        phone,
        company: company || undefined,
        location: location || undefined,
        role: role || undefined,
        products: products.length ? products : undefined,
        material: material || undefined,
        quantity: quantity || undefined,
        message: message || undefined,
        openedFrom: openedFrom || undefined,
        tracking: tracking || undefined,
        referrer: referrer || undefined,
        pageUrl: pageUrl || undefined,
        status: "new",
      });
    }

    const row = (k: string, v: string) =>
      `<tr><td style="width:160px"><strong>${k}</strong></td><td>${escapeHtml(v) || "-"}</td></tr>`;
    try {
      await transporter.sendMail({
        from: `"Pacific Website" <${process.env.SMTP_USER}>`,
        to: process.env.COMPANY_EMAIL,
        replyTo: email,
        subject: `🪟 Window Sills Enquiry - ${name}${location ? ` (${location})` : ""}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
            <h2 style="color:#1f2937">Window Sills &amp; Thresholds: quote request</h2>
            <p style="color:#6b7280">From the sills landing page (opened from: ${escapeHtml(openedFrom) || "-"})</p>
            <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
              ${row("Name", name)}
              ${row("Email", email)}
              ${row("Phone", phone)}
              ${row("Company", company)}
              ${row("Country / city", location)}
              ${row("I am", role)}
              ${row("Products", products.join(", "))}
              ${row("Material", material)}
              ${row("Quantity", quantity)}
              ${row("Ad tracking", tracking)}
              ${row("Referrer", referrer)}
            </table>
            <h3>Message</h3>
            <p>${escapeHtml(message) || "No message provided."}</p>
          </div>`,
      });
    } catch (mailError) {
      console.error("[sills-enquiry] email failed:", mailError);
      if (!doc) throw mailError;
    }

    return NextResponse.json({ success: true, id: doc?._id });
  } catch (error) {
    console.error("[sills-enquiry] failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
