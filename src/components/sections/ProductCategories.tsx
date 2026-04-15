"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";

const categories = [
  {
    name: "Quartz Surfaces",
    description:
      "Explore exquisite mineral surfaces crafted by combining artistic vision & innovation",
    href: "/products",
    image:
      "https://static.wixstatic.com/media/bf5166_02adca27941f4f039746dd6853c78858~mv2.jpg/v1/fit/w_1688,h_1688,q_90/file.jpg",
  },
  {
    name: "Granites",
    description:
      "Versatile stones from subtle whites to deep blacks, and everything in between.",
    href: "/granites",
    image:
      "https://static.wixstatic.com/media/fd8707_7a1d45346df9425fb7eba254fd8b8096~mv2.jpg/v1/fit/w_1379,h_1379,q_90/file.jpg",
  },
  {
    name: "Stone Finishes",
    description:
      "Special textures and modern finishing that transform your space into a realm of contemporary luxury.",
    href: "/granites",
    image:
      "https://static.wixstatic.com/media/fd8707_3f921330440f4103ac7d3bb1a7342d3a~mv2.jpg/v1/fit/w_2688,h_1792,q_90/file.jpg",
  },
  {
    name: "Exotic Collection",
    description:
      "A premium collection of exotic slabs showcasing rare patterns, bold veining, and natural luxury.",
    href: "/collections",
    image:
      "https://static.wixstatic.com/media/bf5166_472def5b6b6642228107ff13025f0e58~mv2.jpg/v1/fit/w_2013,h_1380,q_90/file.jpg",
  },
  {
    name: "Semi-Precious",
    description:
      "True jewels of nature that lift the aesthetics of your home to unsurpassed extravagance.",
    href: "/semi-precious",
    image:
      "https://static.wixstatic.com/media/79abd5_1ef7e4c1e66f4ed49a4bcbbc547d4663~mv2.jpg",
  },
  {
    name: "Soapstone",
    description:
      "The aesthetic appearance along with its characteristics make it a perfect choice for your construction needs.",
    href: "/products",
    image:
      "https://static.wixstatic.com/media/fd8707_81634e84e4a2420a878667b41ff82c96~mv2.jpg/v1/fit/w_5000,h_3500,q_90/file.jpg",
  },
];

export function ProductCategories() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <TextReveal
            as="span"
            className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4"
          >
            Collection Overview
          </TextReveal>
          <TextReveal
            as="h2"
            delay={0.15}
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900 mt-4"
          >
            Explore Our Surfaces
          </TextReveal>
          <TextReveal
            as="p"
            delay={0.3}
            className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto font-light leading-relaxed"
          >
            From engineered quartz to natural granite, discover the perfect surface for your vision.
          </TextReveal>
        </div>

        {/* Categories grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <StaggerItem key={category.name} animation="fadeUp">
              <Link href={category.href} className="group block h-full">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-stone-100 h-full"
                >
                  {/* Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${category.image})` }}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-stone-300 font-light leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-white/70 group-hover:text-white transition-colors">
                      View More
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
