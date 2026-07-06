import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Applications — Pacific Surfaces",
  description:
    "Where Pacific surfaces install best — kitchens, bathrooms, facades, hospitality, and commercial interiors, with performance specs by use case.",
  alternates: { canonical: "/professionals/applications" },
};

/**
 * /professionals/applications
 *
 * Use-case landing for Pacific surfaces. Each application card pairs
 * a room/sector image with a short brief on what Pacific does well
 * in that context. Sections:
 *
 *   1. Hero
 *   2. Application grid (kitchens, bathrooms, facades, commercial, hospitality, healthcare)
 *   3. Performance band (4 spec callouts)
 *   4. CTA
 *
 * No competitor product names. Brand palette only.
 */

const applications = [
  {
    slug: "kitchens",
    name: "Kitchens",
    image: "/images/spaces/kitchens.png",
    body: "Worktops, islands, and splashbacks engineered for daily use — heat-resistant, hygienic, and seamlessly joined for large spans.",
    href: "/spaces/kitchens",
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    image: "/images/spaces/bathrooms.jpg",
    body: "Vanities, shower walls, and full-height cladding in non-porous quartz and natural stone — moisture-stable, low-maintenance, designed to last.",
    href: "/spaces/bathrooms",
  },
  {
    slug: "facades",
    name: "Facades & Cladding",
    image: "/images/spaces/architecture.png",
    body: "Large-format external and internal cladding, ventilated facades, and feature walls in Beyond Finish and natural-stone formats.",
    href: "/spaces/architecture",
  },
  {
    slug: "commercial",
    name: "Commercial Interiors",
    image: "/images/spaces/commercial.jpg",
    body: "Reception desks, partition systems, lift lobbies, and workstations — surfaces specified for high-traffic, brand-critical environments.",
    href: "/spaces/commercial",
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    image: "/images/spaces/commercial.jpg",
    body: "Bar tops, restaurant counters, hotel bathrooms, and signature feature walls — material identity that holds up to a full service week.",
    href: "/spaces/hospitality",
  },
  {
    slug: "outdoor",
    name: "Outdoor & Wet Areas",
    image: "/images/spaces/architecture.png",
    body: "Pool surrounds, terrace counters, and outdoor kitchens — UV-stable, freeze-thaw rated, and built for the elements.",
    href: "/spaces/outdoor",
  },
];

const specs = [
  {
    label: "Hygiene",
    value: "NSF 51",
    body: "Certified safe for direct food contact across our engineered range.",
  },
  {
    label: "Indoor air",
    value: "Greenguard Gold",
    body: "Low-VOC emissions verified for schools, healthcare, and homes.",
  },
  {
    label: "Quality system",
    value: "ISO 9001:2015",
    body: "Manufacturing and dispatch operating to an audited quality system.",
  },
  {
    label: "External use",
    value: "CE Marked",
    body: "Conformity for use as a construction product across the EU.",
  },
];

export default function ApplicationsPage() {
  return (
    <main className="bg-[#0a1620] text-pacific-light">
      {/* ── 1. Hero ── */}
      <section className="relative min-h-[80vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src="/images/professions/applications.jpg"
          alt="Pacific Surfaces applications"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/15" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 w-full">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-pacific-mid/80 font-medium">
              Professionals · Applications
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] max-w-4xl">
              Engineered for <em className="italic font-light">every brief.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-pacific-light/85 leading-relaxed">
              From a single kitchen island to a hundred-metre ventilated facade
              — Pacific surfaces are specified, fabricated, and installed across
              the full range of residential, commercial, and architectural
              applications.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 2. Application grid ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Where they install
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Six contexts, one material library.
            </h2>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {applications.map((app) => (
              <StaggerItem key={app.slug} className="h-full">
                <Link
                  href={app.href}
                  className="group block h-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={app.image}
                      alt={app.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                      <h3 className="text-xl sm:text-2xl font-light tracking-tight">
                        {app.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <div className="p-6 sm:p-7">
                    <p className="text-sm sm:text-base font-light text-pacific-mid leading-relaxed">
                      {app.body}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 3. Performance specs ── */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Performance, certified
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Specified once, holds up forever.
            </h2>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {specs.map((s) => (
              <StaggerItem key={s.value} className="h-full">
                <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-7 sm:p-8 flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
                    <Check className="w-3.5 h-3.5 text-pacific-light" />
                    {s.label}
                  </div>
                  <div className="mt-4 text-2xl sm:text-3xl font-light text-white tracking-tight">
                    {s.value}
                  </div>
                  <p className="mt-3 text-sm font-light text-pacific-mid leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 4. CTA closer ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Match material to brief
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Not sure which surface fits the application?
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Tell us where it&apos;s going — the room, the loads, the look.
              We&apos;ll shortlist three slabs that work and explain why.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Ask for a recommendation
              </MagneticButton>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
              >
                Browse all surfaces
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
