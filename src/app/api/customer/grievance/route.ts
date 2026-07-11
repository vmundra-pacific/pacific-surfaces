import { auth } from "@/auth";
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
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `GR-${date}-${suffix}`;
}

// GET /api/customer/grievance — the logged-in customer's own
// grievances, most recent first. Powers /customer/grievance's list.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const grievances = await freshClient.fetch(
    `*[_type == "grievance" && customer._ref == $customerId] | order(createdAt desc) {
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

  return Response.json({ grievances });
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

  const subject = String(body.subject ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = VALID_CATEGORIES.includes(body.category ?? "")
    ? body.category!
    : "Other";
  const priority = VALID_PRIORITIES.includes(body.priority ?? "")
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
