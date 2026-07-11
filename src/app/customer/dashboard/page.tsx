import { auth } from "@/auth";
import { freshClient } from "@/sanity/lib/client";

const CLOSED_STATUSES = new Set(["Resolved", "Closed"]);

export default async function Dashboard() {
  const session = await auth();

  const statuses: string[] = session?.user?.id
    ? await freshClient.fetch(
        `*[_type == "grievance" && customer._ref == $customerId].status`,
        { customerId: session.user.id }
      )
    : [];

  const total = statuses.length;
  const closed = statuses.filter((s) => CLOSED_STATUSES.has(s)).length;
  const open = total - closed;

  const stats = [
    { label: "Total Tickets", value: total },
    { label: "Open", value: open },
    { label: "Closed", value: closed },
  ];

  return (
    <div>
      <h1 className="text-5xl font-light">Welcome,</h1>
      <p className="mt-3 text-pacific-mid">{session?.user?.name}</p>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/10 p-8"
          >
            <p className="text-pacific-mid">{stat.label}</p>
            <h2 className="mt-4 text-5xl font-light">{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
