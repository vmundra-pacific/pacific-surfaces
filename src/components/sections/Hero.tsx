"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal, LineReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/50 to-stone-950/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://static.wixstatic.com/media/fd8707_81634e84e4a2420a878667b41ff82c96~mv2.jpg/v1/fit/w_5000,h_3500,q_90/file.jpg')",
          }}
        />
      </motion.div>

      {/* Grain overlay */}
      <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <LineReveal delay={0.2}>
          <span className="inline-block px-4 py-1.5 mb-8 text-xs font-medium tracking-[0.2em] uppercase text-stone-300 border border-stone-500/30 rounded-full">
            Premium Engineered Surfaces
          </span>
        </LineReveal>

        {/* Headline */}
        <TextReveal
          as="h1"
          delay={0.4}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1.05] justify-center"
        >
          Surfaces That Define Luxury
        </TextReveal>

        {/* Subtitle */}
        <LineReveal delay={0.9}>
          <p className="mt-8 text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our collection of 273+ patented quartz, granite, and eco surfaces — crafted for architects, designers, and spaces that demand the extraordinary.
          </p>
        </LineReveal>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
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
            Request a Quote
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
