/**
 * Copy and media for /spaces/kitchens, laid out after cosentino.com's
 * kitchens page: full-bleed hero, a tabbed strip of five reasons, the
 * kitchen applications as a sliding row, a planning panel, a tabbed
 * inspiration gallery, popular colours, the catalogue, an FAQ and the
 * other spaces. The running order is theirs; the words, figures and
 * photography are Pacific's own (see the pacific-site-facts note: only
 * figures the site already states, technical wording, no plant names).
 */

export interface KitchenTab {
  label: string;
  heading: string;
  body: [string, string];
  image: string;
  alt: string;
}

export interface KitchenCard {
  title: string;
  href: string;
  image: string;
  alt: string;
}

export interface GalleryShot {
  src: string;
  alt: string;
  tags: GalleryTag[];
}

export type GalleryTag = "Kitchens" | "Islands" | "Countertops" | "Backsplashes";

export const KITCHENS_PAGE = {
  hero: {
    title: "Kitchens by Pacific Surfaces",
    lead: "Worktops, islands, backsplashes and sinks, engineered for the room people actually cook in.",
    image: "/images/spaces/kitchen-hero.webp",
    alt: "A Pacific kitchen with stone-clad cabinets, worktop and full-height backsplash in warm light",
  },

  tabs: [
    {
      label: "Engineered surfaces",
      heading: "Engineered on Bretonstone® technology",
      body: [
        "Every Pacific quartz slab is vibro-compacted under vacuum, cured and calibrated on a state-of-the-art Bretonstone plant with fully automated manufacturing.",
        "The result is a dense, non-porous surface with the same colour and pattern from the first slab of a run to the last, so a long kitchen matches end to end.",
      ],
      image: "/images/india-home/bretonstone-robot.webp",
      alt: "A Breton robot at work over a slab in the Pacific plant",
    },
    {
      label: "Superjumbo format",
      heading: "Slabs big enough to leave out the joint",
      body: [
        "Pacific quartz is pressed at Superjumbo size, 3,480 × 2,007 mm, in 12, 20 and 30 mm thicknesses.",
        "Most islands and long counter runs come out of a single piece, with no seam where everyone gathers, and a waterfall end can run in the same slab.",
      ],
      image: "/projects/islands/statuario.webp",
      alt: "A white-veined quartz island by a city window",
    },
    {
      label: "Built for daily cooking",
      heading: "Heat, stain and scratch resistant",
      body: [
        "Turmeric, oil, tea and a hot, busy hob every day. A non-porous surface keeps spills on top, where a wipe takes them off, and never needs sealing.",
        "Certified to NSF/ANSI 51 for food contact: the standard that matters on a surface you prepare food on.",
      ],
      image: "/projects/islands/taj-application.webp",
      alt: "A kitchen island in Taj Vein quartz",
    },
    {
      label: "One stone, whole kitchen",
      heading: "Worktop, island, backsplash and sink in one stone",
      body: [
        "The same design runs from the worktop up the backsplash, across the island and into an Integra sink cut from the slab, so the kitchen reads as one surface.",
        "Every piece is fabricated to your template: cut-outs, edge profiles and upstands included.",
      ],
      image: "/projects/islands/orenda-application.webp",
      alt: "A complete kitchen in Orenda: island, worktop and full-height backsplash",
    },
    {
      label: "Warranty",
      heading: "A lifetime warranty on every slab",
      body: [
        "Pacific surfaces are made to be cooked on, leaned on and lived with for as long as the kitchen stands.",
        "Every slab is inspected under an ISO 9001:2015 quality system before it ships, and carries a lifetime warranty.",
      ],
      image: "/projects/islands/artemis-kitchen.webp",
      alt: "A white quartz kitchen with a long island and tall units",
    },
  ] satisfies KitchenTab[],

  design: {
    heading: "Design your kitchen with Pacific Surfaces",
    body: [
      "Quartz, Eclipse and granite, in 12, 20 and 30 mm and a range of finishes, for every surface in the kitchen.",
      "From the worktop and island to the backsplash, the sink and the walls around them, in one design or several.",
    ],
    cards: [
      { title: "Countertops", href: "/applications/kitchen-countertops", image: "/projects/islands/new-application-image.webp", alt: "A quartz countertop with an undermount sink and bar stools" },
      { title: "Kitchen islands", href: "/applications/kitchen-islands", image: "/projects/islands/arya-application-kitchen.webp", alt: "A quartz island in a kitchen open to a garden" },
      { title: "Backsplashes", href: "/applications/backsplashes", image: "/projects/islands/orenda-kitchen-new.webp", alt: "A full-height stone backsplash behind a hob" },
      { title: "Waterfall islands", href: "/applications/waterfall-islands", image: "/projects/islands/orenda.webp", alt: "A waterfall island in Orenda, the slab running down both ends" },
      { title: "Integrated sinks", href: "/products/integra", image: "/images/products/fab-creations.jpeg", alt: "A basin cut into the same slab as its top" },
      { title: "Wall cladding", href: "/applications/wall-cladding", image: "/projects/cladding/horizon-veil.webp", alt: "A living-room wall clad in large-format stone" },
    ] satisfies KitchenCard[],
  },

  plan: {
    heading: "Planning a new kitchen?",
    body: "Bring your plan to our team. We will help you choose the design, finish and thickness, and put you in touch with a fabricator near you.",
    cta: { label: "Get a quote", href: "/contact" },
    image: "/images/professions/collaboration.jpg",
    alt: "Designers going over a kitchen plan",
  },

  gallery: {
    heading: "Kitchen inspiration",
    tags: ["Kitchens", "Islands", "Countertops", "Backsplashes"] as GalleryTag[],
    shots: [
      { src: "/projects/islands/orenda-application.webp", alt: "Kitchen in Orenda", tags: ["Kitchens", "Islands", "Backsplashes"] },
      { src: "/projects/islands/arya-application-kitchen.webp", alt: "Kitchen in Arya", tags: ["Kitchens", "Islands"] },
      { src: "/projects/islands/artemis-kitchen.webp", alt: "Kitchen in Artemis Grey", tags: ["Kitchens", "Islands"] },
      { src: "/projects/islands/taj-application.webp", alt: "Island in Taj Vein", tags: ["Islands", "Backsplashes"] },
      { src: "/projects/islands/statuario.webp", alt: "Island by a city window", tags: ["Islands"] },
      { src: "/projects/islands/almond-mist-application.webp", alt: "Outdoor island in Almond Mist", tags: ["Kitchens", "Islands"] },
      { src: "/projects/islands/orenda-kitchen-new.webp", alt: "Hob wall and backsplash in Orenda", tags: ["Kitchens", "Backsplashes", "Countertops"] },
      { src: "/projects/islands/new-application-image.webp", alt: "Countertop with bar stools", tags: ["Countertops", "Kitchens"] },
      { src: "/projects/islands/alabaster-noir.webp", alt: "Dark kitchen in Alabaster Noir", tags: ["Kitchens", "Countertops"] },
      { src: "/projects/islands/sakura.webp", alt: "Island in Sakura", tags: ["Islands", "Backsplashes"] },
      { src: "/projects/islands/taj-vein-application-2.webp", alt: "Taj Vein island and wall", tags: ["Islands", "Backsplashes"] },
      { src: "/projects/islands/counter.webp", alt: "Dark worktop detail", tags: ["Countertops"] },
    ] satisfies GalleryShot[],
  },

  colours: {
    heading: "Popular colours for the kitchen",
    cta: { label: "View all colours", href: "/products/quartz" },
    /** Sanity slugs; names and slab photographs are read at render time. */
    slugs: ["taj-vein-p01", "himalayan-vein-p14", "ruskin-5028", "stellar-ember-5031", "galactic-halo-5012", "alabaster-noir-3003"],
  },

  catalogue: {
    heading: "Download our catalogues",
    body: "Every design, format and finish in one place, with technical data for specification.",
    cta: { label: "Go to downloads", href: "/resources" },
    image: "/images/india-home/taj-vein-kitchen.webp",
    alt: "A kitchen island and full-height wall in Taj Vein",
  },

  faqs: [
    {
      question: "Which Pacific surfaces suit a kitchen?",
      answer: "Mineral infused quartz and Eclipse for worktops, islands and backsplashes: non-porous, heat and stain resistant, and never in need of sealing. Granite where natural stone is wanted. Every piece is cut to your template.",
    },
    {
      question: "Can an island be made from a single slab?",
      answer: "In most kitchens, yes. Pacific quartz is pressed at Superjumbo size, 3,480 × 2,007 mm, so most islands and long counters are cut from one piece without a joint.",
    },
    {
      question: "Does a quartz worktop need sealing?",
      answer: "No. The surface is non-porous, so it never needs sealing. Warm water and a mild soap are the whole daily routine.",
    },
    {
      question: "Where can I buy a Pacific kitchen?",
      answer: "Through our network of fabricators and dealers. Send us your plan through the quote form and our team will put you in touch with one near you.",
    },
  ],

  spaces: {
    heading: "Pacific Surfaces for every space",
    cards: [
      { title: "Bathrooms by Pacific Surfaces", href: "/spaces/bathrooms", image: "/projects/bathrooms/bathtub.webp", alt: "A freestanding bath beside a stone-clad shower" },
      { title: "Hotels by Pacific Surfaces", href: "/spaces/hospitality", image: "/projects/cladding/tiffany.webp", alt: "A restaurant booth against a green stone wall" },
      { title: "Flooring by Pacific Surfaces", href: "/applications/flooring", image: "/images/flooring/card-courtyard.webp", alt: "A courtyard floored in New Viscont White granite" },
    ] satisfies KitchenCard[],
  },
};
