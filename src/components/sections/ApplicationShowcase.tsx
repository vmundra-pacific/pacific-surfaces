"use client";

import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";

const applications = [
  {
    number: "01",
    title: "Countertops",
    description:
      "Transform your kitchen with premium quartz and granite countertops engineered for beauty and durability.",
  },
  {
    number: "02",
    title: "Vanity Tops",
    description:
      "Elevate your bathroom with seamless vanity surfaces that combine luxury with practicality.",
  },
  {
    number: "03",
    title: "Wall Cladding",
    description:
      "Create stunning accent walls and feature surfaces with our engineered stone cladding solutions.",
  },
  {
    number: "04",
    title: "Backsplash",
    description:
      "Complete your kitchen design with coordinated backsplash surfaces in matching finishes.",
  },
];

export function ApplicationShowcase() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <TextReveal
            as="h2"
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900"
          >
            Transform How You See the World Around You
          </TextReveal>
          <TextReveal
            as="p"
            delay={0.2}
            className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Unearth your perfect countertop; meticulously crafted for enduring beauty and lasting durability.
          </TextReveal>
        </div>

        {/* Applications grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {applications.map((app, i) => (
            <StaggerItem key={app.number} animation="fadeUp">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="group p-8 bg-white rounded-2xl border border-stone-200/50 hover:border-stone-300 transition-colors"
              >
                {/* Number */}
                <div className="text-4xl font-light text-stone-300 group-hover:text-stone-400 transition-colors mb-6">
                  {app.number}
                </div>

                {/* Title */}
                <h3 className="text-xl font-light text-stone-900 tracking-tight mb-4 group-hover:underline underline-offset-4 decoration-stone-300 transition-colors">
                  {app.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-stone-600 font-light leading-relaxed">
                  {app.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
