"use client";

import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const partnerCards = [
  {
    title: "Distributors",
    description:
      "Gain access to an extensive range of exquisite Quartz Slabs. Our Super Jumbo collection is sure to impress your clients and elevate your offerings.",
  },
  {
    title: "Architects & Interior Designers",
    description:
      "Discover an exceptional range of Super Jumbo Quartz Slabs, crafted to inspire your boldest designs. Perfect for architects and interior designers seeking seamless beauty and elevated sophistication in every space.",
  },
  {
    title: "Fabricators",
    description:
      "Source top-grade Quartz slabs that meet the highest standards. Our collection includes a wide range of colors and patterns, providing you with endless possibilities to create stunning countertops.",
  },
];

export function PartnerWithUs() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-stone-950">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <TextReveal
            as="h2"
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white"
          >
            Partner With Us
          </TextReveal>
          <TextReveal
            as="p"
            delay={0.2}
            className="mt-6 text-lg text-stone-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Join us on this exciting journey as we shape the future of stones.
          </TextReveal>
        </div>

        {/* Partner cards grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partnerCards.map((card) => (
            <StaggerItem key={card.title} animation="fadeUp">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="group p-8 bg-stone-900 rounded-2xl border border-stone-800 hover:border-stone-700 transition-colors h-full flex flex-col"
              >
                {/* Title */}
                <h3 className="text-2xl font-light text-white tracking-tight mb-4">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-stone-400 font-light leading-relaxed flex-grow mb-6">
                  {card.description}
                </p>

                {/* Arrow icon */}
                <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-stone-500 group-hover:text-white transition-colors">
                  <span>Learn More</span>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 flex justify-center"
        >
          <MagneticButton
            href="/contact"
            variant="primary"
            size="lg"
            className="bg-white text-stone-900 border-white hover:bg-stone-100"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
