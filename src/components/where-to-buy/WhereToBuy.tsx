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
import { Photo } from "@/components/ui/photo";
import {
  FACTORY,
  FACTORY_ADDRESS,
  OPENING_HOURS,
  SALES_PHONE,
} from "@/data/business";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";
import { LIQUID_GLASS_DARK } from "@/components/global/liquid-glass";
import {
  AUDIENCES,
  CONSENT_TEXT,
  EMAIL_RE,
  INTERESTS,
  NEAR_KM,
  TRACKING,
  TYPE_ORDER,
  audienceOf,
  directionsUrl,
  formatKm,
  formatMobile,
  fullAddress,
  indianMobile,
  interestOf,
  typesFor,
  type Audience,
  type Dealer,
  type DealerType,
  type Interest,
  type Ranked,
  type SearchOutcome,
  type SearchQuery,
} from "@/lib/where-to-buy";
import { DealerEnquiry } from "./DealerEnquiry";
import { PartnerCard } from "./PartnerCard";
import "./where-to-buy.css";

/**
 * /where-to-buy: find Pacific Surfaces dealers, distributors and studios.
 *
 * Like Cosentino's locator, it asks first (who you are, what you are
 * interested in, your PIN code or location: dropdowns in one card on a
 * photograph, laid out like /contact) and then lists only the
 * outlets that suit the answers, nearest first, a page at a time: a list
 * and a map, side by side on desktop and a List / Map toggle on phones.
 * Each outlet has Directions (Google Maps, no key) and Enquire (the site's
 * quick-enquiry endpoint, prefilled with the outlet and the answers).
 *
 * Nothing is listed until the visitor leaves their details (marketing,
 * 2026-10-26, like Aquant's locator): name, mobile (checked by a texted
 * code when OTP is set up), email, company and consent, sent with the
 * answers to /api/where-to-buy/lead, which saves the lead for the sales
 * team and answers with the first search. The page never holds the
 * directory: every search, and every refinement of one, goes to
 * /api/where-to-buy/search (behind the access cookie the lead sets) and
 * comes back as the nearest few only (lib/where-to-buy.ts searchOutlets).
 *
 * The answers live in the URL, so a result can be shared:
 *   ?who=homeowner&for=kitchen&where=560102
 *   ?who=trade&for=browsing&lat=12.93&lng=77.62   (location, to ~1 km)
 * plus the refinements type=, view=map, and all=1 for
 * the whole directory. A shared link opens the results for a visitor who
 * has left their details, and the form, filled in, for anyone else.
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

/** The plant's own photographs, for the factory's popup on the map; each
 *  opens the Google Business Profile, which has the rest. */
const FACTORY_PHOTOS = [
  {
    src: "/videos/sustainability-hero-poster.jpg",
    alt: "The Pacific Surfaces plant from the air, among green fields",
  },
  {
    src: "/videos/origin-poster.jpg",
    alt: "Inside the Pacific Surfaces plant",
  },
  {
    src: "/images/india-home/bretonstone-robot.webp",
    alt: "A Breton robot over the quartz mix on the Bretonstone line",
  },
];

/** The photograph (owner, 2026-10-28: the Stellar Fusion bar; it was the
 *  Cristallo Gold island, and Taj Vein before, and /contact has its own,
 *  so the pages differ). */
const MEDIA = {
  hero: {
    src: "/images/where-to-buy/stellar-fusion-bar.webp",
    alt: "A bar with a shelved wall and counter in Stellar Fusion quartz",
  },
};

const INK = "#14140f";
const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const MID = { fontVariationSettings: "'wght' 420, 'wdth' 100" };
const MUTED = { color: "rgba(20,20,15,0.62)" };
/** The same, on the glass card (white copy). */
const GLASS_MUTED = { color: "rgba(255,255,255,0.78)" };

const FIELD =
  "h-12 w-full border border-[#14140f]/15 bg-white px-4 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/45 focus:border-[#14140f] focus:outline-none transition-colors aria-[invalid=true]:border-[#9b2c2c]";
/** The contact page's enquiry form labels. */
const LABEL = "mb-2 block text-[11px] uppercase tracking-[0.16em]";

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

