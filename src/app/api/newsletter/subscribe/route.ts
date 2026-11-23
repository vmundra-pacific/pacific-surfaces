/**
 * POST /api/newsletter/subscribe
 *
 * Receives a JSON body { firstName, email } from the footer newsletter
 * form and saves the subscriber in the CMS (src/cms/forms.ts).
 *
 * Dedup behaviour, done by the CMS on the lower-cased email: if a
 * subscriber with the same email already exists, no duplicate is made,
 * and one with status "unsubscribed" is set back to "subscribed" so a
 * returning user re-opts-in cleanly. The route answers success either
 * way.
 *
 * Required env vars: CMS_URL and CMS_FORMS_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { cmsFormsConfigured, saveForm } from "@/cms/forms";
import { rateLimit, getClientIp, FORM_RATE_LIMIT } from "@/lib/rate-limit";
import { clampField, FIELD_LIMITS } from "@/lib/escape";

export const runtime = "nodejs";
// Up to two tries of the CMS, 25 seconds each (src/cms/forms.ts).
export const maxDuration = 60;

interface NewsletterBody {
  firstName?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  if (!cmsFormsConfigured()) {
    return NextResponse.json(
      { error: "Newsletter service is not configured." },
      { status: 503 }
    );
  }

  // Throttle before touching the CMS — every accepted request is a
  // database write.
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
    const body = (await req.json()) as NewsletterBody;
    const firstName = clampField(body.firstName, FIELD_LIMITS.name);
    const email = clampField(body.email, FIELD_LIMITS.email).toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // The CMS creates the subscriber, or finds it and sets it back to
    // "subscribed" (outcome "created", "resubscribed" or
    // "already-subscribed"); the visitor sees success in each case.
    const saved = await saveForm("newsletter", {
      submittedAt: new Date().toISOString(),
      firstName: firstName || undefined,
      email,
      status: "subscribed",
    });

    // `id` carries the entry's reference, never the CMS's own id.
    return NextResponse.json({ success: true, id: saved.reference });
  } catch (error) {
    // Log the real error server-side; never leak internals to clients.
    console.error("[newsletter/subscribe] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
