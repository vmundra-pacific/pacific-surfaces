/**
 * POST /api/where-to-buy/lead
 *
 * The Where to Buy lead form (marketing, 2026-10-26): no outlet is shown
 * until the visitor leaves their details. Receives the three answers (I am
 * a / interested in / where) with name, mobile, email, company and
 * consent; checks that the mobile was verified by a texted code when
 * Firebase phone sign-in is set up (lib/phone-verification.ts: the browser
 * sends the ID token Firebase gave it for the right code); saves a
 * `dealerLead` document (Studio: Form Submissions →
 * Where to Buy Leads) and emails the sales inbox; and only then answers
 * with the first search, the nearest few outlets and never the directory,
 * with the access cookie that lets /api/where-to-buy/search answer the
 * searches after it, on this visit and later ones
 * (lib/where-to-buy-access.ts).
 *
 * Same guards as /api/contact/submit (rate limit, clamped fields, escaped
 * email), plus a honeypot; Firebase adds its reCAPTCHA to the texting.
 *
 * Env: SANITY_API_WRITE_TOKEN, SMTP_*, COMPANY_EMAIL (or WTB_LEADS_EMAIL
 * for a separate sales inbox), AUTH_SECRET (signs the cookie).
 * LEADS_DRY_RUN=1, outside production only, logs the lead instead of
 * saving or emailing it, for testing.
 */
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { rateLimit, getClientIp, FORM_RATE_LIMIT } from "@/lib/rate-limit";
import { escapeHtml, clampField, FIELD_LIMITS } from "@/lib/escape";
import {
  phoneVerificationEnabled,
  verifiedPhone,
} from "@/lib/phone-verification";
import {
  CONSENT_TEXT,
  EMAIL_RE,
  audienceOf,
  formatKm,
  formatMobile,
  indianMobile,
  interestOf,
  readGeo,
} from "@/lib/where-to-buy";
import { searchDirectory } from "@/lib/where-to-buy-dealers";
import { accessCookie, accessToken } from "@/lib/where-to-buy-access";

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

const inbox = process.env.WTB_LEADS_EMAIL || process.env.COMPANY_EMAIL;
const mailReady = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  inbox
);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const dryRun =
  process.env.LEADS_DRY_RUN === "1" && process.env.NODE_ENV !== "production";

interface Body {
  who?: string;
  interest?: string;
  where?: string;
  geo?: unknown;
  name?: string;
  mobile?: string;
  /** Firebase's ID token for the verified mobile. */
  phoneToken?: string;
  email?: string;
  company?: string;
  consent?: unknown;
  tracking?: string;
  referrer?: string;
  pageUrl?: string;
  /** Honeypot: people never fill it. */
  website?: string;
}

/** A 400 naming the field, so the form can point at it. */
const invalid = (field: string, error: string) =>
  NextResponse.json({ error, field }, { status: 400 });

