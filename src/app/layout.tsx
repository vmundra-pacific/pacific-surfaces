import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalDustMount from "@/components/global/GlobalDustMount";

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
  title: {
    template: "%s — Pacific Surfaces",
    default: "Pacific Surfaces — Premium Quartz & Granite Surfaces",
  },
  description:
    "Premium quartz slabs, granite surfaces, and semi-precious stones for countertops, vanities, flooring, and wall cladding. Crafted for beauty, engineered for durability.",
  metadataBase: new URL("https://www.pacific-surfaces.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Pacific Surfaces",
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Pacific Surfaces",
              alternateName: "Pacific Surfaces (Pacific Group)",
              url: "https://www.pacific-surfaces.com",
              logo: "https://www.pacific-surfaces.com/logos/monogram-light.png",
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
                  telephone: "+91-7305477549",
                  areaServed: "Worldwide",
                  availableLanguage: ["en"],
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
