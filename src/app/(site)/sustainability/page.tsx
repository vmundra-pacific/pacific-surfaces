import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ProCertificates } from "@/components/sections/professionals/ProCertificates";
import {
  CompanyNav,
  ProClose,
  ProFaq,
  ProFigures,
  ProHero,
  ProIntro,
  ProSplit,
  ProSteps,
} from "@/components/sections/professionals/ProKit";

/**
 * /sustainability: rebuilt 2026-10-08 (owner: the Corporate section to get
 * the same visual upgrade). Only what is on record: the 2 MW solar
 * installation and the on-site wind turbine (no claim about how much of
 * the plant they power), the Bretonstone plant, Pacific Mintek, and the
 * EPD for Ecosurfaces. The old page's 100% water recycling, Greenguard,
 * ISO 14001, 80% recycled content and supplier audits are off it until
 * the owner confirms them, and the stock photographs of a wind farm, solar
 * panels and the sea are gone. Copy now lives in code; the Sanity
 * sustainabilityPage singleton is no longer read.
 */

export const metadata: Metadata = {
  title: "Sustainability: Solar, Wind and Ecosurfaces | Pacific Surfaces",
  description:
    "A 2 MW solar installation and a wind turbine at the plant, an Environmental Product Declaration and the Ecosurfaces range: sustainability at Pacific Surfaces.",
  alternates: { canonical: "/sustainability" },
};

const GOALS = [
  {
    title: "Good health and well-being",
    body: "Surfaces certified to NSF/ANSI 51, the standard for materials that come into contact with food.",
  },
  {
    title: "Industry, innovation and infrastructure",
    body: "A state-of-the-art Bretonstone plant with fully automated manufacturing.",
  },
  {
    title: "Responsible consumption and production",
    body: "An Environmental Product Declaration that documents the Ecosurfaces range.",
  },
  {
    title: "Climate action",
    body: "A 2 MW solar installation and an on-site wind turbine at the plant.",
  },
];

const FAQS = [
  {
    q: "How does the plant use renewable energy?",
    a: "The plant runs a 2 MW solar installation and an on-site Siemens Gamesa wind turbine.",
  },
  {
    q: "What is Ecosurfaces?",
    a: "Ecosurfaces is the Pacific Surfaces range with low and zero crystalline silica, documented in an Environmental Product Declaration.",
  },
  {
    q: "Do you publish environmental data for your products?",
    a: "Yes. An Environmental Product Declaration (EPD) is on file, and it opens in full on this page.",
  },
  {
    q: "Where is Pacific Surfaces quartz made?",
    a: "At a state-of-the-art Bretonstone plant in India, with fully automated manufacturing. Quartz grit, a key raw material, comes from the group's own Pacific Mintek factory.",
  },
];

export default function SustainabilityPage() {
  return (
    <main data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Sustainability", url: "/sustainability" },
        ]}
      />

      <ProHero
        eyebrow="Company · Sustainability"
        title="Sustainability, from the plant to the product"
        lead="The plant runs a 2 MW solar installation and an on-site wind turbine, and the Ecosurfaces range is documented in an Environmental Product Declaration."
        image="/videos/sustainability-hero-poster.jpg"
        video="/videos/sustainability-hero.mp4"
        alt="The Pacific Surfaces plant from the air, among green fields"
        ctas={[
          { label: "Explore Ecosurfaces", href: "/products/ecosurfaces" },
          { label: "Talk to us", href: "/contact#enquiry" },
        ]}
        facts={[
          { value: "2 MW", label: "Solar installation" },
          { value: "On site", label: "Wind turbine" },
          { value: "EPD", label: "Environmental product declaration" },
          { value: "Since 2020", label: "Quartz grit made in-house" },
        ]}
      />
      <CompanyNav current="sustainability" />

      <ProIntro
        eyebrow="Our approach"
        title="Start at the plant, carry it into the product"
        body={[
          "Sustainability at Pacific starts where the slabs are made: renewable energy on site, a state-of-the-art Bretonstone plant with fully automated manufacturing, and quartz grit from the group's own factory, Pacific Mintek.",
          "It continues in the product. Ecosurfaces, the range with low and zero crystalline silica, is documented in an Environmental Product Declaration that anyone can read in full.",
        ]}
        specs={[
          { label: "Solar", value: "2 MW installation at the plant" },
          { label: "Wind", value: "An on-site Siemens Gamesa wind turbine" },
          { label: "Raw material", value: "Quartz grit from Pacific Mintek, since 2020" },
          { label: "Documentation", value: "Environmental Product Declaration (EPD)" },
        ]}
      />

      <ProFigures
        eyebrow="Energy and materials"
        title="What the plant runs on"
        items={[
          { value: "2 MW", label: "Solar", note: "A 2 MW solar installation at the plant." },
          { value: "Wind", label: "On-site turbine", note: "A Siemens Gamesa wind turbine on the site." },
          { value: "2020", label: "Raw material in-house", note: "Quartz grit from the group's own Pacific Mintek factory." },
        ]}
      />

      <ProSplit
        eyebrow="Ecosurfaces"
        title="Low and zero crystalline silica"
        body={[
          "Ecosurfaces is the Pacific Surfaces range with low and zero crystalline silica.",
          "Its Environmental Product Declaration is on file and opens in full below.",
        ]}
        points={["Documented in an Environmental Product Declaration", "Colours, finishes and sizes on the Ecosurfaces page"]}
        image="/eco-surfaces-hero.jpg"
        alt="Ecosurfaces by Pacific Surfaces"
        cta={{ label: "Explore Ecosurfaces", href: "/products/ecosurfaces" }}
        tone="stone"
      />

      <ProSteps
        eyebrow="UN Sustainable Development Goals"
        title="The goals we work towards"
        lead="Four of the United Nations goals, each with what Pacific has in place for it."
        steps={GOALS}
        tone="white"
      />

      <ProCertificates />

      <ProFaq title="Sustainability questions" items={FAQS} />

      <ProClose
        title="Let's talk stone"
        body="Ask about a project, a sample or the Environmental Product Declaration."
        ctas={[
          { label: "Get in touch", href: "/contact#enquiry" },
          { label: "Our story", href: "/about" },
        ]}
        image="/images/flooring/new-viscont-white-courtyard.webp"
      />
    </main>
  );
}
