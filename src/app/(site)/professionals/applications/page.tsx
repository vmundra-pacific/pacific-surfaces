import type { Metadata } from "next";
import { BreadcrumbList } from "@/components/global/JsonLd";
import { MaterialTests } from "@/components/sections/sills/TechnicalSpecs";
import { ProCertificates } from "@/components/sections/professionals/ProCertificates";
import {
  Container,
  LABEL,
  LIGHT,
  ProCards,
  ProClose,
  ProFaq,
  ProHero,
  ProIndex,
  ProIntro,
  ProNav,
  ProTable,
} from "@/components/sections/professionals/ProKit";

/**
 * /professionals/applications: a specifier's guide to where each Pacific
 * Surfaces material goes, rebuilt 2026-10-08 (owner: the section looked
 * "cheap"). It links every application page, says which material suits
 * which use, and carries the owner's own test results (the tables already
 * on the window sill page) and the certificates on file. The old cards
 * that repeated one photograph under two names are gone.
 */

export const metadata: Metadata = {
  title: "Where to Use Quartz & Stone: Applications | Pacific Surfaces",
  description:
    "Kitchens, bathrooms, cladding, facades and flooring: where Pacific Surfaces quartz, granite and panels are specified, with test data and certificates.",
  alternates: { canonical: "/professionals/applications" },
};

const FEATURED = [
  {
    title: "Kitchen countertops",
    body: "Quartz worktops: 2 cm for a supported run, 3 cm where the counter overhangs.",
    image: "/projects/islands/orenda-application.webp",
    alt: "A kitchen with a stone island and a matching wall",
    href: "/applications/kitchen-countertops",
    linkLabel: "Countertops",
  },
  {
    title: "Vanity tops",
    body: "Tops cut for the basins you choose, or with an Integra basin in the same quartz.",
    image: "/images/spaces/bathrooms/basin-and-bath.jpg",
    alt: "A bathroom with a stone vanity counter, a basin and a bath",
    href: "/applications/bathroom-vanity-tops",
    linkLabel: "Vanity tops",
  },
  {
    title: "Wall cladding",
    body: "Whole walls in superjumbo slabs, so the veining runs on without a grout line.",
    image: "/images/spaces/hotels/spa-wall.jpg",
    alt: "A wall clad in white marble-look slabs",
    href: "/applications/wall-cladding",
    linkLabel: "Wall cladding",
  },
  {
    title: "Flooring",
    body: "Granite floors, paving and steps, inside and out, in a range of finishes.",
    image: "/images/flooring/card-courtyard.webp",
    alt: "A courtyard paved in New Viscont White granite",
    href: "/applications/flooring",
    linkLabel: "Flooring",
  },
  {
    title: "Backlit features",
    body: "Translucent and semi-precious stone lit from behind, for bars, walls and counters.",
    image: "/images/spaces/hotels/backlit-bar-latte-luxe.jpg",
    alt: "A hotel bar with a backlit stone counter",
    href: "/applications/backlit-features",
    linkLabel: "Backlit features",
  },
  {
    title: "Hospitality interiors",
    body: "Restaurants, lobbies and spas, where surfaces must look new for years.",
    image: "/projects/cladding/tiffany.webp",
    alt: "A restaurant with a green stone feature wall",
    href: "/applications/hospitality-interiors",
    linkLabel: "Hospitality",
  },
];

const GROUPS = [
  {
    title: "Kitchen",
    links: [
      { label: "Kitchen countertops", href: "/applications/kitchen-countertops", note: "Worktops for kitchens and pantries" },
      { label: "Kitchen islands", href: "/applications/kitchen-islands", note: "Islands, often from a single superjumbo slab" },
      { label: "Waterfall islands", href: "/applications/waterfall-islands", note: "Mitred sides that carry the top to the floor" },
      { label: "Backsplashes", href: "/applications/backsplashes", note: "The wall behind the hob and the sink" },
      { label: "Outdoor kitchens", href: "/applications/outdoor-kitchens", note: "Counters for terraces and gardens" },
    ],
  },
  {
    title: "Bathroom",
    links: [
      { label: "Vanity tops", href: "/applications/bathroom-vanity-tops", note: "Tops with cut-outs or integrated basins" },
      { label: "Shower walls", href: "/applications/shower-walls-and-trays", note: "Large panels in place of tiles and grout" },
      { label: "Washbasins", href: "/applications/washbasins", note: "Integra basins in the same material as the top" },
    ],
  },
  {
    title: "Walls and facades",
    links: [
      { label: "Wall cladding", href: "/applications/wall-cladding", note: "Interior walls clad in large slabs" },
      { label: "Feature walls", href: "/applications/feature-walls", note: "Lobbies, headboards and walls behind a bar" },
      { label: "Backlit features", href: "/applications/backlit-features", note: "Translucent and semi-precious stone, lit from behind" },
      { label: "Fireplace surrounds", href: "/applications/fireplace-surrounds", note: "Hearths and surrounds" },
      { label: "Facades", href: "/applications/facades", note: "Exterior cladding in large-format panels" },
    ],
  },
  {
    title: "Floors and stairs",
    links: [
      { label: "Flooring", href: "/applications/flooring", note: "Granite floors and paving, inside and out" },
      { label: "Staircases", href: "/applications/staircases", note: "Treads, risers and landings" },
    ],
  },
  {
    title: "Commercial and hospitality",
    links: [
      { label: "Bar counters", href: "/applications/bar-counters", note: "Bars in hotels and restaurants" },
      { label: "Reception desks", href: "/applications/reception-desks", note: "Desks for lobbies and offices" },
      { label: "Dining and furniture", href: "/applications/dining-and-furniture", note: "Tables, consoles and desks" },
      { label: "Hospitality interiors", href: "/applications/hospitality-interiors", note: "Hotels, restaurants and spas" },
      { label: "Retail interiors", href: "/applications/retail-interiors", note: "Display plinths, cash desks and wall linings" },
    ],
  },
];

