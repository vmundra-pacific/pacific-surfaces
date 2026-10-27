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
import { ConsentBanner } from "@/components/global/ConsentBanner";
import { CONSENT_DEFAULTS_SCRIPT } from "@/lib/consent";
import { REGION_BOOT_SCRIPT } from "@/lib/region";
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

/** Google Tag Manager container. Public token, like the GA ID above. */
const GTM_ID = "GTM-NLNM2VJS";

/** Adds the Hubot Sans italic once the page has loaded (bw-temp.css says why). */
const ITALIC_FONT_SCRIPT = `addEventListener("load",function(){if(!window.FontFace)return;
new FontFace("Hubot Sans",'url("/fonts/HubotSans-Italic.woff2") format("woff2")',{style:"italic",weight:"200 900",display:"swap"})
.load().then(function(f){document.fonts.add(f)}).catch(function(){})},{once:true});`;

// preload: false while bw-temp.css forces Hubot Sans on every element:
// Inter never renders, so preloading it only spent bandwidth at High
// priority inside the LCP window. Restore the preload with the brand test.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
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
  // Lets search show large image previews and full snippets for this
  // image-led catalogue. No index/follow here: a route that sets its own
  // `robots` (the noindex pages, /privacy) replaces this object outright
  // rather than merging with it, so their directives are untouched.
  robots: {
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
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
          Consent Mode defaults, before Tag Manager so every Google tag
          starts with them: advertising storage denied until the visitor
          accepts (lib/consent, ConsentBanner), analytics on.
        */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS_SCRIPT }} />
        {/* The visitor's region on <html data-region> before anything
            paints, for the colours shown per region (lib/region). */}
        <script dangerouslySetInnerHTML={{ __html: REGION_BOOT_SCRIPT }} />
        {/* Hubot Sans italic, added after load (see bw-temp.css). */}
        <script dangerouslySetInnerHTML={{ __html: ITALIC_FONT_SCRIPT }} />
        {/*
          Google Tag Manager — Google's snippet, high in <head> and in the
          server HTML of every page, except that gtm.js (157 KB) is fetched
          once the page has loaded, at the next idle moment (2026-10-22,
          owner: Lighthouse performance above 90). Fetched at once it was
          the largest request ahead of the homepage's first paint on a
          phone. The gtm.start timestamp is still taken here, so Tag
          Manager's timings are unchanged; the tags fire about a second
          later.
          2026-10-24 (owner: mobile Core Web Vitals to pass): 3.5 s after
          load, then the next idle moment. Loaded straight after load, Tag
          Manager and the Google tag it pulls in ran ~600 ms of long tasks
          (on a 4x-slowed phone) just as visitors start tapping, which is
          what pushed INP over 200 ms.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});function go(){var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
function later(){setTimeout(function(){(w.requestIdleCallback||function(c){setTimeout(c,1)})(go,{timeout:4000});},3500);}
if(d.readyState==='complete')later();else w.addEventListener('load',later,{once:true});
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
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
        {/* Google Tag Manager (noscript) — immediately after <body>. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* No next-auth SessionProvider here: only the customer portal
            uses auth, so it is mounted in app/customer/layout.tsx and
            public pages skip the /api/auth/session request. */}
        {children}
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
        {/* lazyOnload: GA waits for idle — keeps gtag off the critical path. Trade-off: sub-second bounces may go uncounted.
            Note (2026-10-24): Tag Manager also loads this same Google tag
            (gtag/js?id=G-7PXLT12ML9&cx=c&gtm=…), so GA loads twice — ~270 ms
            of phone main-thread work and likely double page views. The owner
            will decide whether to drop this direct copy. */}
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
        <ConsentBanner />
      </body>
    </html>
  );
}
