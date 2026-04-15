"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function HeroTerminal() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax for background
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  // Each headline fades in and out at different scroll positions
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.65], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 1], [0, 1, 1, 1]);

  // Y transforms for text slide-up effect
  const y1 = useTransform(scrollYProgress, [0, 0.1, 0.25], [60, 0, -40]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45], [60, 0, -40]);
  const y3 = useTransform(scrollYProgress, [0.4, 0.5, 0.65], [60, 0, -40]);
  const y4 = useTransform(scrollYProgress, [0.6, 0.7, 1], [60, 0, 0]);

  // CTA buttons fade in at the end
  const ctaOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);

  // Scroll indicator fades out
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Parallax background */}
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-900/40 to-stone-950/70 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://static.wixstatic.com/media/fd8707_81634e84e4a2420a878667b41ff82c96~mv2.jpg/v1/fit/w_5000,h_3500,q_90/file.jpg')",
            }}
          />
        </motion.div>

        {/* Grain overlay */}
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4=')]" />

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute top-8 left-8 z-30"
        >
          <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60">
            Scroll to explore
          </span>
        </motion.div>

        {/* Headlines container */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 w-full h-full flex items-center">
          {/* Headline 1 */}
          <motion.h1
            style={{ opacity: opacity1, y: y1 }}
            className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-tight text-white leading-[1.05] text-center px-6"
          >
            We craft surfaces
          </motion.h1>

          {/* Headline 2 */}
          <motion.h2
            style={{ opacity: opacity2, y: y2 }}
            className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-tight text-white leading-[1.05] text-center px-6"
          >
            that define spaces.
          </motion.h2>

          {/* Headline 3 */}
          <motion.p
            style={{ opacity: opacity3, y: y3 }}
            className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.2] text-center px-6 max-w-4xl mx-auto"
          >
            Premium quartz, granite & eco surfaces engineered for the extraordinary.
          </motion.p>

          {/* Headline 4 */}
          <motion.h2
            style={{ opacity: opacity4, y: y4 }}
            className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-tight text-white leading-[1.05] text-center px-6"
          >
            Moving design forward.
          </motion.h2>

          {/* CTAs */}
          <motion.div
            style={{ opacity: ctaOpacity }}
            className="absolute inset-0 flex items-end justify-center pb-[15vh]"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <MagneticButton
                href="/products"
                variant="primary"
                size="lg"
                className="bg-white text-stone-900 border-white hover:bg-stone-100"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton
                href="/contact"
                variant="outline"
                size="lg"
                className="text-white border-stone-400/40 hover:border-white hover:bg-white/5"
              >
                Get a Quote
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Bottom scroll line */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
