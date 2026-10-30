import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { LIQUID_GLASS_DARK } from "@/components/global/liquid-glass";
import {
  PACIFIC_X_FAIRDEAL,
  contactWhatsApp,
  type Partner,
  type PartnerContact,
} from "@/data/partners";

/**
 * (The homepage band is a div, not a <section>: the skin repaints sections
 * white unless their copy is on its KEEP_DARK list, bw-temp-sections.)
 *
 * A regional partner in the Where to Buy places: Pacific by Fairdeal for
 * the Middle East (owner, 2026-10-28) and Pacific Polska for Poland
 * (owner, 2026-10-29). A server component with no region logic of its
 * own: it is rendered everywhere and shown to the region's visitors by CSS
 * from the first paint (`data-me-only` / `data-pl-only`, globals.css), so
 * nothing flashes. Two shapes: the glass `card` of the Where to Buy and
 * Contact heroes, and the `band` on the homepage.
 *
 * Ink: the whole block declares data-over-media (white copy); the buttons
 * set their own ink inline, because the skin (app/bw-temp.css) would turn
 * their dark text white.
 */

const WHATSAPP_TEXT = "Hi, I'd like to know where to buy Pacific Surfaces.";
const BTN =
  "inline-flex h-12 items-center justify-center gap-2 px-5 text-[12px] uppercase tracking-[0.14em] transition hover:brightness-110";
const PRIMARY = { background: "#ffffff", color: "#14140f" };
const SECONDARY = {
  background: "rgba(255,255,255,0.14)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.8)",
};

/** The attribute the region CSS looks for. */
function regionAttr(p: Partner): Record<string, boolean> {
  return p.region === "pl"
    ? { "data-pl-only": true }
    : { "data-me-only": true };
}

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
  // Whatever comes first is the filled button: directions where there is an
  // address, otherwise the first person's WhatsApp.
  const items: {
    key: string;
    href: string;
    label: React.ReactNode;
  }[] = [];
  if (p.mapUrl)
    items.push({
      key: "map",
      href: p.mapUrl,
      label: (
        <>
          Get directions
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </>
      ),
    });
  p.contacts.forEach((c, i) =>
    items.push({
      key: `wa-${i}`,
      href: contactWhatsApp(c, WHATSAPP_TEXT),
      label:
        p.contacts.length > 1 && c.name
          ? `WhatsApp ${c.name.split(" ")[0]}`
          : "WhatsApp",
    })
  );
  if (p.site)
    items.push({ key: "site", href: p.site.href, label: p.site.label });

  return (
    <div
      className={
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap " +
        (center ? "sm:justify-center" : "")
      }
    >
      {items.map((it, i) => (
        <a
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          {...(i === 0 ? {} : { "data-over-media": true })}
          style={i === 0 ? PRIMARY : SECONDARY}
          className={i === 0 ? `${BTN} bg-white` : BTN}
        >
          {it.label}
        </a>
      ))}
    </div>
  );
}

function PhoneEmail({ c }: { c: PartnerContact }) {
  return (
    <>
      <Detail icon={<Phone className="h-4 w-4" />} label="Phone">
        <a href={c.phone.href} className="underline underline-offset-4">
          {c.phone.display}
        </a>
      </Detail>
      <Detail icon={<Mail className="h-4 w-4" />} label="Email">
        <a
          href={`mailto:${c.email}`}
          className="break-all underline underline-offset-4"
        >
          {c.email}
        </a>
      </Detail>
    </>
  );
}

function Details({ p }: { p: Partner }) {
  const named = p.contacts.length > 1;
  const hasAddress = !!p.addressLines?.length;
  return (
    <div
      className={
        "grid gap-5 " +
        (named || hasAddress ? "sm:grid-cols-2" : "sm:grid-cols-1")
      }
    >
      {hasAddress && (
        <Detail icon={<MapPin className="h-4 w-4" />} label={p.addressLabel}>
          {p.legalName && (
            <span className="block font-normal">{p.legalName}</span>
          )}
          {p.addressLines!.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </Detail>
      )}
      {named ? (
        p.contacts.map((c) => (
          <div key={c.email} className="grid content-start gap-3 text-left">
            <div>
              <p className="text-[15px] font-normal leading-snug">{c.name}</p>
              {c.role && (
                <p className="mt-0.5 text-[12px] font-light leading-snug opacity-75">
                  {c.role}
                </p>
              )}
            </div>
            <PhoneEmail c={c} />
          </div>
        ))
      ) : (
        <div className="grid gap-5">
          <PhoneEmail c={p.contacts[0]} />
        </div>
      )}
    </div>
  );
}

/**
 * The partner's own lockup (Pacific by Fair Deal), black on transparent, so
 * it sits on a white plate over the dark glass; one without a lockup (Pacific
 * Polska) is set as a heading. Either way the <h2> keeps the brand as text
 * for screen readers and search.
 */
function Lockup({
  p,
  titleId,
  className = "",
}: {
  p: Partner;
  titleId?: string;
  className?: string;
}) {
  if (!p.logo) {
    return (
      <div className={className}>
        <h2
          id={titleId}
          style={{ fontVariationSettings: "'wght' 250, 'wdth' 100" }}
          className="text-[32px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-[44px]"
        >
          {p.brand}
        </h2>
      </div>
    );
  }
  return (
    <div className={className}>
      <h2 id={titleId} className="sr-only">
        {p.brand}
      </h2>
      <div
        className="inline-block rounded-[4px] px-6 py-5 sm:px-8 sm:py-6"
        style={{ background: "#ffffff" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.logo.src}
          width={p.logo.width}
          height={p.logo.height}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-auto w-[260px] max-w-full sm:w-[360px]"
        />
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
      {...regionAttr(partner)}
      data-over-media
      aria-label={`Where to buy: ${partner.brand}`}
      className={
        "animate-fade-up w-full max-w-[746px] rounded-[6px] px-5 py-9 text-center sm:px-12 sm:py-12 " +
        className
      }
      style={{ ...LIQUID_GLASS_DARK, animationDelay: "0.1s" }}
    >
      <p className="text-xs uppercase tracking-[0.3em]">{partner.kicker}</p>
      <Lockup p={partner} className="mt-5" />
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

/** The homepage's Where to buy band, for a partner's region. */
export function PartnerBand({
  partner = PACIFIC_X_FAIRDEAL,
}: {
  partner?: Partner;
}) {
  const id = `wtb-${partner.region}-title`;
  return (
    <div
      {...regionAttr(partner)}
      data-over-media
      id={`where-to-buy-${partner.region}`}
      role="region"
      aria-labelledby={id}
      className="py-12 sm:py-16"
      style={{ background: "#14140f" }}
    >
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16 lg:px-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em]">{partner.kicker}</p>
          <Lockup p={partner} titleId={id} className="mt-5" />
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
