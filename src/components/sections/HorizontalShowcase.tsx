"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const showcaseItems = [
  {
    title: "Quartz Surfaces",
    description: "Exquisite mineral surfaces crafted by combining artistic vision & innovation",
    image: "https://static.wixstatic.com/media/bf5166_02adca27941f4f039746dd6853c78858~mv2.jpg/v1/fit/w_1688,h_1688,q_90/file.jpg",
    href: "/products",
  },
  {
    title: "Kosmic Collection",
    description: "Engineered quartzite surfaces with celestial patterns and textures",
    image: "https://static.wixstatic.com/media/bf5166_472def5b6b6642228107ff13025f0e58~mv2.jpg/v1/fit/w_2013,h_1380,q_90/file.jpg",
    href: "/collections/kosmic-collection",
  },
  {
    title: "Natural Granites",
    description: "Versatile stones from subtle whites to deep blacks, and everything in between",
    image: "https://static.wixstatic.com/media/fd8707_7a1d45346df9425fb7eba254fd8b8096~mv2.jpg/v1/fit/w_1379,h_1379,q_90/file.jpg",
    href: "/granites",
  },
  {
    title: "Ecosurfaces",
    description: "Revolutionary zero-silica surfaces crafted with people and environment in mind",
    image: "https://static.wixstatic.com/media/fd8707_3f921330440f4103ac7d3bb1a7342d3a~mv2.jpg/v1/fit/w_2688,h_1792,q_90/file.jpg",
    href: "/ecosurfaces",
  },
  {
    title: "Semi-Precious",
    description: "True jewels of nature that lift aesthetics to unsurpassed extravagance",
    image: "https://static.wixstatic.com/media/79abd5_1ef7e4c1e66f4ed49a4bcbbc547d4663~mv2.jpg",
    href: "/semi-precious",
  },
];

export function HorizontalShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Section header */}
        <div className="px-6 lg:px-12 mb-12">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-stone-400 mb-4 block">
            Our Surfaces
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-stone-900">
            Explore the Collection
          </h2>
        </div>

        {/* Horizontal scroll track */}
        <motion.div style={{ x }} className="flex gap-6 pl-6 lg:pl-12">
          {showcaseItems.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex-shrink-0 w-[70vw] sm:w-[50vw] lg:w-[35vw] relative"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100">
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                {/* Number */}
                <div className="absolute top-6 left-6 text-xs font-medium tracking-[0.2em] text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-300 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-white/60 group-hover:text-white transition-colors">
                    Explore
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
