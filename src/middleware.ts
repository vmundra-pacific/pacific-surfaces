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
// DELIBERATELY NOT MATCHED: /studio.
//
// It's tempting to add "/studio/:path*" here to stop the Studio bundle
// and schema being served to anonymous visitors. Don't. The `authorized`
// callback in auth.config.ts checks for a *customer-portal* session, and
// content editors are staff who have no customer account — gating Studio
// on it would redirect every editor to /customer/login and lock them out
// of the CMS.
//
// Sanity's own login already gates every read and write performed inside
// Studio, and src/app/robots.ts disallows /studio for crawlers. What
// remains exposed is the schema shape (field names only, no data), which
// is reconnaissance value rather than a vulnerability. If that ever needs
// closing, the correct fix is a Sanity-role check inside
// src/app/studio/layout.tsx — not this matcher.
export const config = {
  matcher: [
    "/customer/dashboard/:path*",
    "/customer/grievance/:path*",
    "/customer/profile/:path*",
  ],
};