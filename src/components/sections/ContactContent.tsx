"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { trackMetaEvent } from "@/lib/meta-pixel";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL, FACTORY, OPENING_HOURS, SALES_PHONE } from "@/data/business";

/**
 * /contact, laid out after Cosentino's "where to buy" page: a full-bleed
 * interior with one translucent card that asks who you are, what you are
 * looking for and where. The search runs against the dealer roster from
 * Sanity; whatever it finds, the enquiry form below arrives pre-filled
 * with the same three answers, so no visitor reaches a dead end.
 *
 * Running order: search hero, results, three calls to action, the
 * enquiry form, direct lines, the factory with its map, department
 * contacts, closing band.
 *
 * Everything renders on the server. Only the `?type=` pre-fill reads the
 * URL, inside its own Suspense (TypeParam), because useSearchParams at
 * the top would make the whole page client-only and leave its server
 * HTML empty: no H1, no address.
 *
 * The black-on-white skin (app/bw-temp.css) pins heading weights, so
 * they are set inline. Photographs sit one wrapper deep so the skin's
 * `:has(> img)` inversion leaves the white card's ink dark, and copy
 * that does sit on a photograph declares `data-over-media`.
 */

/**
 * Dealer record shape, matching `allDealersQuery` in
 * src/sanity/lib/queries.ts. Every field except `_id` and `name`
 * is optional because the Sanity dealer schema only requires
 * `name`, `type`, and `city`.
 */
