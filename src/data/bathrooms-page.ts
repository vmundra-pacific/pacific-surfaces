import type { SpacePageData } from "@/components/sections/spaces/SpaceLanding";

/**
 * Copy and media for /spaces/bathrooms, "Bathrooms by Pacific Surfaces",
 * laid out like the kitchens page (owner, 2026-10-05). The photographs are
 * the bathrooms of the Pacific Hospitality Collection (public/catalogues),
 * as the catalogue holds them; the hero is its 5,804 px garden bathroom at
 * 3,000 px. Claims are the site's own: Superjumbo size and thicknesses,
 * non-porous and never sealed, Integra basins fabricated into the top.
 */

const B = "/images/spaces/bathrooms";
const H = "/images/spaces/hotels";

export const BATHROOMS_PAGE: SpacePageData = {
  crumb: "Bathrooms",
  tabsLabel: "Pacific Surfaces in the bathroom",
  idPrefix: "bathroom",

  hero: {
    title: "Bathrooms by Pacific Surfaces",
    lead: "Vanity tops, washbasins, shower trays and walls in one seamless surface.",
    image: `${B}/garden-bath.jpg`,
    alt: "A bathroom with a freestanding bath and a walk-in shower clad in stone, open to a garden",
  },

  tabs: [
    {
      label: "Floor to ceiling",
      heading: "Walls in Superjumbo slabs",
      body: [
        "Shower walls, feature walls and full-height cladding from slabs of 3,480 × 2,007 mm, so a wall goes up with very few joints.",
        "The same design carries on to the floor, the shower tray and the vanity.",
      ],
      image: `${B}/shower-wall.jpg`,
      alt: "A shower wall in a gold-veined surface with a hand shower",
    },
    {
      label: "Vanities and basins",
      heading: "Vanity tops and washbasins from the slab",
      body: [
        "Vanity tops in the bathroom's design, with Integra washbasins of the same quartz fabricated into the top: no joint between basin and counter.",
        "Cabinet cladding and bathroom furniture to match.",
      ],
      image: `${B}/double-vanity.jpg`,
      alt: "Two vanities in a veined quartz between dark timber panels",
    },
    {
      label: "Shower trays",
      heading: "Shower trays in one piece",
      body: [
        "A single piece of quartz cut to the shower opening, standard or bespoke, with no tile grid to clean.",
        "Shower cladding in the same design, so the tray and the walls read as one.",
      ],
      image: `${B}/shower-tray.jpg`,
      alt: "A one-piece white quartz shower tray beside a glass screen",
    },
    {
      label: "Easy to keep",
      heading: "Non-porous, never sealed",
      body: [
        "Quartz is non-porous: water, soap and cosmetics stay on the surface, where a wipe takes them off.",
        "It never needs sealing. Warm water and a mild soap are the whole routine.",
      ],
      image: `${B}/shower-niche.jpg`,
      alt: "A shower with a lit niche and a linear drain",
    },
    {
      label: "Hotel bathrooms",
      heading: "From the home to the hotel suite",
      body: [
        "The bathrooms of the Pacific Hospitality Collection, for guest rooms, suites and spas.",
        "One specification, repeated room after room.",
      ],
      image: `${B}/basin-and-bath.jpg`,
      alt: "A hotel bathroom with a vessel basin, a bath and a dark feature wall",
    },
  ],

  design: {
    heading: "Design your bathroom with Pacific Surfaces",
    body: [
      "Quartz and Eclipse for every surface in the bathroom, in 12, 20 and 30 mm.",
      "From the vanity top and the basin to the shower tray, the walls and the floor.",
    ],
    cards: [
      { title: "Vanity tops", href: "/applications/bathroom-vanity-tops", image: `${B}/double-vanity.jpg`, alt: "Two vanities in a veined quartz" },
      { title: "Shower walls and trays", href: "/applications/shower-walls-and-trays", image: `${B}/walk-in-shower.jpg`, alt: "A walk-in shower with stone walls" },
      { title: "Washbasins", href: "/applications/washbasins", image: `${B}/basin-and-bath.jpg`, alt: "A vessel basin on a stone counter" },
      { title: "Wall cladding", href: "/applications/wall-cladding", image: `${B}/shower-wall.jpg`, alt: "A bathroom wall clad in a veined surface" },
      { title: "Shop vanity tops", href: "/shop/vanity-tops", image: `${B}/vanity-mirror.jpg`, alt: "A vanity under a lit mirror" },
    ],
  },

  plan: {
    heading: "Planning a new bathroom?",
    body: "Bring your plan to our team. We will help you choose the design, finish and thickness, and put you in touch with a fabricator near you.",
    cta: { label: "Get a quote", href: "/contact" },
    image: `${B}/bath-shower-niche.jpg`,
    alt: "A bathroom with a freestanding bath and a shower niche",
  },

  gallery: {
    heading: "Bathroom inspiration",
    tags: ["All", "Showers", "Vanities", "Baths"],
    shots: [
      { src: `${B}/garden-bath.jpg`, alt: "A garden bathroom", tags: ["All", "Baths", "Showers"] },
      { src: `${B}/bath-shower-niche.jpg`, alt: "A bath and a shower niche", tags: ["All", "Baths"] },
      { src: `${B}/bath-and-shower.jpg`, alt: "A bath beside a glazed shower", tags: ["All", "Baths", "Showers"] },
      { src: `${B}/basin-and-bath.jpg`, alt: "A vessel basin and a bath", tags: ["All", "Baths", "Vanities"] },
      { src: `${B}/double-vanity.jpg`, alt: "Two vanities", tags: ["All", "Vanities"] },
      { src: `${B}/vanity-mirror.jpg`, alt: "A vanity under a lit mirror", tags: ["All", "Vanities"] },
      { src: `${B}/walk-in-shower.jpg`, alt: "A walk-in shower", tags: ["All", "Showers"] },
      { src: `${B}/shower-wall.jpg`, alt: "A veined shower wall", tags: ["All", "Showers"] },
      { src: `${B}/shower-niche.jpg`, alt: "A shower with a lit niche", tags: ["All", "Showers"] },
      { src: `${B}/rain-shower.jpg`, alt: "A rain shower in a stone enclosure", tags: ["All", "Showers"] },
      { src: `${B}/shower-tray.jpg`, alt: "A one-piece shower tray", tags: ["All", "Showers"] },
      { src: `${B}/suite-bathroom.jpg`, alt: "A suite bathroom", tags: ["All", "Vanities", "Showers"] },
    ],
  },

  colours: {
    heading: "Popular colours for the bathroom",
    cta: { label: "View all colours", href: "/products/quartz" },
    slugs: ["taj-vein-p01", "patagonia-p30", "latte-luxe-5040", "bellagio-3016", "alabaster-3001", "orenda-p25"],
  },

  catalogue: {
    heading: "The Pacific Hospitality Collection",
    body: "Bathrooms, rooms, spa and wellness, and the rest of the hotel, in one catalogue.",
    cta: { label: "Read the catalogue", href: "/resources?read=pacific-hospitality-collection" },
    image: `${B}/suite-bathroom.jpg`,
    alt: "A suite bathroom with white walls and dark timber",
  },

  faqHeading: "Frequently asked questions about bathrooms",
  faqs: [
    {
      question: "Which Pacific surfaces suit a bathroom?",
      answer: "Mineral infused quartz and Eclipse for vanity tops, washbasins, shower trays and walls: non-porous and never in need of sealing. Every piece is cut to your plan.",
    },
    {
      question: "Can a shower be clad in quartz?",
      answer: "Yes, the walls and the tray. Superjumbo slabs, 3,480 × 2,007 mm, cover most shower walls with very few joints.",
    },
    {
      question: "Does quartz need sealing in a bathroom?",
      answer: "No. The surface is non-porous, so it never needs sealing. Warm water and a mild soap are the whole routine.",
    },
    {
      question: "Can I order a vanity top online?",
      answer: "Yes. The Pacific Store has vanity tops with one, two or three basins, made to your size and colour; our team confirms the order before anything ships.",
    },
  ],

  spaces: {
    heading: "Pacific Surfaces for every space",
    cards: [
      { title: "Kitchens by Pacific Surfaces", href: "/spaces/kitchens", image: "/images/spaces/kitchen-hero.webp", alt: "A Pacific kitchen with a stone island" },
      { title: "Hotels by Pacific Surfaces", href: "/spaces/hospitality", image: `${H}/bar-lounge.jpg`, alt: "A hotel bar counter in quartz" },
      { title: "Flooring by Pacific Surfaces", href: "/applications/flooring", image: "/images/flooring/card-courtyard.webp", alt: "A courtyard floored in granite" },
    ],
  },
};
