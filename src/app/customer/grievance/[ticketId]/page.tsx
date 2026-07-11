import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { freshClient } from "@/sanity/lib/client";

interface Grievance {
  _id: string;
  ticketId: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  description?: string;
  adminReply?: string;
  createdAt: string;
}

export default async function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await auth();

  const grievance: Grievance | null = session?.user?.id
    ? await freshClient.fetch(
        // Scoped to the logged-in customer's own ref — so one
        // customer can never view another's ticket by guessing/
        // sharing a ticketId.
        `*[
          _type == "grievance" &&
          ticketId == $ticketId &&
          customer._ref == $customerId
        ][0]{
          _id, ticketId, subject, category, priority, status, description, adminReply, createdAt
        }`,
        { ticketId, customerId: session.user.id }
      )
    : null;

  if (!grievance) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/customer/grievance"
        className="text-xs tracking-[0.2em] uppercase text-pacific-mid hover:text-white transition-colors"
      >
        ← My Grievances
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-pacific-mid">
            {grievance.ticketId} · {grievance.category ?? "Other"} ·{" "}
            {grievance.priority ?? "Medium"} priority
          </div>
          <h1 className="mt-2 text-3xl font-light">{grievance.subject}</h1>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          {grievance.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-pacific-mid">
        Submitted {new Date(grievance.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.02] p-8">
        <div className="text-xs tracking-[0.2em] uppercase text-pacific-mid mb-3">
          Description
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">
          {grievance.description || "—"}
        </p>
      </div>

      {grievance.adminReply && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-8">
          <div className="text-xs tracking-[0.2em] uppercase text-pacific-mid mb-3">
            Response from Pacific Surfaces
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">
            {grievance.adminReply}
          </p>
        </div>
      )}
    </div>
  );
}
