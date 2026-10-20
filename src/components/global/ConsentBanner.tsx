"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readConsent, saveConsent } from "@/lib/consent";

/**
 * The cookie choice, shown once until the visitor answers (lib/consent).
 * Bottom-left, clear of the WhatsApp button, fixed so it never shifts the
 * page. Rendered only after mount, so the server HTML and the first paint
 * are the same for everyone.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setOpen(true);
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
      className="fixed bottom-4 left-4 right-24 z-[60] max-w-[420px] rounded-lg border border-[#14140f]/15 bg-white p-5 text-[#14140f] shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:right-auto"
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
