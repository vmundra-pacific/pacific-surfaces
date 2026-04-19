"use client";

import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface SanityApplicationCard {
  _id: string;
  label: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
}

const fallbackApps = [
  {
    n: "01 · Kitchen",
    title: "Countertops\n& Islands",
    desc: 'Heat-, stain-, and scratch-resistant. Seamless 131" slabs reduce the need for joints on large islands.',
    bg: "from-stone-200 to-stone-100",
  },
  {
    n: "02 · Bath",
    title: "Vanities\n& Shower Walls",
    desc: "Non-porous. Will not harbour bacteria or absorb water. Greenguard Gold certified for indoor air quality.",
    bg: "from-stone-100 to-stone-50",
  },
  {
    n: "03 · Architecture",
    title: "Wall Cladding\n& Façades",
    desc: "UV-stable outdoor-rated finishes for hotels, retail, and commercial envelopes. BIM files available.",
    bg: "from-stone-600 to-stone-500",
  },
  {
    n: "04 · Commercial",
    title: "Hospitality\n& Healthcare",
    desc: "NSF/ANSI 51 food-contact safe. Used across QSR chains, luxury hotels, and hospital clean surfaces.",
    bg: "from-stone-700 to-stone-600",
  },
];

const gradientFallbacks = [
  "from-stone-200 to-stone-100",
  "from-stone-100 to-stone-50",
  "from-stone-600 to-stone-500",
  "from-stone-700 to-stone-600",
];

export function ApplicationCards({
  applications,
}: {
  applications?: SanityApplicationCard[];
}) {
  const hasSanity = applications && applications.length > 0;

  return (
    <section className="py-20 md:py-28 px-6 bg-[#0a1620]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
          <div className="lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4"
            >
              03 · Applications
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.08]"
            >
              Wherever stone would normally be.
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:max-w-md lg:pt-12"
          >
            <p className="text-base font-light text-stone-400 leading-relaxed">
              Rated for residential and commercial use. Passes food-contact,
              low-emission, and fire safety standards in North America, the EU,
              and India.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hasSanity
            ? applications.map((a, i) => {
                const card = (
                  <div className="group rounded-2xl overflow-hidden bg-[#112732] hover:bg-[#1a3545] transition-colors">
                    <div className="aspect-[4/3] relative">
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt={a.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradientFallbacks[i % gradientFallbacks.length]}`}
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#9AA8B6] mb-3">
                        {a.label}
                      </div>
                      <h4 className="text-lg font-light tracking-tight text-white leading-snug mb-3 whitespace-pre-line">
                        {a.title}
                      </h4>
                      <p className="text-sm font-light text-stone-400 leading-relaxed">
                        {a.description}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <StaggerItem key={a._id}>
                    {a.link ? (
                      <Link href={a.link} className="block">
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </StaggerItem>
                );
              })
            : fallbackApps.map((a) => (
                <StaggerItem key={a.n}>
                  <div className="group rounded-2xl overflow-hidden bg-[#112732] hover:bg-[#1a3545] transition-colors">
                    <div
                      className={`aspect-[4/3] bg-gradient-to-br ${a.bg} relative`}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#9AA8B6] mb-3">
                        {a.n}
                      </div>
                      <h4 className="text-lg font-light tracking-tight text-white leading-snug mb-3 whitespace-pre-line">
                        {a.title}
                      </h4>
                      <p className="text-sm font-light text-stone-400 leading-relaxed">
                        {a.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