/** The lead form's fields, after the three answers. */
interface Details {
  name: string;
  mobile: string;
  email: string;
  company: string;
  /** The texted code, when OTP is on. */
  otp: string;
  consent: boolean;
  /** Honeypot: people never fill it. */
  website: string;
}

const NO_DETAILS: Details = {
  name: "",
  mobile: "",
  email: "",
  company: "",
  otp: "",
  consent: false,
  website: "",
};

/** The consent wording, split around its Privacy Policy link. */
const [CONSENT_LEAD] = CONSENT_TEXT.split("Privacy Policy");

const complete = (a: Answers) => a.all || (!!a.who && (!!a.where || !!a.geo));
const round2 = (n: number) => Math.round(n * 100) / 100;

/** The refinements of a search: the types chosen, samples, slabs. */
interface Refinements {
  types: DealerType[] | null;
  samples: boolean;
  slabs: boolean;
}

const NO_REFINEMENTS: Refinements = {
  types: null,
  samples: false,
  slabs: false,
};

/** The answers and refinements as the server's search query. */
const queryOf = (a: Answers, r: Refinements): SearchQuery => ({
  who: a.who,
  interest: a.interest,
  where: a.geo ? "" : a.where,
  geo: a.geo,
  all: a.all,
  types: r.types,
  samples: r.samples,
  slabs: r.slabs,
});

/** One search on the server: its outcome, or "locked" when the access
 *  cookie has lapsed. Throws with a message fit to show. */
async function fetchOutcome(
  q: SearchQuery,
  signal?: AbortSignal
): Promise<SearchOutcome | "locked"> {
  const res = await fetch("/api/where-to-buy/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
    signal,
  });
  if (res.status === 401) return "locked";
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.outcome)
    throw new Error(
      j.error ?? "That search did not go through. Please try again."
    );
  return j.outcome as SearchOutcome;
}

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

