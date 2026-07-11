export { auth as middleware } from "@/auth";

// Deliberately excludes /customer/login and bare /customer — those
// two must always be reachable without a session (the login page is
// how you GET a session, and /customer is just a redirect dispatcher,
// see src/app/customer/page.tsx). Matching them here would run
// auth.config.ts's `authorized` callback against them too, which
// would redirect straight back to /customer/login — an infinite
// loop. This matcher plus that callback is the single source of
// truth for protection; the customer layout itself no longer
// redirects on its own.
export const config = {
  matcher: [
    "/customer/dashboard/:path*",
    "/customer/grievance/:path*",
    "/customer/profile/:path*",
  ],
};