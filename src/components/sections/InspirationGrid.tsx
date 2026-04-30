"use client";

import { useState } from "react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { TextReveal } from "@/components/ui/text-reveal";
import Image from "next/image";
import Link from "next/link";

interface SanityInspiration {
  _id: string;
  name: string;
  category: string;
  image: string | null;
  productSlug: string | null;
}

const filterOptions = [
  "All",
  "Kitchens",
  "Baths",
  "Floors & Walls",
  "Commercial",
];

const fallbackInspirations = [
  {
    name: "Calacatta · Kitchen Island",
    cat: "Kitchens",
    bg: "from-stone-200 to-stone-100",
  },
  {
    name: "Nebula · Floor + Wall",
    cat: "Floors & Walls",
    bg: "from-stone-600 to-stone-500",
  },
  {
    name: "Statuario · Bath Vanity",
    cat: "Baths",
    bg: "from-stone-100 to-stone-200",
  },
  {
    name: "Kosmic · Kitchen Wall",
    cat: "Kitchens",
    bg: "from-amber-900/50 to-stone-600",
  },
  {
    name: "Ecosurface · Counter",
    cat: "Kitchens",
    bg: "from-stone-400 to-stone-500",
  },
  {
    name: "Granite · Façade",
    cat: "Commercial",
    bg: "from-stone-700 to-stone-800",
  },
  { name: "Nebula · Vanity", cat: "Baths", bg: "from-stone-500 to-stone-600" },
  {
    name: "Calacatta · Backsplash",
    cat: "Kitchens",
    bg: "from-stone-200 to-stone-300",
  },
];

const gradientFallbacks = [
  "from-stone-200 to-stone-100",
  "from-stone-600 to-stone-500",
  "from-stone-100 to-stone-200",
  "from-amber-900/50 to-stone-600",
  "from-stone-400 to-stone-500",
  "from-stone-700 to-stone-800",
  "from-stone-500 to-stone-600",
  "from-stone-200 to-stone-300",
];

export function InspirationGrid({
  inspirations,
}: {
  inspirations?: SanityInspiration[];
}) {
  const [active, setActive] = useState("All");
  const hasSanity = inspirations && inspirations.length > 0;

  const items = hasSanity
    ? inspirations.map((insp) => ({
        key: insp._id,
        name: insp.name,
        cat: insp.category,
        image: insp.image,
        productSlug: insp.productSlug,
      }))
    : fallbackInspirations.map((insp) => ({
        key: insp.name,
        name: insp.name,
        cat: insp.cat,
        image: null as string | null,
        productSlug: null as string | null,
        bg: insp.bg,
      }));

  const filtered =
    active === "All" ? items : items.filter((i) => i.cat === active);

  return (
    <section
      id="sec-inspiration"
      className="py-16 sm:py-20 md:py-28 px-6 bg-[#DAE1E8] scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header + filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 sm:mb-14">
          <div>
            <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-3">
              06 · Inspiration
            </div>
            <TextReveal
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-stone-900 leading-[1.08]"
            >
              How designers are using Pacific.
            </TextReveal>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.1em] uppercase transition-colors ${
                  active === f
                    ? "bg-stone-900 text-white"
                    : "bg-white/60 text-stone-600 hover:bg-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((insp, i) => {
            const inner = (
              <>
                {insp.image ? (
                  <Image
                    src={insp.image}
                    alt={insp.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${"bg" in insp ? (insp as { bg: string }).bg : gradientFallbacks[i % gradientFallbacks.length]} group-hover:scale-105 transition-transform duration-500`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <div className="text-xs font-light text-white/90">
                    {insp.name}
                  </div>
                </div>
              </>
            );

            return (
              <StaggerItem key={insp.key}>
                {insp.productSlug ? (
                  <Link
                    href={`/products/${insp.productSlug}`}
                    className="group relative block rounded-xl overflow-hidden aspect-[3/4] cursor-pointer"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer">
                    {inner}
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
