"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const benefits = [
  {
    number: "01",
    title: "Patented Design Innovation",
    highlight: "273+ unique surfaces",
    description:
      "Every Pacific surface is born from our state-of-the-art Bretonstone plant, combining Italian precision engineering with artistic vision. Our patented designs ensure you get surfaces that cannot be found anywhere else in the world.",
  },
  {
    number: "02",
    title: "Sustainable Manufacturing",
    highlight: "Zero compromise",
    description:
      "Powered by 2MW solar energy and Siemens Gamesa windmill technology, our fully automated plant incorporates eco-friendly practices throughout the production cycle. Ecosurfaces with zero crystalline silica protect both people and the planet.",
  },
  {
    number: "03",
    title: "Global Reach, Local Craft",
    highlight: "From India to the world",
    description:
      "With manufacturing in India, warehousing in Poland, and distribution across 6 continents, Pacific delivers premium surfaces to architects, designers, and homeowners worldwide. A 25% year-over-year growth rate speaks to our relentless pursuit of excellence.",
  },
];

export function BenefitsSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative" style={{ height: `${benefits.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-stone-950">
        {/* Grain texture */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {benefits.map((benefit, index) => {
          const start = index / benefits.length;
          const end = (index + 1) / benefits.length;
          const mid = (start + end) / 2;

          return (
            <BenefitCard
              key={benefit.number}
              benefit={benefit}
              scrollYProgress={scrollYProgress}
              start={start}
              end={end}
              mid={mid}
            />
          );
        })}
      </div>
    </section>
  );
}

function BenefitCard({
  benefit,
  scrollYProgress,
  start,
  end,
  mid,
}: {
  benefit: (typeof benefits)[number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  mid: number;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, mid, end - 0.05, end],
    [0, 1, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.08, end - 0.08, end],
    [100, 0, 0, -100]
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center z-10"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Number + Title */}
          <div>
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-stone-500 mb-6 block">
              Benefit {benefit.number}
            </span>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.1]">
              <span className="text-stone-400">A </span>
              {benefit.highlight}
              <span className="text-stone-400"> for</span>
            </h3>
            <p className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.1]">
              {benefit.title.toLowerCase()}
            </p>
          </div>

          {/* Right: Description */}
          <div>
            <p className="text-lg sm:text-xl text-stone-400 font-light leading-relaxed">
              {benefit.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
