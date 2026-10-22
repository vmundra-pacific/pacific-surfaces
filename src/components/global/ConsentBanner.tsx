"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readConsent, saveConsent } from "@/lib/consent";

/**
 * The cookie choice, shown once until the visitor answers (lib/consent).
 * Bottom-left, clear of the support panel (and above the phone support
 * bar), fixed so it never shifts the page.
 *
 * In the server HTML for everyone, so it paints with the page: drawn only
 * once the JavaScript ran, it came seconds late and on pages without a
 * large picture Lighthouse took it for the largest paint (2026-10-22,
 * /products LCP 7 s on a phone). For visitors who have chosen, the
 * Consent Mode script in <head> marks <html data-consent> before the
 * first paint and bw-temp.css hides it; the effect then removes it.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (readConsent() !== null) setOpen(false);
  }, []);

  if (!open) return null;

  const choose = (value: "granted" | "denied") => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choice"
      data-consent-banner
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[85] max-w-[420px] sm:bottom-4 rounded-lg border border-[#14140f]/15 bg-white p-5 text-[#14140f] shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:right-auto"
    >
      <p className="text-[13px] font-light leading-relaxed">
        We use cookies to see how the site is used and, if you agree, to measure our advertising on Google and
        Meta.{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy policy
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          data-over-media
          onClick={() => choose("granted")}
          className="inline-flex h-10 items-center rounded-full bg-[#14140f] px-5 text-[12px] uppercase tracking-[0.12em] text-white hover:opacity-85"
        >
          <span>Accept</span>
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="inline-flex h-10 items-center rounded-full border border-[#14140f]/30 px-5 text-[12px] uppercase tracking-[0.12em] hover:border-[#14140f]"
        >
          <span>Only necessary</span>
        </button>
      </div>
    </div>
  );
}
