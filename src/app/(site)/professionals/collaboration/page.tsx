import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ProfessionalsVideoGrid } from "@/components/sections/ProfessionalsVideoGrid";
import { ProCertificates } from "@/components/sections/professionals/ProCertificates";
import {
  Container,
  LABEL,
  LIGHT,
  ProCards,
  ProClose,
  ProFaq,
  ProHero,
  ProIntro,
  ProNav,
  ProSplit,
  ProSteps,
} from "@/components/sections/professionals/ProKit";

/**
 * /professionals/collaboration: how Pacific Surfaces works with architects,
 * interior designers, developers and fabricators, rebuilt 2026-10-08
 * (owner: the section looked "cheap"). The stock photograph of strangers
 * round a model is gone; the cards show the work each trade does, the
 * films are design professionals talking in front of Pacific slabs, and
 * the team photograph is Pacific's own.
 */

export const metadata: Metadata = {
  title: "For Architects, Designers & Builders | Pacific Surfaces",
  description:
    "How Pacific Surfaces works with architects, interior designers, developers and fabricators: samples, test data, certificates and cut-to-size supply.",
  alternates: { canonical: "/professionals/collaboration" },
};

const TRADES = [
  {
    title: "Architects",
    body: "Test data and certificates for specifications, and large-format slabs for cladding and feature walls.",
    image: "/images/spaces/hotels/wellness-stone-cladding.jpg",
    alt: "A wellness area with a wall clad in grey stone slabs",
    href: "/contact?type=architect#enquiry",
    linkLabel: "Talk to us",
  },
  {
    title: "Interior designers",
    body: "Colours and finishes for hospitality, residential and retail interiors, with samples sent to the studio.",
    image: "/projects/cladding/patagonia.webp",
    alt: "A living room with a feature wall in Patagonia",
    href: "/contact?type=interior-designer#enquiry",
    linkLabel: "Ask for samples",
  },
  {
    title: "Developers and builders",
    body: "Countertops, vanity tops, sills and cladding for multi-unit projects, cut to size and crated for site.",
    image: "/images/spaces/kitchen-hero.webp",
    alt: "A kitchen with quartz worktops and a quartz backsplash",
    href: "/contact?type=builder#enquiry",
    linkLabel: "Plan a project",
  },
  {
    title: "Fabricators",
    body: "Slabs in 12, 20 and 30 mm and in superjumbo formats, straight from the plant that makes them.",
    image: "/images/india-home/bretonstone-robot.webp",
    alt: "A Breton robot over the quartz mix on the Bretonstone line",
    href: "/contact?type=fabricator#enquiry",
    linkLabel: "Buy slabs",
  },
];

const STEPS = [
  {
    title: "Specify",
    body: "Samples, finishes, sizes, test results and certificates for the drawings and the specification.",
  },
  {
    title: "Detail",
    body: "Cut-to-size pieces drawn from your set by Fab Creations, our fabrication service, and agreed before cutting.",
  },
  {
    title: "Supply",
    body: "Slabs or finished pieces, crated and shipped to site in India or to any of 45+ countries.",
  },
  {
    title: "Support",
    body: "One team from the first sample to the last delivery, with contacts for India, Europe and the Middle East.",
  },
];

const FAQS = [
  {
    q: "How do I get samples for a specification?",
    a: "Send an enquiry with the colours and the project, or order a sample from any design's page. Samples are sent to your studio or site.",
  },
  {
    q: "Where can I find test data and certificates?",
    a: "Each design's page lists its finishes and sizes. Test results for quartz and granite are on the Applications page, and the certificates on file (NSF/ANSI 51, CE, ISO 9001:2015, Kosher and EPD) open in full on this page.",
  },
  {
    q: "Can you cut pieces to our drawings?",
    a: "Yes. Fab Creations, our fabrication service, cuts and finishes vanity tops, countertops, cladding, counters, sills and more from your DWG or PDF drawings.",
  },
  {
    q: "Do you work on projects outside India?",
    a: "Yes. Pacific Surfaces ships to more than 45 countries, with dedicated contacts for Poland, Germany, Croatia and the Middle East.",
  },
  {
    q: "Can we visit the factory?",
    a: "Yes. The factory and experience centre is open Monday to Saturday, 9 am to 8 pm. Book a visit through the contact page.",
  },
];

