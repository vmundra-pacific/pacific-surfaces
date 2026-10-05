import type { SpaceCard, SpaceShot, SpaceTab } from "@/components/sections/spaces/SpaceBlocks";

/**
 * Copy and media for /applications/flooring, "Flooring by Pacific
 * Surfaces", laid out like the kitchens page (owner, 2026-10-05).
 *
 * Every fact is from the owner's Landscape Edition catalogue (Pacific
 * Granites India): the eight granites, the six finishes, the paver formats
 * and the technical data for four of the granites. The photographs are the
 * catalogue's own, at the size the PDF holds them (about 1,000 px wide), so
 * none is shown wider than that: the hero is three of them side by side.
 * No slip ratings or other performance claims the catalogue doesn't make,
 * and no plant names in the copy.
 */

const IMG = "/images/flooring";

export interface FloorFinish {
  name: string;
  /** Shown on this granite in the catalogue. */
  shownOn: string;
  image: string;
  note: string;
}

export interface GraniteData {
  name: string;
  density: string;
  porosity: string;
  flexural: string;
  compressive: string;
  absorption: string;
}

export const FLOORING_PAGE = {
  hero: {
    title: "Flooring by Pacific Surfaces",
    lead: "Granite floors, paving and steps, inside and out, in eight granites and six finishes.",
    images: [
      { src: `${IMG}/red-multi-patio.webp`, alt: "A garden patio paved in Red Multi granite" },
      { src: `${IMG}/new-viscont-white-courtyard.webp`, alt: "A courtyard floored in New Viscont White granite" },
      { src: `${IMG}/black-tea-pavers.webp`, alt: "Black Tea granite pavers around a lounge" },
    ],
  },

  tabs: [
    {
      label: "Natural granite",
      heading: "Eight granites in the Landscape Edition",
      body: [
        "Steel Grey, Viscont White, New Viscont White, Absolute Black, Red Multi, Tan Brown, Black Tea and Sadarahalli Grey, each cut and finished by Pacific Granites India.",
        "Dense stones, from 2,600 to 3,250 kg/m³, with compressive strengths of 150 to 230 MPa, for the four granites with technical sheets.",
      ],
      image: `${IMG}/steel-grey-patio.webp`,
      alt: "A patio paved in Steel Grey granite with a dining set",
    },
    {
      label: "Six finishes",
      heading: "From a polished face to a flamed one",
      body: [
        "Polished, Leather, Lapotura, River, Antik, and Flamed & Waterjet: the same granite can read glossy indoors and textured on a terrace.",
        "Finishes are chosen per granite and per floor, so a living room and the patio outside it can share one stone.",
      ],
      image: `${IMG}/black-tea-pavers.webp`,
      alt: "Black Tea granite pavers laid with gravel joints",
    },
    {
      label: "Paving formats",
      heading: "Nine paver formats, in 3 and 5 cm",
      body: [
        "From 10 × 10 cm setts to 90 × 45 cm slabs: 20 × 10, 30 × 25, 30 × 30, 60 × 25, 60 × 30, 60 × 50 and 75 × 25 cm in between.",
        "Every format comes in 3 cm and 5 cm thicknesses; larger floors and steps are cut to your plan.",
      ],
      image: `${IMG}/tan-brown-terrace.webp`,
      alt: "A terrace in Tan Brown granite squares with a café table",
    },
    {
      label: "Low absorption",
      heading: "Little water gets in",
      body: [
        "Water absorption runs from 0.08 % by weight for Absolute Black to 0.62 % for Steel Grey, with open porosity of 0.2 to 0.7 % by volume.",
        "Figures from the Landscape Edition technical sheets; the table further down gives them granite by granite.",
      ],
      image: `${IMG}/sadarahalli-grey-pool.webp`,
      alt: "A pool deck paved in Sadarahalli Grey granite",
    },
    {
      label: "Indoors and out",
      heading: "One stone from the living room to the garden",
      body: [
        "Patios, pool surrounds, courtyards, paths and steps outside; floors, stairs and thresholds inside.",
        "Window sills and thresholds come in granite too, from the Pacific European Window Sill & Threshold Collection.",
      ],
      image: `${IMG}/new-viscont-white-courtyard.webp`,
      alt: "A courtyard floored in New Viscont White granite",
    },
  ] satisfies SpaceTab[],

  finishes: [
    { name: "Polished", shownOn: "Steel Grey", image: `${IMG}/finish-steel-grey-polished.webp`, note: "Glossy and smooth; it deepens the colour." },
    { name: "Lapotura", shownOn: "Steel Grey", image: `${IMG}/finish-steel-grey-lapotura.webp`, note: "Textured, with a sheen on the high points." },
    { name: "Flamed & Waterjet", shownOn: "Steel Grey", image: `${IMG}/finish-steel-grey-flamed.webp`, note: "A rough, open texture." },
    { name: "Antik", shownOn: "Absolute Black", image: `${IMG}/finish-black-antik.webp`, note: "A soft, worn-in texture." },
    { name: "River", shownOn: "Absolute Black", image: `${IMG}/finish-black-river.webp`, note: "Smooth to the touch, with a low sheen." },
    { name: "Flamed & Waterjet", shownOn: "Red Multi", image: `${IMG}/finish-red-multi-flamed.webp`, note: "The same rough texture on a warm granite." },
  ] satisfies FloorFinish[],

  /** Paver formats, cm, each in 3 and 5 cm thicknesses. */
  formats: ["10 × 10", "20 × 10", "30 × 25", "30 × 30", "60 × 25", "60 × 30", "60 × 50", "75 × 25", "90 × 45"],

  technical: [
    { name: "Steel Grey", density: "2,600–2,750", porosity: "0.4", flexural: "14–15", compressive: "150–180", absorption: "0.10–0.62" },
    { name: "Viscont White", density: "2,610–2,900", porosity: "0.5", flexural: "20–21", compressive: "170–204", absorption: "0.15–0.40" },
    { name: "Absolute Black", density: "3,050–3,250", porosity: "0.2", flexural: "12–13", compressive: "215–230", absorption: "0.08–0.10" },
    { name: "Red Multi", density: "2,610–2,690", porosity: "0.7", flexural: "11–17", compressive: "160–190", absorption: "0.25–0.30" },
  ] satisfies GraniteData[],

  // Each card shows what it names: the granite on a floor, or the sill
  // (owner, 2026-10-05: application cards that showed only floors read wrong).
  design: {
    heading: "Design your floor with Pacific Surfaces",
    body: [
      "Granite in six finishes and nine paver formats, for the floors, paths and steps of a house or a whole project.",
      "Open a granite to see the full slab, or carry the stone onto the window sills and thresholds.",
    ],
    cards: [
      { title: "Absolute Black", href: "/products/absolute-black", image: `${IMG}/absolute-black-terrace.webp`, alt: "Absolute Black granite on a terrace by a garden" },
      { title: "Red Multi", href: "/products/red-multi", image: `${IMG}/red-multi-patio.webp`, alt: "A garden patio in Red Multi granite" },
      { title: "Viscont White", href: "/products/viscont-white", image: `${IMG}/viscont-white-deck.webp`, alt: "A deck in Viscont White granite seen from above" },
      { title: "Tan Brown", href: "/products/tan-brown", image: `${IMG}/tan-brown-terrace.webp`, alt: "Tan Brown granite squares on a terrace" },
      { title: "Window sills & thresholds", href: "/products/pacific-european-window-sill-threshold-collection", image: "/images/thresholds-and-sills/granite-sill-brown.jpg", alt: "A brown granite window sill" },
      { title: "All granites", href: "/products/granites", image: `${IMG}/steel-grey-patio.webp`, alt: "A patio paved in Steel Grey granite" },
    ] satisfies SpaceCard[],
  },

  gallery: {
    heading: "Flooring inspiration",
    tags: ["All", "Patios", "Pools", "Courtyards", "Terraces"],
    shots: [
      { src: `${IMG}/steel-grey-patio.webp`, alt: "Steel Grey patio", tags: ["All", "Patios"] },
      { src: `${IMG}/red-multi-patio.webp`, alt: "Red Multi patio", tags: ["All", "Patios"] },
      { src: `${IMG}/new-viscont-white-courtyard.webp`, alt: "New Viscont White courtyard", tags: ["All", "Courtyards"] },
      { src: `${IMG}/sadarahalli-grey-pool.webp`, alt: "Sadarahalli Grey pool deck", tags: ["All", "Pools"] },
      { src: `${IMG}/absolute-black-terrace.webp`, alt: "Absolute Black terrace", tags: ["All", "Terraces", "Pools"] },
      { src: `${IMG}/tan-brown-terrace.webp`, alt: "Tan Brown terrace", tags: ["All", "Terraces"] },
      { src: `${IMG}/black-tea-pavers.webp`, alt: "Black Tea pavers", tags: ["All", "Patios", "Terraces"] },
      { src: `${IMG}/viscont-white-deck.webp`, alt: "Viscont White deck", tags: ["All", "Courtyards", "Terraces"] },
    ] satisfies SpaceShot[],
  },

  colours: {
    heading: "Popular granites for floors",
    cta: { label: "View all granites", href: "/products/granites" },
    /** Sanity slugs of the Landscape Edition granites the catalogue lists. */
    slugs: ["absolute-black", "viscont-white", "red-multi", "tan-brown"],
  },

  plan: {
    heading: "Planning a floor or a terrace?",
    body: "Send us the plan or the area to cover. We will help you choose the granite, the finish and the format, and put you in touch with a dealer near you.",
    cta: { label: "Get a quote", href: "/contact#enquiry" },
    image: `${IMG}/viscont-white-deck.webp`,
    alt: "A Viscont White granite deck seen from above",
  },

  faqs: [
    {
      question: "Which granites are in the Landscape Edition?",
      answer: "Steel Grey, Viscont White, New Viscont White, Absolute Black, Red Multi, Tan Brown, Black Tea and Sadarahalli Grey.",
    },
    {
      question: "Which finishes are available?",
      answer: "Polished, Leather, Lapotura, River, Antik, and Flamed & Waterjet. Polished suits interiors; the textured finishes are the usual choice outdoors. Our team will advise on the finish for your floor.",
    },
    {
      question: "What sizes do pavers come in?",
      answer: "Nine formats from 10 × 10 cm to 90 × 45 cm, each in 3 cm and 5 cm thicknesses. Larger floors and steps are cut to your plan.",
    },
    {
      question: "How do I order?",
      answer: "Send us your plan or the area to cover through the quote form. Our team confirms the granite, finish and format, and puts you in touch with a dealer near you.",
    },
  ],

  spaces: {
    heading: "Pacific Surfaces for every space",
    cards: [
      { title: "Kitchens by Pacific Surfaces", href: "/spaces/kitchens", image: "/images/spaces/kitchen-hero.webp", alt: "A Pacific kitchen with a stone island" },
      { title: "Bathrooms by Pacific Surfaces", href: "/spaces/bathrooms", image: "/projects/bathrooms/bathtub.webp", alt: "A freestanding bath beside a stone-clad shower" },
      { title: "Hotels by Pacific Surfaces", href: "/spaces/hospitality", image: "/projects/cladding/tiffany.webp", alt: "A restaurant booth against a green stone wall" },
    ] satisfies SpaceCard[],
  },
};
