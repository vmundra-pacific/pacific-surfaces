import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ProfessionalsVideoGrid } from "@/components/sections/ProfessionalsVideoGrid";
import {
  ArrowRight,
  FileText,
  Scissors,
  Sparkles,
  Truck,
  Ruler,
  Wrench,
  Layers,
  Boxes,
  ShieldCheck,
  Droplets,
  Bolt,
  ClipboardList,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Fab Creations Cut-to-Size — Pacific Surfaces",
  description:
    "Fab Creations — Pacific's end-to-end cut-to-size service. Send your DWG file; we engineer, fabricate, bond, and dispatch the finished piece. Vanities, sinks, counters, cladding, signage. All under one roof.",
  alternates: { canonical: "/professionals/services" },
};

/**
 * /professionals/services
 *
 * Editorial landing for Pacific's professional services — built
 * around Fab Creations (cut-to-size) as the page's centre of gravity.
 *
 * Order:
 *   1. Hero
 *   2. Fab Creations USP band (oversized)
 *   3. What we cut — applications grid
 *   4. Workflow — 6 steps
 *   5. Engineering details (adhesives / boltable / tolerances)
 *   6. Materials list
 *   7. Supporting services
 *   8. CTA closer
 */

const cutToSizeUses = [
  {
    icon: Droplets,
    title: "Vanities & Bathroom Tops",
    body: "Drop-in or undermount basins, integrated splashbacks, full-height shower walls — cut, polished, and ready to plumb.",
  },
  {
    icon: Layers,
    title: "Integrated Sinks",
    body: "Seamless quartz-on-quartz Integra sinks bonded with marine-grade adhesives. No silicone line. No water ingress.",
  },
  {
    icon: Ruler,
    title: "Custom Counters & Islands",
    body: "Kitchen worktops, breakfast islands, pantry tops — large-format slabs joined invisibly to your DWG dimensions.",
  },
  {
    icon: Boxes,
    title: "Furniture & Tabletops",
    body: "Dining tables, conference tops, console desks. Edge profiles, cutouts for cable management, and concealed support brackets.",
  },
  {
    icon: Bolt,
    title: "Reception & Bar Tops",
    body: "Sculpted reception desks, hospitality bar fronts, lift-lobby counters — fabricated in sections and bolted on site.",
  },
  {
    icon: Wrench,
    title: "Facade & Wall Cladding",
    body: "Ventilated facade panels and feature-wall slabs cut to architect's setting-out drawings, drilled for anchor systems.",
  },
];

const workflow = [
  {
    n: "01",
    title: "Brief",
    body: "Tell us what you're making. Programme, materials, finish, deadline — a five-minute call is usually enough to start.",
  },
  {
    n: "02",
    title: "DWG In",
    body: "Send drawings in DWG, PDF, or hand-sketch. Our tech team translates them into fabrication-ready cut files.",
  },
  {
    n: "03",
    title: "Quote & Approval",
    body: "Itemised quote with materials, labour, lead time, and finish options. Approve once, no surprise add-ons.",
  },
  {
    n: "04",
    title: "Cut & Fabricate",
    body: "CNC and water-jet cutting on calibrated slabs. Edge profiling, cutouts, sink openings, drillings — all in-house.",
  },
  {
    n: "05",
    title: "Bond & Finish",
    body: "Industrial-grade adhesives, hand-polished joints, finish to spec (polished, honed, leather, brushed). Boltable connections engineered in where structure demands it.",
  },
  {
    n: "06",
    title: "Pack & Ship",
    body: "Custom crating, dispatch tracking, and on-site QA the day it lands. White-glove install support available.",
  },
];

const engineeringDetails = [
  {
    icon: Sparkles,
    title: "Industrial-grade adhesives",
    body: "Two-part epoxy and methyl methacrylate (MMA) systems rated for structural load and water immersion. Tested to outlast the slab itself.",
  },
  {
    icon: Bolt,
    title: "Boltable construction",
    body: "Every cut-to-size assembly is engineered with concealed mechanical fixings — through-bolts, threaded inserts, or hidden brackets — so installations stay secure under real load.",
  },
  {
    icon: Ruler,
    title: "Tight tolerances",
    body: "Cut accuracy to ±0.5 mm on CNC, ±0.2 mm on water-jet. Joint lines hand-finished to disappear under a fingernail.",
  },
  {
    icon: ShieldCheck,
    title: "Certified & warrantied",
    body: "NSF 51 for food-contact surfaces, Greenguard Gold for indoor air, and a lifetime warranty on engineered quartz pieces we fabricate.",
  },
];

