"use client";

import { motion } from "framer-motion";
import { Shield, Palette, Award, Sparkles, Leaf, Gem } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";

const features = [
  { icon: Award, label: "Patented Designs", desc: "Exclusive surface patterns you won't find anywhere else" },
  { icon: Palette, label: "273+ Surfaces", desc: "India's widest collection of engineered quartz and granite" },
  { icon: Shield, label: "10-Year Warranty", desc: "Built for durability with industry-leading guarantees" },
  { icon: Sparkles, label: "4 Finish Options", desc: "Polished, Matte, Suede, and Velvet textures" },
  { icon: Leaf, label: "Eco Surfaces", desc: "Sustainable options crafted with environmental care" },
  { icon: Gem, label: "Luxury Grade", desc: "Premium materials for architects and interior designers" },
];

export function FeaturesSection() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <TextReveal
            as="span"
            className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4"
          >
            Why Pacific Surfaces
          </TextReveal>
          <TextReveal
            as="h2"
            delay={0.15}
            className="text-4xl sm:text-5xl font-light tracking-tight text-stone-900 justify-center"
          >
            Engineered for Perfection
          </TextReveal>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <AnimatedSection key={feat.label} animation="fadeUp" delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-white border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feat.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-2 tracking-tight">
                  {feat.label}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandMarquee() {
  const items = [
    "CHROMIA",
    "KOSMIC",
    "AURORA",
    "NEBULA",
    "CELESTIA",
    "LUMINARA",
    "GRANITE",
    "QUARTZ",
  ];

  return (
    <div className="py-8 bg-stone-900 overflow-hidden">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-sm font-medium tracking-[0.3em] text-stone-500"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
