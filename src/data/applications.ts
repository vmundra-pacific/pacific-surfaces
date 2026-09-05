/**
 * Pacific Applications — one page per surface use.
 *
 * The Products mega lists fifteen applications. Until now they all
 * pointed at one of six /spaces routes, so three quarters of the menu
 * led somewhere that never mentioned the thing the visitor clicked.
 * Each entry here gets its own /applications/<slug> page instead,
 * following the pattern Cosentino uses (/kitchens/kitchen-countertop,
 * /kitchens/kitchen-claddings, and so on): the application named, the
 * collections that actually suit it, and why.
 *
 * `space` links the application back to the broader room page, which
 * still exists and still gets traffic.
 *
 * Images are drawn from what is already in public/. Several are
 * approximations — a render standing in for a room we have not shot
 * yet — and are marked with a TODO so they are easy to find and
 * replace when real photography lands.
 */

export interface ApplicationSection {
  eyebrow: string;
  headline: string;
  body: string;
  imageLabel: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface Application {
  slug: string;
  /** Menu label — matches the Products mega exactly. */
  name: string;
  /** Breadcrumb / badge, e.g. "Applications · Kitchen". */
  badge: string;
  /** Page H1. */
  title: string;
  /** Hero standfirst, reused as the meta description. */
  description: string;
  /** The room page this belongs under. */
  space: { name: string; href: string };
  sections: ApplicationSection[];
  /**
   * The collections that may be specified for this application, and
   * nothing else. Engineered quartz is resin-bound, so UV and thermal
   * movement rule it out of anything outdoors or underfoot — the same
   * reason Cosentino sells Silestone for countertops, bathrooms and
   * furniture only and routes every facade and floor to Dekton.
   * Rendered on the page so the restriction is visible rather than
   * implied. See lib/application-rules for the product-page guard.
   */
  collections: { name: string; href: string }[];
  /** Slugs of two or three neighbouring applications. */
  related: string[];
  /**
   * Optional SEO block. Where present the page gets a longer, keyword-led
   * headline and intro, a spec table, and a visible FAQ backed by FAQPage
   * structured data.
   *
   * Written after reading how the category is served today: Cosentino's
   * bathroom page carries numbered sections, dense internal links and an
   * FAQ; Quantra's vanity category is a bare product grid with no copy at
   * all. The gap is substance — a page that answers what someone typing
   * "vanity top" actually wants to know (sizes, price basis, material,
   * where to buy) will outrank a grid.
   */
  seo?: {
    /** Overrides the <title>. Keep the head term first. */
    metaTitle: string;
    metaDescription: string;
    /** Terms the copy should genuinely cover, not stuff. */
    intro: string[];
    specs: { label: string; value: string }[];
    faqs: { question: string; answer: string }[];
  };
}

/** Collection shorthands, so the lists below stay readable. */
const C = {
  quartz: { name: "Quartz", href: "/products/quartz" },
  eclipse: { name: "Eclipse", href: "/products/quartz/chromia" },
  eco: { name: "Ecosurfaces", href: "/products/ecosurfaces" },
  granite: { name: "Granites", href: "/products/granites" },
  exotic: { name: "Exotic", href: "/products/exotic" },
  semiPrecious: { name: "Semi-Precious", href: "/products/semi-precious" },
  integra: { name: "Integra", href: "/products/integra" },
  vanity: { name: "Vanity", href: "/products/vanity" },
  centrepiece: {
    name: "Centrepiece Couture",
    href: "/products/centrepiece-couture",
  },
  translucent: { name: "Translucent", href: "/products/translucent" },
  beyondFinish: {
    name: "Beyond Finish",
    href: "/products/facades-and-finishes",
  },
} as const;

export const APPLICATIONS: Application[] = [
  {
    slug: "kitchen-countertops",
    name: "Kitchen Countertops",
    badge: "Applications · Kitchen",
    title: "Countertops built for the way India cooks.",
    description:
      "Heat, knives, turmeric and oil, every day, for decades. The surface that takes the most punishment in the house.",
    space: { name: "Kitchens", href: "/spaces/kitchens" },
    sections: [
      {
        eyebrow: "Quartz",
        headline: "Non-porous, so nothing soaks in.",
        body: "Turmeric, oil and wine sit on the surface rather than in it, and wipe off. Engineered consistency means a long run of counter matches slab to slab — something no natural stone can promise. Never needs sealing.",
        imageLabel: "Quartz countertop",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/images/spaces/kitchens.png",
      },
      {
        eyebrow: "Thickness",
        headline: "2 cm for runs, 3 cm for spans.",
        body: "A 2 cm slab is the standard for a supported counter run. Go to 3 cm where the counter carries an unsupported overhang, or mitre a 2 cm edge to read as 4 cm or heavier without the weight.",
        imageLabel: "Counter detail",
        ctaLabel: "See all colours",
        ctaHref: "/products",
        imageUrl: "/projects/ruskin-kitchen-counter.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.eco, C.granite, C.exotic],
    related: ["kitchen-islands", "backsplashes", "washbasins"],
  },
  {
    slug: "kitchen-islands",
    name: "Kitchen Islands",
    badge: "Applications · Kitchen",
    title: "The island is the room's one uninterrupted gesture.",
    description:
      "At 137 × 79 inches, most islands come out of a single slab — no joint down the middle of the thing everyone gathers around.",
    space: { name: "Kitchens", href: "/spaces/kitchens" },
    sections: [
      {
        eyebrow: "Jumbo format",
        headline: "One slab, no seam.",
        body: "Our super-jumbo format covers the great majority of island layouts in a single piece. Where a seam is unavoidable, book-matching puts the veining to work rather than hiding the join.",
        imageLabel: "Island in quartz",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/projects/ruskin-kitchen-counter.jpg",
      },
      {
        eyebrow: "Waterfall edges",
        headline: "Carry the pattern to the floor.",
        body: "A mitred waterfall turns the island into one continuous piece of stone. Because our pattern runs through the full thickness of the slab, the vein carries around the corner instead of stopping at it.",
        imageLabel: "Waterfall island",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/demo-rooms/kitchen-02/room.png",
      },
    ],
    collections: [C.quartz, C.eclipse, C.eco, C.granite, C.exotic],
    related: ["kitchen-countertops", "bar-counters", "dining-and-furniture"],
  },
  {
    slug: "backsplashes",
    name: "Backsplashes",
    badge: "Applications · Kitchen",
    title: "Stone up the wall, and not a grout line in sight.",
    description:
      "The wall behind the hob takes more splash and heat than anything except the counter itself. Tile it and you are cleaning grout forever.",
    space: { name: "Kitchens", href: "/spaces/kitchens" },
    sections: [
      {
        eyebrow: "Full-height panels",
        headline: "Counter to underside-of-cabinet, in one piece.",
        body: "A full-height backsplash in the same slab as the counter reads as one surface turning a corner. No grout to stain, no joints to scrub, and the veining carries straight up the wall.",
        imageLabel: "Full-height backsplash",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/demo-rooms/kitchen-02/room.png",
      },
      {
        eyebrow: "Thinner is better here",
        headline: "1.2 cm keeps the wall flat.",
        body: "A splashback carries no load, so the thinnest slab is the right one — less depth stolen from the worktop, less weight on the wall fixing, and a cleaner line where panel meets cabinet.",
        imageLabel: "Splashback detail",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/stone-finishes-slider-01.webp",
      },
    ],
    collections: [C.quartz, C.eclipse, C.eco, C.granite, C.beyondFinish],
    related: ["kitchen-countertops", "wall-cladding", "kitchen-islands"],
  },
  {
    slug: "outdoor-kitchens",
    name: "Outdoor Kitchens",
    badge: "Applications · Outdoor",
    title: "A counter that lives outside all year.",
    description:
      "Sun, monsoon, and the temperature swing between them. Outdoors is the hardest test a surface faces.",
    space: { name: "Outdoor & Wet Areas", href: "/spaces/outdoor" },
    sections: [
      {
        eyebrow: "Granite outdoors",
        headline: "Quarried for weather.",
        body: "Natural granite is the surface we specify outdoors: UV-stable, freeze-thaw tolerant, and unbothered by standing water. Its colour will not shift over a decade of direct sun the way a pigmented surface can.",
        imageLabel: "Outdoor counter",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/demo-rooms/kitchen-03/room.png",
      },
      {
        eyebrow: "Finish matters more here",
        headline: "Texture where things get wet.",
        body: "A polish is beautiful and slippery. Leathered or brushed finishes hold grip when the counter is wet and hide the water marks that outdoor surfaces collect daily.",
        imageLabel: "Textured finish",
        ctaLabel: "Explore finishes",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/stone-finishes-slider-01.webp",
      },
    ],
    collections: [C.granite, C.beyondFinish],
    related: ["kitchen-countertops", "flooring", "bar-counters"],
  },
  {
    slug: "bathroom-vanity-tops",
    name: "Vanity Tops",
    badge: "Applications · Bath",
    title: "Quartz vanity tops, cut to your basin.",
    description:
      "Engineered quartz vanity tops and integrated basins, made to size in 36, 48, 60 and 72 inch lengths. Non-porous, stain-resistant, and finished to the wall.",
    space: { name: "Bathrooms", href: "/spaces/bathrooms" },
    sections: [
      {
        eyebrow: "Vanity collection",
        headline: "Cut to the basin, finished to the wall.",
        body: "Vanity tops are fabricated to your basin and tap layout, with the splash upstand in the same slab. Non-porous throughout, so cosmetics and hard-water marks wipe off instead of settling in.",
        imageLabel: "Vanity top",
        ctaLabel: "Explore Vanity",
        ctaHref: "/products/vanity",
        imageUrl: "/images/spaces/bathrooms.jpg",
      },
      {
        eyebrow: "Hygiene",
        headline: "Nothing for bacteria to hold on to.",
        body: "Zero porosity means no absorption of moisture and nowhere for bacteria to sit. Certified food-contact safe, which is a higher bar than a bathroom will ever ask of it.",
        imageLabel: "Vanity detail",
        ctaLabel: "See all colours",
        ctaHref: "/products",
        imageUrl: "/demo-rooms/bathroom-02/room.png",
      },
    ],
    collections: [C.vanity, C.quartz, C.eclipse, C.eco, C.granite],
    related: ["washbasins", "shower-walls-and-trays", "wall-cladding"],
    seo: {
      metaTitle:
        "Vanity Tops — Quartz Bathroom Vanity Tops & Integrated Basins | Pacific Surfaces",
      metaDescription:
        'Quartz vanity tops made to size in 36", 48", 60" and 72" lengths, with integrated basins. Non-porous, stain-resistant, 125+ designs. Order online, no payment taken.',
      intro: [
        "A vanity top is the hardest-working surface in an Indian bathroom. It meets water every morning, then soap, toothpaste, hair oil, cosmetics and hard-water salts — and unlike a kitchen counter, it rarely gets wiped down after each use.",
        "Pacific vanity tops are cut from engineered quartz: non-porous, so nothing soaks in, and stain-resistant to everything a bathroom throws at them. Natural marble stains on all four of those; quartz does not. Each top is fabricated to your basin and tap layout, with the splash upstand cut from the same slab so the joint disappears.",
        "Choose from 125+ designs, in standard lengths of 36, 48, 60 and 72 inches or cut to a size of your own. Basins can be integrated — carved from the same piece — so there is no rim, no silicone seal and nothing to fail in year three.",
      ],
      specs: [
        { label: "Standard lengths", value: '36", 48", 60", 72" — or custom' },
        { label: "Standard widths", value: '18", 20", 22", 24" — or custom' },
        {
          label: "Basin options",
          value: "Integrated single or double, or cut for a counter-top basin",
        },
        { label: "Finishes", value: "Polished, Suede, Leathered, Matte" },
        {
          label: "Material",
          value:
            "Engineered quartz, non-porous, 0% crystalline silica on Ecosurfaces",
        },
        {
          label: "Certification",
          value: "NSF/ANSI 51, Greenguard Gold, CE, ISO 9001:2015",
        },
        { label: "Warranty", value: "Lifetime warranty on every slab" },
      ],
      faqs: [
        {
          question:
            "What is the best material for a bathroom vanity top in India?",
          answer:
            "Engineered quartz, for most bathrooms. It is non-porous, so water, cosmetics and hard-water salts sit on the surface rather than soaking in, and it needs no sealing — unlike marble, which stains from soap and toothpaste, or granite, which needs periodic sealing. Quartz also comes in consistent colours, so a long double vanity matches end to end.",
        },
        {
          question: "What size vanity top do I need?",
          answer:
            'Pacific vanity tops come in standard lengths of 36", 48", 60" and 72", and widths of 18" to 24". A single-basin vanity usually sits at 36" to 48"; a double-basin vanity needs at least 60". Any non-standard size is cut to your template at no design premium.',
        },
        {
          question: "Can the basin be part of the vanity top?",
          answer:
            "Yes. Our Integra basins are fabricated from the same slab as the top, so the surface runs from the counter down into the bowl as one continuous piece. There is no metal rim, no silicone bead and no lip where dirt collects — and nothing to fail and start leaking later.",
        },
        {
          question: "How much does a quartz vanity top cost?",
          answer:
            "Price depends on the design, the size and the fabrication — cut-outs, edge profile and upstand all count. We do not take payment online: add what you need to the cart, place the order, and our team confirms quantities, freight and price before anything ships.",
        },
        {
          question: "Does a quartz vanity top stain?",
          answer:
            "Its low porosity makes it highly resistant to the things a bathroom produces — cosmetics, hair dye, toothpaste and hard-water marks all wipe off. It is certified food-contact safe to NSF/ANSI 51, a higher bar than a bathroom will ever ask of it.",
        },
        {
          question: "Which finish should I choose for a vanity top?",
          answer:
            "Polished for depth and easy cleaning; honed or matte for a calm, glare-free surface; suede or leathered where you want texture and fewer visible water marks. All four carry the same stain and scratch resistance — the finish changes how the colour reads and how the top feels, not how it performs.",
        },
      ],
    },
  },
  {
    slug: "shower-walls-and-trays",
    name: "Shower Walls",
    badge: "Applications · Bath",
    title: "The wet room, without the tile grid.",
    description:
      "Large-format panels replace two hundred tiles and every grout line between them.",
    space: { name: "Bathrooms", href: "/spaces/bathrooms" },
    sections: [
      {
        eyebrow: "Wall panels",
        headline: "Three panels instead of a tiled wall.",
        body: "A shower enclosure lined in full-height slabs has joints you can count on one hand. Nothing to re-grout, nothing to discolour, and the pattern runs unbroken from floor to ceiling.",
        imageLabel: "Shower enclosure",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/demo-rooms/bathroom-03/room.png",
      },
      {
        eyebrow: "Trays",
        headline: "Falls cut into the stone itself.",
        body: "A tray is machined from a single slab with the drainage fall worked into the surface. One piece, one material, and the same finish as the walls around it.",
        imageLabel: "Shower tray",
        ctaLabel: "Explore Integra",
        ctaHref: "/products/integra",
        imageUrl: "/demo-rooms/wc-03/room.png",
      },
    ],
    collections: [C.quartz, C.eco, C.granite, C.beyondFinish],
    related: ["bathroom-vanity-tops", "washbasins", "flooring"],
  },
  {
    slug: "washbasins",
    name: "Washbasins",
    badge: "Applications · Bath",
    title: "A basin with no rim, no seal, no seam.",
    description:
      "Integra fabricates the basin from the same slab as the top it sits in. One material, straight through.",
    space: { name: "Bathrooms", href: "/spaces/bathrooms" },
    sections: [
      {
        eyebrow: "Integra",
        headline: "The basin is the counter.",
        body: "No metal rim, no silicone bead, no lip where dirt collects. The surface runs from the counter down into the bowl as one continuous piece — which is also why there is nothing to fail and start leaking in year three.",
        imageLabel: "Integra basin",
        ctaLabel: "Explore Integra",
        ctaHref: "/products/integra",
        imageUrl: "/demo-rooms/wc-02/room.png",
      },
      {
        eyebrow: "Kitchen sinks too",
        headline: "The same idea, taking heavier use.",
        body: "The same fabrication makes a kitchen sink from your worktop slab. Heat and impact resistance are properties of the material, so the bowl is as tough as the counter it came from.",
        imageLabel: "Integrated sink",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/demo-rooms/pacific-kitchen-01/room.jpg",
      },
    ],
    collections: [C.integra, C.vanity],
    related: [
      "bathroom-vanity-tops",
      "kitchen-countertops",
      "shower-walls-and-trays",
    ],
  },
  {
    slug: "wall-cladding",
    name: "Wall Cladding",
    badge: "Applications · Architecture",
    title: "Clad a feature wall in one piece of stone.",
    description:
      "At 137 × 79 inches, an entire wall can be a single uninterrupted surface. Never tile a feature wall again.",
    space: { name: "Architecture", href: "/spaces/architecture" },
    sections: [
      {
        eyebrow: "Interior cladding",
        headline: "One slab, wall height.",
        body: "Our format is among the largest engineered stone available in India — large enough that most feature walls are a single piece. Where two meet, book-matching makes the join the point rather than the problem.",
        imageLabel: "Clad feature wall",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/demo-rooms/wall-cladding-01/room.png",
      },
      {
        eyebrow: "Weight",
        headline: "1.2 cm, because the wall has to hold it.",
        body: "Cladding carries no load but must be carried. The thinnest slab keeps the fixing detail simple and the dead load low — which matters as much on a drywall partition as on a structural wall.",
        imageLabel: "Cladding detail",
        ctaLabel: "See all colours",
        ctaHref: "/products",
        imageUrl: "/images/spaces/architecture.png",
      },
    ],
    collections: [
      C.quartz,
      C.eclipse,
      C.granite,
      C.beyondFinish,
      C.semiPrecious,
      C.translucent,
    ],
    related: ["facades", "backsplashes", "fireplace-surrounds"],
  },
  {
    slug: "facades",
    name: "Facades",
    badge: "Applications · Architecture",
    title: "The face of the building, in stone that stays.",
    description:
      "A facade is judged in year fifteen, not on handover day. Ours is specified for weather, UV and pollution.",
    space: { name: "Architecture", href: "/spaces/architecture" },
    sections: [
      {
        eyebrow: "Ventilated facades",
        headline: "Engineered for the outside of the building.",
        body: "Low porosity means the panel does not take on water and the freeze-thaw cycle has nothing to work with. Colour holds under direct UV, and pollution washes off a non-porous face rather than staining it.",
        imageLabel: "Ventilated facade",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/images/products/facades.png",
      },
      {
        eyebrow: "Specification",
        headline: "Fire, emissions and conformity, certified.",
        body: "CE marked for EU conformity, Greenguard Gold for indoor air quality, ISO 9001 through the plant. The paperwork a facade consultant will ask for exists before they ask.",
        imageLabel: "Facade detail",
        ctaLabel: "Technical resources",
        ctaHref: "/resources",
        imageUrl: "/images/spaces/architecture.png",
      },
    ],
    collections: [C.granite, C.beyondFinish],
    related: ["wall-cladding", "flooring", "hospitality-interiors"],
  },
  {
    slug: "flooring",
    name: "Flooring",
    badge: "Applications · Architecture",
    title: "Floors that take the traffic and keep the pattern.",
    description:
      "A floor is the largest single surface in any room, and the one that gets walked on ten thousand times a year.",
    space: { name: "Architecture", href: "/spaces/architecture" },
    sections: [
      {
        eyebrow: "Large-format flooring",
        headline: "Fewer joints across a large span.",
        body: "Jumbo slabs cut into large-format tiles put far fewer joints across a lobby or a living floor than standard tiling. The result reads as a stone floor, not a grid of tiles.",
        imageLabel: "Stone flooring",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/images/spaces/architecture.png",
      },
      {
        eyebrow: "Slip resistance",
        headline: "Specify the finish for the footfall.",
        body: "Polished belongs in dry, low-traffic rooms. For entrances, wet areas and anywhere shoes arrive from outside, a honed, leathered or brushed finish gives grip that a polish cannot.",
        imageLabel: "Floor finish",
        ctaLabel: "Explore finishes",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/stone-finishes-slider-01.webp",
      },
    ],
    collections: [C.granite, C.beyondFinish],
    related: ["staircases", "wall-cladding", "hospitality-interiors"],
  },
  {
    slug: "staircases",
    name: "Staircases",
    badge: "Applications · Architecture",
    title: "Treads, risers and stringers from one stone.",
    description:
      "A staircase is the one element people touch, tread on and look up at all at once.",
    space: { name: "Architecture", href: "/spaces/architecture" },
    sections: [
      {
        eyebrow: "Treads and risers",
        headline: "Cut as a set, matched across the flight.",
        body: "Treads and risers cut from the same block run the pattern up the flight instead of restarting at every step. Granite is the specification here: a stair is trafficked, and engineered surfaces are not rated for it.",
        imageLabel: "Stone staircase",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/demo-rooms/bathroom-03/room.png",
      },
      {
        eyebrow: "Underfoot",
        headline: "3 cm treads, textured nosing.",
        body: "A stair tread spans unsupported and takes concentrated load, so it is the one place we always specify the thickest slab. A honed or leathered surface gives grip where a polish would be a hazard.",
        imageLabel: "Tread detail",
        ctaLabel: "Explore finishes",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/stone-finishes-slider-01.webp",
      },
    ],
    collections: [C.granite, C.beyondFinish],
    related: ["flooring", "wall-cladding", "hospitality-interiors"],
  },
  {
    slug: "dining-and-furniture",
    name: "Dining & Furniture",
    badge: "Applications · Furniture",
    title: "Stone as a piece of furniture, not a building material.",
    description:
      "A dining table, a console, a coffee table — where the slab is the object rather than part of the room.",
    space: { name: "Inspiration", href: "/inspirations/inspiration-gallery" },
    sections: [
      {
        eyebrow: "Centrepiece Couture",
        headline: "Made as one object.",
        body: "Our furniture collection treats the slab as the finished piece: a single top, edges worked on all four sides, and a base detailed to the stone rather than bolted under it.",
        imageLabel: "Stone table",
        ctaLabel: "Explore Centrepiece Couture",
        ctaHref: "/products/centrepiece-couture",
        imageUrl: "/projects/latte-luxe.jpg",
      },
      {
        eyebrow: "Semi-precious",
        headline: "When the piece should be the reason for the room.",
        body: "Agate, amethyst and quartz crystal set into a table top make an object nobody else owns. Backlit, these read as light fittings as much as furniture.",
        imageLabel: "Semi-precious top",
        ctaLabel: "Explore Semi-Precious",
        ctaHref: "/products/semi-precious",
        imageUrl: "/images/products/semi-precious.png",
      },
    ],
    collections: [C.centrepiece, C.semiPrecious, C.quartz, C.granite],
    related: ["kitchen-islands", "bar-counters", "fireplace-surrounds"],
  },
  {
    slug: "bar-counters",
    name: "Bar Counters",
    badge: "Applications · Commercial",
    title: "The counter that takes everything that stains.",
    description:
      "Wine, citrus, spirits and coffee, nightly, on the surface people lean on all evening.",
    space: { name: "Commercial", href: "/spaces/commercial" },
    sections: [
      {
        eyebrow: "Behind the bar",
        headline: "Acid, alcohol and citrus, every night.",
        body: "Low porosity and acid resistance mean a wipe-down at close is the whole maintenance routine. No sealing, no annual refinishing, and no ring left where a glass stood.",
        imageLabel: "Bar top",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/projects/cappuccino-1.jpg",
      },
      {
        eyebrow: "The front",
        headline: "A single face, floor to counter.",
        body: "Large-format slabs run a bar front as one uninterrupted plane, with mitred returns at each end giving it visual mass without the weight of solid stone.",
        imageLabel: "Bar front",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/projects/cappuccino-3.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.granite, C.exotic, C.semiPrecious],
    related: ["reception-desks", "hospitality-interiors", "backlit-features"],
  },
  {
    slug: "reception-desks",
    name: "Reception Desks",
    badge: "Applications · Commercial",
    title: "The first surface a visitor touches.",
    description:
      "A reception desk is brand collateral that also has to survive being leaned on all day.",
    space: { name: "Commercial", href: "/spaces/commercial" },
    sections: [
      {
        eyebrow: "The desk",
        headline: "One plane, wall to wall.",
        body: "A reception front cut from jumbo slabs runs unbroken across the lobby. Book-matching a long desk turns the one unavoidable joint into the centreline of the composition.",
        imageLabel: "Reception desk",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/images/spaces/commercial.jpg",
      },
      {
        eyebrow: "Wear",
        headline: "Ten thousand hands a year.",
        body: "The desk edge takes rings, bags, badges and elbows all day. Scratch and impact resistance are properties of the material, so it looks the same in year five as on handover.",
        imageLabel: "Desk edge",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/images/professions/collaboration.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.granite, C.beyondFinish],
    related: ["bar-counters", "retail-interiors", "feature-walls"],
  },
  {
    slug: "waterfall-islands",
    name: "Waterfall Islands",
    badge: "Applications · Kitchen",
    title: "Carry the stone over the edge and down to the floor.",
    description:
      "A mitred waterfall turns an island into one continuous piece rather than a top sitting on a base.",
    space: { name: "Kitchens", href: "/spaces/kitchens" },
    sections: [
      {
        eyebrow: "The mitre",
        headline: "The vein turns the corner.",
        body: "Because the pattern runs through the full thickness of the slab, a 45-degree mitre carries the veining around the corner instead of stopping it dead at the edge. Cut from one slab, the grain reads continuously from worktop to floor.",
        imageLabel: "Waterfall island",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/demo-rooms/kitchen-02/room.png",
      },
      {
        eyebrow: "Specification",
        headline: "2 cm mitred reads as 4, 6 or 10.",
        body: "The visible edge is a function of the mitre, not the slab: a 2 cm top can present a 100 mm face without the weight or cost of solid stone. Fabrication is exacting, so template early.",
        imageLabel: "Mitred edge",
        ctaLabel: "Explore Fab Creations",
        ctaHref: "/products/fab-creations",
        imageUrl: "/projects/ruskin-kitchen-counter.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.granite, C.exotic],
    related: ["kitchen-islands", "kitchen-countertops", "dining-and-furniture"],
  },
  {
    slug: "feature-walls",
    name: "Feature Walls",
    badge: "Applications · Interiors",
    title: "One wall doing all the talking.",
    description:
      "The wall a room is built around — a lobby, a headboard, a chimney breast, the face behind a bar.",
    space: { name: "Architecture", href: "/spaces/architecture" },
    sections: [
      {
        eyebrow: "Book-matching",
        headline: "Two slabs opened like a book.",
        body: "Consecutive slabs cut from the same block and mirrored make a symmetrical pattern the width of the wall. It is the one detail that reads instantly as stone rather than surface, and it has to be planned at slab selection.",
        imageLabel: "Book-matched wall",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/demo-rooms/wall-cladding-01/room.png",
      },
      {
        eyebrow: "Material",
        headline: "Where the rarest stone earns its place.",
        body: "A feature wall takes no wear and carries no load, which makes it the right home for semi-precious and exotic material too valuable to put on a worktop.",
        imageLabel: "Semi-precious panel",
        ctaLabel: "Explore Semi-Precious",
        ctaHref: "/products/semi-precious",
        imageUrl: "/images/products/semi-precious.png",
      },
    ],
    collections: [
      C.beyondFinish,
      C.semiPrecious,
      C.translucent,
      C.quartz,
      C.eclipse,
      C.granite,
    ],
    related: ["wall-cladding", "backlit-features", "reception-desks"],
  },
  {
    slug: "backlit-features",
    name: "Backlit Features",
    badge: "Applications · Interiors",
    title: "Stone lit from behind, not in front.",
    description:
      "Translucent and semi-precious surfaces stop being a surface and become the light source.",
    space: { name: "Inspiration", href: "/inspirations/inspiration-gallery" },
    sections: [
      {
        eyebrow: "Translucent",
        headline: "Depth daylight cannot show.",
        body: "Lit from behind, veining and crystal structure that read as pattern in daylight read as depth instead. Works on a bar front, a reception desk, an island end or a wall panel.",
        imageLabel: "Backlit panel",
        ctaLabel: "Explore Translucent",
        ctaHref: "/products/translucent",
        imageUrl: "/images/products/translucent.jpeg",
      },
      {
        eyebrow: "Building it",
        headline: "The light box is the detail.",
        body: "Even illumination needs an LED plane set back from the stone, not fixed to it, and a thinner slab than you would use elsewhere. Bring us in at detail design — this is one to resolve before the joinery is made.",
        imageLabel: "Backlit detail",
        ctaLabel: "Explore Semi-Precious",
        ctaHref: "/products/semi-precious",
        imageUrl: "/images/products/semi-precious.png",
      },
    ],
    collections: [C.translucent, C.semiPrecious],
    related: ["feature-walls", "bar-counters", "reception-desks"],
  },
  {
    slug: "retail-interiors",
    name: "Retail Interiors",
    badge: "Applications · Commercial",
    title: "Surfaces that sell the thing standing on them.",
    description:
      "Display plinths, cash desks, wall linings and fitting rooms, in spaces refitted more often than they are rebuilt.",
    space: { name: "Commercial", href: "/spaces/commercial" },
    sections: [
      {
        eyebrow: "Display",
        headline: "A quiet ground for loud product.",
        body: "Retail surfaces work hardest when they recede. Honed and matte finishes kill the glare that fights a product under spotlights, and a consistent colour across a rollout keeps every store on brand.",
        imageLabel: "Retail interior",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/images/spaces/commercial.jpg",
      },
      {
        eyebrow: "Rollout",
        headline: "Store forty matches store one.",
        body: "Engineered production means batch consistency across a rollout and across phases years apart — something no quarried stone can promise when a fit-out runs for three years.",
        imageLabel: "Rollout detail",
        ctaLabel: "Talk to us",
        ctaHref: "/contact",
        imageUrl: "/images/professions/services.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.granite, C.beyondFinish],
    related: ["hospitality-interiors", "reception-desks", "feature-walls"],
  },
  {
    slug: "hospitality-interiors",
    name: "Hospitality Interiors",
    badge: "Applications · Commercial",
    title: "Specified across hotels, QSR, hospitals and airports.",
    description:
      "High-traffic interiors where the surface has to look installed-yesterday for a decade.",
    space: { name: "Commercial", href: "/spaces/commercial" },
    sections: [
      {
        eyebrow: "Contract specification",
        headline: "Rated for the traffic it will actually see.",
        body: "Food-contact safe to NSF/ANSI 51, low-emission to Greenguard Gold, and CE marked. Specified in luxury hotels, QSR chains, hospitals and airports across 45+ countries.",
        imageLabel: "Hospitality interior",
        ctaLabel: "Explore Quartz",
        ctaHref: "/products/quartz",
        imageUrl: "/projects/cappuccino-1.jpg",
      },
      {
        eyebrow: "Consistency at volume",
        headline: "Slab forty matches slab one.",
        body: "A hotel rollout needs the same colour across hundreds of rooms and, often, across phases years apart. Engineered production means batch consistency a quarried stone cannot offer.",
        imageLabel: "Volume install",
        ctaLabel: "Talk to us",
        ctaHref: "/contact",
        imageUrl: "/images/spaces/commercial.jpg",
      },
    ],
    collections: [C.quartz, C.eclipse, C.eco, C.granite],
    related: ["bar-counters", "flooring", "facades"],
  },
  {
    slug: "fireplace-surrounds",
    name: "Fireplace Surrounds",
    badge: "Applications · Interiors",
    title: "The one surface in the room that meets fire.",
    description:
      "A hearth and surround has to take direct heat without discolouring or cracking.",
    space: { name: "Inspiration", href: "/inspirations/inspiration-gallery" },
    sections: [
      {
        eyebrow: "Heat",
        headline: "Specify granite at the firebox.",
        body: "Natural granite takes direct radiant heat without discolouring, which is why we specify it closest to the opening. Engineered surfaces belong on the outer surround and hearth, away from sustained direct heat.",
        imageLabel: "Fireplace surround",
        ctaLabel: "Explore Granites",
        ctaHref: "/products/granites",
        imageUrl: "/projects/cappuccino-3.jpg",
      },
      {
        eyebrow: "The chimney breast",
        headline: "Carry the stone to the ceiling.",
        body: "A full-height chimney breast in one slab turns the fireplace into the room's anchor. The same material as the hearth, running unbroken from floor to ceiling.",
        imageLabel: "Chimney breast",
        ctaLabel: "Explore Beyond Finish",
        ctaHref: "/products/facades-and-finishes",
        imageUrl: "/demo-rooms/wall-cladding-01/room.png",
      },
    ],
    collections: [C.granite, C.beyondFinish],
    related: ["wall-cladding", "dining-and-furniture", "flooring"],
  },
];

export function applicationBySlug(slug: string): Application | undefined {
  return APPLICATIONS.find((a) => a.slug === slug);
}
