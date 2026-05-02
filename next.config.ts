import type { NextConfig } from "next";

/**
 * Security headers applied to every HTML route.
 *
 *   - Strict-Transport-Security: forces HTTPS for one year + applies to
 *     subdomains. Standard hardening — Vercel already serves HTTPS,
 *     this just commits browsers to it.
 *   - X-Content-Type-Options: blocks MIME sniffing.
 *   - Referrer-Policy: only send the origin (not the full path) when
 *     navigating cross-origin — privacy-preserving without breaking
 *     analytics on first-party links.
 *   - Permissions-Policy: explicitly deny APIs we never use. Lighthouse
 *     and Chrome's Issues panel both flag the absence.
 *   - X-Frame-Options: prevent the site from being framed by third
 *     parties — minor clickjacking defense.
 *
 * Notably absent: Content-Security-Policy. Adding a strict CSP would
 * collide with the inline style attributes we use for the parallax
 * canvas and a few dynamic backgrounds; that's a separate, non-trivial
 * task once nonces are wired through.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  /* Strip dev-time console.log/info/debug calls during production builds.
     Keeps console.error and console.warn so real production issues still
     surface. Lighthouse's `errors-in-console` audit is friendlier without
     stray dev logs leaking into the bundle. */
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },

  /* Emit JS source maps for production bundles. Lighthouse audits
     `valid-source-maps`; the bundles also become debuggable in error
     monitoring (Sentry, Vercel logs). Adds ~10–15% to total deploy
     bytes, but maps are served on-demand by browsers that explicitly
     request them, so end-user payload is unaffected. */
  productionBrowserSourceMaps: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  /* Security headers — applied to every route. See `securityHeaders`
     above for the per-header rationale. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Allow LAN origins to fetch /_next/* dev assets when accessing the
  // dev server from another device (phone, second laptop) on the same
  // Wi-Fi. Required since `next dev -H 0.0.0.0` exposes the server on
  // the network IP. Add any other LAN IPs you might browse from here.
  // No effect on production builds.
  allowedDevOrigins: ["192.168.0.126", "192.168.0.0/24", "localhost"],

  /* ─── /collections/* removed; /products/[category]/[slug] owns it ─
     The collection detail page now lives at
       /products/[category]/[slug]
     as a real route (src/app/(site)/products/[category]/[slug]/page.tsx).
     The old /collections/* route files have been deleted.
     These permanent redirects catch any external links or bookmarks
     that still point at /collections/* and bounce them to the new
     hierarchy. Default category is "products" because we can't
     compute the correct one without fetching the collection at
     redirect time.
  */
  async redirects() {
    return [
      {
        // Old /collections/<slug> links bounce to /products/quartz/<slug>.
        // The first segment is just URL aesthetic — the page only
        // looks up the collection by the second segment, so this works
        // even for non-quartz collections. Most are quartz anyway.
        source: "/collections/:slug",
        destination: "/products/quartz/:slug",
        permanent: true,
      },
      {
        // /collections still bounces into the unified product
        // hierarchy. /products itself is now its own page (the All
        // Products landing) — see src/app/(site)/products/page.tsx —
        // so the previous /products redirect has been removed.
        source: "/collections",
        destination: "/products/quartz",
        permanent: true,
      },
      // The four legacy standalone product landings each had their
      // own bespoke layout (SinksContent, GranitesContent, etc.).
      // Now that every category renders through the unified
      // /products/<slug> Catalogue UI, these old URLs redirect into
      // their new equivalents. The page files still exist on disk
      // so the work isn't lost — the redirect just intercepts before
      // they're served.
      {
        source: "/sinks",
        destination: "/products/integra",
        permanent: true,
      },
      {
        source: "/granites",
        destination: "/products/granites",
        permanent: true,
      },
      {
        source: "/semi-precious",
        destination: "/products/semi-precious",
        permanent: true,
      },
      {
        source: "/ecosurfaces",
        destination: "/products/ecosurfaces",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
