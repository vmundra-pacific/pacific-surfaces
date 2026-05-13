import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  ArrowRight,
  Building2,
  PenTool,
  HardHat,
  Briefcase,
  Handshake,
  Lightbulb,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Collaboration — Pacific Surfaces",
  description:
    "Partnerships for architects, designers, developers, and builders — co-creation, joint specifications, and bespoke finishes from Pacific Surfaces.",
  alternates: { canonical: "/professionals/collaboration" },
};

/**
 * /professionals/collaboration
 *
 * Editorial landing for Pacific's partner / collaboration programme.
 * Three audience cards (architects, designers, developers, builders),
 * three "how we co-create" pillars, a featured-projects placeholder,
 * and a CTA closer. Brand-system aligned (navy palette, pacific-mid
 * text, no slate/zinc/neutral grays).
 */

const audiences = [
  {
    icon: Building2,
    title: "Architects",
    body: "Long-form material partners on civic, hospitality, and residential commissions — from concept palettes through full spec packages and on-site QA.",
  },
  {
    icon: PenTool,
    title: "Interior Designers",
    body: "A library, a sounding board, a sample courier. We build alongside studios pushing for a specific tone — quiet, dramatic, or somewhere we haven't named yet.",
  },
  {
    icon: HardHat,
    title: "Developers & Builders",
    body: "Multi-unit specifications, staged dispatch, and predictable lead times. Our trade team is built around the operational rhythm of a real construction calendar.",
  },
  {
    icon: Briefcase,
    title: "Fabricators",
    body: "Technical training, edge-detail libraries, and direct lines to our production team. Our authorised fabricator network is small on purpose.",
  },
];

const pillars = [
  {
    icon: Handshake,
    title: "Joint Specification",
    body: "We sit in your design reviews. Slabs are selected the way the rest of the palette is — as part of the conversation, not after it.",
  },
  {
    icon: Lightbulb,
    title: "Custom Finishes",
    body: "Tone, scale, and finish development against a real brief. If the catalogue doesn't have it yet, our R&D bench can usually get there.",
  },
  {
    icon: FileCheck,
    title: "Project Documentation",
    body: "CAD-ready tile, slab, and finish details. Specification language, certifications, performance data — everything your set needs.",
  },
];

export default function CollaborationPage() {
  return (
    <main className="bg-[#0a1620] text-pacific-light">
      {/* ── 1. Hero ── */}
      <section className="relative min-h-[80vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src="/images/professions/collaboration.jpg"
          alt="Pacific Surfaces collaboration"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/15" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 w-full">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-pacific-mid/80 font-medium">
              Professionals · Collaboration
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] max-w-4xl">
              Partnerships, built{" "}
              <em className="italic font-light">surface by surface.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-pacific-light/85 leading-relaxed">
              The best surfaces don&apos;t arrive at the end of a project — they
              shape it. Pacific co-creates with architects, designers, and
              developers from the first sketch to the day the building opens.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 2. Audience cards ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Who we work with
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Built around how you actually work.
            </h2>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {audiences.map((a) => {
              const Icon = a.icon;
              return (
                <StaggerItem key={a.title} className="h-full">
                  <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 sm:p-8 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500 flex flex-col">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-pacific-light" />
                    </div>
                    <h3 className="mt-6 text-lg font-medium text-white tracking-tight">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base font-light text-pacific-mid leading-relaxed">
                      {a.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 3. How we co-create ── */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              How we co-create
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Three ways the partnership runs.
            </h2>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title} className="h-full">
                  <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-8 lg:p-10 hover:border-white/20 transition-all duration-500 flex flex-col">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Icon className="w-6 h-6 text-pacific-light" />
                    </div>
                    <h3 className="mt-6 text-xl font-light text-white tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-base font-light text-pacific-mid leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 4. Featured collaboration band ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <AnimatedSection animation="fadeUp">
              <div className="relative aspect-[5/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src="/images/spaces/architecture.png"
                  alt="Architecture and large-format facade collaboration"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={0.1}>
              <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
                In the field
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
                Quiet partners on loud buildings.
              </h2>
              <p className="mt-6 text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
                We don&apos;t name-drop. The clients we work with don&apos;t
                like to be name-dropped. What we will tell you: civic landmarks,
                listed hospitality interiors, residential towers, and a fair
                number of homes you would recognise if you walked in.
              </p>
              <p className="mt-4 text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
                Reach out and we&apos;ll walk you through references that match
                the scale and sensibility of your project — under NDA where it
                matters.
              </p>
              <div className="mt-8">
                <MagneticButton
                  href="/contact"
                  variant="outline-dark"
                  size="md"
                >
                  Request references
                </MagneticButton>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── 5. CTA closer ── */}
      <section className="bg-[#112732] border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Become a partner
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Let&apos;s build something worth coming back to.
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              We onboard a small number of studio and developer partners each
              quarter. Tell us about your practice and the work ahead.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Start the conversation
              </MagneticButton>
              <Link
                href="/professionals/programs"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
              >
                Explore trade programs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
