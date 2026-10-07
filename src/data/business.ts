/**
 * What the site says about the business itself, in one place: the
 * factory's name, address and phones, its map, and the social profiles.
 * The footer, the Contact page, the Pacific Quartz page and the JSON-LD
 * in app/layout all read from here, so the name, address and phone match
 * everywhere, and match the Google Business Profile.
 *
 * Sources (owner, 2026-10-05): the factory's signboard name is Pacific
 * Engineered Surfaces Pvt. Ltd.; both phone numbers are shown, the
 * profile's and the site's; the social profiles are the footer's four.
 * Address, profile phone and map pin are as on the Google Business
 * Profile (Maps CID 639735137987049257).
 *
 * Names (owner, 2026-10-07): Pacific Engineered Surfaces Pvt. Ltd. is the
 * registered company, named on the factory entry; the brand is Pacific
 * Surfaces; Pacific Quartz stays as the alternate name, because people
 * search for it.
 *
 * Opening hours (owner, 2026-10-07): Mon to Sat, 9 am to 8 pm, as on the
 * Google Business Profile. The Contact page prints the same, so they are
 * in the structured data too.
 *
 * Copy names the country, not the town (owner, 2026-10-07: "a bigger
 * geographical pin"); the town appears only in the address itself.
 */

export const SITE_URL = "https://pacific-surfaces.com";

/** Stable JSON-LD node ids. Never change these once published. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const FACTORY_ID = `${SITE_URL}/#factory`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;

export interface Phone {
  /** As printed on the page. */
  display: string;
  href: string;
  /** International format for structured data. */
  intl: string;
}

/** The sales line used across the site (and its WhatsApp). */
export const SALES_PHONE: Phone = {
  display: "+91 98940 33566",
  href: "tel:+919894033566",
  intl: "+91-98940-33566",
};

/** The factory's number on the Google Business Profile. */
export const FACTORY_PHONE: Phone = {
  display: "+91 73054 77549",
  href: "tel:+917305477549",
  intl: "+91-73054-77549",
};

export const EMAIL = "info@thepacific.group";

/** The homepage's one H1: the brand, what is made and where (SEO brief,
 *  2026-10-05; India, not the town, owner 2026-10-07). The hero prints it
 *  at its foot. */
export const HOME_H1 = "Pacific Surfaces, quartz slab manufacturer in India";

/** The name Pacific Surfaces is also searched under, with its page. */
export const ALTERNATE_NAME = "Pacific Quartz";
export const ALTERNATE_NAME_PAGE = "/products/quartz/about";

/** The factory and experience centre's hours, as on the Google Business
 *  Profile; schema.org wants the days spelled out and 24-hour times. */
export const OPENING_HOURS = {
  display: "Mon to Sat, 9 am to 8 pm",
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "09:00",
  closes: "20:00",
} as const;

export const FACTORY = {
  /** The registered company, as on the factory's signboard. */
  name: "Pacific Engineered Surfaces Pvt. Ltd.",
  streetAddress: "SY. No. 73/2B, National Highway 44, Nallaganakothapalli",
  locality: "Hosur",
  region: "Tamil Nadu",
  postalCode: "635117",
  country: "IN",
  phones: [FACTORY_PHONE, SALES_PHONE],
  /** The profile's map pin. */
  geo: { latitude: 12.6766191, longitude: 77.9592661 },
  mapUrl: "https://maps.google.com/?cid=639735137987049257",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Pacific%20Engineered%20Surfaces%20Pvt.%20Ltd.%2C%20National%20Highway%2044%2C%20Nallaganakothapalli%2C%20Hosur%2C%20Tamil%20Nadu%20635117",
  /** Google Maps' own "Embed a map" code for the listing; no API key. */
  embedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3892.563211850946!2d77.9592661!3d12.6766191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3badd7e2ff95ee93%3A0x8e0cbb7f20db729!2sPacific%20Engineered%20Surfaces%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1791185571503!5m2!1sen!2sin",
} as const;

/** Street, town, state and PIN on one line. */
export const FACTORY_ADDRESS = `${FACTORY.streetAddress}, ${FACTORY.locality}, ${FACTORY.region} ${FACTORY.postalCode}`;

export const SOCIAL_PROFILES = {
  instagram: "https://www.instagram.com/pacificitaliansurfaces",
  facebook: "https://www.facebook.com/thepacificstone/",
  linkedin: "https://www.linkedin.com/company/pacific-granites-india-pvt-ltd/",
  youtube: "https://www.youtube.com/channel/UCWeTO3mX6zInSev42K9h5Fw",
} as const;

const LOGO_URL = `${SITE_URL}/logos/pacific-surfaces-logo-black.png`;

/**
 * The site-wide JSON-LD: one graph of the brand, the factory and the
 * website, tied together by @id. No ratings, reviews or price range:
 * nothing is stated that isn't sourced above.
 */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Pacific Surfaces",
        alternateName: [ALTERNATE_NAME, "Pacific Engineered Surfaces"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": LOGO_ID,
          url: LOGO_URL,
          contentUrl: LOGO_URL,
          width: 1772,
          height: 420,
          caption: "Pacific Surfaces",
        },
        image: { "@id": LOGO_ID },
        description:
          "Engineered quartz and granite surfaces for kitchens, bathrooms and architecture, made in India and shipped to 45+ countries.",
        email: EMAIL,
        telephone: SALES_PHONE.intl,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: SALES_PHONE.intl,
            email: EMAIL,
            availableLanguage: ["en"],
          },
        ],
        sameAs: Object.values(SOCIAL_PROFILES),
      },
      {
        "@type": "LocalBusiness",
        "@id": FACTORY_ID,
        name: FACTORY.name,
        legalName: FACTORY.name,
        alternateName: ALTERNATE_NAME,
        description: "The quartz factory and experience centre of Pacific Surfaces.",
        url: `${SITE_URL}/contact`,
        image: `${SITE_URL}/images/india-home/bretonstone-robot.webp`,
        logo: { "@id": LOGO_ID },
        telephone: FACTORY_PHONE.intl,
        email: EMAIL,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            telephone: SALES_PHONE.intl,
            email: EMAIL,
            availableLanguage: ["en"],
          },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: FACTORY.streetAddress,
          addressLocality: FACTORY.locality,
          addressRegion: FACTORY.region,
          postalCode: FACTORY.postalCode,
          addressCountry: FACTORY.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: FACTORY.geo.latitude,
          longitude: FACTORY.geo.longitude,
        },
        hasMap: FACTORY.mapUrl,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [...OPENING_HOURS.days],
            opens: OPENING_HOURS.opens,
            closes: OPENING_HOURS.closes,
          },
        ],
        parentOrganization: { "@id": ORG_ID },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Pacific Surfaces",
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
