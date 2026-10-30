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

export interface Partner {
  /** Which region's CSS switch shows it: Middle East or Poland. */
  region: "me" | "pl";
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
}

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
};

/** WhatsApp link with a first message. */
export function contactWhatsApp(c: PartnerContact, text: string) {
  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`;
}
