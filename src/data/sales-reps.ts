import { SALES_PHONE } from "@/data/business";
import { findCountry } from "@/data/regions";

/**
 * Who a visitor's WhatsApp and Call go to, by the region chosen in the
 * header (owner, 2026-11-18: "WhatsApp should go to the local sales rep;
 * international to Abhi; only India to the local team in marketing").
 * The support dock (components/global/SupportDock) uses repFor().
 *
 * The regional reps are the ones /contact lists for each market.
 */
export interface SalesRep {
  /** Who answers, for the button's label. */
  name: string;
  phone: { display: string; href: string };
  /** International format, digits only, for WhatsApp. */
  whatsapp: string;
}

const rep = (name: string, display: string): SalesRep => {
  const digits = display.replace(/\D/g, "");
  return { name, phone: { display, href: `tel:+${digits}` }, whatsapp: digits };
};

/** India: the local team in marketing (the site's sales line). */
export const INDIA_TEAM: SalesRep = {
  name: "Pacific Surfaces India",
  phone: { display: SALES_PHONE.display, href: SALES_PHONE.href },
  whatsapp: SALES_PHONE.href.replace(/\D/g, ""),
};

export const SARAL = rep("Saral Mundra", "+91 73977 46963");
export const SATAKSHI = rep("Satakshi Rautaray", "+49 1525 5460275");
export const PAULINA = rep("Paulina", "+48 517 540 297");
export const MARKO = rep("Marko", "+385 91 250 4582");

/**
 * Everyone else ("International" in the region selector, or a country with
 * no rep of its own): Abhijeet Mankotia (owner, 2026-11-18).
 */
export const INTERNATIONAL: SalesRep = rep(
  "Abhijeet Mankotia",
  "+91 80505 60007"
);

/** Countries with their own rep. */
const BY_COUNTRY: Record<string, SalesRep> = {
  IN: INDIA_TEAM,
  PL: PAULINA,
  // DACH and Benelux: Satakshi, Business Head DACH & Benelux
  DE: SATAKSHI,
  AT: SATAKSHI,
  CH: SATAKSHI,
  NL: SATAKSHI,
  BE: SATAKSHI,
  LU: SATAKSHI,
  HR: MARKO,
  // Saral: Dubai (and the Middle East, below) and Mexico
  MX: SARAL,
};

/** The rep for a country code (from the region selector), or the
 *  international contact when there is none or no region is chosen. */
export function repFor(country: string | null | undefined): SalesRep {
  if (!country) return INTERNATIONAL;
  const code = country.toUpperCase();
  if (BY_COUNTRY[code]) return BY_COUNTRY[code];
  if (findCountry(code)?.continent.id === "middle-east") return SARAL;
  return INTERNATIONAL;
}

/** A WhatsApp chat link with the opening message filled in. */
export function whatsappLink(r: SalesRep, text: string): string {
  return `https://api.whatsapp.com/send/?phone=${r.whatsapp}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
}
