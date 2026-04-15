"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative py-36 sm:py-44 px-6 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20 -bottom-20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/70 to-stone-950/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://static.wixstatic.com/media/fd8707_3f921330440f4103ac7d3bb1a7342d3a~mv2.jpg/v1/fit/w_2688,h_1792,q_90/file.jpg')",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <TextReveal
          as="h2"
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white justify-center leading-[1.1]"
        >
          Ready to Transform Your Space?
        </TextReveal>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 text-lg text-stone-300 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Connect with our surface specialists. From selection to installation, we guide you through every step of creating your perfect space.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton
            href="/contact"
            variant="primary"
            size="lg"
            className="bg-white text-stone-900 border-white hover:bg-stone-100"
          >
            Get a Free Quote
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            href="/products"
            variant="outline"
            size="lg"
            className="text-white border-stone-400/40 hover:border-white hover:bg-white/5"
          >
            Browse Catalog
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
