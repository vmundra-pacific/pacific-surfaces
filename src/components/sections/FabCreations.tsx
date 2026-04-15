"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const fabProducts = [
  {
    name: "Alpine White",
    image:
      "https://static.wixstatic.com/media/bf5166_02adca27941f4f039746dd6853c78858~mv2.jpg/v1/fit/w_1688,h_1688,q_90/file.jpg",
  },
  {
    name: "Monalisa",
    image:
      "https://static.wixstatic.com/media/bf5166_472def5b6b6642228107ff13025f0e58~mv2.jpg/v1/fit/w_2013,h_1380,q_90/file.jpg",
  },
  {
    name: "Arctic White",
    image:
      "https://static.wixstatic.com/media/fd8707_7a1d45346df9425fb7eba254fd8b8096~mv2.jpg/v1/fit/w_1379,h_1379,q_90/file.jpg",
  },
  {
    name: "Patagonia",
    image:
      "https://static.wixstatic.com/media/fd8707_3f921330440f4103ac7d3bb1a7342d3a~mv2.jpg/v1/fit/w_2688,h_1792,q_90/file.jpg",
  },
  {
    name: "Alpinus White",
    image:
      "https://static.wixstatic.com/media/79abd5_1ef7e4c1e66f4ed49a4bcbbc547d4663~mv2.jpg",
  },
  {
    name: "Cristallo",
    image:
      "https://static.wixstatic.com/media/fd8707_81634e84e4a2420a878667b41ff82c96~mv2.jpg/v1/fit/w_5000,h_3500,q_90/file.jpg",
  },
];

export function FabCreations() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column - Text */}
          <div className="flex flex-col justify-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-8 text-xs font-medium tracking-[0.25em] uppercase text-stone-500 border border-stone-200 rounded-full">
                Fabricated and Ready to Install
              </span>
            </motion.div>

            {/* Heading */}
            <TextReveal
              as="h2"
              className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900"
            >
              Fab Creations
            </TextReveal>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-lg text-stone-600 font-light leading-relaxed max-w-lg"
            >
              We specialize in premium, cut-to-size quartz surfaces designed to
              elevate architectural and design projects to new heights. Leveraging
              the power of our state-of-the-art Breton production line, we deliver
              unparalleled precision, durability, and visual elegance.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10"
            >
              <MagneticButton
                href="/products"
                variant="primary"
                size="lg"
                className="bg-stone-900 text-white border-stone-900 hover:bg-stone-800"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right column - Product Grid */}
          <div className="grid grid-cols-2 gap-4">
            {fabProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + index * 0.05,
                }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square bg-stone-100">
                  {/* Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.image})` }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                  {/* Product name */}
                  <div className="absolute inset-0 flex items-end p-4">
                    <p className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {product.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
