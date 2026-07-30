"use client";

/**
 * Error boundary for the whole (site) route group.
 *
 * Previously absent: any throw in a server component rendered Next.js's
 * default error screen — an unstyled, developer-facing page that leaks
 * the framework identity and looks broken to a prospective customer.
 * This keeps a failure on-brand and gives the visitor a way forward.
 *
 * Header/Footer still render around this because the (site) layout sits
 * above it in the tree, so the page keeps its navigation.
 */

import { useEffect } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { RefreshCw, ArrowRight } from "lucide-react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error server-side/in the console for diagnosis.
    // `digest` is the only handle we get on a production server error —
    // it correlates this render with the server log entry.
    console.error("[site error boundary]", error);
  }, [error]);

  return (
    <section className="relative bg-pacific-dark pt-20">
      {/* Grain texture — required on dark sections. */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-32 md:py-40">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-6">
            Something went wrong
          </p>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.05] mb-8">
            This page didn&apos;t load
          </h1>

          <p className="text-base font-light text-pacific-mid leading-relaxed mb-12 max-w-xl">
            An unexpected error interrupted this page. Trying again will
            usually resolve it. If it keeps happening, our team is reachable
            and happy to help.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <MagneticButton onClick={reset} variant="primary-dark">
              <RefreshCw className="w-4 h-4" />
              Try again
            </MagneticButton>

            <MagneticButton href="/contact" variant="outline-dark">
              Contact us
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>

          {error.digest && (
            <p className="mt-12 text-[10px] font-medium tracking-[0.25em] uppercase text-pacific-mid/60">
              Reference {error.digest}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
