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

  // Image variant — the photograph is the section's background and the
  // statement sits on it. The picture enters 20% over its frame and
  // settles to fit as the section crosses the viewport; nothing else
  // moves.
  if (withImagePlaceholder) {
    return (
      <section
        id={id}
        ref={ref}
        className={`relative flex min-h-[78vh] items-center overflow-hidden py-24 sm:py-32 ${isDark ? "bg-pacific-dark" : "bg-[#112732]"}`}
      >
        {/* Background. Scaled rather than sized, so the zoom never changes
            layout — the section keeps its height and the overflow clip
            stops the oversized start widening the page. */}
        <motion.div
          style={{ scale: imageScale, willChange: "transform" }}
          className="absolute inset-0 origin-center"
        >
          <Image
            src="/images/low-silica-statement.webp"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
        </motion.div>

        {/* Scrim. The stone is a pale beige, so white type needs real
            cover: heaviest on the left where the copy sits, clearing to
            the right so the veining still reads. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <h2
            className={`max-w-4xl text-2xl font-light leading-[1.2] tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,.5)] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] ${isDark ? "text-white" : "text-white"}`}
          >
            {statement}
          </h2>
          {subStatement && (
            <p className="mt-8 max-w-3xl text-base font-light leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,.5)] sm:text-lg">
              {subStatement}
            </p>
          )}
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
