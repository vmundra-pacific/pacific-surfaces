"use client";

import { useState } from "react";
import Image from "next/image";
import type { CertificationLink } from "@/data/certifications";
// The viewer renders nothing until a certificate is opened, so its code
// is split out of the page bundle; it is fetched once the page is idle,
// or sooner on hover, focus or touch, so it opens on the click as before.
import {
  LazyCertificateViewer,
  useWarmCertificateViewerWhenIdle,
  warmCertificateViewer,
} from "@/components/certificates/LazyCertificateViewer";
import {
  Container,
  LABEL,
  LIGHT,
} from "@/components/sections/professionals/ProKit";

/**
 * The certificates on file, each opening in the view-only certificate
 * viewer. Only the five in the certificates folder: no Greenguard (none
 * on file) and no warranty line, unlike the homepage TrustStrip.
 */

const ON_FILE: {
  id: CertificationLink["id"];
  title: string;
  sub: string;
  src: string;
}[] = [
  {
    id: "nsf",
    title: "NSF/ANSI 51",
    sub: "Food-contact materials",
    src: "/certifications/nsf.png",
  },
  {
    id: "ce",
    title: "CE",
    sub: "EU conformity",
    src: "/certifications/ce.png",
  },
  {
    id: "iso",
    title: "ISO 9001:2015",
    sub: "Quality management",
    src: "/certifications/iso.png",
  },
  {
    id: "kosher",
    title: "Kosher",
    sub: "Certified",
    src: "/certifications/kosher.png",
  },
  {
    id: "epd",
    title: "EPD",
    sub: "Environmental product declaration",
    src: "/certifications/epd.png",
  },
];

export function ProCertificates({
  title = "Certificates on file",
}: {
  title?: string;
}) {
  const [open, setOpen] = useState<CertificationLink["id"] | null>(null);
  useWarmCertificateViewerWhenIdle();
  return (
    <section className="border-y border-[#14140f]/10 bg-white">
      <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className={LABEL}>Certificates</p>
          <h2
            style={LIGHT}
            className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[16px] font-light leading-relaxed">
            Open any certificate to read it in full, as issued.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ON_FILE.map((c) => (
            <li key={c.id}>
              {/* No aria-label: the visible title, line and "View" name
                  the button, so voice control can say what is on screen. */}
              <button
                type="button"
                onClick={() => setOpen(c.id)}
                onPointerEnter={warmCertificateViewer}
                onFocus={warmCertificateViewer}
                className="group/cert flex w-full flex-col items-center border border-[#14140f]/12 px-4 pb-5 pt-6 text-center transition-colors hover:border-[#14140f]/40"
              >
                <span className="relative block h-16 w-16">
                  <Image
                    src={c.src}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </span>
                <span className="mt-4 text-[13px] uppercase tracking-[0.1em]">
                  {c.title}
                </span>
                <span className="mt-1 text-[12px] font-light opacity-70">
                  {c.sub}
                </span>
                <span className="mt-3 text-[11px] uppercase tracking-[0.14em] underline-offset-4 group-hover/cert:underline">
                  View
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
      {open && (
        <LazyCertificateViewer cert={open} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}
