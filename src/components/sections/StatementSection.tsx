"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StatementSectionProps {
  statement: string;
  theme?: "light" | "dark";
  /**
   * When true, renders the brand-statement layout from the Sidharth
   * UI/UX deck — typographic block on one side, an image placeholder
   * (brand-toned) on the other. Used right after the parallax hero.
   * When false (default), keeps the original full-width centred copy
   * layout the rest of the site already uses elsewhere.
   */
  withImagePlaceholder?: boolean;
  /**
   * Optional smaller second-line copy that renders BELOW the
   * statement + image-placeholder row, spanning the full container
   * width. Currently used on the homepage for the "A leading brand
   * for over 25+ years…" supporting sentence so it reads as a
   * follow-up rather than as part of the headline.
   */
  subStatement?: string;
  /**
   * Optional DOM id forwarded to the outer <section>. Used so the
   * homepage's HomepageSectionNav can anchor "Sustainability" to
   * this block (since this is where the low-silica brand statement
   * appears). Other places that reuse this component leave it
   * unset.
   */
  id?: string;
}

export function StatementSection({
  statement,
  theme = "light",
  withImagePlaceholder = false,
  subStatement,
  id,
}: StatementSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const isDark = theme === "dark";

  // Image-placeholder variant — text on the left, brand-toned
  // placeholder on the right. Same headline copy, just laid out as
  // a two-column editorial block per the deck mock.
  if (withImagePlaceholder) {
    return (
      <section
        id={id}
        ref={ref}
        className={`relative py-20 sm:py-28 md:py-36 px-6 overflow-hidden ${isDark ? "bg-stone-950" : "bg-[#112732]"}`}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          style={{ y, opacity, willChange: "transform, opacity" }}
          className="relative z-10 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-light tracking-tight leading-[1.2] ${isDark ? "text-white" : "text-white"}`}
            >
              {statement}
            </h2>
            {/* Brand visual — real photo at
              /public/images/sustainability-statement.png. Aspect kept
              at 4:3 so the layout matches the placeholder version
              that shipped earlier. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f1f29]">
              <Image
                src="/images/sustainability-statement.png"
                alt="Pacific Surfaces brand visual — Taj vein bathroom"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={false}
              />
            </div>
          </div>
          {/* Sub-statement — smaller second line below the headline +
              image row, spanning the full container width edge-to-
              edge. Reads as the supporting follow-up sentence to the
              main brand statement above. */}
          {subStatement && (
            <p className="mt-10 lg:mt-14 text-base sm:text-lg font-light text-stone-300 leading-relaxed">
              {subStatement}
            </p>
          )}
        </motion.div>
      </section>
    );
  }

  // Default centred / large-display layout (used by other sections
  // outside the homepage).
  return (
    <section
      id={id}
      ref={ref}
      className={`relative py-20 sm:py-32 md:py-44 lg:py-56 px-6 overflow-hidden ${isDark ? "bg-stone-950" : "bg-[#112732]"}`}
    >
      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
      <motion.div
        style={{ y, opacity, willChange: "transform, opacity" }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <h2
          className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-light tracking-tight leading-[1.2] ${isDark ? "text-white" : "text-white"}`}
        >
          {statement}
        </h2>
      </motion.div>
    </section>
  );
}
