"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CircleAlert, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    // Was /customer/grievances (plural) — the real pages live under
    // /customer/grievance (singular).
    name: "My Grievances",
    href: "/customer/grievance",
    icon: CircleAlert,
  },
  {
    name: "Profile",
    href: "/customer/profile",
    icon: User,
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-pacific-dark p-8">
      <h2 className="mb-10 text-2xl font-light">Customer Portal</h2>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-pacific-mid hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-20">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/customer/login" })}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-pacific-mid transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