export async function POST(req: NextRequest) {
  if (!sanityClient && !mailReady && !dryRun) {
    return NextResponse.json(
      { error: "Lead capture is not configured." },
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
      { error: "Too many tries. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = (await req.json()) as Body;
    // A bot filled the hidden field: accept quietly, keep and show nothing.
    if (body.website) return NextResponse.json({ success: true });

    // ---- The three answers
    const who = audienceOf(clampField(body.who, 40));
    if (!who) return invalid("who", "Tell us who you are.");
    const interest = interestOf(clampField(body.interest, 40));
    const geo = readGeo(body.geo);
    const where = geo ? "" : clampField(body.where, 60);
    if (!geo && !where)
      return invalid("where", "Enter your PIN code or use your location.");
    // The first search, as the page will show it.
    const outcome = searchDirectory({
      who: who.value,
      interest: interest?.value ?? null,
      where,
      geo,
      all: false,
      types: null,
      samples: false,
      slabs: false,
    });
    if (outcome.unknown)
      return invalid(
        "where",
        "We don't recognise that. Try a 6-digit PIN code such as 560102, or an area such as HSR Layout."
      );

    // ---- The details
    const name = clampField(body.name, FIELD_LIMITS.name);
    if (name.length < 2) return invalid("name", "Enter your name.");
    const mobile = indianMobile(clampField(body.mobile, FIELD_LIMITS.phone));
    if (!mobile)
      return invalid("mobile", "Enter a 10-digit Indian mobile number.");
    const email = clampField(body.email, FIELD_LIMITS.email);
    if (!EMAIL_RE.test(email))
      return invalid("email", "Enter a valid email address.");
    const company = clampField(body.company, FIELD_LIMITS.shortText);
    if (body.consent !== true)
      return invalid("consent", "Tick the box to agree to be contacted.");

    // ---- The mobile, proven by the texted code.
    const verified = phoneVerificationEnabled();
    if (
      verified &&
      (await verifiedPhone(clampField(body.phoneToken, 4096))) !==
        `+91${mobile}`
    )
      return invalid(
        "otp",
        "Please verify your mobile again: send a new code and enter it."
      );

    // What the visitor is shown first, for the sales team's follow-up.
    const shown = outcome.results.map(
      ({ dealer: d, km }) =>
        `${d.name} (${d.area}${km != null ? `, ${formatKm(km)}` : ""})`
    );
    const location = geo ? `My location (${geo.lat}, ${geo.lng})` : where;
    const matchedAs = geo
      ? undefined
      : outcome.outsidePin
        ? "Outside the Bengaluru directory"
        : outcome.origin?.label;

    const lead = {
      _type: "dealerLead",
      submittedAt: new Date().toISOString(),
      name,
      mobile: formatMobile(mobile),
      mobileVerified: verified,
      email,
      company: company || undefined,
      visitorType: who.label,
      interest: interest?.label,
      location,
      locationMatched: matchedAs,
      geo: geo ? { _type: "geopoint", ...geo } : undefined,
      outletsShown: shown,
      consent: true,
      consentText: CONSENT_TEXT,
      tracking: clampField(body.tracking, FIELD_LIMITS.address) || undefined,
      referrer: clampField(body.referrer, FIELD_LIMITS.address) || undefined,
      pageUrl: clampField(body.pageUrl, FIELD_LIMITS.address) || undefined,
      status: "new",
    };

    // Save first: the document is the record of the lead, so a mail
    // failure (bad SMTP login, quota) must never lose it.
    let leadId: string | null = null;
    if (dryRun) {
      console.info("[where-to-buy/lead] dry run, not saved:", lead);
      leadId = "dry-run";
    } else if (sanityClient) {
      leadId = (await sanityClient.create(lead))._id;
    }

    if (!dryRun && mailReady) {
      try {
        await sendAlert(lead, mobile);
        leadId ??= "emailed";
      } catch (mailError) {
        console.error("[where-to-buy/lead] email failed:", mailError);
        if (!leadId) throw mailError;
      }
    }
    if (!leadId) throw new Error("Lead neither saved nor emailed.");

    const res = NextResponse.json(
      { success: true, outcome },
      { headers: { "Cache-Control": "private, no-store" } }
    );
    const token = accessToken(leadId);
    if (token) res.cookies.set(accessCookie(token));
    return res;
  } catch (error) {
    // Log the real error server-side; never leak internals to clients.
    console.error("[where-to-buy/lead] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

type Lead = {
  name: string;
  mobile: string;
  mobileVerified: boolean;
  email: string;
  company?: string;
  visitorType: string;
  interest?: string;
  location: string;
  locationMatched?: string;
  outletsShown: string[];
  tracking?: string;
  referrer?: string;
  pageUrl?: string;
};

function sendAlert(lead: Lead, mobile: string) {
  // Every interpolated value is visitor-supplied and MUST be escaped (see
  // /api/contact/submit).
  const row = (label: string, value: string) =>
    `<tr><td><strong>${label}</strong></td><td>${value || "-"}</td></tr>`;
  const outlets = lead.outletsShown.length
    ? `<ol>${lead.outletsShown.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ol>`
    : "None near them yet: connect them with the nearest partner.";
  return transporter.sendMail({
    from: `"Pacific Website" <${process.env.SMTP_USER}>`,
    to: inbox,
    replyTo: lead.email,
    // Safe unescaped in the Subject: nodemailer encodes header values and
    // clampField has trimmed the name to one line's worth.
    subject: `🌐 New Where to Buy Lead - ${lead.name.replace(/[\r\n]+/g, " ")}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto">
      <h2 style="color:#1f2937">New Where to Buy Lead</h2>
      <p>Left their details on /where-to-buy before seeing the outlets.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%">
        ${row("Name", escapeHtml(lead.name))}
        ${row(
          "Mobile",
          `<a href="tel:+91${mobile}">${escapeHtml(lead.mobile)}</a> ${
            lead.mobileVerified ? "(verified by OTP)" : "(not verified)"
          }`
        )}
        ${row("Email", escapeHtml(lead.email))}
        ${row("Company", escapeHtml(lead.company))}
        ${row("I am a", escapeHtml(lead.visitorType))}
        ${row("Interested in", escapeHtml(lead.interest))}
        ${row("Location", escapeHtml(lead.location))}
        ${row("Matched as", escapeHtml(lead.locationMatched))}
        ${row("Ad tracking", escapeHtml(lead.tracking))}
        ${row("Page", escapeHtml(lead.pageUrl))}
        ${row("Referrer", escapeHtml(lead.referrer))}
      </table>
      <h3>Outlets shown first</h3>
      ${outlets}
      <p style="color:#6b7280;font-size:12px">Agreed to be contacted: "${escapeHtml(CONSENT_TEXT)}"</p>
    </div>
  `,
  });
}
