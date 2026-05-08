"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { TextReveal } from "@/components/ui/text-reveal";

/**
 * EcosurfacesSection — feature block for the Pacific Ecosurfaces line.
 *
 * Sits right after ApplicationsScrollSections on the homepage. Two-column
 * layout: image placeholder on the left, typographic stack + CTA on the
 * right. The "image" is intentionally a brand-toned placeholder block
 * for now — drop a real photo into /public/images/ecosurfaces.jpg and
 * swap the Image import in once the asset lands.
 *
 * Copy is taken straight from the Sidharth UI/UX deck:
 *   - Eyebrow:  "PACIFIC ECOSURFACES"
 *   - Headline: "THE FIRST MINERAL QUARTZ SURFACE WITH LOW SILICA CONTENT"
 *   - Subhead:  "THE SURFACE THAT CHANGED WHAT SAFE MEANS"
 *   - CTA:      "LEARN MORE ABOUT ECOSURFACES" → /ecosurfaces
 */
export function EcosurfacesSection() {
  return (
    <section className="relative bg-stone-50 py-20 sm:py-28 md:py-36 px-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Image placeholder — brand-toned block. Same aspect ratio as a
            typical editorial kitchen still so swapping in a real photo
            later doesn't reflow the page. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300"
        >
          {/* Decorative leaf mark + caption so the placeholder reads as
              an intentional visual rather than a missing asset. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 gap-3 px-8 text-center">
            <Leaf className="w-10 h-10 stroke-[1.2] text-stone-400" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase">
              Ecosurfaces visual
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
              [ image placeholder ]
            </span>
          </div>
          {/* Subtle grain so the gradient doesn't look flat. */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        {/* Type stack */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="block w-8 h-px bg-stone-400" />
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-stone-500">
              Pacific Ecosurfaces
            </span>
          </div>

          <TextReveal
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-tight text-stone-900 leading-[1.1]"
          >
            The first mineral quartz surface with low silica content.
          </TextReveal>

          <TextReveal
            as="p"
            delay={0.15}
            className="mt-6 text-lg sm:text-xl font-light text-stone-600 leading-relaxed max-w-xl"
          >
            The surface that changed what safe means.
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              href="/ecosurfaces"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-stone-900 text-white text-xs font-medium tracking-[0.2em] uppercase hover:bg-stone-800 transition-colors"
            >
              Learn more about Ecosurfaces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
