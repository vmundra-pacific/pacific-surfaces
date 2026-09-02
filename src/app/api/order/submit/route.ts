/**
 * POST /api/order/submit
 *
 * Receives a cart plus customer details from /cart, records it as an
 * `orderRequest` document in Sanity, and emails the team so somebody
 * picks it up. There is no payment step — the response carries a
 * reference the customer is shown, and the team contacts them to
 * confirm quantities, freight and price.
 *
 * Env vars match /api/contact/submit: Sanity write token for the
 * document, SMTP_* plus COMPANY_EMAIL for the notification. The email
 * is best-effort — an SMTP failure must not lose an order that has
 * already been written to Sanity.
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
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/** Hard cap on lines, so one request can't write an unbounded array. */
const MAX_LINES = 50;
const MAX_QTY_PER_LINE = 99;

interface IncomingLine {
  id?: string;
  name?: string;
  slug?: string;
  collection?: string | null;
  thickness?: string;
  finish?: string;
  quantity?: number;
}

interface OrderBody {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  customerType?: "homeowner" | "professional";
  address?: string;
  notes?: string;
  items?: IncomingLine[];
}

/**
 * Human-quotable reference: PS-<base36 time>-<4 random>. Short enough
 * to read down a phone, unique enough for a support inbox.
 */
function orderReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `PS-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  if (!sanityClient) {
    return NextResponse.json(
      {
        error:
          "Ordering is not configured right now. Please email us at info@pacific-surfaces.com and we'll take it from there.",
      },
      { status: 503 }
    );
  }

  const limit = rateLimit(
    `form:${getClientIp(req)}`,
    FORM_RATE_LIMIT.limit,
    FORM_RATE_LIMIT.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = (await req.json()) as OrderBody;

    const name = clampField(body.name, FIELD_LIMITS.name);
    const email = clampField(body.email, FIELD_LIMITS.email);
    const phone = clampField(body.phone, FIELD_LIMITS.phone);
    const company = clampField(body.company, FIELD_LIMITS.shortText);
    const address = clampField(body.address, FIELD_LIMITS.address);
    const notes = clampField(body.notes, FIELD_LIMITS.message);
    const customerType =
      body.customerType === "homeowner" || body.customerType === "professional"
        ? body.customerType
        : undefined;

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "A delivery address is required." },
        { status: 400 }
      );
    }

    // Rebuild every line server-side. The client sends what is in its
    // localStorage, which is entirely attacker-controlled: clamp the
    // strings, coerce the quantities, and cap the count.
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.slice(0, MAX_LINES).flatMap((line) => {
      const lineName = clampField(line.name, FIELD_LIMITS.shortText);
      if (!lineName) return [];
      const quantity = Math.min(
        MAX_QTY_PER_LINE,
        Math.max(1, Math.floor(Number(line.quantity) || 1))
      );
      return [
        {
          _key: `${clampField(line.id, 64) || "line"}-${clampField(line.thickness, 32)}-${clampField(line.finish, 32)}`.replace(
            /[^a-zA-Z0-9_-]/g,
            "-"
          ),
          name: lineName,
          slug: clampField(line.slug, FIELD_LIMITS.shortText) || undefined,
          collection:
            clampField(line.collection, FIELD_LIMITS.shortText) || undefined,
          thickness: clampField(line.thickness, 32) || undefined,
          finish: clampField(line.finish, 32) || undefined,
          quantity,
        },
      ];
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const totalPieces = items.reduce((n, i) => n + i.quantity, 0);
    const reference = orderReference();

    const doc = await sanityClient.create({
      _type: "orderRequest",
      reference,
      submittedAt: new Date().toISOString(),
      status: "new",
      name,
      email,
      phone,
      company: company || undefined,
      customerType,
      address,
      notes: notes || undefined,
      items,
      totalPieces,
    });

    // Notify the team. Deliberately after the Sanity write and inside
    // its own try — a bounced email must not fail an order that has
    // already been recorded.
    try {
      const rows = items
        .map(
          (i) => `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${escapeHtml(i.collection ?? "—")}</td>
          <td>${escapeHtml(i.thickness ?? "—")}</td>
          <td>${escapeHtml(i.finish ?? "—")}</td>
          <td align="right">${i.quantity}</td>
        </tr>`
        )
        .join("");

      await transporter.sendMail({
        from: `"Pacific Website" <${process.env.SMTP_USER}>`,
        to: process.env.COMPANY_EMAIL,
        replyTo: email,
        subject: `🧾 New Order ${reference} — ${name} (${totalPieces} piece${totalPieces === 1 ? "" : "s"})`,
        // Every interpolated value is customer-supplied and escaped.
        html: `
    <div style="font-family:Arial,sans-serif;max-width:760px;margin:auto">
      <h2 style="color:#112732;margin-bottom:4px">New order request</h2>
      <p style="color:#4a5f6b;margin-top:0">
        Reference <strong>${escapeHtml(reference)}</strong> · ${totalPieces} piece${totalPieces === 1 ? "" : "s"}
      </p>

      <h3 style="color:#112732;margin-bottom:6px">Items</h3>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
        <tr style="background:#f1f4f5">
          <th align="left">Product</th>
          <th align="left">Collection</th>
          <th align="left">Thickness</th>
          <th align="left">Finish</th>
          <th align="right">Qty</th>
        </tr>
        ${rows}
      </table>

      <h3 style="color:#112732;margin-bottom:6px">Customer</h3>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
        <tr><td><strong>Company</strong></td><td>${escapeHtml(company || "—")}</td></tr>
        <tr><td><strong>Type</strong></td><td>${escapeHtml(customerType ?? "—")}</td></tr>
        <tr><td><strong>Delivery address</strong></td><td>${escapeHtml(address)}</td></tr>
        <tr><td><strong>Notes</strong></td><td>${escapeHtml(notes || "—")}</td></tr>
      </table>

      <p style="color:#4a5f6b;font-size:13px">
        No payment was taken. The customer has been told the team will
        contact them to confirm quantities, freight and price.
      </p>
    </div>`,
      });
    } catch (mailError) {
      console.error("[order/submit] notification email failed:", mailError);
    }

    return NextResponse.json({ success: true, reference, id: doc._id });
  } catch (error) {
    console.error("[order/submit] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
