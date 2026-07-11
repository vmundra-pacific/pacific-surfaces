import { auth } from "@/auth";
import { freshClient } from "@/sanity/lib/client";

interface CustomerProfile {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt?: string;
}

const FIELDS: Array<{ key: keyof CustomerProfile; label: string }> = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "phone", label: "Phone" },
];

export default async function ProfilePage() {
  const session = await auth();

  const customer: CustomerProfile | null = session?.user?.id
    ? await freshClient.fetch(
        `*[_type == "customer" && _id == $id][0]{ name, email, company, phone, createdAt }`,
        { id: session.user.id }
      )
    : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-light">Profile</h1>
      <p className="mt-3 text-pacific-mid">
        Your account details on file with Pacific Surfaces. To update any of
        these, contact your account manager or{" "}
        <a href="mailto:bindu@thepacific.group" className="underline hover:text-white">
          bindu@thepacific.group
        </a>
        .
      </p>

      <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between px-8 py-6">
            <span className="text-sm tracking-[0.15em] uppercase text-pacific-mid">
              {label}
            </span>
            <span className="text-white">
              {customer?.[key] || "—"}
            </span>
          </div>
        ))}
      </div>

      {customer?.createdAt && (
        <p className="mt-6 text-xs text-pacific-mid">
          Customer since {new Date(customer.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
