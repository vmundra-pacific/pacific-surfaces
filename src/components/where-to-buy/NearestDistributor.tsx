"use client";

import dynamic from "next/dynamic";
import { useId, useState } from "react";
import { ArrowRight, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  FINDER_AUDIENCES,
  contactWhatsApp,
  type Partner,
} from "@/data/partners";

/**
 * The nearest-distributor finder in a partner's Where to Buy card (Poland,
 * owner 2026-11-19): the visitor says who they are and gives a postal
 * code, and the card shows the ONE distributor nearest to it, on a map,
 * with directions, phone and e-mail, and a WhatsApp to Pacific Polska that
 * says who is asking and where. The postal code table is on the server
 * (/api/where-to-buy/nearest); nothing is stored.
 *
 * Ink: the card is copy-on-media (data-over-media), where the skin forces
 * white text except on `bg-white` elements, so the fields, the submit
 * button and the map frame are bg-white and keep dark text.
 */

const NearestDistributorMap = dynamic(() => import("./NearestDistributorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.16em]">
      Loading map…
    </div>
  ),
});

interface Result {
  postcode: string;
  origin: { lat: number; lng: number };
  approximate: boolean;
  distributor: string;
  km: number;
}

const LABEL = "mb-2 block text-[10px] uppercase tracking-[0.18em] opacity-70";
const FIELD =
  "bg-white h-12 w-full border-0 px-3 text-[15px] font-light outline-none focus-visible:ring-2 focus-visible:ring-white/70";
const BTN =
  "inline-flex h-12 items-center justify-center gap-2 px-5 text-[12px] uppercase tracking-[0.14em] transition hover:brightness-110";
const PRIMARY = { background: "#ffffff", color: "#14140f" };
const SECONDARY = {
  background: "rgba(255,255,255,0.14)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.8)",
};
const REGION_NAME: Record<Partner["region"], string> = {
  pl: "Poland",
  me: "the Middle East",
  mx: "Mexico",
};
const POSTCODE = /^\s*\d{2}[\s-]?\d{3}\s*$/;

export function NearestDistributor({
  partner,
  children,
}: {
  partner: Partner;
  /** Every distributor, shown under a "See all distributors" button
   *  (owner, 2026-11-21). */
  children?: React.ReactNode;
}) {
  const id = useId();
  const [showAll, setShowAll] = useState(false);
  const count = partner.distributors?.length ?? 0;
  const allList = children ? (
    <div className="mt-8 border-t border-white/25 pt-6 text-left">
      <MagneticButton
        type="button"
        variant="outline-dark"
        size="md"
        aria-expanded={showAll}
        aria-controls={`${id}-all`}
        onClick={() => setShowAll((v) => !v)}
        className="!rounded-none h-12 !border-white/80 !text-[12px] uppercase tracking-[0.14em] hover:!bg-white/15 hover:!text-white"
      >
        {showAll
          ? "Hide all distributors"
          : `See all distributors in ${REGION_NAME[partner.region]} (${count})`}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </MagneticButton>
      {showAll && (
        <div id={`${id}-all`} className="mt-6">
          {children}
        </div>
      )}
    </div>
  ) : null;
  const [who, setWho] = useState("");
  const [postcode, setPostcode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const found = result
    ? partner.distributors?.find((d) => d.name === result.distributor)
    : undefined;
  const whoLabel =
    FINDER_AUDIENCES.find((a) => a.value === who)?.label ?? "visitor";

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!who) return setError("Choose who you are.");
    if (!POSTCODE.test(postcode))
      return setError("Enter a Polish postal code, such as 42-130.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/where-to-buy/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: partner.region, who, postcode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Please try again.");
      setResult(data as Result);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  if (result && found) {
    const contact = partner.contacts[0];
    const message = `Hi, I'm a ${whoLabel.toLowerCase()} near ${result.postcode}. I'd like to buy Pacific Surfaces; my nearest distributor is ${found.name}.`;
    return (
      <div aria-live="polite" className="text-left">
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
          Your nearest distributor
        </p>
        <h3 className="mt-3 text-[20px] font-normal leading-snug">
          {found.name}
        </h3>
        {found.owner && (
          <p className="mt-0.5 text-[12px] font-light leading-snug opacity-75">
            {found.owner}
          </p>
        )}
        <p className="mt-2 text-[14px] font-light leading-snug opacity-85">
          {`About ${result.km} km from ${result.postcode}${
            result.approximate ? " (approximate)" : ""
          }`}
        </p>

        {found.lat != null && found.lng != null && (
          <div className="bg-white mt-5 h-[240px] w-full overflow-hidden rounded-[4px] sm:h-[280px]">
            <NearestDistributorMap
              origin={result.origin}
              place={{ lat: found.lat, lng: found.lng, name: found.name }}
              originLabel={`Your postal code ${result.postcode}`}
            />
          </div>
        )}

        <div className="mt-5 grid gap-3">
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
              aria-hidden="true"
            />
            <a
              href={found.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-light leading-snug underline underline-offset-4"
            >
              {found.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </a>
          </div>
          {found.phone && (
            <div className="flex items-start gap-3">
              <Phone
                className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
                aria-hidden="true"
              />
              <a
                href={found.phone.href}
                className="text-[15px] font-light leading-snug underline underline-offset-4"
              >
                {found.phone.display}
              </a>
            </div>
          )}
          {found.email && (
            <div className="flex items-start gap-3">
              <Mail
                className="mt-0.5 h-4 w-4 shrink-0 opacity-80"
                aria-hidden="true"
              />
              <a
                href={`mailto:${found.email}`}
                className="break-all text-[15px] font-light leading-snug underline underline-offset-4"
              >
                {found.email}
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={found.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={PRIMARY}
            className={`${BTN} bg-white`}
          >
            Get directions
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {contact && (
            <a
              href={contactWhatsApp(contact, message)}
              target="_blank"
              rel="noopener noreferrer"
              data-over-media
              style={SECONDARY}
              className={BTN}
            >
              {`WhatsApp ${partner.brand}`}
            </a>
          )}
        </div>
        <div className="mt-4">
          <MagneticButton
            type="button"
            variant="ghost"
            size="sm"
            className="!px-0 underline underline-offset-4"
            onClick={() => setResult(null)}
          >
            Search another postal code
          </MagneticButton>
        </div>
        {allList}
      </div>
    );
  }

  return (
    <>
      <form onSubmit={search} noValidate className="text-left">
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
          Find your nearest distributor
        </p>
        <p className="mt-3 text-[15px] font-light leading-snug">
          Tell us who you are and your postal code, and we will show the
          distributor nearest to you.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-who`} className={LABEL}>
              I am a *
            </label>
            <select
              id={`${id}-who`}
              value={who}
              onChange={(e) => setWho(e.target.value)}
              required
              className={FIELD}
            >
              <option value="" disabled>
                Choose one
              </option>
              {FINDER_AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-postcode`} className={LABEL}>
              Postal code *
            </label>
            <input
              id={`${id}-postcode`}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="e.g. 42-130"
              maxLength={8}
              required
              className={FIELD}
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[13px] font-light leading-snug">
            {error}
          </p>
        )}
        <div className="mt-5">
          <MagneticButton
            type="submit"
            variant="primary-dark"
            size="md"
            disabled={busy}
            className="!rounded-none h-12 uppercase tracking-[0.14em] !text-[12px]"
          >
            {busy ? "Finding…" : "Find my distributor"}
          </MagneticButton>
        </div>
      </form>
      {allList}
    </>
  );
}
