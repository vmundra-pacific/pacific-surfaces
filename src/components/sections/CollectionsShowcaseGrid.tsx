"use client";

import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface SanityCollection {
  _id: string;
  name: string;
  slug: { current: string };
  image: string | null;
  tag: string | null;
  headline: string | null;
  finishCount: string | null;
  showcaseLayout: "wide" | "narrow" | null;
  productCount: number;
}

// Fallback data when Sanity has no collections yet
const fallbackCollections = [
  {
    name: "Calacatta Couture",
    finishCount: "24 Finishes",
    tag: "Signature",
    headline: "The Centrepiece.",
    slug: "centrepiece-couture",
    wide: true,
    bg: "bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50",
  },
  {
    name: "Nebula",
    finishCount: "12 Finishes",
    tag: "New",
    headline: "Nebula.",
    slug: "nebula-collection",
    wide: false,
    bg: "bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500",
  },
  {
    name: "Kosmic",
    finishCount: "18 Finishes",
    tag: null,
    headline: "Kosmic.",
    slug: "kosmic-collection",
    wide: false,
    bg: "bg-gradient-to-br from-amber-900/60 via-stone-700 to-stone-600",
  },
  {
    name: "Statuario",
    finishCount: "9 Finishes",
    tag: null,
    headline: "Statuario.",
    slug: "statuario",
    wide: false,
    bg: "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
  },
  {
    name: "Ecosurfaces",
    finishCount: "Recycled Content",
    tag: "Silica-Free",
    headline: "Ecosurfaces.",
    slug: "ecosurfaces",
    wide: true,
    bg: "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600",
  },
];

const gradientFallbacks = [
  "bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50",
  "bg-gradient-to-br from-stone-700 via-stone-600 to-stone-500",
  "bg-gradient-to-br from-amber-900/60 via-stone-700 to-stone-600",
  "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
  "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600",
];

export function CollectionsShowcaseGrid({
  collections,
}: {
  collections?: SanityCollection[];
}) {
  const hasSanityData = collections && collections.length > 0;

  return (
    <section className="py-20 md:py-28 px-6 bg-white" id="collections">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
          <div className="lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-4"
            >
              01 · Collections
            </motion.div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-[1.08]"
            >
              A library of surfaces drawn from every continent.
            </TextReveal>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:max-w-md lg:pt-12"
          >
            <p className="text-base font-light text-stone-700 leading-relaxed">
              Six signature collections. Over 140 finishes. Each one engineered
              to pass a fabricator&apos;s test and an architect&apos;s eye —
              then specified in homes, hotels, and hospitals around the world.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-12 auto-rows-[320px] gap-4">
          {hasSanityData
            ? collections.map((col, i) => {
                const isWide = col.showcaseLayout === "wide";
                const slug = col.slug?.current || "";
                return (
                  <StaggerItem
                    key={col._id}
                    className={isWide ? "md:col-span-8" : "md:col-span-4"}
                  >
                    <Link
                      href={`/collections/${slug}`}
                      className="group relative block rounded-2xl overflow-hidden h-full"
                    >
                      {/* Background */}
                      {col.image ? (
                        <Image
                          src={col.image}
                          alt={col.name}
                          fill
                          className="object-cover"
                          sizes={isWide ? "66vw" : "33vw"}
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 ${gradientFallbacks[i % gradientFallbacks.length]}`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Tag */}
                      {col.tag && (
                        <span className="absolute top-5 left-5 z-10 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-[0.18em] uppercase text-white">
                          {col.tag}
                        </span>
                      )}

                      {/* Caption */}
                      <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] tracking-[0.12em] text-white/60 mb-1">
                            {col.name} ·{" "}
                            {col.finishCount || `${col.productCount} Products`}
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                            {col.headline || col.name}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })
            : fallbackCollections.map((col) => (
                <StaggerItem
                  key={col.slug}
                  className={col.wide ? "md:col-span-8" : "md:col-span-4"}
                >
                  <Link
                    href={`/collections/${col.slug}`}
                    className="group relative block rounded-2xl overflow-hidden h-full"
                  >
                    <div className={`absolute inset-0 ${col.bg}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {col.tag && (
                      <span className="absolute top-5 left-5 z-10 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-[0.18em] uppercase text-white">
                        {col.tag}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex items-end justify-between">
                      <div>
                        <div className="text-[11px] tracking-[0.12em] text-white/60 mb-1">
                          {col.name} · {col.finishCount}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                          {col.headline}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
