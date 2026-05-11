/**
 * POST /api/newsletter/subscribe
 *
 * Receives a JSON body { firstName, email } from the footer newsletter
 * form and persists as a `newsletterSubscriber` doc in Sanity. Editors
 * triage in Studio under "Form Submissions → Newsletter Subscribers".
 *
 * Dedup behaviour: if a doc with the same email already exists, the
 * route returns success without creating a duplicate. If that existing
 * doc has status="unsubscribed", we flip it back to "subscribed" so a
 * returning user re-opts-in cleanly.
 *
 * Required env vars match /api/contact/submit.
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

interface NewsletterBody {
  firstName?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  if (!sanityClient) {
    return NextResponse.json(
      { error: "Newsletter service is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as NewsletterBody;
    const firstName = (body.firstName ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Dedup — look for an existing subscriber with this email.
    const existing = await sanityClient.fetch<{
      _id: string;
      status?: string;
    } | null>(
      `*[_type == "newsletterSubscriber" && lower(email) == $email][0] { _id, status }`,
      { email }
    );

    if (existing) {
      // Flip an unsubscribed user back to subscribed; otherwise no-op.
      if (existing.status === "unsubscribed") {
        await sanityClient
          .patch(existing._id)
          .set({ status: "subscribed" })
          .commit();
      }
      return NextResponse.json({ success: true, id: existing._id });
    }

    const doc = await sanityClient.create({
      _type: "newsletterSubscriber",
      submittedAt: new Date().toISOString(),
      firstName: firstName || undefined,
      email,
      status: "subscribed",
    });

    return NextResponse.json({ success: true, id: doc._id });
  } catch (error) {
    console.error("[newsletter/subscribe] failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Subscription failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
