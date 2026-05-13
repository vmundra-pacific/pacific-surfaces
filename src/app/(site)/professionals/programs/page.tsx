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
  Award,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Programs — Pacific Surfaces",
  description:
    "Trade incentives, education, and certification for fabricators, designers, and dealers in the Pacific Surfaces partner network.",
  alternates: { canonical: "/professionals/programs" },
};

/**
 * /professionals/programs
 *
 * Trade-incentive + education landing. Four program pillars, a
 * benefits checklist, and a "how to join" closer. Same dark-navy
 * design language as the rest of /professionals.
 */

const programs = [
  {
    icon: Award,
    title: "Pacific Loyalty",
    body: "Trade-only pricing, priority lead times, and quarterly rebates calibrated to volume and tenure with us.",
  },
  {
    icon: GraduationCap,
    title: "Pacific Academy",
    body: "Half-day workshops and in-depth modules on specification, fabrication, installation, and care of engineered surfaces.",
  },
  {
    icon: Sparkles,
    title: "Authorised Fabricator",
    body: "Certified shops with direct technical lines, edge-detail libraries, and co-branded warranty coverage on every job they ship.",
  },
  {
    icon: Users,
    title: "Studio Network",
    body: "A curated set of design studios with early access to releases, co-marketing support, and dedicated specification leads.",
  },
];

const benefits = [
  "Volume-tiered trade pricing",
  "Priority slab holds for staged projects",
  "Quarterly rebates and growth incentives",
  "Direct technical support from our fabrication team",
  "Pacific-certified installer training and re-certification",
  "Co-branded warranty on certified installs",
  "Featured placement in inspiration galleries and case studies",
  "Sample-room support, brochures, and digital assets",
];

export default function ProgramsPage() {
  return (
    <main className="bg-[#0a1620] text-pacific-light">
      {/* ── 1. Hero ── */}
      <section className="relative min-h-[80vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src="/images/professions/programs.jpg"
          alt="Pacific Surfaces trade programs"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/15" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 w-full">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-pacific-mid/80 font-medium">
              Professionals · Programs
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] max-w-4xl">
              Programs that{" "}
              <em className="italic font-light">reward the trade.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-pacific-light/85 leading-relaxed">
              Pacific runs four programs, each built for a different part of the
              trade — fabricators, designers, dealers, and installers.
              Membership is selective on purpose; the rewards scale with the
              work you put in.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 2. Four program pillars ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              The programs
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              Four ways to grow with Pacific.
            </h2>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {programs.map((p, i) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title} className="h-full">
                  <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-8 lg:p-10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-3 bg-white/10 rounded-xl w-fit">
                        <Icon className="w-6 h-6 text-pacific-light" />
                      </div>
                      <div className="text-3xl font-light text-white/30">
                        0{i + 1}
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl sm:text-2xl font-light text-white tracking-tight">
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

      {/* ── 3. Benefits checklist + image ── */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <AnimatedSection animation="fadeUp">
              <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
                What you get
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
                Designed to compound.
              </h2>
              <p className="mt-5 text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
                Every program member gets the foundations below. The longer you
                build with Pacific, the deeper the partnership runs — pricing,
                training, lead times, and co-marketing all scale with tenure.
              </p>
              <ul className="mt-8 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400/90 mt-0.5 flex-shrink-0" />
                    <span className="text-base font-light text-pacific-light/90">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={0.1}>
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src="/images/professions/programs.jpg"
                  alt="Pacific Surfaces trade program"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/30 to-transparent" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── 4. How to join ── */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              How to join
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
              A simple, deliberate intake.
            </h2>
          </AnimatedSection>

          <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                n: "01",
                title: "Apply",
                body: "Send a short brief — who you are, the work you do, the volume you typically move.",
              },
              {
                n: "02",
                title: "Meet",
                body: "A 30-minute call with a Pacific lead to align on scope, fit, and which program matches.",
              },
              {
                n: "03",
                title: "Onboard",
                body: "Welcome kit, certifications, dedicated account contact. You're ready to specify.",
              },
            ].map((s) => (
              <AnimatedSection key={s.n} animation="fadeUp">
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 h-full">
                  <div className="text-3xl font-light text-white/30">{s.n}</div>
                  <h3 className="mt-6 text-xl font-light text-white tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-base font-light text-pacific-mid leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA closer ── */}
      <section className="bg-[#112732] border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Get started
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Ready to build with Pacific?
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Applications are reviewed weekly. The right partners hear back
              within a few working days.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant="primary" size="lg">
                Apply to a program
              </MagneticButton>
              <Link
                href="/professionals/collaboration"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
              >
                See how we collaborate
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