const MATERIALS = [
  {
    cells: ["Quartz", "Countertops, islands, vanity tops, shower walls, cladding, furniture", "Interiors", "12, 20 and 30 mm; slabs up to 3,480 × 2,007 mm"],
    href: "/products/quartz",
  },
  {
    cells: ["Eclipse", "Feature walls, islands and counters with an inlayered design", "Interiors", "Inlayered design quartz"],
    href: "/products/quartz/chromia",
  },
  {
    cells: ["Granite", "Floors, paving, steps, countertops, window sills", "Interiors and exteriors", "Natural stone; finishes vary by stone"],
    href: "/products/granites",
  },
  { cells: ["Beyond Stone", "Facades and large-format cladding", "Exteriors and interiors", "Large-format facade panels"], href: "/products/facades-and-finishes" },
  { cells: ["Translucent", "Backlit walls, bars and counters", "Interiors", "Stone that glows"], href: "/products/translucent" },
  { cells: ["Semi-precious", "Feature pieces, bar fronts, backlit panels", "Interiors", "Hand-selected gemstone"], href: "/products/semi-precious" },
];

const FAQS = [
  {
    q: "Can quartz be used outdoors?",
    a: "Pacific Surfaces quartz is specified for interiors. For terraces, paving, steps and exterior sills, specify granite; for facades, Beyond Stone large-format panels.",
  },
  {
    q: "Which thickness should a kitchen countertop be?",
    a: "2 cm suits a supported counter run. Use 3 cm where the counter carries an unsupported overhang, or mitre a 2 cm edge where a heavier look is wanted.",
  },
  {
    q: "Is Pacific Surfaces quartz certified for food contact?",
    a: "Its NSF/ANSI 51 certificate, the standard for food-contact materials, is on file and opens in full on this page.",
  },
  {
    q: "How large is a single slab?",
    a: "Pacific Surfaces quartz is made in a superjumbo format of up to 3,480 × 2,007 mm (137 × 79 in), so most islands and many walls need no joint.",
  },
  {
    q: "Where can I see the materials installed?",
    a: "The Inspiration Gallery shows projects room by room, and the factory's experience centre shows full slabs, Monday to Saturday, 9 am to 8 pm.",
  },
];

export default function ApplicationsPage() {
  return (
    <main data-light-page className="bg-white text-[#14140f]">
      <BreadcrumbList
        items={[
          { name: "Home", url: "/" },
          { name: "Applications for professionals", url: "/professionals/applications" },
        ]}
      />

      <ProHero
        eyebrow="Professionals · Applications"
        title="Where each surface performs"
        lead="A guide for specifiers: which Pacific Surfaces material suits which part of a project, with the test results and certificates behind it."
        image="/images/india-home/taj-vein-kitchen.webp"
        alt="A kitchen island in Taj Vein quartz"
        ctas={[
          { label: "Ask for a recommendation", href: "/contact#enquiry" },
          { label: "All surfaces", href: "/products" },
        ]}
        facts={[
          { value: "20", label: "Application guides" },
          { value: "6", label: "Material families" },
          { value: "12 · 20 · 30 mm", label: "Quartz thicknesses" },
          { value: "5", label: "Certificates on file" },
        ]}
      />
      <ProNav current="applications" />

      <ProIntro
        eyebrow="Specifying Pacific Surfaces"
        title="The right material for each part of the building"
        body={[
          "Quartz is engineered for interiors: countertops, islands, vanity tops, shower walls and cladding, in 12, 20 and 30 mm and in slabs up to 3,480 × 2,007 mm. Granite takes the floors, paving, steps and sills, inside and out. Beyond Stone panels clad facades, and translucent and semi-precious stone become a light source.",
          "Each application below has its own guide, with the materials to use, the thicknesses that suit it and the details that matter on site.",
        ]}
      />

      <ProCards
        eyebrow="Applications"
        title="Where Pacific Surfaces is specified"
        items={FEATURED}
        columns={3}
        tone="stone"
      />

      <ProIndex eyebrow="Every application" title="All twenty application guides" groups={GROUPS} />

      <ProTable
        eyebrow="Material guide"
        title="Which material where"
        lead="Start from the use, then choose the design. Each material links to its full range."
        columns={["Material", "Best for", "Where", "Format"]}
        rows={MATERIALS}
        tone="stone"
      />

      <section className="bg-white">
        <Container className="py-16 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <div>
              <p className={LABEL}>Test results</p>
              <h2 style={LIGHT} className="mt-4 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-[48px]">
                Tested performance
              </h2>
            </div>
            <p className="max-w-xl text-[17px] font-light leading-relaxed">
              Laboratory results for Pacific Surfaces quartz, 2 cm, across the quartz range, and for Warangal Black granite.
            </p>
          </div>
          <div className="mt-12">
            <MaterialTests />
          </div>
        </Container>
      </section>

      <ProCertificates />

      <ProFaq title="Specification questions" items={FAQS} />

      <ProClose
        title="Not sure which surface fits?"
        body="Tell us where it is going, the room, the loads and the look, and we will suggest the materials and send samples."
        ctas={[
          { label: "Ask for a recommendation", href: "/contact#enquiry" },
          { label: "Fabrication services", href: "/professionals/services" },
        ]}
        image="/images/spaces/hotels/pool-terrace.jpg"
      />
    </main>
  );
}
