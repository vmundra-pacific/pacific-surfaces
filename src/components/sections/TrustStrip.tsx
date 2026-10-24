"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CERTIFICATION_LINKS,
  type CertificationLink,
} from "@/data/certifications";
// The certificate viewer renders nothing until a badge is clicked, so
// its code is split out of the homepage bundle. It is fetched once the
// page is idle, or sooner when a badge is hovered, focused or touched,
// so it opens on the click exactly as before.
import {
  LazyCertificateViewer,
  useWarmCertificateViewerWhenIdle,
  warmCertificateViewer,
} from "@/components/certificates/LazyCertificateViewer";

/* Certification badges. Each entry references an image file under
 * /public/certifications/. Drop the relevant PNG/SVG at the listed
 * path and it'll appear on the card. If the file is missing, the
 * card still renders with the dark placeholder bg + name below.
 *
 * The 25-year-warranty card was retired, and the "lifetime warranty"
 * line in the tagline went too (owner, 2026-10-24: a warranty is stated
 * only for quartz, by series, never for "every slab").
 *
 * Only certificates on file in the Drive viewer are listed (NSF/ANSI 51,
 * CE, ISO 9001:2015, Kosher, EPD). The Greenguard Gold tile was removed
 * (2026-10-24): no Greenguard certificate is held. */
const badges = [
  {
    title: "NSF/ANSI 51",
    cert: "nsf" as const,
    sub: "Food Contact Safe",
    src: "/certifications/nsf.png",
  },
  {
    title: "CE Marked",
    cert: "ce" as const,
    sub: "EU Conformity",
    src: "/certifications/ce.png",
  },
  {
    title: "ISO 9001:2015",
    cert: "iso" as const,
    sub: "Quality System",
    src: "/certifications/iso.png",
  },
  {
    title: "Kosher",
    cert: "kosher" as const,
    sub: "Certified",
    src: "/certifications/kosher.png",
  },
  {
    title: "EPD",
    cert: "epd" as const,
    sub: "Environmental Declaration",
    src: "/certifications/epd.png",
  },
];

/**
 * One badge tile. Falls back to the certification's initials in a ruled
 * box if the image 404s, rather than showing a broken-image icon — the
 * EPD mark is listed here before its artwork has been supplied. Drop the
 * file at the path in `badges` above and the fallback disappears on its
 * own; nothing else needs changing.
 */
function BadgeTile({
  title,
  sub,
  src,
}: {
  title: string;
  sub: string;
  src: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Stone grey rather than white or black: this tile has to stay
    // visible whether the strip is on its navy ground or the white one
    // the temporary skin gives it.
    return (
      <div className="relative flex w-full aspect-square items-center justify-center border border-[#9AA8B6]/50 p-4">
        <span className="text-center text-lg font-light tracking-[0.08em] text-[#9AA8B6]">
          {title}
        </span>
      </div>
    );
  }

  // Capped at 200px: with the strip running full width, each of the six
  // tiles was ~290px square on a 1920 screen and the marks overpowered the
  // section. Narrower screens never reach the cap, so they are unchanged.
  return (
    <div className="relative w-full max-w-[200px] mx-auto aspect-square overflow-hidden">
      <Image
        src={src}
        alt={`${title} — ${sub}`}
        fill
        className="object-contain p-5 sm:p-6"
        sizes="(max-width: 640px) 50vw, 25vw"
        unoptimized={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function TrustStrip() {
  const [openCert, setOpenCert] = useState<CertificationLink["id"] | null>(
    null
  );
  useWarmCertificateViewerWhenIdle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative bg-[#112732] border-y border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-14">
        {/* Tagline. No warranty line: the homepage covers every
            material, and only quartz carries a warranty (owner,
            2026-10-24). */}
        <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#9AA8B6] text-center mb-8 sm:mb-10 lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis">
          Certified to global standards, delivering proven performance, so
          you don&apos;t have to worry about anything.
        </p>

        {/* Badge grid. Each card is a square image tile with the cert
            name + sub-label rendered BELOW the card (not overlaid).
            Five across on desktop, one per certificate on file. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {badges.map((b) => {
            const link = CERTIFICATION_LINKS[b.cert];
            const body = (
              <>
                {/* Image tile */}
                <BadgeTile title={b.title} src={b.src} sub={b.sub} />
                {/* Caption — sits BELOW the card, centred. */}
                <div className="mt-3 text-center">
                  <div className="text-[12px] sm:text-[13px] font-medium tracking-[0.05em] text-white/90 leading-tight">
                    {b.title}
                  </div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-[#9AA8B6] leading-tight mt-1">
                    {b.sub}
                  </div>
                </div>
              </>
            );

            // No certificate on file (Greenguard, for now): a plain tile.
            if (!link.viewable) {
              return (
                <div key={b.title} className="flex flex-col items-center">
                  {body}
                </div>
              );
            }

            return (
              <button
                key={b.title}
                type="button"
                onClick={() => setOpenCert(b.cert)}
                onPointerEnter={warmCertificateViewer}
                onFocus={warmCertificateViewer}
                className="flex flex-col items-center transition-opacity duration-300 hover:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9AA8B6]"
              >
                {body}
                {/* No aria-label: the badge's own text names the button
                    (so voice control can say what is on screen), and
                    this hidden suffix says what pressing it does. */}
                <span className="sr-only"> — {link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {openCert && (
        <LazyCertificateViewer
          cert={openCert}
          onClose={() => setOpenCert(null)}
        />
      )}
    </motion.div>
  );
}
