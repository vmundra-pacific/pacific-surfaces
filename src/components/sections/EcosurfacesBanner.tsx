"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function EcosurfacesBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative py-36 sm:py-44 px-6 overflow-hidden">
      {/* Parallax background with grain texture */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20 -bottom-20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 z-10" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-8 text-xs font-medium tracking-[0.25em] uppercase text-emerald-200 border border-emerald-500/30 rounded-full">
            Safe, Sustainable & Stunning
          </span>
        </motion.div>

        {/* Heading */}
        <TextReveal
          as="h2"
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white justify-center leading-[1.1]"
        >
          Ecosurfaces
        </TextReveal>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-lg text-emerald-100 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Revolutionary surfaces crafted with people and environment in mind.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <MagneticButton
            href="/ecosurfaces"
            variant="primary"
            size="lg"
            className="bg-emerald-500 text-stone-900 border-emerald-500 hover:bg-emerald-400"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
