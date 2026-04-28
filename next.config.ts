import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
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
        source: "/collections",
        destination: "/products",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
