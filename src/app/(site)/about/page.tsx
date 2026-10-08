import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ProCertificates } from "@/components/sections/professionals/ProCertificates";
import {
  CompanyNav,
  ProClose,
  ProFaq,
  ProHero,
  ProIntro,
  ProSplit,
  ProSteps,
  ProTeam,
  ProTimeline,
} from "@/components/sections/professionals/ProKit";
import { MILESTONES, TEAM } from "@/data/our-story";

/**
 * /about, Our Story: rebuilt 2026-10-08 in the Professionals pages' language
 * (owner: "make the changes in our story page also visually"). The plant
 * from the air opens the page; the milestones are the dates on record; the
 * team is the old page's list. The hero is the site's own about-hero film,
 * with a still taken from it (the old poster was its dark opening frame). Figures nobody has confirmed (273+ designs,
 * 500+ projects, "patented", "rapid delivery", the 378,000 sq ft) are off
 * the page until the owner confirms them.
 */

export const metadata: Metadata = {
  title: "Our Story: Quartz and Granite Since 2000 | Pacific Surfaces",
  description:
    "From a granite business founded in 2000 to a state-of-the-art Bretonstone quartz plant: the story, the people and the plant behind Pacific Surfaces.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    title: "Quality you can check",
    body: "NSF/ANSI 51, CE, ISO 9001:2015, Kosher and an EPD are on file, and each certificate can be read in full on this page.",
  },
  {
    title: "Technology",
    body: "Quartz is made at a state-of-the-art Bretonstone plant with fully automated manufacturing, in slabs up to 3,480 × 2,007 mm.",
  },
  {
    title: "Responsibility",
    body: "The plant runs a 2 MW solar installation and an on-site wind turbine, and the Ecosurfaces range is documented in an EPD.",
  },
  {
    title: "Service",
    body: "A factory and experience centre open six days a week, and contacts for India, Poland, Germany, Croatia and the Middle East.",
  },
];

const FAQS = [
  {
    q: "Where are Pacific Surfaces products made?",
    a: "Quartz is made at a state-of-the-art Bretonstone plant in India, with fully automated manufacturing. Granite has been processed by the group since 2000.",
  },
  {
    q: "How long has Pacific been in business?",
    a: "Since 2000, when Pacific Granites was founded. Exports began in 2011, quartz in 2018, and the Bretonstone plant opened in 2023.",
  },
  {
    q: "How much does Pacific produce?",
    a: "Up to 12 million sq ft of quartz and 4.8 million sq ft of granite a year.",
  },
  {
    q: "Where does Pacific supply?",
    a: "More than 45 countries, with a warehouse in Poland since late 2024 and dedicated contacts for Europe and the Middle East.",
  },
  {
    q: "Can I visit?",
    a: "Yes. The factory and experience centre is open Monday to Saturday, 9 am to 8 pm. Book a visit through the contact page.",
  },
];

export default function AboutPage() {
  return (
    <main data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Our story", url: "/about" },
        ]}
      />

      <ProHero
        eyebrow="Our story"
        title="From a granite business to a Bretonstone plant"
        lead="Pacific began in natural stone in 2000. Today Pacific Surfaces makes engineered quartz at a state-of-the-art Bretonstone plant with fully automated manufacturing, and ships to more than 45 countries."
        image="/videos/about-hero-still.webp"
        video="/videos/about-hero.mp4"
        alt="A Breton robot over the quartz mix at the Pacific Surfaces plant"
        ctas={[
          { label: "Visit the factory", href: "/contact#factory" },
          { label: "Pacific Quartz", href: "/products/quartz/about" },
        ]}
        facts={[
          { value: "2000", label: "Founded, in granite" },
          { value: "45+", label: "Countries supplied" },
          { value: "12M sq ft", label: "Quartz a year, up to" },
          { value: "3,480 × 2,007 mm", label: "Superjumbo slabs" },
        ]}
      />
      <CompanyNav current="about" />

      <ProIntro
        eyebrow="Pacific Surfaces"
        title="Twenty-five years in stone"
        body={[
          "Pacific Granites was founded in 2000 to supply natural stone, and began exporting granite in 2011. In 2018 Pacific moved into engineered quartz, and in 2020 it brought quartz grit, a key raw material, in-house with the factory now called Pacific Mintek.",
          "In 2023 Pacific Engineered Surfaces opened a state-of-the-art Bretonstone plant with fully automated manufacturing. Late in 2024 a warehouse opened in Poland, closer to customers in Europe.",
        ]}
        specs={[
          { label: "Founded", value: "2000, as Pacific Granites" },
          { label: "Plant", value: "State-of-the-art Bretonstone plant, fully automated" },
          { label: "Capacity", value: "Up to 12M sq ft quartz and 4.8M sq ft granite a year" },
          { label: "Reach", value: "45+ countries; warehouse in Poland" },
          { label: "Energy", value: "2 MW solar and an on-site wind turbine" },
        ]}
      />

      <ProTimeline eyebrow="Milestones" title="How Pacific grew" items={MILESTONES} tone="stone" />

      <ProSplit
        eyebrow="The plant"
        title="How a slab is made"
        body={[
          "Quartz is blended with resin and pigment, then vibro-compacted under vacuum on the Bretonstone line, which presses the mix into a slab and draws out the air. The slab is cured at high temperature, calibrated to an even thickness and polished.",
          "Slabs come in 12, 20 and 30 mm and in a superjumbo format of up to 3,480 × 2,007 mm.",
        ]}
        image="/images/india-home/bretonstone-robot.webp"
        alt="A Breton robot over the quartz mix on the Bretonstone line"
        cta={{ label: "Pacific Quartz", href: "/products/quartz/about" }}
      />

      <ProTeam
        eyebrow="The team"
        title="The people behind Pacific Surfaces"
        lead="The leadership of Pacific Surfaces and its companies in India and Poland."
        people={TEAM}
      />

      <ProSteps eyebrow="What we stand for" title="Four things to hold us to" steps={VALUES} tone="stone" />

      <ProCertificates />

      <ProFaq title="About Pacific" items={FAQS} />

      <ProClose
        title="Grow with Pacific Surfaces"
        body="See the roles open now, or come and see the plant and the slabs for yourself."
        ctas={[
          { label: "Work with us", href: "/careers" },
          { label: "Visit the factory", href: "/contact#factory" },
        ]}
        image="/videos/team-section-poster.jpg"
      />
    </main>
  );
}
