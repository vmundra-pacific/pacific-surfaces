import type { SpacePageData } from "@/components/sections/spaces/SpaceLanding";

/**
 * Copy and media for /spaces/hospitality, "Hotels by Pacific Surfaces",
 * laid out like the kitchens page (owner, 2026-10-05). The photographs are
 * the Pacific Hospitality Collection's own (public/catalogues), extracted
 * as the catalogue holds them, without recompression. The copy follows the
 * catalogue's chapters and names only the designs it names; its scene
 * captions place hotels in named cities, which are not presented here as
 * Pacific references. Figures are the site's own (Superjumbo size and
 * thicknesses).
 */

const H = "/images/spaces/hotels";
const B = "/images/spaces/bathrooms";

export const HOTELS_PAGE: SpacePageData = {
  crumb: "Hotels",
  tabsLabel: "Pacific Surfaces in the hotel",
  idPrefix: "hotel",

  hero: {
    title: "Hotels by Pacific Surfaces",
    lead: "Quartz surfaces for the lobby, the bar and restaurant, the spa, the rooms and the bathrooms: the Pacific Hospitality Collection.",
    image: `${H}/bar-lounge.jpg`,
    alt: "A hotel bar counter in a warm-veined quartz, its top and front in one surface",
  },

  tabs: [
    {
      label: "Communal areas",
      heading: "Spaces to share and socialise",
      body: [
        "Reception desks, wall cladding, stairs, furniture cladding, fireplaces and floors for the lobby and the lounges.",
        "Patagonia, from the Eclipse Series, runs across the walls and the reception elements: one material language through the lobby.",
      ],
      image: `${H}/lobby-patagonia.jpg`,
      alt: "A hotel lobby with walls and reception elements in Patagonia",
    },
    {
      label: "Restaurants",
      heading: "A beautiful and functional space",
      body: [
        "Worktops and bar tops, wall cladding, islands and buffet areas, tables and floors, front and back of house.",
        "Bellagio, from the Nebula Series, on a feature wall and the dining surfaces; Orenda, from the Eclipse Series, on a café's service counter.",
      ],
      image: `${H}/dining-bellagio-2.jpg`,
      alt: "Restaurant booths against a feature wall in Bellagio",
    },
    {
      label: "Bars",
      heading: "Bar counters that hold the room",
      body: [
        "One surface across the counter top and the front fascia, the veining running on from one to the other.",
        "Latte Luxe, from the Kosmic Series, backlit: under warm light its veining shows a rich depth and subtle movement.",
      ],
      image: `${H}/backlit-bar-latte-luxe.jpg`,
      alt: "A backlit bar counter in Latte Luxe glowing under bar stools",
    },
    {
      label: "Spa and wellness",
      heading: "Spaces to experience well-being and care",
      body: [
        "Washbasins, shower trays, shower and cabinet cladding, wall cladding and floors for treatment rooms and the pool.",
        "A calm, continuous surface in a setting made for relaxation, where design plays a key role.",
      ],
      image: `${H}/spa-wall.jpg`,
      alt: "A spa wall clad in a white quartz with warm veining",
    },
    {
      label: "Rooms and suites",
      heading: "Rooms with a design concept of their own",
      body: [
        "Feature walls and full-height wall cladding behind the bed and the lounge, with tables and cabinets to match.",
        "The en-suite in the same design: washbasins, shower trays and shower walls.",
      ],
      image: `${H}/suite-feature-wall.jpg`,
      alt: "A suite lounge with a full-height feature wall in a gold-veined surface",
    },
  ],

  design: {
    heading: "Design your hotel with Pacific Surfaces",
    body: [
      "Quartz and Eclipse in Superjumbo slabs, 3,480 × 2,007 mm, for every surface a guest sees and touches.",
      "From the reception desk and the bar to the spa, the rooms and the bathrooms, in one design or several.",
    ],
    cards: [
      { title: "Reception desks", href: "/applications/reception-desks", image: `${H}/lobby-patagonia.jpg`, alt: "A hotel lobby with reception elements in Patagonia" },
      { title: "Bar counters", href: "/applications/bar-counters", image: `${H}/bar-lounge.jpg`, alt: "A long bar counter in a warm-veined quartz" },
      { title: "Backlit features", href: "/applications/backlit-features", image: `${H}/backlit-bar-latte-luxe-2.jpg`, alt: "A backlit bar in Latte Luxe" },
      { title: "Feature walls", href: "/applications/feature-walls", image: `${H}/suite-feature-wall.jpg`, alt: "A feature wall behind a lounge" },
      { title: "Wall cladding", href: "/applications/wall-cladding", image: `${H}/spa-wall.jpg`, alt: "A spa wall clad in quartz" },
      { title: "Dining and furniture", href: "/applications/dining-and-furniture", image: `${H}/dining-table.jpg`, alt: "A dining table with a white quartz top" },
      { title: "Hospitality interiors", href: "/applications/hospitality-interiors", image: `${H}/restaurant-alabaster-noir-seasons.jpg`, alt: "A restaurant dining room with a dark and light chequered floor" },
    ],
  },

  plan: {
    heading: "Planning a hotel project?",
    body: "Send us the drawings for the lobby, the restaurant, the spa and the rooms. We will help you specify the design, finish and thickness for each space, and put you in touch with a fabricator near the site.",
    cta: { label: "Get a quote", href: "/contact" },
    image: `${H}/cafe-counter-orenda.jpg`,
    alt: "A café service counter and floor in Orenda beneath deep blue cabinets",
  },

  gallery: {
    heading: "Hotel inspiration",
    tags: ["All", "Lobbies", "Restaurants", "Bars", "Spa", "Rooms"],
    shots: [
      { src: `${H}/lobby-bar.jpg`, alt: "A lobby bar with guests", tags: ["All", "Lobbies", "Bars"] },
      { src: `${H}/lobby-patagonia.jpg`, alt: "A lobby in Patagonia", tags: ["All", "Lobbies"] },
      { src: `${H}/pool-terrace.jpg`, alt: "A lounge on a pool terrace", tags: ["All", "Lobbies"] },
      { src: `${H}/communal-table.jpg`, alt: "A long communal table in white quartz", tags: ["All", "Lobbies", "Restaurants"] },
      { src: `${H}/backlit-bar-latte-luxe.jpg`, alt: "A backlit bar in Latte Luxe", tags: ["All", "Bars"] },
      { src: `${H}/bar-lounge.jpg`, alt: "A hotel bar counter", tags: ["All", "Bars"] },
      { src: `${H}/restaurant-table.jpg`, alt: "A restaurant table being served", tags: ["All", "Restaurants"] },
      { src: `${H}/dining-bellagio.jpg`, alt: "Restaurant booths against Bellagio", tags: ["All", "Restaurants"] },
      { src: `${H}/restaurant-alabaster-noir-seasons.jpg`, alt: "A restaurant dining room", tags: ["All", "Restaurants"] },
      { src: `${H}/cafe-counter-orenda.jpg`, alt: "A café counter in Orenda", tags: ["All", "Restaurants", "Bars"] },
      { src: `${H}/buffet.jpg`, alt: "A buffet in front of an open kitchen", tags: ["All", "Restaurants"] },
      { src: `${H}/winter-garden.jpg`, alt: "A restaurant under a glass roof", tags: ["All", "Restaurants"] },
      { src: `${H}/spa-treatment-room.jpg`, alt: "A spa treatment room", tags: ["All", "Spa"] },
      { src: `${H}/spa-pool.jpg`, alt: "An indoor pool beside a backlit wall", tags: ["All", "Spa"] },
      { src: `${H}/wellness-stone-cladding.jpg`, alt: "A wellness area clad in a grey stone pattern", tags: ["All", "Spa"] },
      { src: `${H}/garden-shower.jpg`, alt: "An outdoor shower in a garden", tags: ["All", "Spa"] },
      { src: `${H}/suite-feature-wall.jpg`, alt: "A suite with a feature wall", tags: ["All", "Rooms"] },
      { src: `${H}/suite-lounge.jpg`, alt: "A suite lounge with a veined wall", tags: ["All", "Rooms"] },
      { src: `${H}/lounge-table.jpg`, alt: "A stone coffee table in a lounge", tags: ["All", "Rooms"] },
      { src: `${B}/suite-bathroom.jpg`, alt: "A suite bathroom", tags: ["All", "Rooms"] },
    ],
  },

  colours: {
    heading: "Designs from the Hospitality Collection",
    cta: { label: "View all colours", href: "/products/quartz" },
    /** Sanity slugs of the designs the catalogue names; read at render time. */
    slugs: ["patagonia-p30", "latte-luxe-5040", "bellagio-3016", "orenda-p25", "alabaster-noir-3003", "seasons-4005"],
  },

  catalogue: {
    heading: "The Pacific Hospitality Collection",
    body: "Communal areas, restaurants, spa and wellness, rooms, bathrooms and furniture: the whole collection in one catalogue.",
    cta: { label: "Read the catalogue", href: "/resources?read=pacific-hospitality-collection" },
    image: `${H}/pool-terrace.jpg`,
    alt: "A lounge on a hotel pool terrace",
  },

  faqHeading: "Frequently asked questions about hotels",
  faqs: [
    {
      question: "Where in a hotel can Pacific surfaces be used?",
      answer: "Communal areas and lobbies, restaurants and bars, spa and wellness, rooms and suites, bathrooms and furniture: the six chapters of the Pacific Hospitality Collection.",
    },
    {
      question: "Can a bar counter be backlit?",
      answer: "In a design made for it, yes. The Hospitality Collection shows Latte Luxe, from the Kosmic Series, backlit on a bar. Ask our team which designs suit a backlit application.",
    },
    {
      question: "Can one design run through the whole hotel?",
      answer: "Yes. Pacific quartz is pressed at Superjumbo size, 3,480 × 2,007 mm, in 12, 20 and 30 mm thicknesses, so one design can run from the reception desk to the guest bathrooms.",
    },
    {
      question: "How do we start a hotel project?",
      answer: "Send the drawings through the quote form. Our team helps specify each space and puts you in touch with a fabricator near the site.",
    },
  ],

  spaces: {
    heading: "Pacific Surfaces for every space",
    cards: [
      { title: "Kitchens by Pacific Surfaces", href: "/spaces/kitchens", image: "/images/spaces/kitchen-hero.webp", alt: "A Pacific kitchen with a stone island" },
      { title: "Bathrooms by Pacific Surfaces", href: "/spaces/bathrooms", image: `${B}/garden-bath.jpg`, alt: "A bathroom with a freestanding bath and a walk-in shower" },
      { title: "Flooring by Pacific Surfaces", href: "/applications/flooring", image: "/images/flooring/card-courtyard.webp", alt: "A courtyard floored in granite" },
    ],
  },
};
