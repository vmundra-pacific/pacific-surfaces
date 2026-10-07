import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
// TEMPORARY brand test — black & white + Hubot Sans. Delete this line and
// src/app/bw-temp.css to restore the navy and Inter.
import "./bw-temp.css";
import BwTempSections from "./bw-temp-sections";
import GlobalDustMount from "@/components/global/GlobalDustMount";
import MetaPixel from "@/components/global/MetaPixel";
import AuthProvider from "@/components/providers/AuthProvider";
import { safeJsonLd } from "@/lib/escape";
import { siteGraph } from "@/data/business";

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
          (No Google Fonts preconnects: next/font self-hosts Inter,
          so fonts.googleapis.com / fonts.gstatic.com are never
          contacted at runtime.)
        */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
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
        <AuthProvider>{children}</AuthProvider>
        <BwTempSections />
        <GlobalDustMount />
        {/*
          Site-wide JSON-LD: one graph holding the brand (Organization),
          the factory (LocalBusiness) and the website, linked by stable
          @ids. Built from data/business, the same source the footer and
          the Contact page print, so the name, address, phone and hours
          always agree. Page-level schema (BreadcrumbList, Product,
          FAQPage, Article) is added per route and can point at these
          ids.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(siteGraph()) }}
        />
        {/*
          Google Analytics 4. gtag.js loads from googletagmanager.com
          (Google's preferred delivery), then the inline init script
          wires the page view + future custom events.
        */}
        {/* lazyOnload: GA waits for idle — keeps gtag off the critical path. Trade-off: sub-second bounces may go uncounted. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="ga-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {/*
          Meta Pixel. Self-contained client component so it can re-fire
          PageView on App Router soft navigations — see MetaPixel.tsx.
        */}
        <MetaPixel />
      </body>
    </html>
  );
}
