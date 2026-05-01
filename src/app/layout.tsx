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
        {children}
      </body>
    </html>
  );
}
