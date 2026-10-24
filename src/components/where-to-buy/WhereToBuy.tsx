"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crosshair,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Pencil,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AUDIENCES,
  DEALERS,
  INTERESTS,
  NEAR_KM,
  PAGE_SIZE,
  TYPE_ORDER,
  audienceOf,
  directionsUrl,
  formatKm,
  fullAddress,
  interestOf,
  interpret,
  rank,
  typesFor,
  type Audience,
  type Dealer,
  type DealerType,
  type Interest,
  type Origin,
  type Ranked,
} from "@/lib/where-to-buy";
import { DealerEnquiry } from "./DealerEnquiry";
import "./where-to-buy.css";

/**
 * /where-to-buy: find Pacific Surfaces dealers, distributors and studios.
 *
 * Like Cosentino's locator, it asks first (who you are, what you are
 * interested in, your PIN code or location) and then lists only the
 * outlets that suit the answers, nearest first, a page at a time: a list
 * and a map, side by side on desktop and a List / Map toggle on phones.
 * Each outlet has Directions (Google Maps, no key) and Enquire (the site's
 * quick-enquiry endpoint, prefilled with the outlet and the answers).
 *
 * The answers live in the URL, so a result can be shared:
 *   ?who=homeowner&for=kitchen&where=560102
 *   ?who=trade&for=browsing&lat=12.93&lng=77.62   (location, to ~1 km)
 * plus the refinements type=, samples=1, slabs=1, view=map, and all=1 for
 * the whole directory.
 */

const DealerMap = dynamic(() => import("./DealerMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.16em]"
      style={{ background: "#ecebe7" }}
    >
      Loading map…
    </div>
  ),
});

const INK = "#14140f";
const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const MID = { fontVariationSettings: "'wght' 420, 'wdth' 100" };
const MUTED = { color: "rgba(20,20,15,0.62)" };

const FIELD =
  "h-12 w-full border border-[#14140f]/15 bg-white px-4 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/45 focus:border-[#14140f] focus:outline-none transition-colors";
const STEP = "text-[11px] uppercase tracking-[0.18em]";

type GeoState = "idle" | "locating" | "denied" | "unavailable";

/** The visitor's answers, as committed to the URL. */
interface Answers {
  who: Audience | null;
  interest: Interest | null;
  /** A PIN code or an area, as typed. */
  where: string;
  /** Or their location, rounded to ~1 km. */
  geo: { lat: number; lng: number } | null;
  /** The whole directory, no questions asked. */
  all: boolean;
}

const NO_ANSWERS: Answers = {
  who: null,
  interest: null,
  where: "",
  geo: null,
  all: false,
};

const complete = (a: Answers) => a.all || (!!a.who && (!!a.where || !!a.geo));
const round2 = (n: number) => Math.round(n * 100) / 100;

function useIsDesktop() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desk;
}

