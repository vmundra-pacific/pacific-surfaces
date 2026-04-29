"use client";

import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const partnerCards = [
  {
    title: "Distributors",
    description:
      "Gain access to an extensive range of exquisite Quartz Slabs. Our Super Jumbo collection is sure to impress your clients and elevate your offerings.",
    href: "/contact?type=distributor",
  },
  {
    title: "Architects & Interior Designers",
    description:
      "Discover an exceptional range of Super Jumbo Quartz Slabs, crafted to inspire your boldest designs. Perfect for architects and interior designers seeking seamless beauty and elevated sophistication in every space.",
    href: "/contact?type=architect",
  },
  {
    title: "Fabricators",
    description:
      "Source top-grade Quartz slabs that meet the highest standards. Our collection includes a wide range of colors and patterns, providing you with endless possibilities to create stunning countertops.",
    href: "/contact?type=fabricator",
  },
];

export function PartnerWithUs() {
  return (
    <section className="relative py-20 sm:py-28 md:py-36 px-6 bg-stone-950 overflow-hidden">
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-20">
          <TextReveal
            as="h2"
            className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white"
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
              <Link href={card.href}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className="group p-6 sm:p-8 bg-stone-900 rounded-2xl border border-stone-800 hover:border-stone-700 transition-colors h-full flex flex-col"
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
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-20 flex justify-center"
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
