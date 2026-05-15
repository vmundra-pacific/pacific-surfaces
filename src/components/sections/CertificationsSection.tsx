"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * CertificationsSection — two-card editorial cert block sitting right
 * after EcosurfacesSection on the homepage. Mirrors the Cosentino
 * Silestone certification spread the editorial team referenced:
 *
 *   - Left card  → "Certified by DNV" — verification statement
 *     about Pacific's engineered surface technology meeting the
 *     highest environmental standards. Solid navy card, text-only.
 *   - Right card → "Certified by SGS" — confirms the Pacific colour
 *     portfolio contains less than 40% crystalline silica. Image
 *     placeholder background (lab/microscope visual once a real
 *     photo lands at /public/images/sgs-cert.jpg) with the cert
 *     label + body text overlaid via a bottom-up scrim.
 *
 * Drop a real lab/microscope photo into /public/images/sgs-cert.jpg
 * and replace the placeholder div in the right card when the asset
 * is approved.
 */
export function CertificationsSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed two-card spread — no section padding, no gap
          between cards, no rounded corners. Each card carries its
          own padding and fills its half of the viewport so no page
          background shows through. The eyebrow lives inside the
          left card now (was previously above the grid). */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left card — Certified by DNV (solid navy, text-only). */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative bg-[#112732] py-20 sm:py-28 md:py-32 px-8 sm:px-12 md:px-16 lg:px-20 overflow-hidden min-h-[420px] lg:min-h-[520px] flex flex-col justify-center"
        >
          {/* Subtle grain so the navy isn't flat */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nA'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nA)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-400">
              Certified by
            </span>
            {/* DNV logo — sits on a generous white plate so the
                  logo's brand colours read cleanly on the navy card.
                  Bigger size + soft shadow + thin stone ring give
                  the plate a sense of "credential" rather than just
                  a chip. */}
            <div className="mt-4 mb-10 inline-flex items-center justify-center bg-white rounded-lg px-8 py-5 shadow-[0_8px_28px_rgba(0,0,0,0.25)] ring-1 ring-stone-200/60">
              <Image unoptimized={false}
                src="/logos/dnv.webp"
                alt="DNV certification"
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm sm:text-base font-light text-stone-300 leading-relaxed max-w-md">
              This Verification Statement confirms that Pacific Surfaces&apos;
              engineered surface technology complies with the highest
              environmental standards, maintaining the same level of
              performance, durability, and resistance across the full Pacific
              portfolio.
            </p>
          </div>
        </motion.div>

        {/* Right card — Certified by SGS (image placeholder bg
            with text overlay). */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="relative overflow-hidden bg-[#0f1f29] min-h-[420px] lg:min-h-[520px]"
        >
          {/* Real lab/microscope photo behind the cert content. */}
          <Image unoptimized={false}
            src="/images/sgs-cert.png"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={false}
          />
          {/* Bottom-up scrim — keeps the cert text + logo readable
                regardless of which part of the photo it overlays. */}
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/85 via-black/55 to-transparent pointer-events-none" />
          {/* Card content — vertically centred, left-aligned text.
                Inner wrapper is `flex flex-col items-start` so the
                "CERTIFIED BY" eyebrow sits ABOVE the logo plate
                rather than next to it (the inline-flex on the plate
                made them line up side-by-side without an explicit
                column layout). */}
          <div className="relative h-full p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-300">
                Certified by
              </span>
              {/* SGS logo — same large credential treatment as
                    DNV so the two cards read as a matched pair. */}
              <div className="mt-4 mb-10 inline-flex items-center justify-center bg-white rounded-lg px-8 py-5 shadow-[0_8px_28px_rgba(0,0,0,0.25)] ring-1 ring-stone-200/60">
                <Image unoptimized={false}
                  src="/logos/sgs.png"
                  alt="SGS certification"
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-sm sm:text-base font-light text-stone-100 leading-relaxed max-w-md">
                Pacific Surfaces&apos; engineered surface technology achieved
                independent certification from SGS for almost the entire
                portfolio to contain 0% crystalline silica — a benchmark
                for safer fabrication and installation environments.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
