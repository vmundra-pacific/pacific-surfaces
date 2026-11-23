import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { customerGrievance, type Grievance } from "@/cms/customers";

// This page reads the CMS: up to two tries of each read, 25 seconds each
// (src/cms/forms.ts).
export const maxDuration = 60;

export default async function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const session = await auth();

  const grievance: Grievance | null = session?.user?.id
    ? // Scoped by the CMS to the logged-in customer's own tickets — so
      // one customer can never view another's ticket by guessing/
      // sharing a ticketId.
      await customerGrievance(session.user.id, ticketId)
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