export default function CollaborationPage() {
  return (
    <div data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          {
            name: "Working with Pacific Surfaces",
            url: "/professionals/collaboration",
          },
        ]}
      />

      <ProHero
        eyebrow="Professionals · Working with us"
        title="For architects, designers, builders and fabricators"
        lead="Pacific Surfaces supports a project from the first specification to the last delivery: samples and test data for the drawings, cut-to-size pieces for the site, and one team to call."
        image="/images/spaces/hotels/restaurant-alabaster-noir-seasons.jpg"
        alt="A restaurant with stone tables and a black and white stone floor"
        ctas={[
          { label: "Start a project", href: "/contact#enquiry" },
          { label: "Ask for samples", href: "/contact?type=architect#enquiry" },
        ]}
        facts={[
          { value: "45+", label: "Countries we export to" },
          { value: "137 × 79 in", label: "Superjumbo slab, 3,500 × 2,050 mm" },
          { value: "5", label: "Certificates on file" },
          { value: "Since 2000", label: "Working in stone" },
        ]}
      />
      <ProNav current="collaboration" />

      <ProIntro
        eyebrow="Working with Pacific Surfaces"
        title="One source for the specification and the supply"
        body={[
          "Architects and designers specify Pacific Surfaces quartz, Eclipse and granite for kitchens, bathrooms, hospitality interiors, cladding and facades. Builders and fabricators buy the same slabs, or finished pieces cut to the drawings.",
          "Every colour comes with its finishes, sizes and test data, and the certificates on file can be read in full online. The slabs are made at a state-of-the-art Bretonstone plant with fully automated manufacturing, so what is specified is what is delivered.",
        ]}
        specs={[
          {
            label: "Materials",
            value: "Quartz, Eclipse, granite, Beyond Stone panels",
          },
          {
            label: "Slab format",
            value: "Up to 137 × 79 in (3,500 × 2,050 mm)",
          },
          { label: "Quartz thicknesses", value: "12, 20 and 30 mm" },
          {
            label: "Certificates",
            value: "NSF/ANSI 51, CE, ISO 9001:2015, Kosher, EPD",
          },
          {
            label: "Contacts",
            value: "India, Poland, Germany, Croatia, Middle East",
          },
        ]}
      />

      <ProCards
        eyebrow="Who we work with"
        title="Built around how each trade works"
        items={TRADES}
        columns={4}
        tone="stone"
      />

      <ProSteps
        eyebrow="How a project runs"
        title="From the first sample to the last crate"
        steps={STEPS}
        tone="white"
      />

      <section className="bg-white">
        <Container className="py-12 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <div>
              <p className={LABEL}>In their words</p>
              <h2
                style={LIGHT}
                className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]"
              >
                Design professionals on Pacific Surfaces
              </h2>
            </div>
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              Short films recorded in front of Pacific Surfaces slabs. Tap a
              film to play it with sound.
            </p>
          </div>
          <div className="mt-12">
            <ProfessionalsVideoGrid bare />
          </div>
        </Container>
      </section>

      <ProSplit
        eyebrow="The team"
        title="The people you will work with"
        body={[
          "Sales, technical and production teams work from the factory and experience centre, with contacts for India, Poland, Germany, Croatia and the Middle East.",
          "Bring a drawing or a brief to the experience centre to see full slabs, finishes and edge details before you specify.",
        ]}
        image="/videos/team-section-poster.jpg"
        alt="The Pacific Surfaces team"
        reverse
        cta={{ label: "Find your contact", href: "/contact#factory" }}
        tone="stone"
      />

      <ProCertificates />

      <ProFaq title="Working together" items={FAQS} />

      <ProClose
        title="Start the specification"
        body="Tell us about the project, the colours you are considering and the date it is needed. Samples, data and a contact follow."
        ctas={[
          { label: "Start a project", href: "/contact#enquiry" },
          {
            label: "See the applications",
            href: "/professionals/applications",
          },
        ]}
        image="/images/spaces/hotels/spa-pool.jpg"
      />
    </div>
  );
}
