"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/* Certification badges. Each entry references an image file under
 * /public/certifications/. Drop the relevant PNG/SVG at the listed
 * path and it'll appear on the card. If the file is missing, the
 * card still renders with the dark placeholder bg + name below.
 *
 * The 25-year-warranty card was retired; that promise moves to the
 * tagline above the grid as "Lifetime warranty". */
const badges = [
  {
    title: "NSF/ANSI 51",
    sub: "Food Contact Safe",
    src: "/certifications/nsf.png",
  },
  {
    title: "Greenguard Gold",
    sub: "Low Emissions",
    src: "/certifications/greenguard.png",
  },
  {
    title: "CE Marked",
    sub: "EU Conformity",
    src: "/certifications/ce.png",
  },
  {
    title: "ISO 9001:2015",
    sub: "Quality System",
    src: "/certifications/iso.png",
  },
  {
    title: "Kosher",
    sub: "Certified",
    src: "/certifications/kosher.png",
  },
];

export function TrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative bg-[#112732] border-y border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-14">
        {/* Tagline — now includes the Lifetime warranty promise that
            used to live as its own card. */}
        <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#9AA8B6] text-center mb-8 sm:mb-10 lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis">
          Certified to global standards, delivering proven performance with
          lifetime warranty, so you don&apos;t have to worry about anything.
        </p>

        {/* Badge grid. Each card is a square image tile with the cert
            name + sub-label rendered BELOW the card (not overlaid).
            4 columns on desktop now that the warranty card is gone. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {badges.map((b) => (
            <div key={b.title} className="flex flex-col items-center">
              {/* Image tile */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={b.src}
                  alt={`${b.title} — ${b.sub}`}
                  fill
                  className="object-contain p-6 sm:p-8"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  unoptimized={false}
                />
              </div>
              {/* Caption — sits BELOW the card, centred. */}
              <div className="mt-3 text-center">
                <div className="text-[12px] sm:text-[13px] font-medium tracking-[0.05em] text-white/90 leading-tight">
                  {b.title}
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-[#9AA8B6] leading-tight mt-1">
                  {b.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
