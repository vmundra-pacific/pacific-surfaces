/**
 * Regional partners shown in the Where to Buy places (owner, 2026-10-28):
 * visitors whose region is in the Middle East see Pacific x Fairdeal, the
 * UAE partner, in place of the Bengaluru outlet search (see
 * components/where-to-buy/PartnerCard and globals.css [data-me-only]).
 *
 * Every detail below is as Fair Deal publishes it on fairdealuae.com
 * (checked 2026-10-28): its only address there is the Sharjah head office,
 * so no Dubai showroom is listed. Its pages link to pacificfairdealuae.com,
 * but that domain has expired (a GoDaddy parking page), so it is not used.
 */
export interface Partner {
  /** The brand as shown: "Pacific x Fairdeal". */
  brand: string;
  /** The company's registered name. */
  legalName: string;
  /** Short line under the brand. */
  tagline: string;
  /** Emirates it serves, from its own site. */
  serves: string;
  addressLabel: string;
  addressLines: string[];
  phone: { display: string; href: string };
  /** International format, digits only, for wa.me. */
  whatsapp: string;
  email: string;
  site: { display: string; href: string };
  /** The map location Fair Deal links from its own contact page. */
  mapUrl: string;
}

export const PACIFIC_X_FAIRDEAL: Partner = {
  brand: "Pacific x Fairdeal",
  legalName: "Fair Deal Marbles & Granite IND LLC",
  tagline: "Pacific Surfaces in the UAE and the Middle East",
  serves: "Dubai, Sharjah and Abu Dhabi",
  addressLabel: "Head office",
  addressLines: [
    "Emirates Industrial City, Sajja",
    "Sharjah, United Arab Emirates",
  ],
  phone: { display: "+971 6 534 3255", href: "tel:+97165343255" },
  whatsapp: "971588217083",
  email: "marketing@fairdealuae.com",
  site: { display: "fairdealuae.com", href: "https://fairdealuae.com/" },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=25.3413647,55.6262982",
};

/** WhatsApp link with a first message. */
export function partnerWhatsApp(p: Partner, text: string) {
  return `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(text)}`;
}