const capabilityStats = [
  {
    value: "24 hrs",
    label: "Quote turnaround",
    note: "Send a drawing today, get a costed quote tomorrow.",
  },
  {
    value: "± 0.5 mm",
    label: "Cut tolerance",
    note: "CNC-precise, hand-finished where it matters.",
  },
  {
    value: "3.2 × 1.6 m",
    label: "Max single piece",
    note: "Largest format we can mill, ship, and install.",
  },
  {
    value: "10–14 days",
    label: "Standard lead time",
    note: "Fabrication, finish, and dispatch — door to door.",
  },
  {
    value: "273+",
    label: "Surface SKUs",
    note: "The full Pacific catalogue, available cut-to-size.",
  },
  {
    value: "25+ yrs",
    label: "On the job",
    note: "A quarter-century of stone, quartz, and bespoke fab.",
  },
];

const supportingServices = [
  {
    icon: ClipboardList,
    title: "Specification & Sampling",
    body: "Spec-language for your drawings, physical samples to your studio, certifications on file — everything your set needs.",
  },
  {
    icon: Compass,
    title: "On-site Consultation",
    body: "Senior project leads on the ground for templating, layout reviews, and design-critical installs.",
  },
  {
    icon: Truck,
    title: "Logistics & Delivery",
    body: "Lead-time visibility, holds for staged projects, coordinated dispatch — single piece to full container loads.",
  },
  {
    icon: ShieldCheck,
    title: "Aftercare & Warranty",
    body: "Lifetime warranty on engineered pieces, documented care guides, and a direct contact for the years that follow.",
  },
];

