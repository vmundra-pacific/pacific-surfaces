/**
 * POST /api/careers/apply
 *
 * Receives the careers form submission as multipart/form-data:
 *   firstName, lastName, email, phone, address, currentLocation,
 *   age, totalExperience, comments, department,
 *   appliedFor (optional, role title), resume (file),
 *   portfolioUrl (optional, string), portfolio (optional, file),
 *   website (a hidden field people never fill: when it is filled the
 *   route answers success and keeps nothing).
 *
 * If the applied-for role has `requiresPortfolio: true` in the CMS
 * (job openings — e.g. Senior Graphic Designer), the candidate
 * must supply at least one of portfolioUrl / portfolio, checked here
 * server-side (not just in the client form) since this is a public
 * endpoint.
 *
 * Side effects, in order:
 *   1. Send the form fields, the resume and the portfolio file (if one
 *      was attached) to the CMS's careers door (src/cms/forms.ts),
 *      which keeps the files in its private file store and saves the
 *      application. The CMS answers "duplicate" for the same
 *      application sent again; nothing new is kept and no email sent.
 *   2. Send an email notification via the same SMTP transport that
 *      powers the Contact form (src/lib/mail.ts), to:
 *        - the role-specific `applyEmail` if the candidate applied
 *          to a specific role and that role has one set, OR
 *        - CAREERS_INBOX_EMAIL if set, OR
 *        - muthusamyg@pacific-surfaces.com as the default inbox.
 *      The email names the files and links to the application in the
 *      CMS editor; the files are opened there.
 *      Email is best-effort — if SMTP isn't configured or the send
 *      fails, the application is still saved in the CMS. We log the
 *      failure but don't fail the whole request.
 *
 * Required environment variables:
 *   - CMS_URL, CMS_FORMS_SECRET
 *   - SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS  (already set in
 *                              Vercel — same creds the Contact form uses)
 *   - CAREERS_INBOX_EMAIL     (optional override — defaults to
 *                              muthusamyg@pacific-surfaces.com if unset)
 */

import * as cms from "@/cms/read";
import { NextRequest, NextResponse, after } from "next/server";
import {
  cmsFormsConfigured,
  cmsJobApplicationUrl,
  saveJobApplication,
} from "@/cms/forms";
import { transporter } from "@/lib/mail";
import { rateLimit, getClientIp, FORM_RATE_LIMIT } from "@/lib/rate-limit";

// `nodejs` runtime (not edge) — edge has tighter file/body limits
// that can choke on a 5MB resume PDF.
export const runtime = "nodejs";

const MAX_RESUME_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// Portfolios run heavier than resumes (image-led PDFs, decks), so this
// gets a larger cap and a broader set of accepted types.
const MAX_PORTFOLIO_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_PORTFOLIO_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint", // .ppt
  "image/jpeg",
  "image/png",
]);

