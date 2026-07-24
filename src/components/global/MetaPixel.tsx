"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, trackMetaEvent } from "@/lib/meta-pixel";

/**
 * Meta (Facebook) Pixel.
 *
 * Two halves:
 *  1. The standard fbevents.js snippet, which fires the first
 *     PageView on hard load.
 *  2. A pathname effect that re-fires PageView on client-side
 *     navigation. Without it the App Router's soft transitions go
 *     uncounted and everything looks like a one-page session — the
 *     gap GA still has in this layout.
 *
 * `usePathname` only, deliberately: `useSearchParams` in a
 * root-layout client component opts every route out of static
 * rendering. Query-only changes (e.g. /contact?type=distributor)
 * are the same page view for attribution purposes anyway.
 *
 * `afterInteractive` rather than GA's `lazyOnload` — ad attribution
 * windows care about the click landing, and a visitor who bounces
 * before idle is exactly the signal Meta needs to optimise against.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  // The inline snippet already tracks the landing PageView, so the
  // effect has to sit out the entry route or it double-counts. Holding
  // the last path (rather than a "has run" flag) also makes React's
  // StrictMode double-invoke in dev a no-op — the path hasn't changed.
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    const isFirstRender = lastPath.current === null;
    lastPath.current = pathname;
    if (isFirstRender) return;
    // Via the helper so a throw inside fbq can't escape the effect and
    // take out the page through the nearest error boundary.
    trackMetaEvent("PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
