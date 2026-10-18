import {
  ALTERNATE_NAME,
  ALTERNATE_NAME_PAGE,
  EMAIL,
  FACTORY,
  FACTORY_ADDRESS,
  FACTORY_PHONE,
  FOUNDING_YEAR,
  HOME_H1,
  OPENING_HOURS,
  SALES_PHONE,
  SITE_URL,
} from "@/data/business";

/**
 * GET /llms.txt — a short map of the site for language-model tools
 * (llmstxt.org): who Pacific Surfaces is, how to reach it, and the main
 * pages. The name, address, phones and hours come from data/business.ts,
 * so they match the footer, the Contact page and the JSON-LD.
 *
 * Only what the site already states and nobody disputes. The silica and
 * composition figures, Greenguard, slab sizes and thicknesses, the
 * warranty term and the design and collection counts stay out until the
 * owner settles them (site audit, AEO-FACTS-01 to 03); add them here when
 * they are settled everywhere else.
 */

export const dynamic = "force-static";

const link = (name: string, path: string, note?: string) =>
  `- [${name}](${SITE_URL}${path})${note ? `: ${note}` : ""}`;

const BODY = [
  "# Pacific Surfaces",
  "",
  `> ${HOME_H1}: engineered quartz and granite surfaces for kitchens, bathrooms and architecture, made in India and shipped to 45+ countries.`,
  "",
  `Pacific Surfaces grew from a granite business founded in ${FOUNDING_YEAR} and makes its quartz at a Bretonstone plant in India. The brand is also searched for as ${ALTERNATE_NAME} (${SITE_URL}${ALTERNATE_NAME_PAGE}), and the registered company is ${FACTORY.name}`,
  "",
  "## Contact",
  "",
  `- Factory and experience centre: ${FACTORY.name}, ${FACTORY_ADDRESS}, India`,
  `- Opening hours: ${OPENING_HOURS.display}`,
  `- Sales: ${SALES_PHONE.display}`,
  `- Factory: ${FACTORY_PHONE.display}`,
  `- Email: ${EMAIL}`,
  `- Map: ${FACTORY.mapUrl}`,
  link("Contact page", "/contact", "quotes, samples and project enquiries"),
  "",
  "## Products",
  "",
  link("All products", "/products"),
  link(
    "Quartz",
    "/products/quartz",
    "quartz slabs for kitchens, vanities and feature walls"
  ),
  link(
    ALTERNATE_NAME,
    ALTERNATE_NAME_PAGE,
    "engineered quartz slabs by Pacific Surfaces, made at a Bretonstone plant in India"
  ),
  link(
    "Eclipse",
    "/products/quartz/chromia",
    "inlayered design quartz, with the pattern engineered through the slab"
  ),
  link(
    "Granites",
    "/products/granites",
    "natural granite slabs, sourced and finished in-house"
  ),
  link(
    "Semi-Precious Stones",
    "/products/semi-precious",
    "gemstone surfaces such as agate, amethyst and malachite"
  ),
  link(
    "Exotic Collection",
    "/products/exotic",
    "slabs hand-selected for striking veining"
  ),
  link(
    "Centrepiece Couture",
    "/products/centrepiece-couture",
    "gallery-grade statement slabs"
  ),
  link(
    "Integra",
    "/products/integra",
    "quartz sinks fabricated to fuse seamlessly with the countertop"
  ),
  link("Vanity", "/products/vanity", "vanity tops for the bathroom"),
  link(
    "Fab Creations",
    "/products/fab-creations",
    "cut-to-size and bespoke fabrication"
  ),
  link("Ecosurfaces", "/products/ecosurfaces"),
  link(
    "Beyond Stone",
    "/products/facades-and-finishes",
    "stone finishes and textures, from polished and honed to leathered and brushed"
  ),
  link(
    "Window Sills & Thresholds",
    "/products/pacific-european-window-sill-threshold-collection",
    "granite and quartz window sills, window thresholds and door thresholds, cut to size"
  ),
  "",
  "## Store",
  "",
  link(
    "Pacific Store",
    "/shop",
    "vanity tops, vanities and integrated quartz sinks, made to order. Nothing is paid online: an order is a request, and the team confirms quantities, freight and price"
  ),
  link(
    "Quartz vanity tops",
    "/shop/vanity-tops",
    "single and double basin layouts, made to size"
  ),
  "",
  "## Spaces and applications",
  "",
  link("Kitchens", "/spaces/kitchens"),
  link("Bathrooms", "/spaces/bathrooms"),
  link("Hotels and hospitality", "/spaces/hospitality"),
  link("Architecture", "/spaces/architecture"),
  link("Commercial", "/spaces/commercial"),
  link("Outdoor and wet areas", "/spaces/outdoor"),
  link(
    "Applications",
    "/applications",
    "every use the surfaces are specified for, from countertops to facades and flooring"
  ),
  "",
  "## Guides",
  "",
  link("What is quartz?", "/learn/what-is-quartz"),
  link("What is granite?", "/learn/what-is-granites"),
  link("What are semi-precious stones?", "/learn/what-is-semi-precious"),
  link("What is Eclipse?", "/learn/what-is-vision"),
  link("Quartz care and maintenance", "/learn/maintenance-quartz"),
  link("Granite care and maintenance", "/learn/maintenance-granites"),
  link("Quartz warranty", "/learn/warranty-quartz"),
  link("Resources", "/resources", "spec sheets, brochures and care guides"),
  "",
  "## Professionals",
  "",
  link("Fabrication services", "/professionals/services"),
  link(
    "Working with architects, designers, developers and fabricators",
    "/professionals/collaboration"
  ),
  link("Applications for specifiers", "/professionals/applications"),
  link("Trade programs", "/professionals/programs"),
  "",
  "## Company",
  "",
  link("About", "/about"),
  link("Sustainability", "/sustainability"),
  link("Careers", "/careers"),
  link("The Pacific Journal", "/blog", "news and guides"),
  "",
  "## Optional",
  "",
  link("Sitemap", "/sitemap.xml", "every public page"),
  "",
].join("\n");

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