export async function POST(req: NextRequest) {
  if (!cmsFormsConfigured()) {
    return NextResponse.json(
      {
        error:
          "Application service is not configured. Please email careers@pacific-surfaces.com directly.",
      },
      { status: 503 }
    );
  }

  // Throttle FIRST — before `req.formData()` buffers the body. This is
  // the most expensive public endpoint: each accepted request sends
  // up to 28 MB of files on to the CMS, which stores them and saves the
  // application, and then an email is sent.
  const limit = rateLimit(
    `form:${getClientIp(req)}`,
    FORM_RATE_LIMIT.limit,
    FORM_RATE_LIMIT.windowMs
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many applications submitted. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  try {
    const formData = await req.formData();
    // A bot filled the hidden field: accept quietly, keep nothing.
    if ((formData.get("website") || "").toString()) {
      return NextResponse.json({ success: true });
    }
    const firstName = (formData.get("firstName") || "").toString().trim();
    const lastName = (formData.get("lastName") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const address = (formData.get("address") || "").toString().trim();
    const currentLocation = (formData.get("currentLocation") || "")
      .toString()
      .trim();
    const age = (formData.get("age") || "").toString().trim();
    const totalExperience = (formData.get("totalExperience") || "")
      .toString()
      .trim();
    const comments = (formData.get("comments") || "").toString().trim();
    const department = (formData.get("department") || "").toString().trim();
    const appliedFor = (formData.get("appliedFor") || "").toString().trim();
    const resume = formData.get("resume");
    const portfolioUrl = (formData.get("portfolioUrl") || "").toString().trim();
    const portfolioFile = formData.get("portfolio");
    const portfolio =
      portfolioFile instanceof File && portfolioFile.size > 0
        ? portfolioFile
        : null;

    // Field-level validation. Surface a specific error for each
    // missing piece so the client can display it usefully.
    if (!firstName || !lastName) {
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
    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json(
        { error: "Please attach your resume." },
        { status: 400 }
      );
    }
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { error: "Resume must be under 8 MB." },
        { status: 400 }
      );
    }
    if (resume.type && !ALLOWED_RESUME_TYPES.has(resume.type)) {
      return NextResponse.json(
        { error: "Resume must be a PDF, DOC, or DOCX file." },
        { status: 400 }
      );
    }
    if (portfolio) {
      if (portfolio.size > MAX_PORTFOLIO_BYTES) {
        return NextResponse.json(
          { error: "Portfolio file must be under 20 MB." },
          { status: 400 }
        );
      }
      if (portfolio.type && !ALLOWED_PORTFOLIO_TYPES.has(portfolio.type)) {
        return NextResponse.json(
          { error: "Portfolio must be a PDF, PPT/PPTX, JPG, or PNG file." },
          { status: 400 }
        );
      }
    }
    if (portfolioUrl && !/^https?:\/\/.+/i.test(portfolioUrl)) {
      return NextResponse.json(
        {
          error:
            "Portfolio link must be a valid URL starting with http:// or https://.",
        },
        { status: 400 }
      );
    }

    // Look up the applied-for role once — used both to enforce a
    // portfolio requirement server-side (the client already does this,
    // but this is a public endpoint so it can't be trusted alone) and
    // to route the notification email to a role-specific inbox.
    let roleApplyEmail: string | undefined;
    let roleRequiresPortfolio = false;
    if (appliedFor) {
      try {
        const role = await cms.jobApply<{
          applyEmail?: string | null;
          requiresPortfolio?: boolean | null;
        } | null>(appliedFor);
        roleApplyEmail = role?.applyEmail || undefined;
        roleRequiresPortfolio = !!role?.requiresPortfolio;
      } catch {
        // Fall through — treat as not requiring a portfolio rather than
        // blocking a legitimate submission over a lookup failure.
      }
    }
    if (roleRequiresPortfolio && !portfolioUrl && !portfolio) {
      return NextResponse.json(
        {
          error:
            "This role requires a portfolio — add a link or upload a file.",
        },
        { status: 400 }
      );
    }

    // 1. Save the application with its files in the CMS.
    const submittedAt = new Date().toISOString();
    const saved = await saveJobApplication(
      {
        submittedAt,
        firstName,
        lastName,
        email,
        phone,
        address,
        currentLocation: currentLocation || undefined,
        age: age || undefined,
        totalExperience: totalExperience || undefined,
        comments: comments || undefined,
        department,
        appliedFor: appliedFor || undefined,
        portfolioUrl: portfolioUrl || undefined,
        status: "new",
      },
      {
        name: resume.name,
        type: resume.type,
        bytes: new Uint8Array(await resume.arrayBuffer()),
      },
      portfolio
        ? {
            name: portfolio.name,
            type: portfolio.type,
            bytes: new Uint8Array(await portfolio.arrayBuffer()),
          }
        : null
    );

    // The same application sent again: already saved and emailed.
    if (saved.outcome === "duplicate") {
      return NextResponse.json({ success: true });
    }

    // 2. Email notification — best-effort, doesn't fail the
    //    request if it errors. Wrapped in `after()` so the work
    //    survives the response being sent — a bare fire-and-forget
    //    promise gets killed when the serverless function freezes
    //    on Vercel.
    after(() =>
      sendNotificationEmail({
        entryUrl: cmsJobApplicationUrl(saved.id),
        resumeName: resume.name,
        portfolioName: portfolio ? portfolio.name : null,
        portfolioUrl,
        roleApplyEmail,
        firstName,
        lastName,
        email,
        phone,
        address,
        currentLocation,
        age,
        totalExperience,
        comments,
        department,
        appliedFor,
      }).catch((err) => {
        console.error("[careers/apply] email send failed:", err);
      })
    );

    // No id in the answer: the CMS's id stays on the server.
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the real error server-side; never leak internals (stack
    // details, env hints, CMS errors) to the client.
    console.error("[careers/apply] submission failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ *
 * Email helper                                                        *
 * ------------------------------------------------------------------ */

interface NotificationParams {
  /** The application in the CMS editor; only the owner can open it. */
  entryUrl: string | null;
  resumeName: string;
  portfolioName: string | null;
  portfolioUrl: string;
  roleApplyEmail: string | undefined;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  currentLocation: string;
  age: string;
  totalExperience: string;
  comments: string;
  department: string;
  appliedFor: string;
}

async function sendNotificationEmail({
  entryUrl,
  resumeName,
  portfolioName,
  portfolioUrl,
  roleApplyEmail,
  firstName,
  lastName,
  email,
  phone,
  address,
  currentLocation,
  age,
  totalExperience,
  comments,
  department,
  appliedFor,
}: NotificationParams) {
  // Falls back to Muthusamy's inbox directly so this works with zero
  // extra Vercel config. Set CAREERS_INBOX_EMAIL later to redirect
  // notifications elsewhere without touching code. roleApplyEmail (the
  // role's own override, looked up once in the POST handler) wins over
  // both when set.
  const globalInbox =
    process.env.CAREERS_INBOX_EMAIL || "muthusamyg@pacific-surfaces.com";
  const toEmail = roleApplyEmail || globalInbox;

  const fullName = `${firstName} ${lastName}`.trim();
  const subject = appliedFor
    ? `New career application — ${fullName} for ${appliedFor}`
    : `New career application — ${fullName}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #112732;">
      <h2 style="margin: 0 0 16px 0; font-weight: 400; font-size: 20px;">New career application</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #6b7785; width: 140px;">Name</td><td style="padding: 6px 0;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7785;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeAttr(email)}" style="color: #112732;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #6b7785;">Phone</td><td style="padding: 6px 0;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding: 6px 0; color: #6b7785;">Address</td><td style="padding: 6px 0;">${escapeHtml(address)}</td></tr>
        ${currentLocation ? `<tr><td style="padding: 6px 0; color: #6b7785;">Current Location</td><td style="padding: 6px 0;">${escapeHtml(currentLocation)}</td></tr>` : ""}
        ${age ? `<tr><td style="padding: 6px 0; color: #6b7785;">Age</td><td style="padding: 6px 0;">${escapeHtml(age)}</td></tr>` : ""}
        ${totalExperience ? `<tr><td style="padding: 6px 0; color: #6b7785;">Total Experience</td><td style="padding: 6px 0;">${escapeHtml(totalExperience)}</td></tr>` : ""}
        <tr><td style="padding: 6px 0; color: #6b7785;">Department</td><td style="padding: 6px 0;">${escapeHtml(department || "—")}</td></tr>
        ${appliedFor ? `<tr><td style="padding: 6px 0; color: #6b7785;">Applied for</td><td style="padding: 6px 0;"><strong>${escapeHtml(appliedFor)}</strong></td></tr>` : ""}
      </table>
      ${
        comments
          ? `<div style="margin-top: 20px; padding: 12px 16px; background: #f6f8fa; border-radius: 8px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #6b7785; text-transform: uppercase; letter-spacing: 0.08em;">Comments / Remarks</p>
              <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${escapeHtml(comments)}</p>
            </div>`
          : ""
      }
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e8ec;">
        <p style="margin: 0 0 8px 0; font-size: 14px;">
          <strong>Resume:</strong>
          ${escapeHtml(resumeName || "attached")}
        </p>
        ${
          portfolioUrl
            ? `<p style="margin: 0 0 8px 0; font-size: 14px;">
                <strong>Portfolio Link:</strong>
                <a href="${escapeAttr(portfolioUrl)}" style="color: #112732;">${escapeHtml(portfolioUrl)}</a>
              </p>`
            : ""
        }
        ${
          portfolioName !== null
            ? `<p style="margin: 0 0 8px 0; font-size: 14px;">
                <strong>Portfolio File:</strong>
                ${escapeHtml(portfolioName || "attached")}
              </p>`
            : ""
        }
        ${
          entryUrl
            ? `<p style="margin: 0; font-size: 14px;">
          <a href="${escapeAttr(entryUrl)}" style="color: #112732;">Open the application and its files in the CMS →</a>
        </p>`
            : ""
        }
      </div>
    </div>
  `;

  const text = [
    `New career application`,
    ``,
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    currentLocation ? `Current Location: ${currentLocation}` : "",
    age ? `Age: ${age}` : "",
    totalExperience ? `Total Experience: ${totalExperience}` : "",
    `Department: ${department || "—"}`,
    appliedFor ? `Applied for: ${appliedFor}` : "",
    comments ? `\nComments:\n${comments}` : "",
    ``,
    `Resume: ${resumeName || "attached"}`,
    portfolioUrl ? `Portfolio Link: ${portfolioUrl}` : "",
    portfolioName !== null
      ? `Portfolio File: ${portfolioName || "attached"}`
      : "",
    entryUrl ? `In the CMS: ${entryUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: `"Pacific Surfaces Careers" <${process.env.SMTP_USER}>`,
    to: toEmail,
    replyTo: email, // hitting Reply emails the candidate directly
    subject,
    html,
    text,
  });
}

/**
 * Tiny HTML escapers for safe email body interpolation. We treat
 * candidate input as untrusted.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
