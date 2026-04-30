"use client";

import { motion } from "framer-motion";

/* ─── Inline-SVG cert icons ────────────────────────────────────────
   Simple white-stroked iconographic representations sized for the
   36×36 badge container. Using `currentColor` so they inherit the
   parent's text colour (white/80 on the dark navy strip). Replace
   any of these with an <img> from public/certs/ if/when the brand
   team supplies official artwork. */

function NsfIcon() {
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7" aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="18"
        y="21"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill="currentColor"
        fontFamily="Helvetica, Arial, sans-serif"
        letterSpacing="-0.3"
      >
        NSF
      </text>
    </svg>
  );
}

function GreenguardIcon() {
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7" aria-hidden="true">
      {/* Leaf body */}
      <path
        d="M18 6 C 10.5 9, 7.5 16.5, 9 25 C 17 25, 25 19.5, 28 11.5 C 25 8.5, 22 7, 18 6 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Stem / vein */}
      <path
        d="M9 25 Q 13.5 20.5, 19 16.5"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CeIcon() {
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7" aria-hidden="true">
      {/* C — left arc with horizontal opening */}
      <path
        d="M16 8 A 10 10 0 1 0 16 28"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      {/* E — right arc with crossbar opening */}
      <path
        d="M30 8 A 10 10 0 1 0 30 28"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      {/* E crossbar */}
      <rect x="23" y="16.5" width="7" height="3" fill="currentColor" />
    </svg>
  );
}

function IsoIcon() {
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="30"
        height="30"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill="currentColor"
        fontFamily="Helvetica, Arial, sans-serif"
        letterSpacing="-0.3"
      >
        ISO
      </text>
    </svg>
  );
}

function WarrantyIcon() {
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7" aria-hidden="true">
      {/* Shield outline */}
      <path
        d="M18 4 L 30 9 L 30 18 C 30 25 25 30 18 32 C 11 30 6 25 6 18 L 6 9 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Number inside */}
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="currentColor"
        fontFamily="Helvetica, Arial, sans-serif"
      >
        25
      </text>
    </svg>
  );
}

const badges = [
  { Icon: NsfIcon, title: "NSF/ANSI 51", sub: "Food Contact Safe" },
  { Icon: GreenguardIcon, title: "Greenguard Gold", sub: "Low Emissions" },
  { Icon: CeIcon, title: "CE Marked", sub: "EU Conformity" },
  { Icon: IsoIcon, title: "ISO 9001:2015", sub: "Quality System" },
  { Icon: WarrantyIcon, title: "25 Year Warranty*", sub: "" },
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        {/* Label */}
        <p className="text-[11px] tracking-[0.15em] uppercase text-[#9AA8B6] text-center mb-5">
          Certified to global standards, delivering proven performance.
        </p>
        {/* Badges — single scrollable row */}
        <div className="flex items-center justify-center gap-8 overflow-x-auto no-scrollbar">
          {badges.map((b) => (
            <div key={b.title} className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-md bg-white/[0.06] flex items-center justify-center text-white/80">
                <b.Icon />
              </div>
              <div>
                <div className="text-[11px] font-medium text-white/90 leading-tight whitespace-nowrap">
                  {b.title}
                </div>
                <div className="text-[10px] text-[#9AA8B6] leading-tight whitespace-nowrap">
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
