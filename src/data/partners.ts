/**
 * Regional partners shown in the Where to Buy places (owner, 2026-10-28):
 * visitors whose region is in the Middle East see Pacific by Fairdeal (first
 * named "Pacific x Fairdeal"; the owner renamed it to follow the partner's
 * own logo, "Pacific by Fair Deal"), the UAE partner, in place of the Bengaluru outlet search (see
 * components/where-to-buy/PartnerCard and globals.css [data-me-only]).
 *
 * Every detail below is as Fair Deal publishes it on fairdealuae.com
 * (checked 2026-10-28): its only address there is the Sharjah head office,
 * so no Dubai showroom is listed. Its pages link to pacificfairdealuae.com,
 * but that domain has expired (a GoDaddy parking page), so it is not used.
 *
 * Poland (owner, 2026-10-29): visitors whose region is Poland see Pacific
 * Polska, the Poland warehouse and company, with Marcin's and Paulina's
 * contacts (the same as /contact). It is shown the same way, by CSS from
 * <html data-region="PL"> (globals.css [data-pl-only]).
 */
export interface PartnerContact {
  /** Shown above the details when a partner lists more than one person. */
  name?: string;
  role?: string;
  phone: { display: string; href: string };
  /** International format, digits only, for wa.me. */
  whatsapp: string;
  email: string;
}

/** A distributor in a partner's region, listed under the partner. */
export interface RegionDistributor {
  /** The trading name, as the business writes it. */
  name: string;
  /** The owner, as Polish sole traders put it beside the name. */
  owner?: string;
  /** The town in the postal line of the address: the card groups the
   *  distributors under it, city by city (owner, 2026-11-19). */
  city: string;
  addressLines: string[];
  phone?: { display: string; href: string };
  email?: string;
  mapUrl: string;
  /** Where it is, for the nearest-distributor finder's distance and map:
   *  the street or house from OpenStreetMap where it has one, else the
   *  village (2026-11-19). */
  lat?: number;
  lng?: number;
}

/** "I am a" in the nearest-distributor finder: the same five as the India
 *  Where to Buy form (lib/where-to-buy AUDIENCES), repeated here so the
 *  homepage does not load the India place data. */
export const FINDER_AUDIENCES = [
  { value: "homeowner", label: "Homeowner" },
  { value: "designer", label: "Architect or interior designer" },
  { value: "studio", label: "Kitchen or interior studio" },
  { value: "builder", label: "Builder or developer" },
  { value: "trade", label: "Fabricator or dealer" },
] as const;

export interface Partner {
  /** Which region's CSS switch shows it: Middle East, Poland or Mexico. */
  region: "me" | "pl" | "mx";
  /** The small line above the brand. */
  kicker: string;
  /** The brand as shown: "Pacific by Fairdeal". */
  brand: string;
  /** The partner's own lockup (public/images/where-to-buy), cut from the
   *  artwork the owner supplied ("Jute bag By Fairdeal.pdf"): black on
   *  transparent, so it is shown on a white plate. Without one the brand
   *  is set as a heading. */
  logo?: { src: string; width: number; height: number };
  /** The company's registered name. */
  legalName?: string;
  /** Short line under the brand. */
  tagline: string;
  /** Where it serves, from its own site. */
  serves: string;
  addressLabel: string;
  /** Left out until the address is known; the card then shows contacts only. */
  addressLines?: string[];
  contacts: PartnerContact[];
  site?: { display: string; href: string; label: string };
  /** The map location Fair Deal links from its own contact page. */
  mapUrl?: string;
  /** Distributors in the region, listed below the partner's contacts. */
  distributors?: RegionDistributor[];
  /** "postcode": instead of listing the distributors, ask who the visitor
   *  is and their postal code, and show the one nearest distributor on a
   *  map (Poland, owner 2026-11-19; /api/where-to-buy/nearest). */
  finder?: "postcode";
}

/** Saral Mundra: Pacific Surfaces sales for Dubai and Mexico (owner,
 *  2026-11-18), with the number and address /contact lists for him. Shown
 *  on the Mexico card; the owner took him off the UAE card the same day
 *  (Dubai visitors' WhatsApp still reaches him, data/sales-reps). */
const SARAL_MUNDRA: PartnerContact = {
  name: "Saral Mundra",
  role: "Business Development · Dubai & Mexico", // owner, 2026-11-21
  phone: { display: "+91 73977 46963", href: "tel:+917397746963" },
  whatsapp: "917397746963",
  email: "saral@thepacific.group",
};