export function WhereToBuy() {
  // Committed answers, and the form's draft of them.
  const [answers, setAnswers] = useState<Answers>(NO_ANSWERS);
  const [draft, setDraft] = useState<Answers>(NO_ANSWERS);
  const [editing, setEditing] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  // False when the page's Permissions-Policy header forbids geolocation
  // (next.config.ts sends geolocation=() sitewide): the button is hidden
  // rather than offered and refused.
  const [geoAllowed, setGeoAllowed] = useState(true);

  // Refinements of the results.
  const [typeOverride, setTypeOverride] = useState<DealerType[] | null>(null);
  const [samplesOnly, setSamplesOnly] = useState(false);
  const [slabsOnly, setSlabsOnly] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [view, setView] = useState<"list" | "map">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [enquiry, setEnquiry] = useState<{ dealer: Dealer | null } | null>(
    null
  );
  const [ready, setReady] = useState(false);
  const isDesktop = useIsDesktop();
  const resultsTop = useRef<HTMLElement>(null);
  const barAnchor = useRef<HTMLDivElement>(null);

  // Read a shared link once.
  useEffect(() => {
    const policy = (
      document as Document & {
        featurePolicy?: { allowsFeature: (f: string) => boolean };
      }
    ).featurePolicy;
    if (
      !("geolocation" in navigator) ||
      (policy && !policy.allowsFeature("geolocation"))
    )
      setGeoAllowed(false);
    const p = new URLSearchParams(window.location.search);
    const lat = parseFloat(p.get("lat") ?? "");
    const lng = parseFloat(p.get("lng") ?? "");
    const a: Answers = {
      who: audienceOf(p.get("who"))?.value ?? null,
      interest: interestOf(p.get("for"))?.value ?? null,
      where: (p.get("where") ?? "").slice(0, 60),
      geo: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
      all: p.get("all") === "1",
    };
    setDraft(a);
    if (complete(a)) {
      setAnswers(a);
      setEditing(false);
    }
    const t = (p.get("type") ?? "")
      .split(",")
      .filter((x): x is DealerType => TYPE_ORDER.some((o) => o.value === x));
    if (t.length) setTypeOverride(t);
    setSamplesOnly(p.get("samples") === "1");
    setSlabsOnly(p.get("slabs") === "1");
    if (p.get("view") === "map") setView("map");
    setReady(true);
  }, []);

  // And keep the URL in step.
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (complete(answers)) {
      if (answers.all) p.set("all", "1");
      if (answers.who) p.set("who", answers.who);
      if (answers.interest) p.set("for", answers.interest);
      if (answers.geo) {
        p.set("lat", String(answers.geo.lat));
        p.set("lng", String(answers.geo.lng));
      } else if (answers.where) p.set("where", answers.where);
      if (typeOverride) p.set("type", typeOverride.join(","));
      if (samplesOnly) p.set("samples", "1");
      if (slabsOnly) p.set("slabs", "1");
      if (view === "map") p.set("view", "map");
    }
    const s = p.toString();
    const url = `${window.location.pathname}${s ? `?${s}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`)
      window.history.replaceState(window.history.state, "", url);
  }, [ready, answers, typeOverride, samplesOnly, slabsOnly, view]);

  const done = complete(answers) && !editing;
  const audience = answers.all ? null : audienceOf(answers.who);
  const interest = answers.all ? null : interestOf(answers.interest);

  const search = useMemo(
    () => interpret(answers.all ? "" : answers.where),
    [answers]
  );
  const origin: Origin | null = useMemo(
    () =>
      answers.all
        ? null
        : answers.geo
          ? { ...answers.geo, label: "your location", kind: "geo" }
          : search.origin,
    [answers, search]
  );
  const ranked = useMemo(() => rank(DEALERS, search, origin), [search, origin]);

  const suggested = useMemo<DealerType[]>(
    () =>
      audience
        ? typesFor(audience.value, interest?.value ?? null)
        : TYPE_ORDER.map((t) => t.value),
    [audience, interest]
  );
  const types = typeOverride ?? suggested;
  const needsDisplay = !typeOverride && !!audience?.needsDisplay;

  const matches = useMemo(
    () =>
      ranked.filter(
        ({ dealer: d }) =>
          types.includes(d.type) &&
          (!needsDisplay || d.samples || d.slabs) &&
          (!samplesOnly || d.samples) &&
          (!slabsOnly || d.slabs)
      ),
    [ranked, types, needsDisplay, samplesOnly, slabsOnly]
  );
  const visible = useMemo(
    () => (answers.all ? matches : matches.slice(0, shown)),
    [matches, shown, answers.all]
  );
  const typeCounts = useMemo(() => {
    const c = new Map<DealerType, number>();
    ranked
      .filter(
        ({ dealer: d }) =>
          (!needsDisplay || d.samples || d.slabs) &&
          (!samplesOnly || d.samples) &&
          (!slabsOnly || d.slabs)
      )
      .forEach(({ dealer: d }) => c.set(d.type, (c.get(d.type) ?? 0) + 1));
    return c;
  }, [ranked, needsDisplay, samplesOnly, slabsOnly]);

  // ---- the form
  const setD = (patch: Partial<Answers>) => {
    setFormError(null);
    setDraft((d) => ({ ...d, ...patch, all: false }));
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const where = draft.where.trim();
    if (!draft.who) return setFormError("Tell us who you are.");
    if (!draft.geo && !where)
      return setFormError(
        `Enter your PIN code${geoAllowed ? " or use your location" : ""}.`
      );
    if (!draft.geo) {
      const s = interpret(where);
      if (s.unknown && !s.outsidePin)
        return setFormError(
          "We don't recognise that. Try a 6-digit PIN code such as 560102, or an area such as HSR Layout."
        );
    }
    setAnswers({ ...draft, where: draft.geo ? "" : where, all: false });
    setEditing(false);
    setTypeOverride(null);
    setSamplesOnly(false);
    setSlabsOnly(false);
    setShown(PAGE_SIZE);
    setActiveId(null);
    requestAnimationFrame(() =>
      resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const browseAll = () => {
    setAnswers({ ...NO_ANSWERS, all: true });
    setEditing(false);
    setTypeOverride(null);
    setShown(PAGE_SIZE);
    requestAnimationFrame(() =>
      resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const edit = () => {
    setDraft(answers.all ? NO_ANSWERS : answers);
    setEditing(true);
    requestAnimationFrame(() =>
      document
        .getElementById("wtb-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeoState("unavailable");
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState("idle");
        setD({
          geo: {
            lat: round2(pos.coords.latitude),
            lng: round2(pos.coords.longitude),
          },
          where: "",
        });
      },
      (err) =>
        setGeoState(
          err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"
        ),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  };

  // On phones the results bar sticks under the header: bring it there, so
  // the map below fills the screen.
  const toBar = () =>
    requestAnimationFrame(() =>
      barAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );

  const showMap = () => {
    setView("map");
    if ((barAnchor.current?.getBoundingClientRect().top ?? 0) > 100) toBar();
  };

  const showOnMap = (id: string) => {
    setActiveId(id);
    setFocusToken((n) => n + 1);
    if (!isDesktop) {
      setView("map");
      toBar();
    }
  };

  const onMarker = useCallback(
    (id: string) => {
      setActiveId(id);
      if (isDesktop)
        document
          .getElementById(`dealer-${id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [isDesktop]
  );

  const openEnquiry = useCallback(
    (dealer: Dealer | null) => setEnquiry({ dealer }),
    []
  );
  const closeEnquiry = useCallback(() => setEnquiry(null), []);

  // The map's popup, as plain DOM (Leaflet owns it). Text only, no HTML from data.
  const popupFor = useCallback(
    (r: Ranked, i: number) => {
      const d = r.dealer;
      const el = document.createElement("div");
      el.setAttribute("data-testid", "map-popup");
      const kicker = document.createElement("div");
      kicker.className = "wtb-pop-kicker";
      kicker.textContent = `${i + 1} · ${d.typeLabel} · ${d.area}${r.km != null ? ` · ${formatKm(r.km)}` : ""}`;
      const name = document.createElement("div");
      name.className = "wtb-pop-name";
      name.textContent = d.name;
      const addr = document.createElement("div");
      addr.className = "wtb-pop-addr";
      addr.textContent = fullAddress(d);
      const actions = document.createElement("div");
      actions.className = "wtb-pop-actions";
      const dir = document.createElement("a");
      dir.href = directionsUrl(d);
      dir.target = "_blank";
      dir.rel = "noopener noreferrer";
      dir.textContent = "Directions";
      const enq = document.createElement("button");
      enq.type = "button";
      enq.textContent = "Enquire";
      enq.addEventListener("click", () => openEnquiry(d));
      actions.append(dir, enq);
      el.append(kicker, name, addr);
      if (d.phone) {
        const ph = document.createElement("a");
        ph.href = d.phone.href;
        ph.textContent = d.phone.display;
        ph.style.cssText = `display:block;margin-top:4px;color:${INK};text-decoration:underline`;
        el.append(ph);
      }
      el.append(actions);
      return el;
    },
    [openEnquiry]
  );

  // ---- the results line
  const place = answers.geo ? "you" : (search.origin?.label ?? answers.where);
  const outlets = (k: number) => `${k} outlet${k === 1 ? "" : "s"}`;
  let heading: string;
  let note: string | null = null;
  let offerEnquiry = false;
  if (answers.all) {
    heading = `All ${outlets(matches.length)} in Bengaluru`;
  } else if (search.outsidePin && !answers.geo) {
    heading = `No outlets listed near ${answers.where} yet`;
    note =
      "This directory covers Bengaluru for now. Enquire and we will connect you with the Pacific partner nearest to you.";
    offerEnquiry = true;
  } else if (!matches.length) {
    heading = `No outlets for ${audience?.plural ?? "you"} near ${place} yet`;
    note = "Enquire and we will connect you with the right Pacific partner.";
    offerEnquiry = true;
  } else {
    heading =
      matches.length > visible.length
        ? `${visible.length} nearest of ${matches.length} near ${place}`
        : `${outlets(matches.length)} near ${place}`;
    const nearest = matches[0].km;
    if (nearest != null && nearest > NEAR_KM && !matches[0].exact) {
      note = `The nearest is about ${formatKm(nearest)} away${
        nearest > 60 ? "; this directory covers Bengaluru for now" : ""
      }. Enquire and we will find the partner nearest to you.`;
      offerEnquiry = true;
    }
    if (answers.who === "trade")
      note =
        "Pacific supplies fabricators and dealers through its distributors, and directly. Enquire for trade supply.";
    if (answers.who === "trade") offerEnquiry = true;
  }
  const typeNames = TYPE_ORDER.filter((t) => types.includes(t.value))
    .map((t) => t.plural.toLowerCase())
    .join(", ");
  const subline = answers.all
    ? "Every listed outlet, by name"
    : `${typeNames.charAt(0).toUpperCase()}${typeNames.slice(1)}${
        needsDisplay ? " with Pacific on display" : ""
      } · nearest first, straight-line distance`;
  const firstNearby =
    origin && !answers.all && visible.some((r) => r.exact)
      ? visible.findIndex((r) => !r.exact)
      : -1;

  const summary = [
    audience?.label,
    interest && interest.value !== "browsing" ? interest.label : null,
    answers.geo
      ? "Near my location"
      : answers.where
        ? `Near ${search.origin?.label ?? answers.where}`
        : null,
  ].filter(Boolean) as string[];

  const enquiryContext = {
    who: audience?.label,
    interest: interest?.label,
    application: interest?.application,
  };

  return (
    <>
      {/* 1 · The questions ----------------------------------------------------- */}
      {/* A light hero: data-header-light asks the header for its solid,
          dark-on-light state at the top of the page. */}
      <section
        data-header-light
        className="border-b border-[#14140f]/10 pb-8 pt-28 sm:pb-10 lg:pt-32"
        style={{ background: "#EFEDE9", color: INK }}
      >
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-[0.3em]">Where to buy</p>
          <h1
            style={LIGHT}
            className={cn(
              "mt-3 uppercase leading-[0.98] tracking-[-0.03em]",
              done
                ? "text-[30px] sm:text-4xl lg:text-5xl"
                : "text-[34px] sm:text-5xl lg:text-[64px]"
            )}
          >
            Find Pacific Surfaces near you
          </h1>

          {done ? (
            <div
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3"
              data-testid="answers-summary"
            >
              {answers.all ? (
                <p className="text-base font-light">
                  Every outlet in Bengaluru.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {summary.map((s) => (
                    <li
                      key={s}
                      className="border border-[#14140f]/20 bg-white px-3 py-1.5 text-[12px] uppercase tracking-[0.12em]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={edit}
                data-testid="edit-search"
                className="inline-flex h-9 items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] underline underline-offset-4"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit search
              </button>
            </div>
          ) : (
            <>
              <p className="mt-4 max-w-2xl text-base font-light leading-snug sm:text-lg">
                Dealers, distributors and kitchen and interior studios where you
                can see and buy Pacific Surfaces quartz and granite. Three quick
                questions and we show the ones that suit you, nearest first. Now
                listing Bengaluru; more cities soon.
              </p>

              <form
                id="wtb-form"
                onSubmit={submit}
                noValidate
                className="mt-7 grid max-w-5xl scroll-mt-24 gap-6 border border-[#14140f]/10 bg-white p-5 sm:p-7"
                aria-label="Find an outlet"
                data-testid="wtb-form"
              >
                <fieldset>
                  <legend className={STEP}>1 · I am a</legend>
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="I am a"
                  >
                    {AUDIENCES.map((a) => (
                      <Choice
                        key={a.value}
                        on={draft.who === a.value}
                        onClick={() => setD({ who: a.value })}
                      >
                        {a.label}
                      </Choice>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className={STEP}>2 · Interested in</legend>
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Interested in"
                  >
                    {INTERESTS.map((i) => (
                      <Choice
                        key={i.value}
                        on={draft.interest === i.value}
                        onClick={() => setD({ interest: i.value })}
                      >
                        {i.label}
                      </Choice>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className={STEP}>3 · Where</legend>
                  <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1 sm:max-w-md">
                      <label htmlFor="wtb-where" className="sr-only">
                        PIN code or area
                      </label>
                      <MapPin
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                        aria-hidden="true"
                      />
                      <input
                        id="wtb-where"
                        type="text"
                        inputMode="text"
                        enterKeyHint="search"
                        autoComplete="postal-code"
                        maxLength={60}
                        value={draft.geo ? "" : draft.where}
                        onChange={(e) =>
                          setD({ where: e.target.value, geo: null })
                        }
                        placeholder={
                          draft.geo
                            ? "Using your location"
                            : "PIN code, e.g. 560102, or area"
                        }
                        className={cn(FIELD, "pl-11")}
                      />
                    </div>
                    {geoAllowed && (
                      <button
                        type="button"
                        onClick={locate}
                        disabled={geoState === "locating"}
                        aria-pressed={!!draft.geo}
                        data-over-media={draft.geo ? "" : undefined}
                        style={
                          draft.geo
                            ? {
                                background: INK,
                                color: "#ffffff",
                                borderColor: INK,
                              }
                            : { color: INK, borderColor: INK }
                        }
                        className="inline-flex h-12 items-center justify-center gap-2 border bg-white px-5 text-[13px] uppercase tracking-[0.14em] transition-colors disabled:opacity-60"
                      >
                        {draft.geo ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Crosshair className="h-4 w-4" aria-hidden="true" />
                        )}
                        {geoState === "locating"
                          ? "Locating…"
                          : draft.geo
                            ? "Using my location"
                            : "Use my location"}
                      </button>
                    )}
                  </div>
                  {(geoState === "denied" || geoState === "unavailable") && (
                    <p className="mt-2 text-sm font-light" role="status">
                      {geoState === "denied"
                        ? "Location is blocked for this site. Allow it in your browser, or enter your PIN code."
                        : "We could not get your location. Enter your PIN code instead."}
                    </p>
                  )}
                </fieldset>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    data-over-media
                    data-testid="wtb-submit"
                    style={{ background: INK, color: "#ffffff" }}
                    className="inline-flex h-12 items-center justify-center gap-2 px-8 text-[13px] uppercase tracking-[0.14em] transition-opacity hover:opacity-85"
                  >
                    Show outlets
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {formError && (
                    <p
                      className="text-sm font-light text-[#9b2c2c]"
                      role="alert"
                      data-testid="form-error"
                    >
                      {formError}
                    </p>
                  )}
                  {complete(answers) && (
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="text-[12px] uppercase tracking-[0.14em] underline underline-offset-4 sm:ml-auto"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <p className="mt-4 text-[13px] font-light" style={MUTED}>
                Or{" "}
                <button
                  type="button"
                  onClick={browseAll}
                  className="underline underline-offset-4"
                  style={{ color: INK }}
                >
                  browse every Bengaluru outlet
                </button>
                .
              </p>
            </>
          )}
        </div>
      </section>

      {/* 2 · Results, once answered ---------------------------------------- */}
      <section
        ref={resultsTop}
        className="scroll-mt-20 bg-white"
        style={{ color: INK }}
        hidden={!done}
      >
        {done && (
          <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-8 lg:px-12">
            {/* Refinements */}
            <div className="flex flex-col gap-3 border-b border-[#14140f]/10 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
                role="group"
                aria-label="Type of outlet"
              >
                {TYPE_ORDER.map((t) => {
                  const c = typeCounts.get(t.value) ?? 0;
                  const on = types.includes(t.value);
                  if (!c && !on) return null;
                  return (
                    <Chip
                      key={t.value}
                      on={on}
                      onClick={() => {
                        const next = on
                          ? types.filter((x) => x !== t.value)
                          : [...types, t.value];
                        setTypeOverride(next.length ? next : null);
                        setShown(PAGE_SIZE);
                      }}
                    >
                      {t.plural} <span className="opacity-60">{c}</span>
                    </Chip>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Toggle
                  on={samplesOnly}
                  onClick={() => setSamplesOnly((v) => !v)}
                >
                  Samples<span className="hidden sm:inline"> on display</span>
                </Toggle>
                <Toggle on={slabsOnly} onClick={() => setSlabsOnly((v) => !v)}>
                  Slabs<span className="hidden sm:inline"> on display</span>
                </Toggle>
                {(typeOverride || samplesOnly || slabsOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeOverride(null);
                      setSamplesOnly(false);
                      setSlabsOnly(false);
                    }}
                    className="inline-flex h-10 items-center px-2 text-[12px] uppercase tracking-[0.12em] underline underline-offset-4"
                  >
                    {answers.all ? "Clear" : "Back to suggested"}
                  </button>
                )}
              </div>
            </div>

            {/* Results line, and the List / Map toggle on phones */}
            <div ref={barAnchor} aria-hidden="true" className="scroll-mt-20" />
            <div className="sticky top-20 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-[#14140f]/10 bg-white px-4 py-3 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:px-0 lg:pb-2 lg:pt-6">
              <div className="min-w-0">
                <h2
                  style={MID}
                  className="line-clamp-2 text-[14px] leading-snug normal-case tracking-normal sm:text-lg lg:text-xl"
                  aria-live="polite"
                  data-testid="results-heading"
                >
                  {heading}
                </h2>
                <p
                  className="hidden text-[12px] font-light sm:block"
                  style={MUTED}
                >
                  {audience ? `For ${audience.plural}: ` : ""}
                  {subline}
                </p>
              </div>
              {/* Phones: the answers can be changed from the sticky bar. */}
              <button
                type="button"
                onClick={edit}
                aria-label="Edit search"
                data-testid="edit-search-bar"
                style={{ color: INK }}
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center border border-[#14140f]/20 lg:hidden"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <div
                className="flex shrink-0 border border-[#14140f] lg:hidden"
                role="tablist"
                aria-label="View"
              >
                <ViewTab
                  on={view === "list"}
                  onClick={() => setView("list")}
                  icon={<List className="h-4 w-4" aria-hidden="true" />}
                >
                  List
                </ViewTab>
                <ViewTab
                  on={view === "map"}
                  onClick={showMap}
                  icon={<MapIcon className="h-4 w-4" aria-hidden="true" />}
                >
                  Map
                </ViewTab>
              </div>
            </div>
            {note && (
              <div
                className="mt-4 flex flex-col gap-3 border border-[#14140f]/15 p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ background: "#F6F5F2" }}
                data-testid="results-note"
              >
                <p className="text-sm font-light">{note}</p>
                {offerEnquiry && (
                  <button
                    type="button"
                    onClick={() => openEnquiry(null)}
                    data-over-media
                    style={{ background: INK, color: "#ffffff" }}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 px-5 text-[12px] uppercase tracking-[0.14em]"
                  >
                    Enquire{" "}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="grid gap-6 pb-16 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
              {/* List */}
              <div
                className={cn(view === "map" && "hidden lg:block")}
                data-testid="results-list"
              >
                {visible.length > 0 && (
                  <ol className="flex flex-col gap-3">
                    {visible.map((r, i) => (
                      <li key={r.dealer.id}>
                        {i === firstNearby && i > 0 && (
                          <p
                            className="mb-3 mt-3 text-[11px] uppercase tracking-[0.2em]"
                            style={MUTED}
                          >
                            Nearby
                          </p>
                        )}
                        <DealerCard
                          r={r}
                          index={i}
                          active={activeId === r.dealer.id}
                          onHover={setActiveId}
                          onShowOnMap={showOnMap}
                          onEnquire={openEnquiry}
                        />
                      </li>
                    ))}
                  </ol>
                )}
                {matches.length > visible.length && (
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                    data-testid="show-more"
                    style={{ color: INK, borderColor: INK }}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 border bg-white text-[13px] uppercase tracking-[0.14em] transition-colors hover:bg-black/5"
                  >
                    Show {Math.min(PAGE_SIZE, matches.length - visible.length)}{" "}
                    more
                    <span className="opacity-60">
                      ({matches.length - visible.length} left)
                    </span>
                  </button>
                )}

                <div className="mt-8 border-t border-[#14140f]/10 pt-6 text-sm font-light">
                  <p>
                    Not near Bengaluru, or need help choosing?{" "}
                    <button
                      type="button"
                      onClick={() => openEnquiry(null)}
                      className="underline underline-offset-4"
                    >
                      Tell us where you are
                    </button>{" "}
                    and we will connect you with the nearest partner.
                  </p>
                  <p className="mt-2">
                    A dealer or studio?{" "}
                    <Link
                      href="/contact?type=distributor#enquiry"
                      className="underline underline-offset-4"
                    >
                      Become a Pacific partner
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Map */}
              <div
                className={cn("lg:block", view === "map" ? "block" : "hidden")}
              >
                <div
                  className="relative h-[calc(100svh-9.5rem)] min-h-[420px] w-full overflow-hidden border border-[#14140f]/10 lg:sticky lg:top-24 lg:h-[calc(100svh-7.5rem)]"
                  data-testid="map-panel"
                >
                  <DealerMap
                    results={visible}
                    origin={origin}
                    activeId={activeId}
                    focusToken={focusToken}
                    onSelect={onMarker}
                    popupFor={popupFor}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {enquiry && (
        <DealerEnquiry
          dealer={enquiry.dealer}
          near={answers.geo ? "my location" : answers.where}
          context={enquiryContext}
          onClose={closeEnquiry}
        />
      )}
    </>
  );
}

/** One answer in the form: a radio as a button. */
function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      data-over-media={on ? "" : undefined}
      style={
        on
          ? { background: INK, color: "#ffffff", borderColor: INK }
          : { color: INK }
      }
      className="inline-flex min-h-11 items-center gap-1.5 border border-[#14140f]/20 px-4 py-2 text-left text-[13px] leading-tight transition-colors hover:border-[#14140f]"
    >
      {children}
    </button>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      data-over-media={on ? "" : undefined}
      style={
        on
          ? { background: INK, color: "#ffffff", borderColor: INK }
          : { color: INK }
      }
      className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap border border-[#14140f]/20 px-4 text-[12px] uppercase tracking-[0.12em] transition-colors hover:border-[#14140f]"
    >
      {children}
    </button>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{ color: INK }}
      className="inline-flex h-10 items-center gap-2 border border-[#14140f]/20 px-3 text-[12px] uppercase tracking-[0.12em] transition-colors hover:border-[#14140f]"
    >
      <span
        aria-hidden="true"
        className="flex h-4 w-4 items-center justify-center border"
        style={{ borderColor: INK, background: on ? INK : "#ffffff" }}
      >
        {on && (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          >
            <path d="M2.5 6.5l2.2 2.2L9.5 3.8" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

function ViewTab({
  on,
  onClick,
  icon,
  children,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      data-over-media={on ? "" : undefined}
      style={
        on
          ? { background: INK, color: "#ffffff" }
          : { background: "#ffffff", color: INK }
      }
      className="inline-flex h-9 items-center gap-1.5 px-3 text-[12px] uppercase tracking-[0.12em]"
    >
      {icon}
      {children}
    </button>
  );
}

function DealerCard({
  r,
  index,
  active,
  onHover,
  onShowOnMap,
  onEnquire,
}: {
  r: Ranked;
  index: number;
  active: boolean;
  onHover: (id: string | null) => void;
  onShowOnMap: (id: string) => void;
  onEnquire: (d: Dealer) => void;
}) {
  const d = r.dealer;
  const approx = d.geo === "pin-code" || d.geo === "area";
  const display = [
    d.samples && "Sample stand",
    d.slabs &&
      (d.onDisplay.length
        ? `Display slabs: ${d.onDisplay.join(", ")}`
        : "Display slabs"),
  ].filter(Boolean) as string[];
  return (
    <div
      id={`dealer-${d.id}`}
      data-testid="dealer-card"
      onMouseEnter={() => onHover(d.id)}
      className={cn(
        "scroll-mt-28 border bg-white p-5 transition-colors sm:p-6",
        active
          ? "border-[#14140f]"
          : "border-[#14140f]/12 hover:border-[#14140f]/40"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px]"
          data-over-media
          style={{ background: "#112732", color: "#ffffff" }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p
              className="text-[11px] uppercase tracking-[0.16em]"
              style={MUTED}
            >
              {d.typeLabel} · {d.area}
            </p>
            {r.km != null && (
              <p className="text-[12px]" data-testid="distance">
                {formatKm(r.km)}
              </p>
            )}
          </div>
          <h3
            style={MID}
            className="mt-1 text-xl leading-tight tracking-[-0.01em]"
          >
            {d.name}
            {r.exact && <span className="sr-only"> (matches your search)</span>}
          </h3>
          <p className="mt-2 text-[14px] font-light leading-snug">
            {fullAddress(d)}
          </p>
          {approx && (
            <p className="mt-1 text-[12px] font-light" style={MUTED}>
              Map position approximate; use Directions or call ahead.
            </p>
          )}
          {display.length > 0 && (
            <p className="mt-2 text-[13px] font-light">
              <span
                className="text-[11px] uppercase tracking-[0.14em]"
                style={MUTED}
              >
                On display{" "}
              </span>
              {display.join(" · ")}
            </p>
          )}
          {d.phone && (
            <a
              href={d.phone.href}
              className="mt-2 inline-flex items-center gap-1.5 text-[14px] underline underline-offset-4"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {d.phone.display}
            </a>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={directionsUrl(d)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="directions"
              data-over-media
              style={{ background: INK, color: "#ffffff" }}
              className="inline-flex h-10 items-center gap-2 px-4 text-[12px] uppercase tracking-[0.12em] transition-opacity hover:opacity-85"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Directions
            </a>
            <button
              type="button"
              onClick={() => onEnquire(d)}
              data-testid="enquire"
              style={{ color: INK, borderColor: INK }}
              className="inline-flex h-10 items-center gap-2 border bg-white px-4 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-black/5"
            >
              Enquire
            </button>
            <button
              type="button"
              onClick={() => onShowOnMap(d.id)}
              data-testid="show-on-map"
              style={{ color: INK }}
              className="inline-flex h-10 items-center gap-1.5 px-2 text-[12px] uppercase tracking-[0.12em] underline underline-offset-4"
            >
              <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
