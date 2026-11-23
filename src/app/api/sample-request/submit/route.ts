/**
 * POST /api/sample-request/submit
 *
 * Receives a JSON body from the OrderSampleModal (used in two modes
 * by ProductDetail and surrounding components):
 *   - mode "sample"   → physical sample request (address required)
 *   - mode "enquire"  → product enquiry (message required)
 *
 * Saves a sample request in the CMS (src/cms/forms.ts), where the
 * owner reads it. No email is sent.
 *
 * Required env vars: CMS_URL and CMS_FORMS_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { cmsFormsConfigured, saveForm } from "@/cms/forms";
import { rateLimit, getClientIp, FORM_RATE_LIMIT } from "@/lib/rate-limit";
import { clampField, FIELD_LIMITS } from "@/lib/escape";

export const runtime = "nodejs";

interface SampleBody {
  mode?: "sample" | "enquire";
  /** Chooser answer from the sample flow. Absent on enquiries. */
  userType?: "homeowner" | "professional";
  productName?: string;
  productCategory?: string;
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  address?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  if (!cmsFormsConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sample-request service is not configured. Please email us at info@pacific-surfaces.com directly.",
      },
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
    const body = (await req.json()) as SampleBody;
    const mode: "sample" | "enquire" =
      body.mode === "enquire" ? "enquire" : "sample";

    // Whitelist rather than clamp — anything other than the two
    // known values is dropped, so a hand-rolled POST can't write
    // arbitrary text into a field editors read as a category.
    const userType =
      body.userType === "homeowner" || body.userType === "professional"
        ? body.userType
        : undefined;

    const productName = clampField(body.productName, FIELD_LIMITS.shortText);
    const productCategory = clampField(
      body.productCategory,
      FIELD_LIMITS.shortText
    );
    const name = clampField(body.name, FIELD_LIMITS.name);
    const email = clampField(body.email, FIELD_LIMITS.email);
    const phone = clampField(body.phone, FIELD_LIMITS.phone);
    const projectType = clampField(body.projectType, FIELD_LIMITS.shortText);
    const address = clampField(body.address, FIELD_LIMITS.address);
    const notes = clampField(body.notes, FIELD_LIMITS.message);

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
    if (mode === "sample" && !address) {
      return NextResponse.json(
        { error: "Shipping address is required for sample requests." },
        { status: 400 }
      );
    }
    if (mode === "enquire" && !notes) {
      return NextResponse.json(
        { error: "Please include a question or message." },
        { status: 400 }
      );
    }

    const saved = await saveForm("sample-request", {
      submittedAt: new Date().toISOString(),
      mode,
      userType,
      productName: productName || undefined,
      productCategory: productCategory || undefined,
      name,
      email,
      phone: phone || undefined,
      projectType: projectType || undefined,
      address: address || undefined,
      notes: notes || undefined,
      status: "new",
    });

    // `id` carries the entry's reference, never the CMS's own id.
    return NextResponse.json({ success: true, id: saved.reference });
  } catch (error) {
    // Log the real error server-side; never leak internals to clients.
    console.error("[sample-request/submit] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