export const PACIFIC_X_FAIRDEAL: Partner = {
  region: "me",
  kicker: "Where to buy · UAE & Middle East",
  brand: "Pacific by Fairdeal",
  logo: {
    src: "/images/where-to-buy/pacific-by-fairdeal-logo.svg",
    width: 573,
    height: 108,
  },
  legalName: "Fair Deal Marbles & Granite IND LLC",
  tagline: "Pacific Surfaces in the UAE and the Middle East",
  serves: "Dubai, Sharjah and Abu Dhabi",
  addressLabel: "Head office",
  addressLines: [
    "Emirates Industrial City, Sajja",
    "Sharjah, United Arab Emirates",
  ],
  contacts: [
    {
      phone: { display: "+971 6 534 3255", href: "tel:+97165343255" },
      whatsapp: "971588217083",
      email: "marketing@fairdealuae.com",
    },
  ],
  site: {
    display: "fairdealuae.com",
    href: "https://fairdealuae.com/",
    label: "Visit Fairdeal",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=25.3413647,55.6262982",
};

/**
 * Pacific Polska. The contacts are the ones on /contact (Inquiries for
 * Poland); the e-mail addresses are on thepacific.group because the .pl
 * domain is parked with no mail server (owner, 2026-10-24).
 *
 * TODO(owner): the Polish address was asked for on 2026-10-29 and is not
 * in the repo, the earlier sessions or any public listing, so none is
 * shown. Fill in `addressLines` (and `mapUrl`) and the card shows it with
 * a Get directions button; nothing else needs to change.
 */
export const PACIFIC_POLSKA: Partner = {
  region: "pl",
  kicker: "Where to buy · Poland",
  brand: "Pacific Polska",
  tagline: "Pacific Surfaces in Poland",
  serves: "Poland and Central and Eastern Europe",
  addressLabel: "Warehouse",
  finder: "postcode",
  contacts: [
    {
      name: "Paulina Popławska",
      role: "Director, Pacific Polska",
      phone: { display: "+48 517 540 297", href: "tel:+48517540297" },
      whatsapp: "48517540297",
      email: "paulina@thepacific.group",
    },
    {
      name: "Marcin",
      role: "Business Development Consultant",
      phone: { display: "+48 537 819 991", href: "tel:+48537819991" },
      whatsapp: "48537819991",
      email: "marcin@thepacific.group",
    },
  ],
  // Poland distributors (owner, 2026-11-14). IMPERIAL-GRANIT's address is
  // its own Google Maps listing (the link the owner sent); phone from the
  // owner, 2026-11-21.
  // ANT-MAR BIS (owner, 2026-11-19): name, address, phone and e-mail as on
  // the company's own card; the phone is written in international form.
  distributors: [
    {
      name: "SB GRANIT",
      owner: "Szymon Bałazy",
      city: "Nowe Szumowo",
      addressLines: ["Nowe Szumowo 6", "18-305 Nowe Szumowo"],
      phone: { display: "+48 604 062 510", href: "tel:+48604062510" },
      lat: 52.9094,
      lng: 22.0636,
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          "SB GRANIT, Nowe Szumowo 6, 18-305 Nowe Szumowo, Poland"
        ),
    },
    {
      name: "IMPERIAL-GRANIT",
      owner: "Michał Olejniczak",
      city: "Bralin",
      addressLines: ["Tabor Wielki 1C", "63-640 Bralin"],
      phone: { display: "+48 606 839 239", href: "tel:+48606839239" },
      mapUrl: "https://maps.app.goo.gl/uixiZVwKhJ39sFUeA",
      lat: 51.2889,
      lng: 17.8656,
    },
    {
      name: "ANT-MAR BIS Sp. z o.o.",
      city: "Kalej",
      addressLines: ["Brzozowa 50 (entrance from Cmentarna)", "42-130 Kalej"],
      phone: { display: "+48 34 317 04 29", href: "tel:+48343170429" },
      email: "biuro@antmar.pl",
      lat: 50.8431,
      lng: 18.9927,
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("ANT-MAR BIS, Brzozowa 50, 42-130 Kalej, Poland"),
    },
    // PARTNER KAMIENIA (owner, 2026-11-21): address, phone and e-mail as on
    // partnerkamienia.pl/kamien-w-domu/kontakt; the point is the building
    // OpenStreetMap gives for that address.
    {
      name: "PARTNER KAMIENIA",
      city: "Rzeszotary",
      addressLines: ["ul. Legnicka 32", "59-222 Rzeszotary"],
      phone: { display: "+48 502 161 547", href: "tel:+48502161547" },
      email: "biuro@partnerkamienia.pl",
      lat: 51.2526,
      lng: 16.1615,
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          "PARTNER KAMIENIA, Legnicka 32, 59-222 Rzeszotary, Poland"
        ),
    },
  ],
};

/** WhatsApp link with a first message. */
export function contactWhatsApp(c: PartnerContact, text: string) {
  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Mexico (owner, 2026-11-18): visitors whose region is Mexico see Saral
 * Mundra, Pacific's sales contact for the market, in place of the outlet
 * search (<html data-region="MX">, globals.css [data-mx-only]).
 */
export const PACIFIC_MEXICO: Partner = {
  region: "mx",
  kicker: "Where to buy · Mexico",
  brand: "Pacific Surfaces",
  tagline: "Quartz and granite surfaces for Mexico, supplied by Pacific",
  serves: "Mexico",
  addressLabel: "Contact",
  contacts: [SARAL_MUNDRA],
};
