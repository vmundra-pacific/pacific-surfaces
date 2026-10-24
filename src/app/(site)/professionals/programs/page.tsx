import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import {
  ProClose,
  ProFaq,
  ProHero,
  ProIntro,
  ProNav,
  ProSplit,
  ProSteps,
} from "@/components/sections/professionals/ProKit";

/**
 * /professionals/programs: the trade programs, rebuilt 2026-10-08 (owner:
 * the section looked "cheap"). The four programs, the member benefits and
 * the intake keep the wording already published; nothing was added to
 * them. They are waiting for the owner to confirm what each program offers.
 */

export const metadata: Metadata = {
  title: "Trade Programs for Fabricators & Dealers | Pacific Surfaces",
  description:
    "Trade incentives, education, and certification for fabricators, designers, and dealers in the Pacific Surfaces partner network.",
  alternates: { canonical: "/professionals/programs" },
};

const PROGRAMS = [
  {
    title: "Pacific Loyalty",
    body: "Trade-only pricing, priority lead times, and quarterly rebates calibrated to volume and tenure with us.",
  },
  {
    title: "Pacific Academy",
    body: "Half-day workshops and in-depth modules on specification, fabrication, installation, and care of engineered surfaces.",
  },
  {
    title: "Authorised Fabricator",
    body: "Certified shops with direct technical lines, and edge-detail libraries for every job they ship.",
  },
  {
    title: "Studio Network",
    body: "A curated set of design studios with early access to releases, co-marketing support, and dedicated specification leads.",
  },
];

const BENEFITS = [
  "Volume-tiered trade pricing",
  "Priority slab holds for staged projects",
  "Quarterly rebates and growth incentives",
  "Direct technical support from our fabrication team",
  "Pacific-certified installer training and re-certification",
  "Technical support on certified installs",
  "Featured placement in inspiration galleries and case studies",
  "Sample-room support, brochures, and digital assets",
];

const JOIN = [
  {
    title: "Apply",
    body: "Send a short brief: who you are, the work you do and the volume you typically move.",
  },
  {
    title: "Meet",
    body: "A 30-minute call with a Pacific Surfaces lead to agree scope, fit and the program that matches.",
  },
  {
    title: "Onboard",
    body: "Welcome kit, certifications and a dedicated account contact. You are ready to specify.",
  },
];

const FAQS = [
  {
    q: "Who can join a program?",
    a: "Fabricators, designers, dealers and installers who work with engineered surfaces. Each program is built for a different part of the trade.",
  },
  {
    q: "How do I apply?",
    a: "Send an enquiry and choose your role: a short brief on the work you do and the volume you move is enough to start.",
  },
  {
    q: "How soon will I hear back?",
    a: "Applications are reviewed weekly, and the right partners hear back within a few working days.",
  },
];

export default function ProgramsPage() {
  return (
    <div data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Trade programs", url: "/professionals/programs" },
        ]}
      />

      <ProHero
        eyebrow="Professionals · Trade programs"
        title="Trade programs for fabricators, designers and dealers"
        lead="Pacific Surfaces runs four programs, each built for a different part of the trade. Membership is selective on purpose; the rewards scale with the work you put in."
        image="/images/india-home/collection-eclipse.webp"
        alt="A long bar counter in Eclipse quartz"
        ctas={[
          {
            label: "Apply to a program",
            href: "/contact?type=distributor#enquiry",
          },
          { label: "Working with us", href: "/professionals/collaboration" },
        ]}
        facts={[
          { value: "4", label: "Trade programs" },
          { value: "45+", label: "Countries we export to" },
          { value: "Since 2000", label: "Working in stone" },
        ]}
      />
      <ProNav current="programs" />

      <ProIntro
        eyebrow="The trade"
        title="Programs that reward the trade"
        body={[
          "Fabricators, designers, dealers and installers work with Pacific Surfaces in different ways, so each program is built around one of them: pricing and priority for those who buy in volume, training for those who cut and install, and early access for the studios that specify.",
          "Every member works with the same slabs, made at a state-of-the-art Bretonstone plant with fully automated manufacturing, and with one team from the first order on.",
        ]}
      />

      <ProSteps
        eyebrow="The programs"
        title="Four ways to grow with Pacific Surfaces"
        steps={PROGRAMS}
        tone="stone"
      />

      <ProSplit
        eyebrow="What members get"
        title="Designed to compound"
        body={[
          "Every program member gets the foundations below. The longer you build with Pacific Surfaces, the deeper the partnership runs.",
        ]}
        points={BENEFITS}
        image="/videos/origin-poster.jpg"
        alt="Inside the Pacific Surfaces plant"
      />

      <ProSteps
        eyebrow="How to join"
        title="A simple, deliberate intake"
        steps={JOIN}
        tone="stone"
      />

      <ProFaq title="Program questions" items={FAQS} />

      <ProClose
        title="Ready to build with Pacific Surfaces?"
        body="Applications are reviewed weekly. Tell us who you are and the work you do, and the right program follows."
        ctas={[
          {
            label: "Apply to a program",
            href: "/contact?type=distributor#enquiry",
          },
          { label: "Fabrication services", href: "/professionals/services" },
        ]}
        image="/images/spaces/hotels/backlit-bar-latte-luxe-2.jpg"
      />
    </div>
  );
}
