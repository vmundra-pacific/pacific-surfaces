"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

export function StorySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["40px", "-40px"]);

  return (
    <section
      ref={containerRef}
      className="py-28 sm:py-36 px-6 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column - Text */}
          <div className="flex flex-col justify-start">
            {/* Heading */}
            <TextReveal
              as="h2"
              className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900"
            >
              The Way We Do It
            </TextReveal>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg text-stone-600 font-light leading-relaxed max-w-lg"
            >
              Our journey begins where conventionality ends. We have never been
              accustomed to the word &apos;impossible&apos;. At Pacific we are
              exceptionally skilled at our craft. Challenges are our guiding
              stars, and innovation is our trusted compass. With a legacy deeply
              rooted in the artistry of stones, our artists transform raw
              materials into exquisite works of functional art.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10"
            >
              <MagneticButton
                href="/about"
                variant="primary"
                size="lg"
                className="bg-stone-900 text-white border-stone-900 hover:bg-stone-800"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right column - Decorative element */}
          <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
            <motion.div
              style={{ y }}
              className="absolute inset-0 bg-stone-900 rounded-2xl overflow-hidden"
            >
              {/* Placeholder for decorative content */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="text-6xl md:text-7xl font-light text-stone-700 mb-4">
                    10+
                  </div>
                  <p className="text-stone-500 font-light text-lg">
                    Years of Excellence
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
