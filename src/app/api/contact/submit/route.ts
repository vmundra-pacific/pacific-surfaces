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
  if (!sanityClient) {
    return NextResponse.json(
      {
        error:
          "Contact service is not configured. Please email us at info@pacific-surfaces.com directly.",
      },
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

    const doc = await sanityClient.create({
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

    return NextResponse.json({ success: true, id: doc._id });
  } catch (error) {
    console.error("[contact/submit] failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Submission failed. Please try again or email us directly.",
      },
      { status: 500 }
    );
  }
}