const capabilities = [
  {
    icon: FileText,
    title: "DWG in",
    body: "Send your file. We work to spec.",
  },
  {
    icon: Scissors,
    title: "Cut to size",
    body: "CNC-precise, every edge engineered.",
  },
  {
    icon: Sparkles,
    title: "Bonded & boltable",
    body: "High-grade adhesives, hardware-ready.",
  },
  {
    icon: Truck,
    title: "Finished & shipped",
    body: "Polished, packed, dispatched.",
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-[#0a1620] text-pacific-light">
      {/* 1. Hero */}
      <section className="relative min-h-[80vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src="/images/professions/services.jpg"
          alt="Pacific Surfaces Fab Creations cut-to-size service"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/15" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28 w-full">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-pacific-mid/80 font-medium">
              Professionals · Services · Fab Creations
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.05] max-w-4xl">
              We don&apos;t just sell slabs —{" "}
              <em className="italic font-light">
                we engineer them to your drawing.
              </em>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg font-light text-pacific-light/85 leading-relaxed">
              Fab Creations is Pacific&apos;s flagship cut-to-size service. Send
              a DWG file; we deliver the finished piece — fabricated, bonded,
              polished, and dispatched from a single facility. Every step under
              one roof.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. Fab Creations USP band */}
      <section className="relative bg-stone-950 overflow-hidden border-y border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/professions/services.jpg"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/95 to-stone-950" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="inline-block text-[10px] sm:text-xs tracking-[0.4em] uppercase text-pacific-light/70 font-medium border border-white/15 rounded-full px-4 py-1.5">
              Fab Creations · Cut-to-size
            </span>
            <h2 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[0.95]">
              Your specification.
              <br />
              Our design.
              <br />
              <em className="italic font-light text-pacific-light">
                All under one roof.
              </em>
            </h2>
            <p className="mt-10 max-w-3xl mx-auto text-xl sm:text-2xl font-light text-pacific-light/90 leading-relaxed">
              Send a DWG file. We deliver the finished piece — designed,
              fabricated, polished, and dispatched from a single facility.{" "}
              <span className="text-white font-medium">
                The only end-to-end cut-to-size solution in the industry.
              </span>
            </p>
            <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Vanities, sinks, custom counters, bespoke worktops — every piece
              joined with industrial-grade adhesives and engineered to be{" "}
              <span className="text-white font-medium">boltable</span>, so
              installations stay secure under real-world load.
            </p>
          </AnimatedSection>

          <StaggerContainer className="mt-16 lg:mt-20 flex flex-wrap justify-center gap-4 lg:gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <StaggerItem
                  key={cap.title}
                  className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-1.125rem)]"
                >
                  <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 text-left">
                    <div className="p-2.5 bg-white/10 rounded-lg w-fit">
                      <Icon className="w-5 h-5 text-pacific-light" />
                    </div>
                    <div className="mt-4 text-base font-medium text-white tracking-tight">
                      {cap.title}
                    </div>
                    <p className="mt-1.5 text-sm font-light text-pacific-mid leading-relaxed">
                      {cap.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="mt-12 lg:mt-16 flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton href="/contact" variant="primary" size="lg">
              Send a DWG file
            </MagneticButton>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
            >
              See available surfaces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Video grid — click to play. */}
      <ProfessionalsVideoGrid
        eyebrow="In motion"
        title="See the cut in motion."
        body="Quick reels from the fab floor — DWG to finished piece, by hand, under one roof."
      />

      {/* 4. What we cut */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              What we cut
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
              From a single vanity top to a hundred-metre facade.
            </h2>
            <p className="mt-5 max-w-2xl text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              If it can be drawn, we can usually cut it. A short list of the
              pieces we ship most often:
            </p>
          </AnimatedSection>
          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {cutToSizeUses.map((u) => {
              const Icon = u.icon;
              return (
                <StaggerItem key={u.title} className="h-full">
                  <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 sm:p-8 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500 flex flex-col">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-pacific-light" />
                    </div>
                    <h3 className="mt-6 text-lg font-medium text-white tracking-tight">
                      {u.title}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base font-light text-pacific-mid leading-relaxed">
                      {u.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 4. Workflow */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              The workflow
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
              From your file to finished piece, in six steps.
            </h2>
          </AnimatedSection>
          <div className="mt-14 lg:mt-20 relative">
            <div
              aria-hidden="true"
              className="hidden lg:block absolute left-[7.5rem] top-2 bottom-2 w-px bg-white/10"
            />
            <ol className="space-y-12 lg:space-y-16">
              {workflow.map((step) => (
                <AnimatedSection
                  key={step.n}
                  animation="fadeUp"
                  className="grid grid-cols-1 lg:grid-cols-[8rem_1fr] gap-4 lg:gap-12 items-start relative"
                >
                  <div className="flex items-baseline gap-3 lg:gap-0 lg:flex-col">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-white/90 tracking-tight">
                      {step.n}
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden lg:block absolute left-[7.3rem] top-2.5 w-2 h-2 rounded-full bg-pacific-light"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base font-light text-pacific-mid leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Engineering details */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Under the hood
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
              Built to outlast the building it lives in.
            </h2>
            <p className="mt-5 max-w-2xl text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Cut-to-size only works if the engineering behind it works. Four
              standards every Fab Creations piece is built to:
            </p>
          </AnimatedSection>
          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {engineeringDetails.map((d) => {
              const Icon = d.icon;
              return (
                <StaggerItem key={d.title} className="h-full">
                  <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-8 lg:p-10 hover:border-white/20 transition-all duration-500 flex">
                    <div className="p-3 bg-white/10 rounded-xl w-fit h-fit flex-shrink-0">
                      <Icon className="w-6 h-6 text-pacific-light" />
                    </div>
                    <div className="ml-5 lg:ml-6">
                      <h3 className="text-xl font-light text-white tracking-tight">
                        {d.title}
                      </h3>
                      <p className="mt-3 text-base font-light text-pacific-mid leading-relaxed">
                        {d.body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 6. Materials */}
      <section className="bg-[#112732] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
                By the numbers
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
                A quarter-century of cut-to-size, in six figures.
              </h2>
              <p className="mt-5 text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
                A quick snapshot of what Fab Creations runs at — turnaround,
                tolerance, scale, and the experience behind it.
              </p>
            </div>
          </AnimatedSection>

          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {capabilityStats.map((stat) => (
              <StaggerItem key={stat.label} className="h-full">
                <div className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-7 lg:p-8 hover:border-white/20 transition-all duration-500">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-none">
                    {stat.value}
                  </div>
                  <div className="mt-5 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-pacific-light/80 font-medium">
                    {stat.label}
                  </div>
                  <p className="mt-3 text-sm font-light text-pacific-mid leading-relaxed">
                    {stat.note}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-10 lg:mt-12">
            <MagneticButton href="/products" variant="outline-dark" size="md">
              Browse the catalogue
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 7. Supporting services */}
      <section className="bg-[#0a1620]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Beyond the cut
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-3xl">
              Everything else the project needs.
            </h2>
            <p className="mt-5 max-w-2xl text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              Cut-to-size is the headline. The supporting services keep the
              project on rails from first brief to handover.
            </p>
          </AnimatedSection>
          <StaggerContainer className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {supportingServices.map((s) => {
              const Icon = s.icon;
              return (
                <StaggerItem key={s.title} className="h-full">
                  <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 sm:p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                    <div className="p-3 bg-white/10 rounded-xl w-fit">
                      <Icon className="w-5 h-5 text-pacific-light" />
                    </div>
                    <h3 className="mt-6 text-lg font-medium text-white tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm font-light text-pacific-mid leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* 8. CTA closer */}
      <section className="bg-[#112732] border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-24 lg:py-32 text-center">
          <AnimatedSection animation="fadeUp">
            <span className="text-[10px] tracking-[0.3em] uppercase text-pacific-mid/70 font-medium">
              Ready to cut?
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Send a drawing. We&apos;ll send a quote .
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg font-light text-pacific-mid leading-relaxed">
              CAD, DWG, PDF, or a hand-sketch — whatever you have, we can work
              from it. A senior Pacific fabricator will respond within one
              working day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/contact" variant=
"primary" size="lg">Send a DWG file</MagneticButton>
              <Link
                href="/professionals/applications"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-[0.1em] uppercase text-white/80 hover:text-white transition-colors"
              >
                See application areas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