export interface Dealer {
  _id: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

/** Every photograph on the page, in one place so each can be swapped. */
const MEDIA = {
  hero: { src: "/images/india-home/collection-eclipse.webp", alt: "A long Eclipse quartz bar counter in a restaurant" },
  enquiry: { src: "/projects/islands/statuario.webp", alt: "A white-veined quartz island by a city window" },
  closing: { src: "/videos/india-film-poster.jpg", alt: "A white quartz kitchen in morning light" },
};

const LIGHT = { fontVariationSettings: "'wght' 250, 'wdth' 100" };
const PANEL = "bg-[#EFEDE9]";
const INK = "#14140f";

/** The where-to-buy finder in the hero; off for now (owner, 2026-10-05). */
const SHOW_FINDER = false;

const PHONE = SALES_PHONE.display;
const PHONE_HREF = SALES_PHONE.href;
const whatsApp = (text: string) =>
  `https://api.whatsapp.com/send/?phone=919894033566&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;

const ROLES = [
  { value: "homeowner", label: "Homeowner" },
  { value: "architect", label: "Architect" },
  { value: "interior-designer", label: "Interior designer" },
  { value: "builder", label: "Builder or developer" },
  { value: "fabricator", label: "Fabricator" },
  { value: "distributor", label: "Distributor or dealer" },
  { value: "other", label: "Other" },
];

const LOOKING_FOR = [
  { value: "kitchen-countertops", label: "Kitchen countertops" },
  { value: "kitchen-islands", label: "Kitchen islands" },
  { value: "vanity-tops", label: "Vanity tops and sinks" },
  { value: "flooring", label: "Flooring" },
  { value: "wall-cladding", label: "Wall cladding" },
  { value: "exterior-cladding", label: "Facades and exterior cladding" },
  { value: "staircases", label: "Staircases" },
  { value: "commercial", label: "Commercial project" },
  { value: "samples", label: "Samples" },
  { value: "partnership", label: "Becoming a Pacific partner" },
  { value: "other", label: "Other" },
];

const departmentContacts: {
  name: string;
  contacts: { name?: string; phone?: string; email: string }[];
}[] = [
  {
    name: "International Sales",
    contacts: [
      { name: "Manya Singh", phone: "+91 9600067822", email: "manya.singh@thepacific.group" },
      { name: "Manish", phone: "+91 93242 81801", email: "manish@thepacific.group" },
    ],
  },
  {
    name: "Inquiries for India",
    contacts: [{ phone: "+91 9894033566", email: "info@thepacific.group" }],
  },
  {
    name: "Inquiries for Poland",
    contacts: [
      { name: "Paulina", phone: "+48 517 540 297", email: "paulina@thepacific.group" },
      { name: "Marcin", phone: "+48 537 819 991", email: "marcin@pacificsurfaces.pl" },
    ],
  },
  {
    name: "Inquiries for Germany",
    contacts: [{ name: "Satakshi Rautaray", phone: "+49 1525 5460275", email: "satakshi@thepacific.group" }],
  },
  {
    name: "Inquiries for Middle East",
    contacts: [{ name: "Saral", phone: "+91 73977 46963", email: "saral@thepacific.group" }],
  },
  {
    name: "Inquiries for Croatia",
    contacts: [{ name: "Marko", phone: "+385 91 250 4582", email: "marko@thepacific.group" }],
  },
  {
    name: "Exports & Logistics",
    contacts: [{ phone: "+91 88705 81104", email: "customs@pacific-surfaces.com" }],
  },
  {
    name: "Finance",
    contacts: [{ phone: "+91 89259 19991", email: "finance@pacific-surfaces.com" }],
  },
  {
    name: "Marketing",
    contacts: [{ email: "marketing@thepacific.group" }],
  },
  {
    name: "Human Resources",
    contacts: [{ phone: "+91 89259 01419", email: "hr@pacific-surfaces.com" }],
  },
  {
    name: "Procurement",
    contacts: [{ phone: "+91 89259 13267", email: "procurement@pacific-surfaces.com" }],
  },
];

// Map ?type=<x> URL params to the "I am" values. PartnerWithUs on the
// homepage links into this page with these short slugs.
const TYPE_PARAM_TO_ROLE: Record<string, string> = {
  distributor: "distributor",
  architect: "architect",
  "interior-designer": "interior-designer",
  fabricator: "fabricator",
  homeowner: "homeowner",
  builder: "builder",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  address: "",
  phone: "",
  role: "",
  application: "",
  message: "",
};

/** Reports `?type=` (a PartnerWithUs card's link) to the page. */
function TypeParam({ onChange }: { onChange: (type: string | null) => void }) {
  const type = useSearchParams().get("type");
  useEffect(() => {
    onChange(type);
  }, [type, onChange]);
  return null;
}

/** An address that wraps only after the @, never mid-word. */
function EmailText({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 0) return <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>;
  return (
    <span className="min-w-0">
      {email.slice(0, at)}
      <wbr />@{email.slice(at + 1)}
    </span>
  );
}

function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

/** A photograph filling its positioned parent, one wrapper deep (see top). */
function Photo({ src, alt, priority, sizes = "100vw", className }: { src: string; alt: string; priority?: boolean; sizes?: string; className?: string }) {
  return (
    <div aria-hidden={alt ? undefined : true} className="absolute inset-0 -z-10">
      <div className="relative h-full w-full">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={cn("object-cover", className)} />
      </div>
    </div>
  );
}

const FIELD =
  "h-12 w-full border border-[#14140f]/15 bg-white px-4 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/45 focus:border-[#14140f] focus:outline-none transition-colors";
const LABEL = "mb-2 block text-[11px] uppercase tracking-[0.16em]";

export function ContactContent({ dealers = [] }: { dealers?: Dealer[] }) {
  const [typeParam, setTypeParam] = useState<string | null>(null);
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState(EMPTY_FORM);

  // The hero's three questions.
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");

  // `null` = no search yet; [] = searched, nothing; `approx` = nearest by
  // postal prefix rather than an exact match.
  const [results, setResults] = useState<Dealer[] | null>(null);
  const [approx, setApprox] = useState(false);
  const [searched, setSearched] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);

  // Postal codes compare without spaces, dashes or case, so "sw1a1aa"
  // finds a dealer stored as "SW1A 1AA".
  const normalisePostal = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = where.trim();
    if (raw.length < 2) return;
    const needle = normalisePostal(raw);
    const looksPostal = /\d/.test(raw);

    let found: Dealer[] = [];
    let near = false;
    if (looksPostal) {
      found = dealers.filter((d) => d.pincode && normalisePostal(d.pincode) === needle);
      // No exact match: walk the prefix down. For Indian PIN codes the
      // first three digits are a region, the first two a state.
      if (found.length === 0) {
        for (let len = needle.length - 1; len >= 2; len--) {
          const prefix = needle.slice(0, len);
          found = dealers.filter((d) => d.pincode && normalisePostal(d.pincode).startsWith(prefix));
          if (found.length > 0) {
            near = true;
            break;
          }
        }
      }
    } else {
      const city = raw.toLowerCase();
      found = dealers.filter(
        (d) => d.city?.toLowerCase().includes(city) || d.address?.toLowerCase().includes(city)
      );
    }

    setResults(found);
    setApprox(near);
    setSearched(raw);
    setSearchCount((n) => n + 1);
    // Carry the three answers into the enquiry form.
    setFormData((prev) => ({
      ...prev,
      role: who || prev.role,
      application: what || prev.application,
      address: raw,
    }));
  };

  useEffect(() => {
    if (searchCount > 0) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchCount]);

  // Pre-fill "I am" from ?type=<x>. Only fires when the param changes,
  // so later edits are never clobbered.
  useEffect(() => {
    if (!typeParam) return;
    const mapped = TYPE_PARAM_TO_ROLE[typeParam];
    if (mapped) {
      setWho(mapped);
      setFormData((prev) => ({ ...prev, role: mapped }));
    }
  }, [typeParam]);

  // Success-panel auto-reset, kept in a ref so "Send another enquiry"
  // can cancel it before it wipes fresh input; cleared on unmount.
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Provenance for triage: a PartnerWithUs card click, or the
          // hero search.
          source: typeParam || (searchCount > 0 ? "where-to-buy" : undefined),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setFormState("sent");
      // Fired only once the API confirms, so a failed POST never counts.
      trackMetaEvent("Lead", {
        content_name: "Contact Form",
        content_category: typeParam || "contact",
      });
      resetTimerRef.current = setTimeout(() => {
        setFormState("idle");
        setFormData(EMPTY_FORM);
      }, 6000);
    } catch (err) {
      console.error("[contact form] submit failed:", err);
      setFormState("idle");
      alert("Sorry, we couldn't send your message. Please try again or email us directly.");
    }
  };

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <Suspense fallback={null}>
        <TypeParam onChange={setTypeParam} />
      </Suspense>

      {/* 1 · Where to buy ------------------------------------------------ */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#14140f] pb-16 pt-32 lg:pt-36">
        <Photo src={MEDIA.hero.src} alt={MEDIA.hero.alt} priority />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/25 to-black/55" />
        <Container className="flex flex-col items-center">
          <motion.div
            data-over-media
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em]">Where to buy</p>
            <h1 style={LIGHT} className="mt-4 text-[40px] uppercase leading-none tracking-[-0.03em] sm:text-6xl lg:text-[84px]">
              Find Pacific Surfaces near you
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-light leading-snug sm:text-lg">
              Pacific ships to 45+ countries. Tell us who you are, what you need and where, and we connect you with the nearest partner.
            </p>
          </motion.div>

          {/* The partner finder is off for now (owner, 2026-10-05): until it
              is back, the hero hands straight on to the enquiry form, which
              asks for the city as well. Flip SHOW_FINDER to restore it. */}
          {!SHOW_FINDER && (
            <motion.div
              data-over-media
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col items-center gap-5"
            >
              <a
                href="#enquiry"
                className="inline-flex h-[52px] items-center justify-center gap-2 bg-white px-10 text-sm uppercase tracking-[0.14em] text-[#14140f] transition-opacity hover:opacity-90"
              >
                Send an enquiry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="text-[13px] font-light">
                Prefer to talk?{" "}
                <a href={PHONE_HREF} className="underline underline-offset-4">{PHONE}</a>
                {" · "}
                <a href={whatsApp("Hi, I'd like to know where to buy Pacific Surfaces.")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  WhatsApp
                </a>
              </p>
            </motion.div>
          )}

          {SHOW_FINDER && (
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full max-w-[560px] bg-white/85 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-9"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="who" className={LABEL}>What type of user are you?</label>
                <select id="who" value={who} onChange={(e) => setWho(e.target.value)} className={FIELD}>
                  <option value="">Select</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="what" className={LABEL}>What are you looking for?</label>
                <select id="what" value={what} onChange={(e) => setWhat(e.target.value)} className={FIELD}>
                  <option value="">Select</option>
                  {LOOKING_FOR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="where" className={LABEL}>Postal code or city</label>
                <input
                  id="where"
                  type="text"
                  required
                  maxLength={40}
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="e.g. 560001 or Bengaluru"
                  className={FIELD}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={where.trim().length < 2}
              className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 bg-[#1D1D1C] text-sm uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
            <p className="mt-5 text-center text-[13px] font-light">
              Prefer to talk?{" "}
              <a href={PHONE_HREF} className="underline underline-offset-4">{PHONE}</a>
              {" · "}
              <a href={whatsApp("Hi, I'd like to know where to buy Pacific Surfaces.")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                WhatsApp
              </a>
            </p>
          </motion.form>
          )}
        </Container>
      </section>

      {/* 2 · Results, once a search has run ------------------------------- */}
      {results !== null && (
        <section ref={resultsRef} className={cn(PANEL, "scroll-mt-20")}>
          <Container className="py-14 lg:py-20">
            <p className="text-xs uppercase tracking-[0.25em]">
              {results.length === 0 ? "No match yet" : approx ? "Nearest to you" : "Near you"}
            </p>
            <h2 style={LIGHT} className="mt-3 text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl">
              {results.length === 0
                ? `We will find you a partner near ${searched}`
                : `${results.length} Pacific partner${results.length === 1 ? "" : "s"} ${approx ? "nearest to" : "in"} ${searched}`}
            </h2>

            {results.length > 0 ? (
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((d) => (
                  <div key={d._id} className="flex flex-col gap-4 border border-[#14140f]/10 bg-white p-6 lg:p-7">
                    <div>
                      <h3 className="text-xl font-light tracking-tight">{d.name}</h3>
                      {d.type && <span className="mt-2 inline-block text-[10px] uppercase tracking-[0.2em] opacity-60">{d.type}</span>}
                    </div>
                    {d.description && <p className="line-clamp-4 text-sm font-light leading-relaxed opacity-75">{d.description}</p>}
                    <div className="space-y-2.5 text-sm font-light">
                      {(d.address || d.city || d.pincode) && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <div>
                            {d.address && <div>{d.address}</div>}
                            <div className="opacity-70">{[d.city, d.pincode, d.country].filter(Boolean).join(" · ")}</div>
                          </div>
                        </div>
                      )}
                      {d.phone && (
                        <a href={`tel:${d.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 hover:opacity-70">
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          {d.phone}
                        </a>
                      )}
                      {d.email && (
                        <a href={`mailto:${d.email}`} className="flex items-center gap-3 hover:opacity-70">
                          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <EmailText email={d.email} />
                        </a>
                      )}
                      {d.website && (
                        <a href={d.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 break-all hover:opacity-70">
                          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {d.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 max-w-2xl text-base font-light leading-relaxed">
                There is no registered Pacific partner at this location yet. Send the enquiry below, already filled in
                with your answers, and our team will recommend the nearest showroom or fabricator.
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#enquiry" data-over-media className="inline-flex h-12 items-center gap-2 bg-[#1D1D1C] px-7 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85">
                Send an enquiry
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={whatsApp(`Hi, I'm looking for a Pacific Surfaces partner near ${searched}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 border border-[#14140f] px-7 text-[13px] uppercase tracking-[0.12em] hover:bg-[#14140f]/5"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </Container>
        </section>
      )}

      {/* 3 · The enquiry --------------------------------------------------- */}
      <section id="enquiry" className={cn(PANEL, "scroll-mt-20")}>
        <div className="grid lg:grid-cols-2">
          <div className="relative isolate hidden min-h-[640px] lg:block">
            <Photo src={MEDIA.enquiry.src} alt={MEDIA.enquiry.alt} sizes="50vw" />
          </div>
          <div className="px-5 py-14 sm:px-8 lg:px-16 lg:py-20 xl:px-24">
            <p className="text-xs uppercase tracking-[0.25em]">Project enquiry</p>
            <h2 style={LIGHT} className="mt-3 text-[30px] uppercase leading-[1.05] tracking-[-0.02em] sm:text-[42px] lg:text-[52px]">
              Tell us about your project
            </h2>
            <p className="mt-4 max-w-lg text-base font-light leading-relaxed opacity-75">
              Design, thickness, finish, quantities and delivery. One message reaches the right team, and we reply within 24 hours.
            </p>

            {formState === "sent" ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border border-[#14140f]/10 bg-white p-10 text-center">
                <CheckCircle className="mx-auto h-10 w-10" strokeWidth={1.25} aria-hidden="true" />
                <h3 className="mt-5 text-2xl font-light">Enquiry sent</h3>
                <p className="mx-auto mt-3 max-w-sm font-light opacity-75">Thank you. Our team will get back to you within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (resetTimerRef.current) {
                      clearTimeout(resetTimerRef.current);
                      resetTimerRef.current = null;
                    }
                    setFormState("idle");
                    setFormData(EMPTY_FORM);
                  }}
                  className="mt-6 text-sm underline underline-offset-4"
                >
                  Send another enquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={LABEL}>Full name *</label>
                  <input id="name" type="text" required value={formData.name} onChange={set("name")} placeholder="Your name" className={FIELD} />
                </div>
                <div>
                  <label htmlFor="email" className={LABEL}>Email *</label>
                  <input id="email" type="email" required value={formData.email} onChange={set("email")} placeholder="you@email.com" className={FIELD} />
                </div>
                <div>
                  <label htmlFor="phone" className={LABEL}>Phone *</label>
                  <input id="phone" type="tel" required value={formData.phone} onChange={set("phone")} placeholder="+91 98940 33566" className={FIELD} />
                </div>
                <div>
                  <label htmlFor="address" className={LABEL}>City or postal code</label>
                  <input id="address" type="text" value={formData.address} onChange={set("address")} placeholder="Where is the project?" className={FIELD} />
                </div>
                <div>
                  <label htmlFor="role" className={LABEL}>I am *</label>
                  <select id="role" required value={formData.role} onChange={set("role")} className={FIELD}>
                    <option value="">Select</option>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="application" className={LABEL}>Looking for *</label>
                  <select id="application" required value={formData.application} onChange={set("application")} className={FIELD}>
                    <option value="">Select</option>
                    {LOOKING_FOR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className={LABEL}>Requirements *</label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={set("message")}
                    placeholder="Designs you like, sizes, quantities, timeline…"
                    className={cn(FIELD, "h-auto resize-none py-3")}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={formState === "sending"}
                    className="inline-flex h-[52px] items-center gap-3 bg-[#1D1D1C] px-9 text-sm uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
                  >
                    {formState === "sending" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                        Sending
                      </>
                    ) : (
                      <>
                        Send enquiry
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className="text-[13px] font-light opacity-65">We reply within 24 hours, Monday to Saturday.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 4 · Direct lines -------------------------------------------------- */}
      <section className="border-b border-[#14140f]/10 bg-white">
        <Container className="grid gap-px py-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
            { icon: Phone, label: "Call", value: PHONE, href: PHONE_HREF },
            { icon: MessageCircle, label: "WhatsApp", value: "Message the sales team", href: whatsApp("Hi, I have an enquiry for Pacific Surfaces."), external: true },
            { icon: Clock, label: "Hours", value: OPENING_HOURS.display },
          ].map((l) => {
            const Icon = l.icon;
            const body = (
              <>
                <Icon className="h-6 w-6 shrink-0" strokeWidth={1.25} aria-hidden="true" />
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.16em] opacity-60">{l.label}</span>
                  <span className="mt-1 block break-all text-[17px] font-light">{l.value}</span>
                </span>
              </>
            );
            const cls = "flex items-center gap-4 px-2 py-6 lg:px-6";
            return l.href ? (
              <a key={l.label} href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={cn(cls, "transition-opacity hover:opacity-70")}>{body}</a>
            ) : (
              <div key={l.label} className={cls}>{body}</div>
            );
          })}
        </Container>
      </section>

      {/* 5 · The factory --------------------------------------------------
          Name, address, phones and hours exactly as on the Google Business
          Profile and in the site's JSON-LD (data/business), with Google
          Maps' own embed of the listing and a directions link. */}
      <section id="factory" className={cn(PANEL, "scroll-mt-20")}>
        <Container className="grid gap-10 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] opacity-60">Factory and experience centre</p>
            <h2 style={LIGHT} className="mt-3 text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl lg:text-[42px]">
              See the slabs where they are made
            </h2>
            <address className="mt-8 text-[17px] font-light not-italic leading-relaxed">
              <span className="block font-normal">{FACTORY.name}</span>
              {FACTORY.streetAddress},
              <br />
              {FACTORY.locality}, {FACTORY.region} {FACTORY.postalCode}, India
            </address>
            <ul className="mt-6 space-y-2 text-[17px] font-light">
              {FACTORY.phones.map((phone) => (
                <li key={phone.href}>
                  <a href={phone.href} className="inline-flex items-center gap-3 underline-offset-4 hover:underline">
                    <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {phone.display}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-3 underline-offset-4 hover:underline">
                  <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <EmailText email={EMAIL} />
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {OPENING_HOURS.display}
              </li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={FACTORY.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-over-media
                className="inline-flex h-12 items-center gap-2 bg-[#1D1D1C] px-7 text-[13px] uppercase tracking-[0.12em] text-white hover:opacity-85"
              >
                Get directions
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={FACTORY.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 border border-[#14140f] px-7 text-[13px] uppercase tracking-[0.12em] hover:bg-black/5"
              >
                Open in Google Maps
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#14140f]/10 bg-white lg:aspect-auto lg:min-h-[480px]">
            <iframe
              src={FACTORY.embedUrl}
              title={`Map showing ${FACTORY.name}`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </Container>
      </section>

      {/* 6 · Department contacts ------------------------------------------- */}
      <section className="bg-white">
        <Container className="py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 style={LIGHT} className="text-[28px] uppercase leading-tight tracking-[-0.02em] sm:text-4xl lg:text-[42px]">
              Department contacts
            </h2>
            <p className="max-w-md text-[15px] font-light opacity-70">For a region or a department, write to the team directly.</p>
          </div>
          <div className="mt-10 grid gap-px border border-[#14140f]/10 bg-[#14140f]/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {departmentContacts.map((dept) => (
              <div key={dept.name} className="bg-white p-6">
                <h3 className="text-[13px] uppercase tracking-[0.14em]">{dept.name}</h3>
                <div className="mt-5 space-y-4">
                  {dept.contacts.map((c) => (
                    <div key={c.email} className="space-y-1 text-sm font-light">
                      {c.name && <p className="font-normal">{c.name}</p>}
                      {c.phone && (
                        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 opacity-75 hover:opacity-100">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {c.phone}
                        </a>
                      )}
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 opacity-75 hover:opacity-100">
                        <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <EmailText email={c.email} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7 · Closing band -------------------------------------------------- */}
      <section className="relative isolate overflow-hidden bg-[#14140f]">
        <Photo src={MEDIA.closing.src} alt="" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50" />
        <Container className="py-24 lg:py-36">
          <div data-over-media className="max-w-3xl">
            <h2 style={LIGHT} className="text-[36px] uppercase leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[76px]">
              Bring your plan. We bring the stone.
            </h2>
            <p className="mt-5 max-w-xl text-lg font-light leading-snug">
              Superjumbo slabs, zero crystalline silica, a lifetime warranty, and a team that answers within a day.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#enquiry" className="inline-flex h-[52px] items-center gap-2 bg-white px-8 text-sm uppercase tracking-[0.14em] transition-opacity hover:opacity-90">
                Get a quote
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link href="/products" className="inline-flex h-[52px] items-center gap-2 border border-white px-8 text-sm uppercase tracking-[0.14em] hover:bg-white/10">
                Explore the surfaces
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
