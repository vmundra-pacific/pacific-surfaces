"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * SpaceFeatureSection — reusable feature block for the per-space
 * landing pages (/spaces/kitchens, /spaces/bathrooms, etc.).
 *
 * Each space page composes four of these in series, alternating
 * left/right image position and theme (light/dark) for editorial
 * rhythm. Each section pairs an image placeholder with a heading +
 * body + product CTA, where the CTA routes to the most relevant
 * Pacific catalogue page (Quartz, Granites, Vanity, Integra,
 * Façades and Finishes, Centrepiece Couture, Semi-Precious).
 *
 * Image placeholders are intentionally simple gradient blocks for
 * now — drop a real photo into /public/images/spaces/<slug>/<n>.jpg
 * and replace the placeholder div with <Image> when the asset lands.
 */
interface SpaceFeatureSectionProps {
  eyebrow: string;
  headline: string;
  body: string;
  /** Caption shown inside the placeholder box, e.g. "Quartz worktop" */
  imageLabel: string;
  /**
   * Optional Sanity-managed image URL. When present, renders a real
   * <Image> here. When null/undefined, falls back to the gradient
   * placeholder block with the imageLabel caption.
   */
  imageUrl?: string | null;
  ctaLabel: string;
  ctaHref: string;
  /** When true, image is on the left at lg+. Defaults to true. */
  imageOnLeft?: boolean;
  /** Light cream bg or brand navy bg. Defaults to "light". */
  theme?: "light" | "dark";
}

export function SpaceFeatureSection({
  eyebrow,
  headline,
  body,
  imageLabel,
  imageUrl,
  ctaLabel,
  ctaHref,
  imageOnLeft = true,
  theme = "light",
}: SpaceFeatureSectionProps) {
  const isDark = theme === "dark";
  return (
    <section
      className={`py-20 md:py-28 px-6 ${isDark ? "bg-[#112732]" : "bg-stone-50"}`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Image — real Sanity-uploaded photo when imageUrl is set,
            gradient placeholder fallback otherwise. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border ${
            isDark
              ? "border-white/10 bg-gradient-to-br from-[#1d3947] via-[#2c4a5b] to-[#0f1f29]"
              : "border-stone-200 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300"
          } ${imageOnLeft ? "lg:order-1" : "lg:order-2"}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageLabel}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={false}
            />
          ) : (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center ${
                isDark ? "text-white/40" : "text-stone-500"
              }`}
            >
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase">
                {imageLabel}
              </span>
              <span
                className={`text-[10px] tracking-[0.2em] uppercase ${
                  isDark ? "text-white/25" : "text-stone-400"
                }`}
              >
                [ image placeholder ]
              </span>
            </div>
          )}
        </motion.div>

        {/* Type stack */}
        <div className={imageOnLeft ? "lg:order-2" : "lg:order-1"}>
          <span
            className={`text-[10px] font-medium tracking-[0.3em] uppercase mb-4 block ${
              isDark ? "text-white/60" : "text-stone-500"
            }`}
          >
            {eyebrow}
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] mb-6 ${
              isDark ? "text-white" : "text-stone-900"
            }`}
          >
            {headline}
          </h2>
          <p
            className={`text-base sm:text-lg font-light leading-relaxed mb-8 max-w-xl ${
              isDark ? "text-stone-300" : "text-stone-600"
            }`}
          >
            {body}
          </p>
          <Link
            href={ctaHref}
            className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors ${
              isDark
                ? "bg-white text-stone-900 hover:bg-stone-100"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
