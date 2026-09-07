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
  // Zoom out: the picture enters 20% over its frame and settles to fit
  // as the section crosses the viewport, then holds. Only the image
  // moves — the type above it stays put.
  const imageScale = useTransform(scrollYProgress, [0, 0.6, 1], [1.2, 1, 1]);

  const isDark = theme === "dark";

  // Image variant — statement above, then the photograph filling the
  // full width of the section beneath it. The image scales down as the
  // section passes through the viewport, so it reads as pulling back from
  // the stone rather than sitting still.
  if (withImagePlaceholder) {
    return (
      <section
        id={id}
        ref={ref}
        className={`relative overflow-hidden py-20 sm:py-28 md:py-32 ${isDark ? "bg-pacific-dark" : "bg-[#112732]"}`}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Type sits above the picture and keeps the page's side padding;
            the image below deliberately does not, so it runs edge to
            edge. */}
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <h2
            className={`max-w-4xl text-2xl font-light leading-[1.2] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] ${isDark ? "text-white" : "text-white"}`}
          >
            {statement}
          </h2>
          {subStatement && (
            <p className="mt-8 max-w-3xl text-base font-light leading-relaxed text-white/85 sm:text-lg">
              {subStatement}
            </p>
          )}
        </div>

        {/* Full-bleed photograph, and the only thing that moves. It starts
            20% over its frame and settles to fit as the section crosses
            the viewport. The wrapper clips, so the oversized start never
            widens the page or introduces a horizontal scrollbar. */}
        <div className="relative z-10 mt-12 w-full overflow-hidden sm:mt-16">
          <motion.div
            style={{ scale: imageScale, willChange: "transform" }}
            className="relative aspect-[16/9] w-full origin-center sm:aspect-[21/9]"
          >
            <Image
              src="/images/low-silica-statement.webp"
              alt="Low-silica engineered surface — close detail"
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />
          </motion.div>
        </div>
      </section>
    );
  }

  // Default centred / large-display layout (used by other sections
  // outside the homepage).
  return (
    <section
      id={id}
      ref={ref}
      className={`relative py-20 sm:py-32 md:py-44 lg:py-56 px-6 overflow-hidden ${isDark ? "bg-pacific-dark" : "bg-[#112732]"}`}
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
