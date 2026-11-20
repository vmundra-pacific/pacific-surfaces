import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { clampField, FIELD_LIMITS } from "@/lib/escape";
import { freshClient } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";

const VALID_CATEGORIES = [
  "Product Quality",
  "Delivery",
  "Installation",
  "Service",
  "Billing",
  "Warranty",
  "Other",
];
const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// Human-readable ticket id — e.g. GR-20260707-4F2A. Not a database
// key (Sanity's _id already is one), just what the customer sees on
// screen and can reference in an email/call.
function makeTicketId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  // 8 hex characters from the system's random source: the page looks a
  // ticket up by this id, so two tickets on one day must not share one.
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `GR-${date}-${suffix}`;
}

/**
 * The session is a signed token that lives for 30 days and is not looked
 * up anywhere, so on its own it keeps working after the account is
 * switched off in the Studio (`active: false`). Every read and write here
 * therefore checks the account is still active.
 */
const isActive = (customerId: string) =>
  freshClient.fetch<boolean>(
    `defined(*[_type == "customer" && _id == $id && active == true][0]._id)`,
    { id: customerId }
  );

const PRIVATE = { "Cache-Control": "private, no-store" };

// GET /api/customer/grievance — the logged-in customer's own
// grievances, most recent first. Powers /customer/grievance's list.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let grievances;
  try {
    grievances = await freshClient.fetch(
      `*[_type == "grievance" && customer._ref == $customerId && customer->active == true] | order(createdAt desc) {
      _id,
      ticketId,
      subject,
      category,
      priority,
      status,
      description,
      adminReply,
      createdAt
    }`,
      { customerId: session.user.id }
    );
  } catch (err) {
    console.error("Failed to list grievances:", err);
    return Response.json(
      { error: "Could not load your grievances. Please try again." },
      { status: 502, headers: PRIVATE }
    );
  }

  return Response.json({ grievances }, { headers: PRIVATE });
}

// POST /api/customer/grievance — create a new grievance for the
// logged-in customer. Previously this just echoed the request body
// back without ever writing to Sanity — nothing a customer submitted
// was actually saved.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // A signed-in customer files a handful of tickets, not a stream: each
  // one is a document the support team has to read.
  const limit = rateLimit(`grievance:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: {
    subject?: string;
    category?: string;
    priority?: string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Clamped: these were unbounded, so one request could store megabytes.
  const subject = clampField(body?.subject, FIELD_LIMITS.shortText);
  const description = clampField(body?.description, FIELD_LIMITS.message);
  const category = VALID_CATEGORIES.includes(body?.category ?? "")
    ? body.category!
    : "Other";
  const priority = VALID_PRIORITIES.includes(body?.priority ?? "")
    ? body.priority!
    : "Medium";

  if (!subject || !description) {
    return Response.json(
      { error: "Subject and description are required." },
      { status: 400 }
    );
  }

  const ticketId = makeTicketId();

  try {
    if (!(await isActive(session.user.id))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const created = await writeClient.create({
      _type: "grievance",
      ticketId,
      subject,
      category,
      priority,
      description,
      status: "Open",
      customer: { _type: "reference", _ref: session.user.id },
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true, ticketId, id: created._id });
  } catch (err) {
    // Most likely cause: SANITY_API_WRITE_TOKEN is missing or isn't a
    // write-capable token (see src/sanity/lib/write-client.ts).
    console.error("Failed to create grievance:", err);
    return Response.json(
      { error: "Could not submit your grievance. Please try again." },
      { status: 500 }
    );
  }
}
