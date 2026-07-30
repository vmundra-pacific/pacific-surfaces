import type { Metadata } from "next";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { auth } from "@/auth";

/**
 * Keep the entire customer portal out of search results. This layout
 * covers /customer/login, /dashboard, /grievance/* and /profile — none
 * of which are public content, and an indexed login form attracts
 * automated credential-stuffing traffic.
 *
 * This tag — not robots.txt — is what actually removes a page from the
 * index, so it is deliberately the ONLY mechanism used here. See the
 * note in src/app/robots.ts explaining why /customer/ is intentionally
 * NOT disallowed there: blocking the crawler would stop it from ever
 * fetching this directive, freezing any already-indexed portal pages in
 * place instead of dropping them.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Presentational only — protection lives entirely in
// src/middleware.ts (matched routes + auth.config.ts's `authorized`
// callback). This layout also wraps /customer/login, which must
// never redirect on a missing session (that was the earlier
// "too many redirects" bug: redirecting to /customer/login from
// inside a layout that also wraps /customer/login sends you right
// back to where you started). Instead, this only decides whether to
// show the portal chrome (sidebar) — the login page has no session
// yet, so it renders full-width with no sidebar; every other
// /customer/* route is only reachable once middleware has already
// confirmed a session exists.
export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return <div className="min-h-screen bg-pacific-dark text-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-pacific-dark text-white">
      <CustomerSidebar />

      <main className="flex-1 p-8 lg:p-12">
        {children}
      </main>
    </div>
  );
}