export function WhereToBuy({
  unlocked: startUnlocked,
  otp,
}: {
  /** Whether this browser has left its details (the access cookie). */
  unlocked: boolean;
  /** Whether the mobile is checked with a texted code. */
  otp: boolean;
}) {
  // Whether the visitor has left their details; the outlets themselves
  // come a search at a time from the server.
  const [unlocked, setUnlocked] = useState(startUnlocked);
  /** The server's answer to the current search and refinements. */
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null);
  /** The query that answer is for, so a search is never asked twice. */
  const answered = useRef<string | null>(null);
  // Committed answers, and the form's draft of them.
  const [answers, setAnswers] = useState<Answers>(NO_ANSWERS);
  const [draft, setDraft] = useState<Answers>(NO_ANSWERS);
  const [formError, setFormError] = useState<string | null>(null);
  /** The field the error is about, to mark and focus it. */
  const [badField, setBadField] = useState<string | null>(null);
  /** The card's step: the three answers, then (before any outlet is
   *  shown) the visitor's details, after Continue. */
  const [step, setStep] = useState<"answers" | "details">("answers");
  // The lead form.
  const [details, setDetails] = useState<Details>(NO_DETAILS);
  const [otpState, setOtpState] = useState<"idle" | "sending" | "sent">("idle");
  /** The mobile the last code went to (10 digits). */
  const [otpFor, setOtpFor] = useState("");
  const [resendIn, setResendIn] = useState(0);
  /** Turns the typed code into Firebase's proof (lib/firebase-phone.ts). */
  const confirmCode = useRef<((code: string) => Promise<string>) | null>(null);
  /** That proof, once the code was right; good for an hour. */
  const [phoneToken, setPhoneToken] = useState<{
    mobile: string;
    token: string;
  } | null>(null);
  const recaptchaHost = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  /** The visitor's details, to fill in the outlet enquiry. */
  const [contact, setContact] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  // False when the page's Permissions-Policy header forbids geolocation
  // (next.config.ts sends geolocation=() sitewide): the button is hidden
  // rather than offered and refused.
  const [geoAllowed, setGeoAllowed] = useState(true);

  // Refinements of the results.
  const [typeOverride, setTypeOverride] = useState<DealerType[] | null>(null);
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
      // ?all=1 (the whole directory) is no longer offered: every search
      // is the nearest few to a place.
      all: false,
    };
    setDraft(a);
    // A shared link shows results only to a visitor who has left their
    // details; anyone else gets the form, filled in.
    if (complete(a) && startUnlocked) setAnswers(a);
    const t = (p.get("type") ?? "")
      .split(",")
      .filter((x): x is DealerType => TYPE_ORDER.some((o) => o.value === x));
    if (t.length) setTypeOverride(t);
    if (p.get("view") === "map") setView("map");
    setReady(true);
  }, [startUnlocked]);

  // And keep the URL in step, keeping any ad tags so the lead and the
  // outlet enquiries can still read them.
  useEffect(() => {
    if (!ready) return;
    const now = new URLSearchParams(window.location.search);
    const p = new URLSearchParams();
    TRACKING.forEach((k) => {
      const v = now.get(k);
      if (v) p.set(k, v);
    });
    if (complete(answers)) {
      if (answers.all) p.set("all", "1");
      if (answers.who) p.set("who", answers.who);
      if (answers.interest) p.set("for", answers.interest);
      if (answers.geo) {
        p.set("lat", String(answers.geo.lat));
        p.set("lng", String(answers.geo.lng));
      } else if (answers.where) p.set("where", answers.where);
      if (typeOverride) p.set("type", typeOverride.join(","));
      if (view === "map") p.set("view", "map");
    }
    const s = p.toString();
    const url = `${window.location.pathname}${s ? `?${s}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`)
      window.history.replaceState(window.history.state, "", url);
  }, [ready, answers, typeOverride, view]);

  // Every search after the lead goes to the server, which answers with the
  // nearest few; refinements ask again. A lapsed access shows the form.
  useEffect(() => {
    if (!unlocked || !complete(answers)) return;
    const q = queryOf(answers, {
      types: typeOverride,
      samples: false,
      slabs: false,
    });
    const key = JSON.stringify(q);
    if (key === answered.current) return;
    const ctrl = new AbortController();
    fetchOutcome(q, ctrl.signal)
      .then((o) => {
        if (o === "locked") {
          setUnlocked(false);
          setOutcome(null);
          answered.current = null;
          return;
        }
        answered.current = key;
        setOutcome(o);
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setFormError((err as Error).message);
        setBadField(null);
      });
    return () => ctrl.abort();
  }, [unlocked, answers, typeOverride]);

  const done = complete(answers) && unlocked && outcome !== null;
  const audience = answers.all ? null : audienceOf(answers.who);
  const interest = answers.all ? null : interestOf(answers.interest);
  const origin = outcome?.origin ?? null;
  // The nearest few, as the server sent them (see MAX_SHOWN).
  const visible = useMemo(() => outcome?.results ?? [], [outcome]);

  const suggested = useMemo<DealerType[]>(
    () =>
      audience
        ? typesFor(audience.value, interest?.value ?? null)
        : TYPE_ORDER.map((t) => t.value),
    [audience, interest]
  );
  const types = typeOverride ?? suggested;
  const needsDisplay = !typeOverride && !!audience?.needsDisplay;

  // ---- the form
  const setD = (patch: Partial<Answers>) => {
    setFormError(null);
    setBadField(null);
    setDraft((d) => ({ ...d, ...patch, all: false }));
  };
  const setL = (patch: Partial<Details>) => {
    setFormError(null);
    setBadField(null);
    setDetails((d) => ({ ...d, ...patch }));
  };

  /** Show an error, on the card's step with its field, marked and focused. */
  const fail = (field: string | null, message: string) => {
    const answer = field === "who" || field === "where";
    setFormError(message);
    setBadField(field);
    if (answer) setStep("answers");
    const id = answer ? `wtb-${field}` : `wtb-lead-${field}`;
    if (field)
      requestAnimationFrame(() => document.getElementById(id)?.focus());
  };

  const mobile = indianMobile(details.mobile);
  const codeSent = otpState === "sent" && !!mobile && otpFor === mobile;
  const mobileProven = !!mobile && phoneToken?.mobile === mobile;

  // The wait before a code can be sent again.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    if (!mobile)
      return fail("mobile", "Enter a 10-digit Indian mobile number.");
    if (!recaptchaHost.current) return;
    setOtpState("sending");
    setFormError(null);
    setBadField(null);
    try {
      const { sendCode: text } = await import("@/lib/firebase-phone");
      confirmCode.current = await text(mobile, recaptchaHost.current);
      setOtpFor(mobile);
      setOtpState("sent");
      setResendIn(30);
      setDetails((d) => ({ ...d, otp: "" }));
      requestAnimationFrame(() =>
        document.getElementById("wtb-lead-otp")?.focus()
      );
    } catch (err) {
      setOtpState(otpFor === mobile ? "sent" : "idle");
      fail(
        "mobile",
        err instanceof Error ? err.message : "We could not send the code."
      );
    }
  };

  /** The details' first problem, as [field, message]. */
  const checkDetails = (): [string, string] | null => {
    if (details.name.trim().length < 2) return ["name", "Enter your name."];
    if (!EMAIL_RE.test(details.email.trim()))
      return ["email", "Enter a valid email address."];
    if (!mobile) return ["mobile", "Enter a 10-digit Indian mobile number."];
    if (otp && !mobileProven) {
      if (!codeSent)
        return ["mobile", "Tap Send code to verify your mobile number."];
      if (!/^\d{6}$/.test(details.otp))
        return ["otp", "Enter the 6-digit code we sent to your mobile."];
    }
    if (!details.consent)
      return ["consent", "Tick the box to agree to be contacted."];
    return null;
  };

  /** The visitor's details, the code's proof, then the lead; it returns the outlets. */
  const sendLead = async (a: Answers) => {
    const problem = checkDetails();
    if (problem) return fail(...problem);
    setSending(true);
    try {
      let token = mobileProven ? phoneToken!.token : "";
      if (otp && !token) {
        try {
          token = await confirmCode.current!(details.otp);
        } catch (err) {
          return fail("otp", (err as Error).message);
        }
        setPhoneToken({ mobile: mobile!, token });
      }
      const here = new URLSearchParams(window.location.search);
      const res = await fetch("/api/where-to-buy/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who: a.who,
          interest: a.interest,
          where: a.where,
          geo: a.geo,
          name: details.name.trim(),
          mobile,
          phoneToken: token,
          email: details.email.trim(),
          company: details.company.trim(),
          consent: details.consent,
          website: details.website,
          tracking: TRACKING.flatMap((k) =>
            here.get(k) ? [`${k}=${here.get(k)}`] : []
          ).join(" "),
          referrer: document.referrer,
          pageUrl: window.location.href,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Firebase's proof was refused: start the code over.
        if (j.field === "otp") {
          setPhoneToken(null);
          setOtpState("idle");
        }
        return fail(
          j.field ?? null,
          j.error ??
            `That did not go through. Please try again, or call ${SALES_PHONE.display}.`
        );
      }
      // The lead answers with the first search; the cookie it set covers
      // the searches after it.
      answered.current = JSON.stringify(queryOf(a, NO_REFINEMENTS));
      setOutcome((j.outcome as SearchOutcome | undefined) ?? null);
      setUnlocked(true);
      setStep("answers");
      setContact({
        name: details.name.trim(),
        email: details.email.trim(),
        phone: formatMobile(mobile!),
      });
      // Fired only once the lead is saved, so a failed POST never counts.
      trackMetaEvent("Lead", {
        content_name: "Where to buy",
        content_category: a.interest ?? "dealer",
      });
      window.gtag?.("event", "generate_lead", {
        form: "where_to_buy_details",
        page: window.location.pathname,
      });
      show(a);
    } catch {
      fail(
        null,
        `That did not go through. Please try again, or call ${SALES_PHONE.display}.`
      );
    } finally {
      setSending(false);
    }
  };

  /** The three answers, or null after pointing at the one missing. */
  const checkAnswers = (): Answers | null => {
    const where = draft.where.trim();
    if (!draft.who) {
      fail("who", "Tell us who you are.");
      return null;
    }
    if (!draft.geo && !where) {
      fail(
        "where",
        `Enter your PIN code${geoAllowed ? " or use your location" : ""}.`
      );
      return null;
    }
    return { ...draft, where: draft.geo ? "" : where, all: false };
  };

  /** The card's first step: on to the details, or (once given) a search. */
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sending) return;
    const a = checkAnswers();
    if (!a) return;
    if (!unlocked) {
      // The server checks the place, with the lead.
      setFormError(null);
      setBadField(null);
      setStep("details");
      requestAnimationFrame(() =>
        document.getElementById("wtb-lead-name")?.focus()
      );
      return;
    }
    // The server checks the place, and answers with the nearest few.
    setSending(true);
    try {
      const q = queryOf(a, NO_REFINEMENTS);
      const o = await fetchOutcome(q);
      if (o === "locked") {
        setUnlocked(false);
        setOutcome(null);
        answered.current = null;
        return fail(
          null,
          "Please leave your details again to see the outlets."
        );
      }
      if (o.unknown)
        return fail(
          "where",
          "We don't recognise that. Try a 6-digit PIN code such as 560102, or an area such as HSR Layout."
        );
      answered.current = JSON.stringify(q);
      setOutcome(o);
      show(a);
    } catch (err) {
      fail(null, (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  /** The card's second step: the answers and the details, as a lead. */
  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const a = checkAnswers();
    if (a) sendLead(a);
  };

  /** Commit the answers and show the results. */
  const show = (a: Answers) => {
    setAnswers(a);
    setTypeOverride(null);
    setActiveId(null);
    requestAnimationFrame(() =>
      resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  /** Back up to the questions, which keep the answers to change. */
  const edit = () =>
    document
      .getElementById("wtb-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  /** From the details back to the answers ("Change"); the details stay. */
  const back = () => {
    setFormError(null);
    setBadField(null);
    setStep("answers");
    requestAnimationFrame(() => document.getElementById("wtb-who")?.focus());
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

  // The factory's popup: the plant's photographs, then where and when,
  // with the Google Business Profile for the rest. Plain DOM, as above.
  const factoryPopup = useCallback(() => {
    const el = document.createElement("div");
    el.setAttribute("data-testid", "factory-popup");
    const photos = document.createElement("div");
    photos.className = "wtb-pop-photos";
    for (const p of FACTORY_PHOTOS) {
      const a = document.createElement("a");
      a.href = FACTORY.profileUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const img = document.createElement("img");
      img.src = p.src;
      img.alt = p.alt;
      img.loading = "lazy";
      img.decoding = "async";
      a.append(img);
      photos.append(a);
    }
    const kicker = document.createElement("div");
    kicker.className = "wtb-pop-kicker";
    kicker.textContent = `Our factory · ${FACTORY.locality}`;
    const name = document.createElement("div");
    name.className = "wtb-pop-name";
    name.textContent = FACTORY.name;
    const addr = document.createElement("div");
    addr.className = "wtb-pop-addr";
    addr.textContent = FACTORY_ADDRESS;
    const hours = document.createElement("div");
    hours.className = "wtb-pop-addr";
    hours.textContent = `Experience centre: ${OPENING_HOURS.display}`;
    const actions = document.createElement("div");
    actions.className = "wtb-pop-actions";
    const dir = document.createElement("a");
    dir.href = FACTORY.directionsUrl;
    dir.target = "_blank";
    dir.rel = "noopener noreferrer";
    dir.textContent = "Directions";
    const google = document.createElement("a");
    google.href = FACTORY.profileUrl;
    google.target = "_blank";
    google.rel = "noopener noreferrer";
    google.className = "wtb-pop-secondary";
    google.setAttribute("data-testid", "factory-google");
    google.textContent = "Photos & reviews";
    actions.append(dir, google);
    el.append(photos, kicker, name, addr, hours, actions);
    return el;
  }, []);

  // ---- the results line
  const place = answers.geo ? "you" : (origin?.label ?? answers.where);
  const outlets = (k: number) => `${k} outlet${k === 1 ? "" : "s"}`;
  let heading: string;
  let note: string | null = null;
  let offerEnquiry = false;
  // Never a total: only what is shown is counted (see MAX_SHOWN).
  if (answers.all) {
    heading = "Outlets in Bengaluru";
  } else if (outcome?.outsidePin) {
    heading = `No outlets listed near ${answers.where} yet`;
    note =
      "This directory covers Bengaluru for now. Enquire and we will connect you with the Pacific partner nearest to you.";
    offerEnquiry = true;
  } else if (!visible.length) {
    heading = `No outlets for ${audience?.plural ?? "you"} near ${place} yet`;
    note = "Enquire and we will connect you with the right Pacific partner.";
    offerEnquiry = true;
  } else {
    heading = outcome?.more
      ? `The ${visible.length} nearest outlets to ${place}`
      : `${outlets(visible.length)} near ${place}`;
    const nearest = visible[0].km;
    if (nearest != null && nearest > NEAR_KM && !visible[0].exact) {
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

  // The answers so far, recalled above the details form.
  const draftInterest = interestOf(draft.interest);
  const summary = [
    audienceOf(draft.who)?.label,
    draftInterest && draftInterest.value !== "browsing"
      ? draftInterest.label
      : null,
    draft.geo
      ? "Near my location"
      : draft.where.trim()
        ? `Near ${draft.where.trim()}`
        : null,
  ].filter(Boolean) as string[];

  const enquiryContext = {
    who: audience?.label,
    interest: interest?.label,
    application: interest?.application,
  };

  return (
    <>
      {/* 1 · The questions, on a photograph as on /contact (after
          Cosentino): who you are, what for and where, in one card. ------ */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#14140f] pb-16 pt-32 lg:pt-36">
        <Photo
          src={MEDIA.hero.src}
          alt={MEDIA.hero.alt}
          priority
          fetchPriority="high"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/5 to-black/30"
        />
        <div className="mx-auto flex w-full max-w-[1760px] flex-col items-center px-5 sm:px-8 lg:px-12">
          {/* The card is liquid glass on the photograph, as on Cosentino's
              where-to-buy page (owner, 2026-10-28), about 39% of a wide
              screen: the heading and the form inside it. The heading block
              declares data-over-media (white copy); the form is not inside
              one, so its fields keep dark ink on white, and its labels are
              white by inline style. Before any outlet is shown the form has
              two steps: the answers, then (after Continue) the visitor's
              details. */}
          {/* In the Middle East this card gives way to Pacific x Fairdeal
              (data-me-out / PartnerCard, shown by CSS from the first paint,
              owner 2026-10-28). */}
          <PartnerCard />
          <div
            data-me-out
            className="animate-fade-up w-full max-w-[746px] rounded-[6px] px-5 py-9 sm:px-12 sm:py-12"
            style={{ ...LIQUID_GLASS_DARK, animationDelay: "0.1s" }}
          >
            <div data-over-media className="text-center">
              <p className="text-xs uppercase tracking-[0.3em]">Where to buy</p>
              <h1
                style={LIGHT}
                className="mt-3 text-[32px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-[44px]"
              >
                Find Pacific Surfaces near you
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] font-light leading-snug sm:text-base">
                Dealers, distributors and kitchen and interior studios where you
                can see and buy Pacific quartz and granite. Now listing
                Bengaluru; more cities soon.
              </p>
            </div>

            <form
              id="wtb-form"
              onSubmit={
                step === "details" && !unlocked ? submitDetails : submit
              }
              noValidate
              aria-label={
                step === "details" ? "Your details" : "Find an outlet"
              }
              data-testid="wtb-form"
              className="mx-auto mt-8 w-full max-w-[520px] scroll-mt-28"
              style={{ color: "#ffffff" }}
            >
              {!unlocked && (
                <p className={cn(LABEL, "mb-5")} style={GLASS_MUTED}>
                  Step {step === "answers" ? "1" : "2"} of 2
                  {step === "details" ? " · Your details" : ""}
                </p>
              )}
              {step === "answers" || unlocked ? (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="wtb-who" className={LABEL}>
                      I am a *
                    </label>
                    <select
                      id="wtb-who"
                      value={draft.who ?? ""}
                      onChange={(e) =>
                        setD({ who: audienceOf(e.target.value)?.value ?? null })
                      }
                      aria-invalid={badField === "who"}
                      className={FIELD}
                    >
                      <option value="">Select</option>
                      {AUDIENCES.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wtb-for" className={LABEL}>
                      Interested in
                    </label>
                    <select
                      id="wtb-for"
                      value={draft.interest ?? ""}
                      onChange={(e) =>
                        setD({
                          interest: interestOf(e.target.value)?.value ?? null,
                        })
                      }
                      className={FIELD}
                    >
                      <option value="">Select</option>
                      {INTERESTS.map((i) => (
                        <option key={i.value} value={i.value}>
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wtb-where" className={LABEL}>
                      PIN code or area *
                    </label>
                    <div className="flex flex-col gap-2.5 sm:flex-row">
                      <div className="relative flex-1">
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
                          aria-invalid={badField === "where"}
                          placeholder={
                            draft.geo
                              ? "Using your location"
                              : "e.g. 560102 or HSR Layout"
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
                          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 border bg-white px-4 text-[12px] uppercase tracking-[0.12em] transition-colors disabled:opacity-60"
                        >
                          {draft.geo ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Crosshair className="h-4 w-4" aria-hidden="true" />
                          )}
                          {geoState === "locating"
                            ? "Locating…"
                            : draft.geo
                              ? "Located"
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
                  </div>
                </div>
              ) : (
                <div className="space-y-5" data-testid="wtb-details">
                  {/* The answers so far, with the way back to change them. */}
                  <div
                    className="flex flex-wrap items-center gap-2"
                    data-testid="answers-summary"
                  >
                    {summary.map((s) => (
                      <span
                        key={s}
                        className="border border-[#14140f]/20 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]"
                        style={{ color: INK }}
                      >
                        {s}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={back}
                      data-testid="change-answers"
                      className="inline-flex h-8 items-center gap-1.5 px-1 text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Change
                    </button>
                  </div>
                  <p
                    className="text-[13px] font-light leading-snug"
                    style={GLASS_MUTED}
                  >
                    We show the outlets as soon as you send this, and our team
                    may call to help you choose.
                  </p>
                  <div>
                    <label htmlFor="wtb-lead-name" className={LABEL}>
                      Full name *
                    </label>
                    <input
                      id="wtb-lead-name"
                      type="text"
                      autoComplete="name"
                      maxLength={200}
                      value={details.name}
                      onChange={(e) => setL({ name: e.target.value })}
                      aria-invalid={badField === "name"}
                      placeholder="Your name"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="wtb-lead-mobile" className={LABEL}>
                      Mobile *
                      {otp && (
                        <span className="normal-case tracking-normal opacity-60">
                          {" "}
                          (we text you a code)
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-light"
                          style={MUTED}
                        >
                          +91
                        </span>
                        <input
                          id="wtb-lead-mobile"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          maxLength={16}
                          value={details.mobile}
                          onChange={(e) => setL({ mobile: e.target.value })}
                          aria-invalid={badField === "mobile"}
                          aria-describedby={
                            mobileProven ? "wtb-lead-verified" : undefined
                          }
                          placeholder="98450 12345"
                          className={cn(FIELD, "pl-14")}
                        />
                      </div>
                      {otp &&
                        (mobileProven ? (
                          <span
                            id="wtb-lead-verified"
                            className="inline-flex h-12 shrink-0 items-center gap-1.5 px-2 text-[12px] uppercase tracking-[0.12em]"
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={sendCode}
                            disabled={
                              otpState === "sending" ||
                              (codeSent && resendIn > 0)
                            }
                            data-testid="send-code"
                            style={{ color: INK, borderColor: INK }}
                            className="inline-flex h-12 shrink-0 items-center justify-center border bg-white px-4 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-black/5 disabled:opacity-50"
                          >
                            {otpState === "sending"
                              ? "Sending…"
                              : !codeSent
                                ? "Send code"
                                : resendIn > 0
                                  ? `Resend ${resendIn}s`
                                  : "Resend code"}
                          </button>
                        ))}
                    </div>
                    {/* The texted code, under the number it went to. */}
                    {otp && codeSent && !mobileProven && (
                      <div className="mt-3">
                        <label htmlFor="wtb-lead-otp" className={LABEL}>
                          Code sent to {formatMobile(otpFor)} *
                        </label>
                        <input
                          id="wtb-lead-otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={details.otp}
                          onChange={(e) =>
                            setL({ otp: e.target.value.replace(/\D/g, "") })
                          }
                          aria-invalid={badField === "otp"}
                          placeholder="6-digit code"
                          className={cn(FIELD, "tracking-[0.3em]")}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="wtb-lead-email" className={LABEL}>
                      Email *
                    </label>
                    <input
                      id="wtb-lead-email"
                      type="email"
                      autoComplete="email"
                      maxLength={320}
                      value={details.email}
                      onChange={(e) => setL({ email: e.target.value })}
                      aria-invalid={badField === "email"}
                      placeholder="you@email.com"
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="wtb-lead-company" className={LABEL}>
                      Company{" "}
                      <span className="normal-case tracking-normal opacity-60">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="wtb-lead-company"
                      type="text"
                      autoComplete="organization"
                      maxLength={200}
                      value={details.company}
                      onChange={(e) => setL({ company: e.target.value })}
                      placeholder="Firm or studio, if any"
                      className={FIELD}
                    />
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-[13px] font-light leading-snug">
                    <input
                      id="wtb-lead-consent"
                      type="checkbox"
                      checked={details.consent}
                      onChange={(e) => setL({ consent: e.target.checked })}
                      aria-invalid={badField === "consent"}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#14140f]"
                    />
                    <span>
                      {CONSENT_LEAD}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="underline underline-offset-4"
                      >
                        Privacy Policy
                      </Link>
                      . *
                    </span>
                  </label>
                  {otp && (
                    <p className="text-[11px] font-light" style={GLASS_MUTED}>
                      Codes are sent by Google Firebase; this form is protected
                      by reCAPTCHA and the Google{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        Terms of Service
                      </a>{" "}
                      apply.
                    </p>
                  )}
                  {/* Firebase's invisible reCAPTCHA renders here. */}
                  <div ref={recaptchaHost} />
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={details.website}
                    onChange={(e) => setL({ website: e.target.value })}
                    className="absolute left-[-9999px] h-px w-px opacity-0"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={sending}
                data-over-media
                data-testid="wtb-submit"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
                className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 text-sm uppercase tracking-[0.14em] transition hover:brightness-125 disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                    {unlocked ? "Searching" : "Sending"}
                  </>
                ) : (
                  <>
                    {step === "answers" && !unlocked
                      ? "Continue"
                      : "Show outlets"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
              {formError && (
                <p
                  className="mt-3 text-sm font-light"
                  style={{ color: "#ffd3cf" }}
                  role="alert"
                  data-testid="form-error"
                >
                  {formError}
                </p>
              )}
              <p className="mt-5 text-center text-[13px] font-light">
                Prefer to talk?{" "}
                <a
                  href={SALES_PHONE.href}
                  className="underline underline-offset-4"
                >
                  {SALES_PHONE.display}
                </a>
                {" · "}
                <a
                  href={`https://api.whatsapp.com/send/?phone=${SALES_PHONE.href.replace(/\D/g, "")}&text=${encodeURIComponent("Hi, I'd like to know where to buy Pacific Surfaces.")}&type=phone_number&app_absent=0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  WhatsApp
                </a>
              </p>
            </form>
          </div>
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
                  const has = !!outcome?.available.includes(t.value);
                  const on = types.includes(t.value);
                  if (!has && !on) return null;
                  return (
                    <Chip
                      key={t.value}
                      on={on}
                      onClick={() => {
                        const next = on
                          ? types.filter((x) => x !== t.value)
                          : [...types, t.value];
                        setTypeOverride(next.length ? next : null);
                      }}
                    >
                      {t.plural}
                    </Chip>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {typeOverride && (
                  <button
                    type="button"
                    onClick={() => setTypeOverride(null)}
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
              {/* Back up to the card to change the answers (sticky on phones). */}
              <button
                type="button"
                onClick={edit}
                aria-label="Edit search"
                title="Edit search"
                data-testid="edit-search-bar"
                style={{ color: INK }}
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center border border-[#14140f]/20"
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
                    factoryPopup={factoryPopup}
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
          contact={contact}
          onClose={closeEnquiry}
        />
      )}
    </>
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
