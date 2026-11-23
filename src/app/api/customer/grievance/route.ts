import { auth } from "@/auth";
import { saveForm } from "@/cms/forms";
import { customerGrievances } from "@/cms/customers";
import { clampField, FIELD_LIMITS } from "@/lib/escape";

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
// key (the CMS has its own), just what the customer sees on screen
// and can reference in an email/call.
function makeTicketId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `GR-${date}-${suffix}`;
}

// GET /api/customer/grievance — the logged-in customer's own
// grievances, most recent first, read through the CMS's customer door.
// Powers nothing today (the list page reads the CMS itself). The CMS's
// own ids are left out of the answer.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const grievances = (await customerGrievances(session.user.id)).map((g) => ({
    ticketId: g.ticketId,
    subject: g.subject,
    category: g.category,
    priority: g.priority,
    status: g.status,
    description: g.description,
    adminReply: g.adminReply,
    createdAt: g.createdAt,
  }));

  return Response.json({ grievances });
}

// POST /api/customer/grievance — create a new grievance for the
// logged-in customer, saved in the CMS (src/cms/forms.ts).
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

  // Cut to the lengths the CMS keeps, so a long complaint loses its tail
  // instead of failing every time.
  const subject = clampField(body.subject, FIELD_LIMITS.shortText);
  const description = clampField(body.description, FIELD_LIMITS.message);
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
    const saved = await saveForm(
      "grievance",
      {
        ticketId,
        subject,
        category,
        priority,
        description,
        status: "Open",
        createdAt: new Date().toISOString(),
      },
      session.user.id
    );

    // `id` carries the entry's reference, never the CMS's own id.
    return Response.json({ success: true, ticketId, id: saved.reference });
  } catch (err) {
    // Most likely cause: CMS_URL or CMS_FORMS_SECRET is missing, or the
    // CMS did not answer (src/cms/forms.ts).
    console.error("Failed to create grievance:", err);
    return Response.json(
      { error: "Could not submit your grievance. Please try again." },
      { status: 500 }
    );
  }
}
