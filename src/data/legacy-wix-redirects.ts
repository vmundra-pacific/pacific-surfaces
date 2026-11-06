/**
 * The old Wix site (thepacific.group, and www.pacific-surfaces.com before
 * the rebuild) had pages the new site does not: short colour pages
 * (/sakura), /product-page/<slug> for products since renamed or retired,
 * /category/<series or colour> and /post/<blog slug>. thepacific.group
 * forwards every path to the same path here, so each of them 404ed
 * (286 of the 531 archived pages, checked 2026-11-06).
 *
 * Each goes to the same product or post where one exists, else its
 * series, category or section. Generated from the Internet Archive list
 * and the live sitemap; listed ahead of the catch-all /product-page/:slug
 * rule in next.config.ts so these win.
 */
export const LEGACY_WIX_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/alabasternoir", destination: "/products/alabaster-noir-3003" },
  { source: "/artemis", destination: "/products/artemis-3058" },
  { source: "/arvawhite", destination: "/products/arva-white-1002" },
  { source: "/arya", destination: "/products/arya-3008" },
  { source: "/astralmist", destination: "/products/astral-mist" },
  { source: "/aureate", destination: "/products/aureate-3014" },
  { source: "/awards", destination: "/about" },
  { source: "/bellagio", destination: "/products/bellagio-3016" },
  {
    source: "/biancocristallo-5003",
    destination: "/products/bianco-cristallo",
  },
  { source: "/blacknimbus", destination: "/products/quartz" },
  { source: "/blog/categories/events", destination: "/blog" },
  { source: "/bohemia", destination: "/products/bohemia-3018" },
  { source: "/cappuccino", destination: "/products/cappuccino" },
  { source: "/category-page", destination: "/products" },
  { source: "/category/artemis-range", destination: "/products/quartz" },
  { source: "/category/aurora", destination: "/products/quartz/aurora" },
  { source: "/category/beige", destination: "/products" },
  { source: "/category/black", destination: "/products" },
  { source: "/category/blue", destination: "/products" },
  { source: "/category/brown", destination: "/products" },
  { source: "/category/celestia", destination: "/products/quartz/celestia" },
  { source: "/category/centrepiece-couture", destination: "/products/vanity" },
  { source: "/category/chromia", destination: "/products/quartz/chromia" },
  { source: "/category/concrete", destination: "/products/quartz" },
  { source: "/category/eco-surface", destination: "/products/ecosurfaces" },
  { source: "/category/ecosurfaces", destination: "/products/ecosurfaces" },
  { source: "/category/exotic-collection", destination: "/products/exotic" },
  { source: "/category/gold", destination: "/products" },
  { source: "/category/granite", destination: "/products/granites" },
  { source: "/category/granites", destination: "/products/granites" },
  { source: "/category/green", destination: "/products" },
  { source: "/category/grey", destination: "/products" },
  { source: "/category/kosmic", destination: "/products/quartz/kosmic" },
  { source: "/category/kreos-featured", destination: "/products/quartz" },
  { source: "/category/luminara", destination: "/products/quartz/luminara" },
  { source: "/category/marble", destination: "/products/exotic" },
  { source: "/category/marbles", destination: "/products/exotic" },
  { source: "/category/maroon", destination: "/products" },
  {
    source: "/category/monolith-quartz-vanity",
    destination: "/products/vanity",
  },
  { source: "/category/multi-color", destination: "/products" },
  { source: "/category/nebula", destination: "/products/quartz/nebula" },
  { source: "/category/new-collection", destination: "/products/quartz" },
  { source: "/category/onyx", destination: "/products/semi-precious" },
  { source: "/category/pink", destination: "/products" },
  { source: "/category/purple", destination: "/products" },
  { source: "/category/quartz", destination: "/products/quartz" },
  { source: "/category/quartzite", destination: "/products/exotic" },
  { source: "/category/red", destination: "/products" },
  { source: "/category/rose", destination: "/products" },
  {
    source: "/category/semi-precious-stones",
    destination: "/products/semi-precious",
  },
  { source: "/category/sinks", destination: "/products/integra" },
  { source: "/category/soapstones", destination: "/products/exotic" },
  { source: "/category/statuario", destination: "/products/quartz" },
  {
    source: "/category/stone-finishes",
    destination: "/products/facades-and-finishes",
  },
  { source: "/category/table", destination: "/products/quartz" },
  { source: "/category/terrazo", destination: "/products/quartz" },
  { source: "/category/uncategorized", destination: "/products" },
  { source: "/category/white", destination: "/products" },
  { source: "/certifications", destination: "/resources" },
  { source: "/cherryhill", destination: "/products/cherry-hill-5068" },
  { source: "/chromia", destination: "/products/quartz/chromia" },
  { source: "/classicgray", destination: "/products/classic-gray-1005" },
  { source: "/costa", destination: "/products/costa-3026" },
  { source: "/driftwood", destination: "/products/driftwood-5010" },
  { source: "/echowhite", destination: "/products/echo-white-1001" },
  { source: "/environment", destination: "/sustainability" },
  { source: "/event-details/coverings2024", destination: "/blog" },
  { source: "/events", destination: "/blog" },
  { source: "/events-1", destination: "/blog" },
  { source: "/exoticstones", destination: "/products/exotic" },
  { source: "/fab-creations-cut-to-size", destination: "/products/quartz" },
  { source: "/frenchvanilla", destination: "/products/french-vanilla-5064" },
  { source: "/galactichalo", destination: "/products/galactic-halo-5012" },
  { source: "/general-7", destination: "/" },
  { source: "/glacialsilver", destination: "/products/glacial-silver-3059" },
  { source: "/goldendawn", destination: "/products/golden-dawn-5013" },
  { source: "/havana", destination: "/products/havana-5076" },
  { source: "/hazelgold", destination: "/products/hazel-gold-3039" },
  { source: "/hermes", destination: "/products/hermes-3040" },
  { source: "/home", destination: "/" },
  { source: "/home-source-mailchimp", destination: "/" },
  { source: "/honeydew", destination: "/products/honeydew-3041" },
  { source: "/inspiration", destination: "/inspirations/inspiration-gallery" },
  { source: "/irishcream", destination: "/products/irish-cream-5016" },
  { source: "/job-board", destination: "/careers" },
  { source: "/kosmic-collection", destination: "/products/quartz/kosmic" },
  {
    source: "/kosmic-collection-source-mailchimp",
    destination: "/products/quartz/kosmic",
  },
  { source: "/latteluxe", destination: "/products/latte-luxe-5040" },
  { source: "/maplegaze-5019", destination: "/products/maple-gaze" },
  { source: "/marbles", destination: "/products/exotic" },
  { source: "/nebula-collection", destination: "/products/quartz/nebula" },
  { source: "/our-story", destination: "/about" },
  { source: "/pacific-engineered-surfaces", destination: "/products/quartz" },
  { source: "/pacific-granites-india", destination: "/products/granites" },
  { source: "/pacific-mintek", destination: "/products/ecosurfaces" },
  { source: "/pacific-quartz-surfaces", destination: "/products/quartz" },
  { source: "/poseidon", destination: "/products/poseidon" },
  {
    source:
      "/post/12mm-quartz-slabs-the-next-big-revolution-in-modern-surfaces",
    destination:
      "/blog/12mm-quartz-slabs-the-next-big-revolution-in-modern-surfaces",
  },
  {
    source: "/post/2025-s-top-5-quartz-trends-pacific-s-picks",
    destination: "/blog/2025-s-top-5-quartz-trends-pacific-s-picks",
  },
  {
    source:
      "/post/a-grand-showcase-of-innovation-pacific-at-stone-expo-poland-2025",
    destination:
      "/blog/a-grand-showcase-of-innovation-pacific-at-stone-expo-poland-2025",
  },
  {
    source: "/post/calacatta-quartz-the-epitome-of-modern-design",
    destination: "/blog",
  },
  {
    source:
      "/post/discover-granite-in-over-30-unique-textures-a-journey-of-touch-and-design",
    destination:
      "/blog/discover-granite-in-over-30-unique-textures-a-journey-of-touch-and-design",
  },
  {
    source: "/post/elevate-your-kitchen-with-stunning-new-countertops",
    destination: "/blog",
  },
  {
    source:
      "/post/embracing-elegance-and-durability-the-importance-of-quartz-slabs-in-interior-and-architecture",
    destination: "/blog",
  },
  {
    source:
      "/post/introducing-the-integra-sink-collection-now-available-for-purchase",
    destination:
      "/blog/discover-the-new-integra-sink-collection-now-live-and-available-for-purchase",
  },
  {
    source: "/post/introducing-the-latest-additions-to-the-nebula-collection",
    destination:
      "/blog/introducing-the-latest-additions-to-the-nebula-collection",
  },
  {
    source: "/post/introducing-walnut-a-new-standard-in-subtle-luxury",
    destination: "/blog",
  },
  {
    source: "/post/lifetime-warranty-confidence-that-lasts-forever",
    destination: "/blog/lifetime-warranty-confidence-that-lasts-forever",
  },
  {
    source: "/post/pacific-at-coverings-2024-a-showcase-of-innovation",
    destination: "/blog/pacific-at-coverings-2024-a-showcase-of-innovation",
  },
  {
    source:
      "/post/pacific-at-coverings-2025-orlando-a-showcase-of-scale-innovation-and-craftsmanship",
    destination: "/blog",
  },
  {
    source: "/post/pacific-at-marmomac-2024-a-stunning-success",
    destination: "/blog/pacific-at-marmomac-2024-a-stunning-success",
  },
  {
    source:
      "/post/pacific-at-the-big-5-dubai-a-week-that-redefined-possibilities",
    destination:
      "/blog/pacific-at-the-big-5-dubai-a-week-that-redefined-possibilities",
  },
  {
    source: "/post/pacific-because-excellence-has-an-origin",
    destination: "/blog/pacific-because-excellence-has-an-origin",
  },
  {
    source:
      "/post/pacific-polska-at-ad100-polska-2025-a-night-of-design-excellence-and-inspiration",
    destination:
      "/blog/pacific-polska-at-ad100-polska-2025-a-night-of-design-excellence-and-inspiration",
  },
  {
    source: "/post/pacific-shines-at-acetech-2024",
    destination: "/blog/pacific-shines-at-acetech-2024",
  },
  {
    source: "/post/pacific-unveils-cutting-edge-quartz-manufacturing-plant",
    destination: "/blog",
  },
  {
    source:
      "/post/pacific-unveils-the-revolutionary-kosmic-collection-a-leap-into-the-future-of-quartz-surfaces",
    destination:
      "/blog/pacific-unveils-the-revolutionary-kosmic-collection-a-leap-into-the-future-of-quartz-surfaces",
  },
  {
    source: "/post/quartz-myth-busters-the-truth-behind-the-myths",
    destination: "/blog/quartz-myth-busters-the-truth-behind-the-myths",
  },
  {
    source: "/post/the-art-of-stone-exploring-granite-s-finest-shades",
    destination: "/blog/the-art-of-stone-exploring-granite-s-finest-shades",
  },
  {
    source: "/post/the-secret-formula-to-success",
    destination: "/blog/the-secret-formula-to-success",
  },
  {
    source:
      "/post/the-ultimate-beginner-s-guide-to-choosing-the-perfect-surface",
    destination:
      "/blog/the-ultimate-beginner-s-guide-to-choosing-the-perfect-surface",
  },
  {
    source:
      "/post/uk-stone-show-2025-a-powerful-showcase-of-innovation-scale-style",
    destination:
      "/blog/uk-stone-show-2025-a-powerful-showcase-of-innovation-scale-style",
  },
  {
    source:
      "/post/what-are-the-trendiest-colors-for-architects-in-2025-get-ready-to-elevate-your-interiors-with-the-t",
    destination:
      "/blog/what-are-the-trendiest-colors-for-architects-in-2025-get-ready-to-elevate-your-interiors-with-th",
  },
  {
    source: "/post/which-brand-of-quartz-countertop-is-best-in-2026",
    destination: "/blog",
  },
  { source: "/privacy-policy", destination: "/privacy" },
  { source: "/product-page/adonis-5060", destination: "/products/adonis-5059" },
  {
    source: "/product-page/allura",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/alps-5061", destination: "/products/alps-5060" },
  {
    source: "/product-page/amber-3005",
    destination: "/products/quartz/nebula",
  },
  { source: "/product-page/andromeda-gold", destination: "/products/granites" },
  { source: "/product-page/angola-black", destination: "/products/granites" },
  {
    source: "/product-page/artemis-3059",
    destination: "/products/artemis-3058",
  },
  {
    source: "/product-page/atlantis-gold-3011",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/atlantis-pearl-3012",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/atlantis-sky-3013",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/bamboo",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/bianco-angel", destination: "/products/granites" },
  { source: "/product-page/bianco-antico", destination: "/products/granites" },
  { source: "/product-page/black-dunes", destination: "/products/granites" },
  {
    source: "/product-page/black-soapstone",
    destination: "/products/granites",
  },
  { source: "/product-page/black-thunder", destination: "/products/granites" },
  {
    source: "/product-page/blue-in-the-night",
    destination: "/products/granites",
  },
  {
    source: "/product-page/brisket",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/brooklyn-50057",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/candystripe",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/canopy-5052",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/canyon-gold", destination: "/products/granites" },
  {
    source: "/product-page/caribbean-3020",
    destination: "/products/quartz/nebula",
  },
  { source: "/product-page/carrara-fusion", destination: "/products/quartz" },
  {
    source: "/product-page/catena",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/caterina-3021", destination: "/products/caterina" },
  {
    source: "/product-page/cedar-charm-5005",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/centara-3022",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/cherry-hill-5066",
    destination: "/products/cherry-hill-5068",
  },
  {
    source: "/product-page/cloudy-ascent-5006",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/comet-strands-5008",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/copy-of-mirano-p07",
    destination: "/products/mirano-p07",
  },
  {
    source: "/product-page/crater",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/crescendo", destination: "/products/quartz" },
  {
    source: "/product-page/crimson-flow-p21",
    destination: "/products/crimson-flow-p15",
  },
  {
    source: "/product-page/crystal-frost-5009",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/dakar-5039",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/delano-3028",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/dima",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/dolce-3030",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/enigma",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/evergreen-3035",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/fantasy-brown",
    destination: "/products/brown-fantasy",
  },
  { source: "/product-page/fantasy-river", destination: "/products/granites" },
  {
    source: "/product-page/florence-5065",
    destination: "/products/florence-5067",
  },
  {
    source: "/product-page/frankfurt-5046",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/frenchvanilla-5064",
    destination: "/products/french-vanilla-5064",
  },
  {
    source: "/product-page/fuji",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/fusion-black", destination: "/products/granites" },
  { source: "/product-page/fusion-gold", destination: "/products/granites" },
  {
    source: "/product-page/gabbia",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/gator",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/glacial-silver-3058",
    destination: "/products/glacial-silver-3059",
  },
  { source: "/product-page/gray-fantasy", destination: "/products/granites" },
  {
    source: "/product-page/halcyon-3037",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/harmony-3038",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/helsinki-5015",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/hermes", destination: "/products/hermes-3040" },
  { source: "/product-page/hermes-3053", destination: "/products/hermes-3040" },
  {
    source: "/product-page/horizon-3042",
    destination: "/products/quartz/nebula",
  },
  {
    source: "/product-page/hydra-waterblast",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/hydroflame-flamed-water-cleaned",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/indian-juprana", destination: "/products/granites" },
  {
    source: "/product-page/indian-statuario",
    destination: "/products/granites",
  },
  {
    source: "/product-page/inferno-flamed",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/interstellar",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/kashmir-cream", destination: "/products/granites" },
  {
    source: "/product-page/kimberly-5053",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/kingston-5017",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/la-curva",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/lagoon-2002",
    destination: "/products/quartz/luminara",
  },
  { source: "/product-page/lavender-blue", destination: "/products/granites" },
  { source: "/product-page/linea", destination: "/products/quartz" },
  {
    source: "/product-page/loom",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/luna",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/lunar-light-5018",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/madagascar-white",
    destination: "/products/granites",
  },
  {
    source: "/product-page/mandarin-2004",
    destination: "/products/quartz/luminara",
  },
  { source: "/product-page/maroon-cohiba", destination: "/products/granites" },
  {
    source: "/product-page/martello-bush-hammered",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/matcha-mist",
    destination: "/products/matcha-mist-1",
  },
  { source: "/product-page/mercury-black", destination: "/products/granites" },
  { source: "/product-page/mercury-white", destination: "/products/granites" },
  {
    source: "/product-page/midnight-5020",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/milky-way-5021",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/millennium-gold-1",
    destination: "/products/millennium-gold",
  },
  { source: "/product-page/mistoria", destination: "/products/quartz" },
  {
    source: "/product-page/mocha-muse-5022",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/mont-blanc", destination: "/products/granites" },
  {
    source: "/product-page/nautica-2007",
    destination: "/products/quartz/luminara",
  },
  {
    source: "/product-page/neptune-5023",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/nevada-5049",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/nova-2008",
    destination: "/products/quartz/luminara",
  },
  {
    source: "/product-page/oceana-5026",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/ombrello",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/orion-glow-5027",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/palladium-2011",
    destination: "/products/quartz/luminara",
  },
  { source: "/product-page/panda-white", destination: "/products/granites" },
  {
    source: "/product-page/paradise-city-5070",
    destination: "/products/paradise-city-5072",
  },
  { source: "/product-page/platinum-white", destination: "/products/granites" },
  { source: "/product-page/polar-white", destination: "/products/granites" },
  {
    source: "/product-page/portofino-sky-5047",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/poseidon-5045", destination: "/products/poseidon" },
  {
    source: "/product-page/raffles-2001",
    destination: "/products/quartz/luminara",
  },
  {
    source: "/product-page/rainforest-brown",
    destination: "/products/granites",
  },
  {
    source: "/product-page/rainforest-green",
    destination: "/products/granites",
  },
  {
    source: "/product-page/rette",
    destination: "/products/facades-and-finishes",
  },
  { source: "/product-page/rosewood", destination: "/products/granites" },
  {
    source: "/product-page/rotana-2012",
    destination: "/products/quartz/luminara",
  },
  {
    source: "/product-page/rushmore-5048",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/sage-5055", destination: "/products/quartz/kosmic" },
  {
    source: "/product-page/san-marino-5069",
    destination: "/products/san-marino-5071",
  },
  {
    source: "/product-page/santiago-5059",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/seagrass",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/shadow-mist-5029",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/smoky-ash-1007",
    destination: "/products/quartz/aurora",
  },
  {
    source: "/product-page/solar-mist-5030",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/stella-pearl-4003",
    destination: "/products/quartz/celestia",
  },
  {
    source: "/product-page/sublime",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/sunset-glow-5032",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/terra",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/tremezzo-4007",
    destination: "/products/quartz/celestia",
  },
  {
    source: "/product-page/twilight-5035",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/ultima-white-1010",
    destination: "/products/ultima-white-1014",
  },
  {
    source: "/product-page/valencia-5074",
    destination: "/products/valencia-5073",
  },
  {
    source: "/product-page/velvet-4011",
    destination: "/products/quartz/celestia",
  },
  {
    source: "/product-page/vento",
    destination: "/products/facades-and-finishes",
  },
  {
    source: "/product-page/verdant-veil-5037",
    destination: "/products/quartz/kosmic",
  },
  {
    source: "/product-page/vienna-5042",
    destination: "/products/quartz/kosmic",
  },
  { source: "/product-page/wakanda-5177", destination: "/products/wakanda" },
  {
    source: "/product-page/waldorf-4004",
    destination: "/products/quartz/celestia",
  },
  { source: "/product-page/walnut", destination: "/products/walnut-5070" },
  { source: "/product-page/walnut-5068", destination: "/products/walnut-5070" },
  {
    source: "/product-page/white-fantasy",
    destination: "/products/fantasy-white",
  },
  { source: "/profile/digital/followers", destination: "/" },
  { source: "/profile/digital/profile", destination: "/" },
  { source: "/projects", destination: "/inspirations/inspiration-gallery" },
  { source: "/quartz-cut-to-size", destination: "/products/quartz" },
  { source: "/quartz-surfaces", destination: "/products/quartz" },
  { source: "/quartztables", destination: "/products/quartz" },
  { source: "/ruskin", destination: "/products/ruskin-5028" },
  { source: "/sakura", destination: "/products/sakura" },
  { source: "/sample-request", destination: "/contact" },
  { source: "/sanmarino", destination: "/products/san-marino-5071" },
  { source: "/seasons", destination: "/products/seasons-4005" },
  { source: "/semi-precious-stones", destination: "/products/semi-precious" },
  {
    source:
      "/semi-precious-stonesnatural-stone-surfacesstone-surface-designersstone-surface-finishes",
    destination: "/products/semi-precious",
  },
  { source: "/services-7", destination: "/professionals/services" },
  { source: "/soapstone", destination: "/products/exotic" },
  { source: "/soneva", destination: "/products/soneva-4001" },
  { source: "/stella", destination: "/products/stella-4002" },
  { source: "/stone-finishes", destination: "/products/facades-and-finishes" },
  {
    source: "/stone-finishesstone-finish-texturetypes-of-stone-finishes",
    destination: "/products/facades-and-finishes",
  },
  { source: "/superwhite", destination: "/products/super-white-1009" },
  { source: "/terms-and-conditions", destination: "/privacy" },
  { source: "/upcoming-events", destination: "/blog" },
  { source: "/venezia", destination: "/products/venezia-5075" },
  { source: "/verdantveil", destination: "/products/quartz/kosmic" },
  { source: "/walnut", destination: "/products/walnut-5070" },
  { source: "/workwithus", destination: "/careers" },
  { source: "/zenith", destination: "/products/zenith-2013" },
];
