import Link from "next/link";
import { auth } from "@/auth";
import { freshClient } from "@/sanity/lib/client";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface Grievance {
  _id: string;
  ticketId: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  createdAt: string;
}

// Pacific palette only — no amber/emerald/warm tones (brand
// guideline), so status is distinguished by weight/opacity rather
// than a traffic-light color scheme.
const STATUS_STYLES: Record<string, string> = {
  Open: "bg-white/15 text-white",
  "In Progress": "bg-pacific-light/20 text-pacific-light",
  "Waiting for Customer": "bg-pacific-light/20 text-pacific-light",
  Resolved: "bg-pacific-mid/20 text-pacific-mid",
  Closed: "bg-pacific-mid/10 text-pacific-mid/70",
};

export default async function GrievancesPage() {
  const session = await auth();

  // Layout guarantees a session by the time this renders (middleware
  // blocks unauthenticated requests before they ever reach here), but
  // guard anyway rather than assume.
  const grievances: Grievance[] = session?.user?.id
    ? await freshClient.fetch(
        `*[_type == "grievance" && customer._ref == $customerId] | order(createdAt desc) {
          _id, ticketId, subject, category, priority, status, createdAt
        }`,
        { customerId: session.user.id }
      )
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-light">My Grievances</h1>

        {/* Was /customer/grievances/new (plural) — the real page
            lives at /customer/grievance/new (singular). */}
        <MagneticButton href="/customer/grievance/new" variant="outline-dark">
          Raise Grievance
        </MagneticButton>
      </div>

      {grievances.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-20 text-center">
          <h2 className="text-2xl font-light">No grievances yet</h2>
          <p className="mt-4 text-pacific-mid">
            Raise your first support request.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {grievances.map((g) => (
            <Link
              key={g._id}
              href={`/customer/grievance/${g.ticketId}`}
              className="block rounded-2xl border border-white/10 bg-white/[.02] p-6 transition hover:border-white/25"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs tracking-[0.2em] uppercase text-pacific-mid">
                    {g.ticketId} · {g.category ?? "Other"}
                  </div>
                  <div className="mt-1 truncate text-lg font-light">
                    {g.subject}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_STYLES[g.status] ?? "bg-white/10 text-white"
                  }`}
                >
                  {g.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
