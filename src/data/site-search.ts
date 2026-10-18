import { APPLICATIONS } from "@/data/applications";
import { VANITY_TOP_PRODUCTS } from "@/data/store";

/**
 * The pages the site search finds besides the Sanity products and blog
 * posts (owner, 2026-10-14: "vanity top" and "window sill" found nothing,
 * though both are on the site). Every route a visitor might look for by
 * name: the store and its vanity tops, the sill and threshold collection,
 * every application, space and category page, the learning pages and the
 * company pages. Matched on the server (api/search) so the index never
 * ships to the browser.
 */

export interface SitePage {
  name: string;
  href: string;
  /** Shown under the name in the results. */
  group: string;
  /** Other words people use for it. */
  keywords: string;
}

const STATIC: SitePage[] = [
  // The store
  {
    name: "Store",
    href: "/shop",
    group: "Store",
    keywords: "shop buy order cart vanities vanity tops sinks basins",
  },
  {
    name: "Quartz Vanity Tops",
    href: "/shop/vanity-tops",
    group: "Store",
    keywords:
      "vanity top tops countertop bathroom basin sink single double undermount",
  },
  {
    name: "Integrated Quartz Sinks",
    href: "/products/integra",
    group: "Products",
    keywords:
      "integra sink sinks basin basins washbasin quartz sink kitchen sink",
  },

  // Sills and thresholds
  {
    name: "Window Sills & Thresholds",
    href: "/products/pacific-european-window-sill-threshold-collection",
    group: "Products",
    keywords:
      "window sill sills windowsill windowsills threshold thresholds door sill doorsill wheelchair threshold bevelled bevel single double european granite quartz crate export",
  },

  // Material and category pages
  {
    name: "Quartz",
    href: "/products/quartz",
    group: "Products",
    keywords:
      "quartz mineral infused low silica surface slabs engineered stone collections",
  },
  {
    name: "Eclipse",
    href: "/products/quartz/chromia",
    group: "Products",
    keywords: "eclipse chromia vision inlayered design quartz",
  },
  {
    name: "Granites",
    href: "/products/granites",
    group: "Products",
    keywords: "granite granites natural stone slabs",
  },
  {
    name: "Ecosurfaces",
    href: "/products/ecosurfaces",
    group: "Products",
    keywords: "eco ecosurfaces recycled sustainable surface",
  },
  {
    name: "Semi-Precious Stones",
    href: "/products/semi-precious",
    group: "Products",
    keywords: "semi precious semiprecious gemstone agate amethyst backlit",
  },
  {
    name: "Exotic Collection",
    href: "/products/exotic",
    group: "Products",
    keywords: "exotic natural stone",
  },
  {
    name: "Beyond Stone",
    href: "/products/facades-and-finishes",
    group: "Products",
    keywords: "beyond stone facades finishes facade cladding panels",
  },
  {
    name: "All Products",
    href: "/products",
    group: "Products",
    keywords: "products catalogue slabs colours colors surfaces",
  },
  {
    name: "Catalogue",
    href: "/catalogue",
    group: "Products",
    keywords: "catalogue catalog browse slabs colours",
  },

  // Spaces
  {
    name: "Kitchens",
    href: "/spaces/kitchens",
    group: "Spaces",
    keywords: "kitchen kitchens countertop island worktop",
  },
  {
    name: "Bathrooms",
    href: "/spaces/bathrooms",
    group: "Spaces",
    keywords: "bathroom bathrooms vanity shower washroom",
  },
  {
    name: "Hotels and Hospitality",
    href: "/spaces/hospitality",
    group: "Spaces",
    keywords: "hotel hotels hospitality restaurant lobby",
  },
  {
    name: "Commercial",
    href: "/spaces/commercial",
    group: "Spaces",
    keywords: "commercial office offices retail",
  },
  {
    name: "Architecture",
    href: "/spaces/architecture",
    group: "Spaces",
    keywords: "architecture architects facade building",
  },
  {
    name: "Outdoor",
    href: "/spaces/outdoor",
    group: "Spaces",
    keywords: "outdoor exterior garden patio",
  },
  {
    name: "Flooring",
    href: "/applications/flooring",
    group: "Spaces",
    keywords: "floor flooring tiles pavers granite landscape",
  },
  {
    name: "Spaces",
    href: "/spaces",
    group: "Spaces",
    keywords: "spaces rooms",
  },

  // Tools and help
  {
    name: "Visualizer",
    href: "/visualize",
    group: "Tools",
    keywords: "visualize visualiser visualizer room design try colour",
  },
  {
    name: "Resources",
    href: "/resources",
    group: "Resources",
    keywords:
      "resources downloads catalogues brochures spec sheets technical datasheet",
  },
  {
    name: "Inspiration Gallery",
    href: "/inspirations/inspiration-gallery",
    group: "Inspiration",
    keywords: "inspiration inspirations gallery projects ideas",
  },
  {
    name: "What is quartz?",
    href: "/learn/what-is-quartz",
    group: "Learn",
    keywords: "learn quartz guide mineral infused",
  },
  {
    name: "Quartz care and maintenance",
    href: "/learn/maintenance-quartz",
    group: "Learn",
    keywords: "care cleaning maintenance quartz",
  },
  {
    name: "Granite care and maintenance",
    href: "/learn/maintenance-granites",
    group: "Learn",
    keywords: "care cleaning maintenance granite",
  },
  {
    name: "Quartz warranty",
    href: "/learn/warranty-quartz",
    group: "Learn",
    keywords: "warranty guarantee quartz",
  },
  {
    name: "What is Eclipse?",
    href: "/learn/what-is-vision",
    group: "Learn",
    keywords: "eclipse vision inlayered learn",
  },

  // Professionals
  {
    name: "Professional Services",
    href: "/professionals/services",
    group: "Professionals",
    keywords:
      "professionals services fabrication fab creations architects designers trade",
  },
  {
    name: "Collaboration",
    href: "/professionals/collaboration",
    group: "Professionals",
    keywords: "collaboration architects designers partners",
  },
  {
    name: "Applications for Professionals",
    href: "/professionals/applications",
    group: "Professionals",
    keywords: "applications specification architects",
  },
  {
    name: "Programs",
    href: "/professionals/programs",
    group: "Professionals",
    keywords: "programs program dealers trade partners samples",
  },

  // Company
  {
    name: "About Us",
    href: "/about",
    group: "Company",
    keywords: "about company story our story history factory",
  },
  {
    name: "Sustainability",
    href: "/sustainability",
    group: "Company",
    keywords:
      "sustainability eco green certifications certificates environment",
  },
  {
    name: "Careers",
    href: "/careers",
    group: "Company",
    keywords: "careers jobs work hiring vacancies",
  },
  {
    name: "Blog",
    href: "/blog",
    group: "Company",
    keywords: "blog articles news",
  },
  {
    name: "Contact",
    href: "/contact",
    group: "Company",
    keywords:
      "contact enquiry enquire quote address phone email dealers offices sample",
  },
];

