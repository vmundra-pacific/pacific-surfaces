"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";

/**
 * EcosurfacesSection — feature block for the Pacific Ecosurfaces line.
 *
 * Sits right after TrustStrip on the homepage. The Ecosurfaces photo
 * (a low-silica slab with the eco material visible underneath) is the
 * full-section background, with a diagonal scrim that is heaviest at the
 * top left — where the copy sits — and clears toward the slab itself.
 *
 * The type stack runs from the top left across the width. It used to be
 * penned into a right-hand grid column against an empty left one, which
 * read as one-sided and left the copy stranded beside the subject.
 *
 * Copy:
 *   - Eyebrow:  "PACIFIC SURFACES"
 *   - Headline: brand low-silica statement
 *   - Subhead:  "A LEADING BRAND FOR OVER 25+ YEARS…"
 *   - CTA:      "EXPLORE ECOSURFACES" → /ecosurfaces
 */
export function EcosurfacesSection() {
  return (
    <section className="relative bg-[#0f1f29] overflow-hidden">
      {/* Full-bleed background photo — covers the entire section
          edge-to-edge without any side fade so the image is visible
          across the full width. Object-cover keeps it filling the
          section regardless of viewport aspect ratio. */}
      <Image
        unoptimized={false}
        src="/images/ecosurfaces.png"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />

      {/* Diagonal darken — heaviest under the copy at the top left,
          clearing toward the bottom right so the slab keeps its light.
          A uniform wash flattened the whole photograph to hold text
          that only occupies one corner of it. */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/40 to-black/15 pointer-events-none" />

      {/* Content — anchored top left and running across the width.
          min-h gives the section presence without a fixed image
          height. */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-24 md:py-28 min-h-[600px] lg:min-h-[700px]">
        <div className="flex max-w-4xl flex-col items-start">
          <div className="flex items-center gap-2 mb-6">
            <span className="block w-8 h-px bg-white/40" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60">
              Pacific Surfaces
            </span>
          </div>

          <TextReveal
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.2]"
          >
            Pacific Surfaces is a low-silica mineral-infused engineered surfaces
            brand composed of premium and recycled minerals and materials.
          </TextReveal>

          <TextReveal
            as="p"
            delay={0.15}
            className="mt-10 sm:mt-12 text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-white leading-[1.6] max-w-xl"
          >
            A leading brand for over 25+ years that inspires designs for
            kitchens, bathrooms &amp; home surfaces.
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 sm:mt-14"
          >
            <Link
              href="/ecosurfaces"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-white text-pacific-dark text-xs font-medium tracking-[0.2em] uppercase hover:bg-pacific-light transition-colors"
            >
              Explore Ecosurfaces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
