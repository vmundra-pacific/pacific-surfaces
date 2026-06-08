import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import GlobalDustMount from "@/components/global/GlobalDustMount";

/**
 * Google Analytics 4 measurement ID. Points at the existing
 * "Pacific Group - Website" property (which thepacific.group also
 * sends to — that domain 301-redirects here, so the stream covers
 * both surfaces). Hardcoded rather than env-var'd because it's a
 * stable, public token; rotating it would require a redeploy
 * either way.
 */
const GA_MEASUREMENT_ID = "G-7PXLT12ML9";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// `viewportFit: "cover"` lets the page render edge-to-edge on
// iPhone in landscape — without it iOS Safari leaves black bars
// where the notch is. Components that touch the screen edge (the
// header, the slab dock, hero scrim) read env(safe-area-inset-*)
// in CSS to keep their content clear of the notch itself.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  // Plain string instead of { template, default } — the previous
  // template was double-suffixing every page ("Vanity — Pacific
  // Surfaces — Pacific Surfaces"). With a string layout title and
  // each page setting its own `title`, the page's title fully
  // replaces it on that route — Next.js doesn't append anything.
  // Pages that don't set their own title fall back to this string.
  title: "Pacific Surfaces — Premium Quartz & Granite Surfaces",
  description:
    "Premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, flooring, and wall cladding. Crafted for beauty, engineered for durability.",
  metadataBase: new URL("https://pacific-surfaces.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Pacific Surfaces",
  },
  // Google Search Console ownership verification. Emits
  // <meta name="google-site-verification" content="..."> into the
  // root layout's <head>. Required for GSC to confirm we own
  // pacific-surfaces.com so we can submit sitemaps, request
  // indexing, and view search performance / coverage data.
  verification: {
    google: "H28JjFgJyLzNlXvq40-cdWNqnbA5w512rxUsvekw2ok",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Resource hints. Tell the browser to start DNS + TLS
          handshakes to the asset CDNs *before* it sees the first
          <img src=...sanity.io...> in the body. Saves 100-300ms on
          first image fetch.
            - cdn.sanity.io — every product image, every blog photo,
              every project poster comes from here
            - fonts.googleapis.com / fonts.gstatic.com — Inter is
              loaded via next/font, which already injects the right
              hints, but we add them explicitly as a belt-and-braces
              safety net
        */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      {/*
        suppressHydrationWarning is on <html> and <body> because
        browser extensions (Grammarly, Dark Reader, ad-blockers,
        the smooth-scroll layer, etc.) routinely inject inline
        styles or attributes onto these elements BEFORE React hydrates.
        The mismatch is harmless — React still patches up children —
        but it spams the dev console with red errors. This flag tells
        React to ignore mismatches on this single element only;
        children still hydrate strictly.
      */}
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased`}
      >
        <GlobalDustMount />
        {/*
          Organization JSON-LD — gives Google enough metadata to
          show the brand panel in search results (logo, social
          links, contact). One emit at the layout level so it
          covers every page on the site. BreadcrumbList is added
          per-nested-route where the path is meaningful.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://pacific-surfaces.com/#organization",
              name: "Pacific Surfaces",
              alternateName: "Pacific Surfaces (Pacific Group)",
              url: "https://pacific-surfaces.com",
              logo: "https://pacific-surfaces.com/logos/monogram-light.png",
              description:
                "Premium quartz, granite, and semi-precious stone surfaces for kitchens, bathrooms, and architectural applications. Engineered in India, shipped to 45+ countries.",
              sameAs: [
                "https://www.instagram.com/pacific.surfaces/",
                "https://www.linkedin.com/company/pacific-surfaces/",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  email: "info@thepacific.group",
                  telephone: "+91-9894033566",
                  areaServed: "Worldwide",
                  availableLanguage: ["en"],
                },
              ],
            }),
          }}
        />
        {/*
          LocalBusiness JSON-LD — child type HomeAndConstructionBusiness
          inherits all Organization fields and adds business-specific
          ones (priceRange, geo, address, opening hours). Eligible for
          the Google local pack and "stone fabricator near me" queries.

          NOTE: address is country-only for now. Once the showroom address
          is canonicalized in Sanity siteSettings, swap the hardcoded
          values out for a server-fetched version. priceRange "$$$"
          signals premium tier without exposing actual pricing.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HomeAndConstructionBusiness",
              "@id": "https://pacific-surfaces.com/#localbusiness",
              name: "Pacific Surfaces",
              url: "https://pacific-surfaces.com",
              logo: "https://pacific-surfaces.com/logos/monogram-light.png",
              image:
                "https://pacific-surfaces.com/logos/monogram-light.png",
              telephone: "+91-9894033566",
              email: "info@thepacific.group",
              priceRange: "$$$",
              description:
                "Premium quartz, granite, and semi-precious stone surfaces for architects, designers, and homeowners.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Country", name: "United Arab Emirates" },
                { "@type": "Country", name: "United States" },
                { "@type": "Country", name: "United Kingdom" },
              ],
              sameAs: [
                "https://www.instagram.com/pacific.surfaces/",
                "https://www.linkedin.com/company/pacific-surfaces/",
              ],
            }),
          }}
        />
        {/*
          WebSite + SearchAction — eligible for the sitelinks search box
          that Google shows under your brand SERP. The SearchAction
          target points to /search?q={...}; that route forwards to the
          products grid filtered by the term. If you later build a
          dedicated search page, just keep the URL pattern stable.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://pacific-surfaces.com/#website",
              url: "https://pacific-surfaces.com",
              name: "Pacific Surfaces",
              publisher: {
                "@id": "https://pacific-surfaces.com/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://pacific-surfaces.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {children}
        {/*
          Google Analytics 4. `afterInteractive` defers the script
          until after hydration so it never blocks LCP. gtag.js
          loads from googletagmanager.com (Google's preferred
          delivery), then the inline init script wires the page
          view + future custom events.
        */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