const APPLICATION_PAGES: SitePage[] = APPLICATIONS.map((a) => ({
  name: a.name,
  href: `/applications/${a.slug}`,
  group: "Applications",
  keywords: `${a.slug.replace(/-/g, " ")} ${a.space.name} ${a.title}`,
}));

const VANITY_PAGES: SitePage[] = VANITY_TOP_PRODUCTS.map((t) => ({
  name: t.name,
  href: `/shop/${t.slug}`,
  group: "Store",
  keywords: `${t.layout} vanity top tops bathroom basin sink quartz countertop`,
}));

/** Each address once: the hand-written entry wins over a generated one. */
export const SITE_PAGES: SitePage[] = [
  ...STATIC,
  ...VANITY_PAGES,
  ...APPLICATION_PAGES,
].filter((p, i, all) => all.findIndex((q) => q.href === p.href) === i);

/** "Sills" and "sill", "tops" and "top", "colours" and "colour" match. */
function stem(word: string) {
  // A plain trailing "s" only: "tiles" -> "tile", "finishes" -> "finishe"
  // (still found by "finish", since words match as prefixes); "glass" stays.
  return word.length > 3 && /[^s]s$/.test(word) ? word.slice(0, -1) : word;
}

export function searchWords(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);
}

/**
 * Pages matching every word of the query, each as a word start (so a
 * half-typed "vani" finds vanity tops), best first: words in the name
 * count over words only in the keywords.
 */
export function searchPages(q: string, limit = 6): SitePage[] {
  const words = searchWords(q);
  if (words.length === 0) return [];
  const scored: { page: SitePage; score: number }[] = [];
  for (const page of SITE_PAGES) {
    const nameWords = searchWords(page.name);
    const allWords = [...nameWords, ...searchWords(page.keywords)];
    if (!words.every((w) => allWords.some((h) => h.startsWith(w)))) continue;
    const inName = words.filter((w) =>
      nameWords.some((h) => h.startsWith(w))
    ).length;
    scored.push({
      page,
      score: inName * 2 + (nameWords[0]?.startsWith(words[0]) ? 1 : 0),
    });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.page);
}
