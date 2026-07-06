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
 * full-section background. A right-side dark gradient scrim ramps from
 * transparent on the left (so the photo's subject reads cleanly) into
 * the brand navy on the right (so the typographic stack overlaying it
 * stays legible).
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
      <Image unoptimized={false}
        src="/images/ecosurfaces.png"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />

      {/* Soft uniform darken — applied across the entire image so the
          white type stack reads cleanly regardless of which part of
          the photo it overlays. Light enough that the image still
          shows through, dark enough to anchor the text. */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Content — stays in the right half on lg+, full-width on
          smaller screens. min-h ensures the section has presence
          without needing a fixed image height. */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 md:py-36 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-[600px] lg:min-h-[700px]">
        {/* Empty left column on lg+ so the photo's subject is visible
            unobstructed. Hidden on smaller screens where the layout
            stacks. */}
        <div className="hidden lg:block" />

        {/* Type stack — right column */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="block w-8 h-px bg-white/40" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60">
              Pacific Surfaces
            </span>
          </div>

          <TextReveal
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-light tracking-tight text-white leading-[1.25]"
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
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-white text-stone-900 text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-100 transition-colors"
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
