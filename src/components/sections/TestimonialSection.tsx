"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote: "Pacific surfaces transformed our entire project. The quality and consistency of their quartz slabs is unmatched in the industry.",
    author: "Leading Architecture Firm",
    role: "Principal Architect",
    location: "Mumbai, India",
  },
  {
    quote: "The Ecosurfaces line gave us a sustainable option without compromising on the luxury our clients expect. A game-changer for modern design.",
    author: "Premium Interior Studio",
    role: "Design Director",
    location: "Dubai, UAE",
  },
  {
    quote: "From sample to installation, Pacific delivered with precision and care. Their global logistics made our international project seamless.",
    author: "International Design Group",
    role: "Project Lead",
    location: "Warsaw, Poland",
  },
];

export function TestimonialSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative py-32 sm:py-44 bg-stone-950 overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div style={{ y }} className="mb-20">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 block mb-6">
            Trusted Worldwide
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-[1.1] max-w-3xl">
            Built by craftsmen, trusted by industry leaders
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative p-8 rounded-2xl bg-stone-900/50 border border-stone-800/50 backdrop-blur-sm"
            >
              {/* Quote mark */}
              <div className="text-6xl font-serif text-stone-700 leading-none mb-4">&ldquo;</div>

              <p className="text-stone-300 font-light leading-relaxed text-base mb-8">
                {item.quote}
              </p>

              <div className="border-t border-stone-800 pt-6">
                <p className="text-white text-sm font-medium">{item.author}</p>
                <p className="text-stone-500 text-xs mt-1">{item.role}</p>
                <p className="text-stone-600 text-xs mt-0.5">{item.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
