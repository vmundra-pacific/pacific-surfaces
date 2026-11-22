/**
 * Short /blog addresses that 404ed (site audit, 2026-11-20). The posts
 * published 2026-10-28 to 2026-11-18 cross-link each other with short
 * slugs (/blog/marble-quartz), but each post went live under the slug
 * Sanity generated from its title, so 58 links in the CMS bodies hit dead
 * ends. The last two are earlier slugs of the May 2026 quartz vs granite
 * post that Search Console still knows. Each goes to the live post on the
 * same topic. If a post is ever published under one of these short slugs,
 * delete its line here, or the redirect hides it.
 */
export const BLOG_SHORT_SLUG_REDIRECTS: {
  source: string;
  destination: string;
}[] = [
  {
    source: "/blog/backlit-quartz",
    destination:
      "/blog/backlit-quartz-how-light-turns-stone-into-the-centrepiece-of-a-space",
  },
  {
    source: "/blog/best-quartz-countertop-brand",
    destination:
      "/blog/choosing-the-best-quartz-countertop-brand-in-india-what-sets-pacific-apart",
  },
  {
    source: "/blog/granite-vs-quartz-outdoor-kitchen",
    destination:
      "/blog/granite-or-quartz-for-an-outdoor-kitchen-which-stone-lasts-outside",
  },
  {
    source: "/blog/hide-joints-quartz-kitchen-platform",
    destination: "/blog/how-to-hide-joints-on-a-long-quartz-kitchen-platform",
  },
  {
    source: "/blog/integrated-quartz-sink-kitchen-slab",
    destination:
      "/blog/kitchen-slab-with-an-integrated-quartz-sink-how-it-works-and-why-it-s-a-smarter-choice",
  },
  {
    source: "/blog/is-quartz-heat-resistant",
    destination: "/blog/is-quartz-heat-resistant-what-indian-cooks-should-know",
  },
  {
    source: "/blog/jumbo-quartz-slabs",
    destination:
      "/blog/jumbo-quartz-slabs-why-slab-size-matters-for-islands-and-long-platforms",
  },
  // No dedicated post; the Ecosurfaces post covers low and zero silica
  // and the SGS test.
  {
    source: "/blog/low-silica-quartz",
    destination:
      "/blog/pacific-ecosurfaces-safe-by-design-from-our-factory-to-your-kitchen",
  },
  {
    source: "/blog/marble-quartz",
    destination: "/blog/marble-quartz-the-marble-look-without-the-upkeep",
  },
  {
    source: "/blog/pacific-ecosurfaces",
    destination:
      "/blog/pacific-ecosurfaces-safe-by-design-from-our-factory-to-your-kitchen",
  },
  {
    source: "/blog/pacific-quartz-safety-certifications",
    destination:
      "/blog/safety-certified-inside-the-standards-behind-pacific-quartz",
  },
  {
    source: "/blog/quartz-bathroom-vanity-tops",
    destination: "/blog/quartz-bathroom-vanity-tops-sizes-basins-and-colours",
  },
  {
    source: "/blog/quartz-countertop-thickness",
    destination: "/blog/quartz-countertop-thickness-12-mm-20-mm-or-30-mm",
  },
  {
    source: "/blog/quartz-dining-table-tops",
    destination: "/blog/quartz-slab-dining-tables-shapes-sizes-and-care",
  },
  {
    source: "/blog/quartz-finishes-room-by-room",
    destination:
      "/blog/which-quartz-finish-where-polished-matte-suede-and-velvet-room-by-room",
  },
  {
    source: "/blog/quartz-kitchen-island-ideas",
    destination:
      "/blog/kitchen-island-ideas-in-quartz-waterfall-ends-overhangs-and-seating",
  },
  {
    source: "/blog/quartz-stone-commercial-spaces",
    destination:
      "/blog/quartz-stone-for-hotels-hospitals-and-restaurant-kitchens",
  },
  {
    source: "/blog/quartz-stone-guide",
    destination:
      "/blog/quartz-stone-what-is-it-how-is-it-made-and-where-it-works-the-best",
  },
  {
    source: "/blog/quartz-vs-granite-kitchen",
    destination: "/blog/quartz-vs-granite-which-is-better-for-your-kitchen",
  },
  {
    source: "/blog/quartz-wall-cladding-showers",
    destination:
      "/blog/quartz-wall-cladding-for-showers-and-wet-areas-a-complete-guide",
  },
  // No dedicated post; the brand guide has the "Questions to ask any
  // quartz company before you buy" checklist.
  {
    source: "/blog/questions-to-ask-quartz-company",
    destination:
      "/blog/choosing-the-best-quartz-countertop-brand-in-india-what-sets-pacific-apart",
  },
  {
    source: "/blog/statuario-calacatta-carrara-marble-quartz",
    destination:
      "/blog/statuario-calacatta-or-carrara-choosing-a-marble-quartz-look-for-your-kitchen",
  },
  {
    source: "/blog/stone-for-kitchen-slab",
    destination:
      "/blog/stone-for-kitchen-slab-granite-quartz-marble-or-sintered-stone",
  },
  {
    source: "/blog/ways-to-use-quartz-in-home-interiors",
    destination: "/blog/the-best-ways-to-use-quartz-in-modern-home-interiors",
  },
  {
    source: "/blog/white-quartz-countertops",
    destination:
      "/blog/white-quartz-countertops-10-shades-and-how-to-pick-yours",
  },
  {
    source: "/blog/quartz-vs-granite-is-better-for-indian-kitchens-in-2026",
    destination:
      "/blog/quartz-vs-granite-which-is-better-for-indian-kitchens-in-2026",
  },
  {
    source: "/blog/quartz-vs-granite-which-is-better-for-indian-kitchens",
    destination:
      "/blog/quartz-vs-granite-which-is-better-for-indian-kitchens-in-2026",
  },
];
