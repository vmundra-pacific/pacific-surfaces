"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";

const collections = [
  {
    name: "Chromia",
    slug: "chromia",
    description: "Patented designer quartz with bold veining and marble-like depth",
    image: "https://static.wixstatic.com/media/bf5166_02adca27941f4f039746dd6853c78858~mv2.jpg/v1/fit/w_1688,h_1688,q_90/file.jpg",
    count: "30+",
  },
  {
    name: "Kosmic",
    slug: "kosmic",
    description: "Engineered quartzite surfaces with celestial patterns and textures",
    image: "https://static.wixstatic.com/media/bf5166_472def5b6b6642228107ff13025f0e58~mv2.jpg/v1/fit/w_2013,h_1380,q_90/file.jpg",
    count: "40+",
  },
  {
    name: "Granite",
    slug: "granite",
    description: "Natural Indian granite in stunning finishes for enduring beauty",
    image: "https://static.wixstatic.com/media/fd8707_7a1d45346df9425fb7eba254fd8b8096~mv2.jpg/v1/fit/w_1379,h_1379,q_90/file.jpg",
    count: "50+",
  },
];

export function CollectionShowcase() {
  return (
    <section className="py-28 sm:py-36 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div>
            <TextReveal
              as="span"
              className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4"
            >
              Our Collections
            </TextReveal>
            <TextReveal
              as="h2"
              delay={0.15}
              className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900"
            >
              Curated for Excellence
            </TextReveal>
          </div>
          <Link
            href="/collections"
            className="group flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-stone-500 hover:text-stone-900 transition-colors"
          >
            View All Collections
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Collection grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col, i) => (
            <StaggerItem key={col.slug} animation="fadeUp">
              <Link href={`/collections/${col.slug}`} className="group block">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                  className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-stone-100"
                >
                  {/* Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${col.image})` }}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Count badge */}
                  <div className="absolute top-5 right-5 px-3 py-1 text-xs font-medium tracking-wider text-white/80 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                    {col.count} designs
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2">
                      {col.name}
                    </h3>
                    <p className="text-sm text-stone-300 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {col.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-white/70 group-hover:text-white transition-colors">
                      Explore
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
