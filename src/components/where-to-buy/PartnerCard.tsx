import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { LIQUID_GLASS_DARK } from "@/components/global/liquid-glass";
import {
  PACIFIC_X_FAIRDEAL,
  partnerWhatsApp,
  type Partner,
} from "@/data/partners";

/**
 * (The homepage band is a div, not a <section>: the skin repaints sections
 * white unless their copy is on its KEEP_DARK list, bw-temp-sections.)
 *
 * Pacific x Fairdeal, the Middle East's partner (owner, 2026-10-28), in
 * the Where to Buy places. A server component with no region logic of
 * its own: it is rendered everywhere and shown to Middle East visitors by
 * CSS from the first paint (`data-me-only`, globals.css), so nothing
 * flashes. Two shapes: the glass `card` of the Where to Buy and Contact
 * heroes, and the `band` on the homepage.
 *
 * Ink: the whole block declares data-over-media (white copy); the buttons
 * set their own ink inline, because the skin (app/bw-temp.css) would turn
 * their dark text white.
 */

const WHATSAPP_TEXT = "Hi, I'd like to know where to buy Pacific Surfaces.";
const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const BTN =
  "inline-flex h-12 items-center justify-center gap-2 px-5 text-[12px] uppercase tracking-[0.14em] transition hover:brightness-110";

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-left">
      <span className="mt-0.5 shrink-0 opacity-80" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
          {label}
        </p>
        <div className="mt-0.5 text-[15px] font-light leading-snug">
          {children}
        </div>
      </div>
    </div>
  );
}

function Actions({ p, center }: { p: Partner; center?: boolean }) {
  return (
    <div
      className={
        "flex flex-col gap-3 sm:flex-row " + (center ? "sm:justify-center" : "")
      }
    >
      <a
        href={p.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: "#ffffff", color: "#14140f" }}
        className={`${BTN} bg-white`}
      >
        Get directions
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
      <a
        href={partnerWhatsApp(p, WHATSAPP_TEXT)}
        target="_blank"
        rel="noopener noreferrer"
        data-over-media
        style={{
          background: "rgba(255,255,255,0.14)",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
        className={BTN}
      >
        WhatsApp
      </a>
      <a
        href={p.site.href}
        target="_blank"
        rel="noopener noreferrer"
        data-over-media
        style={{
          background: "rgba(255,255,255,0.14)",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
        className={BTN}
      >
        Visit Fairdeal
      </a>
    </div>
  );
}

function Details({ p }: { p: Partner }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Detail icon={<MapPin className="h-4 w-4" />} label={p.addressLabel}>
        <span className="block font-normal">{p.legalName}</span>
        {p.addressLines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </Detail>
      <div className="grid gap-5">
        <Detail icon={<Phone className="h-4 w-4" />} label="Phone">
          <a href={p.phone.href} className="underline underline-offset-4">
            {p.phone.display}
          </a>
        </Detail>
        <Detail icon={<Mail className="h-4 w-4" />} label="Email">
          <a
            href={`mailto:${p.email}`}
            className="break-all underline underline-offset-4"
          >
            {p.email}
          </a>
        </Detail>
      </div>
    </div>
  );
}

/** The glass card of the Where to Buy and Contact heroes. */
export function PartnerCard({
  partner = PACIFIC_X_FAIRDEAL,
  className = "",
}: {
  partner?: Partner;
  className?: string;
}) {
  return (
    <div
      data-me-only
      data-over-media
      aria-label="Where to buy in the Middle East"
      className={
        "animate-fade-up w-full max-w-[746px] rounded-[6px] px-5 py-9 text-center sm:px-12 sm:py-12 " +
        className
      }
      style={{ ...LIQUID_GLASS_DARK, animationDelay: "0.1s" }}
    >
      <p className="text-xs uppercase tracking-[0.3em]">
        Where to buy · UAE &amp; Middle East
      </p>
      <h2
        style={LIGHT}
        className="mt-3 text-[34px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-[48px]"
      >
        {partner.brand}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] font-light leading-snug sm:text-base">
        {partner.tagline}. Serving {partner.serves}.
      </p>
      <div className="mx-auto mt-8 max-w-[560px] border-t border-white/25 pt-7">
        <Details p={partner} />
      </div>
      <div className="mt-8">
        <Actions p={partner} center />
      </div>
    </div>
  );
}

/** The homepage's Where to buy band, for the Middle East. */
export function PartnerBand({
  partner = PACIFIC_X_FAIRDEAL,
}: {
  partner?: Partner;
}) {
  return (
    <div
      data-me-only
      data-over-media
      id="where-to-buy-me"
      role="region"
      aria-labelledby="wtb-me-title"
      className="py-16 sm:py-20"
      style={{ background: "#14140f" }}
    >
      <div className="mx-auto grid w-full max-w-[1760px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16 lg:px-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em]">
            Where to buy · UAE &amp; Middle East
          </p>
          <h2
            id="wtb-me-title"
            style={LIGHT}
            className="mt-3 text-[40px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-[60px]"
          >
            {partner.brand}
          </h2>
          <p className="mt-4 max-w-md text-base font-light leading-snug sm:text-lg">
            {partner.tagline}. Serving {partner.serves}.
          </p>
          <div className="mt-8">
            <Actions p={partner} />
          </div>
        </div>
        <div className="border-t border-white/25 pt-8 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
          <Details p={partner} />
        </div>
      </div>
    </div>
  );
}
