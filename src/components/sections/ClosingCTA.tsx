"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function ClosingCTA() {
  return (
    <section className="relative py-32 sm:py-40 px-6 bg-[#112732] overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <TextReveal
          as="h2"
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-[1.1] justify-center"
        >
          Your next project starts with a sample.
        </TextReveal>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton
            href="/contact"
            variant="primary"
            size="lg"
            className="bg-white text-[#112732] border-white hover:bg-stone-100"
          >
            Request a Sample
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            href="/visualize"
            variant="outline"
            size="lg"
            className="text-white border-white/30 hover:border-white hover:bg-white/5"
          >
            Try the Visualizer
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
