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

  /* productionBrowserSourceMaps was previously enabled but caused a
     measurable Performance regression (96 → 65) — Next.js 15 inlines
     extra `//# sourceMappingURL=` references and bumps bundle parse
     cost even when the .map files load on-demand. Lighthouse's
     `valid-source-maps` audit doesn't FAIL when maps are absent, only
     when the maps that exist are malformed, so leaving this off is
     net-positive. Re-enable only if production debugging needs it. */

  images: {
    // Vercel's /_next/image optimizer is re-enabled now that the
    // project is on the Pro plan (5,000 free transformations + PAYG
    // beyond that). The optimizer wraps `cdn.sanity.io` URLs through
    // Vercel's edge cache, serving AVIF/WebP at the responsive size
    // each viewport needs — noticeably faster than letting browsers
    // hit Sanity's CDN directly, especially for local /public/*
    // assets like the team photos which are unoptimized PNGs at
    // source. To bypass the optimizer on a specific <Image>, set
    // `unoptimized` per-component (e.g. the homepage carousel did
    // this historically; that prop is now redundant but harmless).
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
        // Vanity used to live as a sub-collection at
        // /products/centrepiece-couture/vanity but is now its own
        // top-level category at /products/vanity. Old bookmarks and
        // any external links still pointing at the deep URL bounce
        // to the new landing.
        source: "/products/centrepiece-couture/vanity",
        destination: "/products/vanity",
        permanent: true,
      },
      {
        // Exotic collections used to be mistakenly routed under
        // /products/semi-precious/* because the homepage carousel
        // lumped both "semi" and "exotic" name prefixes into the
        // semi-precious category. Anything still pointing at the old
        // URL shape rebounces under the correct Exotic top-level.
        source: "/products/semi-precious/:slug(exotic.*)",
        destination: "/products/exotic/:slug",
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
      {
        // Natural Stone Finishes was renamed to Façades and Finishes.
        // Catch the old slug + any deeper sub-paths and bounce to the
        // new URL space so external links and indexed pages don't 404.
        source: "/products/natural-stone-finishes",
        destination: "/products/facades-and-finishes",
        permanent: true,
      },
      {
        source: "/products/natural-stone-finishes/:path*",
        destination: "/products/facades-and-finishes/:path*",
        permanent: true,
      },
      {
        // Legacy Wix URL. The old /category/all-products listing maps
        // to the new unified All Products landing at /products.
        source: "/category/all-products",
        destination: "/products",
        permanent: true,
      },
      {
        // Legacy Wix product detail URLs. Wix used /product-page/<slug>
        // for every product PDP; Google still has thousands of these
        // indexed under www.pacific-surfaces.com/product-page/<slug>
        // and clicking a search result would land on the not-found
        // handler and bounce to the homepage. The new Next.js URL
        // for the same product is /products/<slug>, so we map them
        // 1:1 here. The dispatcher at /products/[slug]/page.tsx
        // already resolves any slug to either a category catalogue
        // or a product detail page, so the redirected URL just works.
        source: "/product-page/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
