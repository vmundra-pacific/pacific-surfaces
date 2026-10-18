import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { ProCertificates } from "@/components/sections/professionals/ProCertificates";
import { SALES_PHONE } from "@/data/business";
import {
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
 * /professionals/services: Fab Creations, the cut-to-size fabrication
 * service, rebuilt 2026-10-08 (owner: the section looked "cheap"). Real
 * photographs only: the plant's own footage opens the page, each card
 * shows the piece it names. Figures are the confirmed ones; the old
 * tolerances, lead times and Greenguard claim are off until confirmed.
 */

export const metadata: Metadata = {
  title: "Quartz Fabrication & Cut-to-Size Services | Pacific Surfaces",
  description:
    "Fab Creations by Pacific Surfaces: send a drawing and we cut, finish and crate quartz, Eclipse and granite pieces, from vanity tops to cladding and sills.",
  alternates: { canonical: "/professionals/services" },
};

const MAKE = [
  {
    title: "Vanity tops",
    body: "Single and double basin tops, cut for the basins and taps you specify.",
    image: "/images/spaces/bathrooms/double-vanity.jpg",
    alt: "Two stone vanity units with marble-look quartz tops",
    href: "/applications/bathroom-vanity-tops",
  },
  {
    title: "Integrated sinks",
    body: "Integra basins bonded into the top in matching quartz, so no seam sits between basin and counter.",
    image: "/videos/integra-poster.jpg",
    alt: "A quartz vanity top with an integrated basin and a brass tap",
    href: "/products/integra",
  },
  {
    title: "Countertops and islands",
    body: "Worktops and islands cut to your layout; a superjumbo slab covers most islands without a joint.",
    image: "/projects/islands/artemis-kitchen.webp",
    alt: "A kitchen with a quartz island and matching wall cabinets",
    href: "/applications/kitchen-islands",
  },
  {
    title: "Tables and furniture",
    body: "Dining tables, desks and console tops, with edge profiles and cut-outs to your drawing.",
    image: "/images/spaces/hotels/dining-table.jpg",
    alt: "A white quartz dining table in a hotel lounge",
    href: "/applications/dining-and-furniture",
  },
  {
    title: "Bar and reception counters",
    body: "Counters for bars, lobbies and restaurants, made in sections and assembled on site.",
    image: "/images/spaces/hotels/lobby-bar.jpg",
    alt: "A hotel bar counter clad in stone with two guests",
    href: "/applications/bar-counters",
  },
  {
    title: "Wall cladding",
    body: "Feature walls and cladding cut to the setting-out drawings, so the veining runs across the wall.",
    image: "/projects/cladding/horizon-veil.webp",
    alt: "A living room wall clad in large marble-look slabs",
    href: "/applications/wall-cladding",
  },
  {
    title: "Shower walls",
    body: "Full-height shower walls and trays with no grout lines, cut around fittings and niches.",
    image: "/images/spaces/bathrooms/shower-wall.jpg",
    alt: "A shower wall in large-format stone with a hand shower",
    href: "/applications/shower-walls-and-trays",
  },
  {
    title: "Window sills and thresholds",
    body: "Granite and quartz sills and thresholds in popular or custom sizes, crated for export.",
    image: "/images/thresholds-and-sills/hero-charcoal-sill.webp",
    alt: "A charcoal granite window sill above the sea",
    href: "/products/pacific-european-window-sill-threshold-collection",
  },
];

const STEPS = [
  {
    title: "Brief",
    body: "Tell us what you are making, in which material and finish, and when it is needed on site.",
  },
  {
    title: "Drawings",
    body: "Send DWG or PDF drawings, or a hand sketch. Our team turns them into cutting files and checks every dimension with you.",
  },
  {
    title: "Quote",
    body: "An itemised quote for material, fabrication, finish and delivery, approved before any cutting starts.",
  },
  {
    title: "Cut",
    body: "Pieces are cut from calibrated slabs on CNC and water-jet machines, with edge profiles, cut-outs and sink openings made in-house.",
  },
  {
    title: "Finish",
    body: "Joints are bonded and hand-finished, and every face is finished as specified: polished, honed or leather.",
  },
  {
    title: "Crate and ship",
    body: "Each piece is checked, crated for the journey and shipped to site, in India or abroad.",
  },
];

const FAQS = [
  {
    q: "What can Fab Creations make?",
    a: "Vanity tops, integrated sinks, kitchen countertops and islands, tables and furniture, bar and reception counters, wall cladding, shower walls, and window sills and thresholds. If it is cut from a slab, send the drawing and we will tell you how it can be made.",
  },
  {
    q: "What drawings do you need?",
    a: "DWG or PDF drawings, or a clear hand sketch with dimensions. Our team turns them into cutting files and confirms every dimension with you before the quote is approved.",
  },
  {
    q: "Which materials and thicknesses can be fabricated?",
    a: "Pacific Surfaces quartz in 12, 20 and 30 mm, Eclipse inlayered design quartz, and granite. Each design's page lists its finishes and the thicknesses it comes in.",
  },
  {
    q: "How large can one piece be?",
    a: "Up to the size of the slab. Pacific Surfaces quartz is made in a superjumbo format of up to 3,480 × 2,007 mm, so most islands and long counters need no joint. Longer runs are joined and the joints hand-finished.",
  },
  {
    q: "Do you supply projects outside India?",
    a: "Yes. Pacific Surfaces ships to more than 45 countries, and finished pieces are crated for export. Dedicated contacts look after Europe and the Middle East.",
  },
  {
    q: "Can I see the material before ordering?",
    a: "Ask for samples with your enquiry, or visit the factory and experience centre, Monday to Saturday, 9 am to 8 pm.",
  },
];

export default function ServicesPage() {
  return (
    <div data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Fabrication services", url: "/professionals/services" },
        ]}
      />

      <ProHero
        eyebrow="Professionals · Fabrication services"
        title="Cut-to-size quartz and stone fabrication"
        lead="Fab Creations is the fabrication service of Pacific Surfaces. Send a drawing, and the piece is cut, finished, crated and shipped from one facility, in quartz, Eclipse or granite."
        image="/videos/origin-poster.jpg"
        video="/videos/origin.mp4"
        alt="Inside the Pacific Surfaces plant"
        ctas={[
          { label: "Send a drawing", href: "/contact#enquiry" },
          { label: "Fab Creations designs", href: "/products/fab-creations" },
        ]}
        facts={[
          { value: "3,480 × 2,007 mm", label: "Largest slab, superjumbo" },
          { value: "12 · 20 · 30 mm", label: "Quartz thicknesses" },
          { value: "45+", label: "Countries supplied" },
          { value: "Since 2000", label: "Working in stone" },
        ]}
      />
      <ProNav current="services" />

      <ProIntro
        eyebrow="Fab Creations"
        title="From a single vanity top to a full feature wall"
        body={[
          "Fab Creations turns Pacific Surfaces slabs into finished pieces: vanity tops and integrated sinks, kitchen countertops and islands, tables, bar and reception counters, wall cladding, shower walls, and window sills and thresholds.",
          "Work starts from your drawing. Every piece is cut to it, finished, checked and crated for the journey, whether it goes to a site in India or to one of the 45+ countries Pacific Surfaces supplies.",
        ]}
        specs={[
          { label: "Materials", value: "Quartz, Eclipse and granite" },
          {
            label: "Slab format",
            value: "Up to 3,480 × 2,007 mm (137 × 79 in)",
          },
          { label: "Quartz thicknesses", value: "12, 20 and 30 mm" },
          { label: "Drawings", value: "DWG, PDF or a hand sketch" },
          { label: "Finishes", value: "Polished, honed or leather, by design" },
        ]}
      />

      <ProCards
        eyebrow="What we fabricate"
        title="Pieces made to your drawing"
        lead="Each piece is cut from the same slabs shown in the catalogue, so the colour you specify is the colour that arrives."
        items={MAKE}
        columns={4}
        tone="stone"
      />

      <ProSteps
        eyebrow="How it works"
        title="From your file to the finished piece"
        lead="Six steps, with one team from the first call to delivery."
        steps={STEPS}
        tone="white"
      />

      <ProSplit
        eyebrow="Slab and piece from one source"
        title="Made at our own plant"
        body={[
          "Pacific Surfaces makes its quartz at a state-of-the-art Bretonstone plant with fully automated manufacturing. Fab Creations cuts and finishes those slabs under the same roof.",
          "One source for the slab and the piece means one point of contact, and one standard from the raw mix to the crate.",
        ]}
        points={[
          "Quartz in 12, 20 and 30 mm",
          "Superjumbo slabs up to 3,480 × 2,007 mm, for fewer joints",
          "Up to 12 million sq ft of quartz a year",
          "Certificates on file: NSF/ANSI 51, CE, ISO 9001:2015, Kosher, EPD",
        ]}
        image="/images/india-home/bretonstone-robot.webp"
        alt="A Breton robot over the quartz mix on the Bretonstone line"
        cta={{ label: "Visit the factory", href: "/contact#factory" }}
        tone="stone"
      />

      <ProCertificates />

      <ProFaq title="Fabrication questions" items={FAQS} />

      <ProClose
        title="Send a drawing, get a quote"
        body={`Attach your DWG, PDF or sketch to an enquiry, or call ${SALES_PHONE.display}. Every quote is itemised before cutting starts.`}
        ctas={[
          { label: "Send an enquiry", href: "/contact#enquiry" },
          { label: `Call ${SALES_PHONE.display}`, href: SALES_PHONE.href },
        ]}
        image="/images/spaces/hotels/cafe-counter-orenda.jpg"
      />
    </div>
  );
}
