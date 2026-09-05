"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * CertificationsSection — two credential cards side by side, laid out
 * after the Silestone/Cosentino certification spread:
 *
 *   - Left card  → solid dark ground. "Certified by", the DNV mark, a
 *     gap, then the statement. Everything left-aligned and anchored to
 *     the top, with the lower third left empty.
 *   - Right card → the same block set over the lab photograph, which
 *     fills the card and carries a left-to-right scrim so the copy
 *     holds against it.
 *
 * The pair sits inset from the page edge so the page ground reads as a
 * margin around them, as in the reference.
 *
 * LOGO NOTE: the reference knocks its logos out in white. Ours cannot:
 * /logos/dnv.webp and /logos/sgs.png are both ink on a SOLID WHITE
 * background — measured 0% transparent, ~86% and ~72% near-white pixels.
 * A `grayscale(1) invert(1)` knockout was tried and fails on both — DNV's
 * pale blue bars invert to near-black and disappear into the card, and
 * SGS's inverted white ground reads as a grey box over the photograph.
 * So each logo sits on a small white plate, as tight as the mark allows.
 * Drop in transparent white-on-clear logo files and the plate can go.
 */

export function CertificationsSection() {
  return (
    <section className="relative bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-1 lg:grid-cols-2">
        {/* Left card — Certified by DNV, solid ground. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative overflow-hidden bg-[#112732] p-8 sm:p-10 lg:p-14 min-h-[460px] lg:min-h-[560px]"
        >
          <div className="relative flex flex-col items-start">
            <span className="text-sm font-light text-white/90">
              Certified by
            </span>
            <span className="mt-3 inline-flex items-center justify-center rounded-sm bg-white px-5 py-3">
              <Image
                unoptimized={false}
                src="/logos/dnv.webp"
                alt="DNV certification"
                width={200}
                height={80}
                className="h-11 w-auto object-contain"
              />
            </span>
            <p className="mt-16 max-w-xl text-lg font-light leading-relaxed text-white sm:text-xl">
              This Verification Statement confirms that Pacific Surfaces&apos;
              engineered surface technology complies with the highest
              environmental standards, maintaining the same level of
              performance, durability and resistance across the full Pacific
              portfolio.
            </p>
          </div>
        </motion.div>

        {/* Right card — Certified by SGS, over the lab photograph. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="relative overflow-hidden bg-[#0f1f29] p-8 sm:p-10 lg:p-14 min-h-[460px] lg:min-h-[560px]"
        >
          <Image
            unoptimized={false}
            src="/images/sgs-cert.png"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover object-[70%_center]"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={false}
          />
          {/* Left-to-right scrim — the copy sits on the left half, so the
              photograph stays legible on the right rather than being
              flattened under an even wash. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20 pointer-events-none" />
          <div className="relative flex flex-col items-start">
            <span className="text-sm font-light text-white/90">
              Certified by
            </span>
            <span className="mt-3 inline-flex items-center justify-center rounded-sm bg-white px-5 py-3">
              <Image
                unoptimized={false}
                src="/logos/sgs.png"
                alt="SGS certification"
                width={200}
                height={80}
                className="h-11 w-auto object-contain"
              />
            </span>
            <p className="mt-16 max-w-xl text-lg font-light leading-relaxed text-white sm:text-xl">
              Pacific Surfaces&apos; engineered surface technology achieved
              independent certification from SGS for the entire portfolio of
              Ecosurfaces to contain 0% crystalline silica — a benchmark for
              safer fabrication and installation environments.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
