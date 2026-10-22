"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle, Mail, MessageSquareText, Phone, X } from "lucide-react";
import { LIQUID_GLASS } from "@/components/global/liquid-glass";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { EMAIL, SALES_PHONE } from "@/data/business";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

/**
 * Quick support on every page (owner, 2026-10-22: "improve the visibility
 * of our WhatsApp support or add floating support enquiry options like
 * Fasa Stone"). In place of the lone WhatsApp button: a dock at the bottom
 * right with Enquire, WhatsApp, Call and Email, in the liquid glass of the
 * homepage section dock above it, and on phones a row with Enquire,
 * WhatsApp and Call.
 *
 * Enquire opens a short form over the page. It posts to the contact form's
 * endpoint, so the enquiry lands in Studio's Contact Submissions, its
 * source naming the quick form, the page and any ad tags. On the sills
 * landing page Enquire opens that page's own quote form instead (a link to
 * "#quote", which SillsQuote handles).
 */

const WHATSAPP =
  "https://api.whatsapp.com/send/?phone=919894033566&text=Hi%2C+I+am+interested+in+your+quartz+and+granite+surfaces.+Please+share+details+and+pricing&type=phone_number&app_absent=0";

const SILLS_PAGE = "/products/pacific-european-window-sill-threshold-collection";
/** Full-screen views where the panel would sit on the experience. */
const HIDDEN_ON = ["/visualize/showroom/walk"];

const PHONE_HIDDEN_KEY = "pacific:support-hidden";

const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

/** The contact form's own values, so the enquiries sort the same way. */
const LOOKING_FOR = [
  { value: "kitchen-countertops", label: "Kitchen countertops" },
  { value: "vanity-tops", label: "Vanity tops and sinks" },
  { value: "flooring", label: "Flooring" },
  { value: "wall-cladding", label: "Wall cladding" },
  { value: "window-sills-thresholds", label: "Window sills and thresholds" },
  { value: "commercial", label: "Commercial project" },
  { value: "samples", label: "Samples" },
  { value: "partnership", label: "Becoming a Pacific partner" },
  { value: "other", label: "Other" },
];

const FIELD =
  "h-11 w-full border border-[#14140f]/20 bg-white px-3.5 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/40 focus:border-[#14140f] focus:outline-none";
const LABEL = "mb-1.5 block text-[11px] uppercase tracking-[0.14em]";
const EMPTY = { name: "", email: "", phone: "", application: "", message: "", website: "" };

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 175.216 175.552" fill="currentColor" className={className} aria-hidden="true">
      <path d="M87.184 14.2c-40.487 0-73.395 32.908-73.395 73.396 0 12.938 3.379 25.5 9.792 36.627l-10.39 37.924 38.852-10.189a73.065 73.065 0 0035.141 8.96h.031c40.468 0 73.378-32.929 73.378-73.397 0-19.608-7.633-38.038-21.495-51.89C125.236 21.79 106.812 14.2 87.184 14.2zm0 134.16h-.026a60.863 60.863 0 01-31.023-8.506l-2.227-1.32-23.076 6.053 6.156-22.488-1.45-2.306a60.816 60.816 0 01-9.326-32.397c0-33.633 27.386-61.02 61.042-61.02 16.305 0 31.633 6.354 43.151 17.886 11.516 11.53 17.864 26.852 17.858 43.15-.006 33.654-27.402 61.047-61.079 61.047v-.099zm33.484-45.702c-1.837-.919-10.864-5.361-12.547-5.973-1.683-.613-2.907-.919-4.131.919-1.224 1.837-4.746 5.972-5.816 7.196-1.071 1.225-2.143 1.378-3.98.46-1.836-.92-7.753-2.858-14.771-9.113-5.46-4.868-9.147-10.883-10.217-12.72-1.071-1.838-.114-2.831.805-3.746.825-.822 1.837-2.143 2.756-3.214.918-1.071 1.224-1.837 1.837-3.061.612-1.225.306-2.296-.153-3.215-.46-.919-4.131-9.96-5.662-13.633-1.49-3.58-3.006-3.095-4.131-3.153-1.071-.052-2.296-.065-3.52-.065-1.224 0-3.214.46-4.898 2.296-1.683 1.837-6.429 6.283-6.429 15.322 0 9.04 6.583 17.773 7.502 18.997.918 1.225 12.956 19.775 31.39 27.735 4.384 1.893 7.806 3.022 10.474 3.868 4.402 1.398 8.407 1.2 11.574.728 3.531-.527 10.864-4.44 12.394-8.727 1.53-4.286 1.53-7.96 1.071-8.726-.459-.766-1.683-1.225-3.52-2.143z" />
    </svg>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function SupportDock() {
  const pathname = usePathname() ?? "/";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  // Phones only (owner, 2026-10-22): an X hides the row for the rest of
  // the visit, for visitors who would rather not have it.
  const [phoneHidden, setPhoneHidden] = useState(false);

  // A moment after load, so it never competes with the page's first paint.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PHONE_HIDDEN_KEY)) setPhoneHidden(true);
    } catch {}
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const hidePhone = () => {
    setPhoneHidden(true);
    try {
      sessionStorage.setItem(PHONE_HIDDEN_KEY, "1");
    } catch {}
  };

  const onSills = pathname.startsWith(SILLS_PAGE);
  const close = useCallback(() => setOpen(false), []);
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const enquire = () => {
    setState((s) => (s === "sent" ? "idle" : s));
    setOpen(true);
  };

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return setState("sent");
    setState("sending");
    const here = new URLSearchParams(location.search);
    const tags = TRACKING.flatMap((k) => (here.get(k) ? [`${k}=${here.get(k)}`] : [])).join(" ");
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          application: form.application,
          message: form.message,
          source: [`quick-enquiry ${pathname}`, tags].filter(Boolean).join(" | "),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      setForm(EMPTY);
      trackMetaEvent("Lead", { content_name: "Quick enquiry", content_category: form.application || "contact" });
      window.gtag?.("event", "generate_lead", { form: "quick_enquiry", page: pathname });
    } catch {
      setState("error");
    }
  };

  // On the sills page Enquire is a link to its own quote form.
  const EnquireButton = ({ className, children }: { className: string; children: React.ReactNode }) =>
    onSills ? (
      <a href="#quote" data-quote-from="support" className={className}>
        {children}
      </a>
    ) : (
      <button type="button" onClick={enquire} className={className}>
        {children}
      </button>
    );

  // Icon tiles in the homepage section dock's glass (owner, 2026-10-22):
  // only Enquire carries a word; the others name themselves on hover.
  const icon = "flex h-10 w-12 items-center justify-center rounded-xl opacity-80 transition hover:bg-white/50 hover:opacity-100";
  const links = [
    { href: WHATSAPP, label: "WhatsApp", external: true, glyph: <WhatsAppGlyph className="h-[18px] w-[18px] text-[#25D366]" /> },
    { href: SALES_PHONE.href, label: `Call ${SALES_PHONE.display}`, glyph: <Phone className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> },
    { href: `mailto:${EMAIL}`, label: EMAIL, glyph: <Mail className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> },
  ];

  return (
    <>
      {/* Desktop and tablet: the support dock, bottom right */}
      <ul
        style={LIQUID_GLASS}
        className={cn(
          "fixed bottom-4 right-2 z-[80] hidden flex-col gap-1 rounded-2xl px-1.5 py-2 transition-all duration-500 sm:flex",
          mounted ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        )}
        aria-label="Quick support"
      >
        <li>
          <EnquireButton className="flex w-12 flex-col items-center justify-center gap-1 rounded-xl py-2 transition hover:bg-white/50">
            <span style={{ color: "#14140f" }} className="flex flex-col items-center gap-1 text-[9px] font-medium uppercase tracking-[0.02em]">
              <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
              Enquire
            </span>
          </EnquireButton>
        </li>
        {links.map((l) => (
          <li key={l.href} className="group/dock relative">
            <a
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={l.label}
              style={{ color: "#14140f" }}
              className={icon}
            >
              {l.glyph}
            </a>
            <span
              aria-hidden="true"
              style={{ ...LIQUID_GLASS, color: "#14140f" }}
              className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] opacity-0 transition-all duration-200 group-hover/dock:translate-x-0 group-hover/dock:opacity-100 group-focus-within/dock:translate-x-0 group-focus-within/dock:opacity-100"
            >
              {l.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Phones: the same glass, a row at the bottom right, and room for it at the foot of the page */}
      {!phoneHidden && (
      <>
      <div
        style={LIQUID_GLASS}
        className={cn(
          "fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-[80] flex items-center gap-1 rounded-2xl p-1.5 transition-all duration-500 sm:hidden",
          mounted ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        )}
        role="complementary"
        aria-label="Quick support"
      >
        <EnquireButton className="flex h-11 items-center justify-center gap-2 rounded-xl px-3">
          <span style={{ color: "#14140f" }} className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em]">
            <MessageSquareText className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
            Enquire
          </span>
        </EnquireButton>
        {links.slice(0, 2).map((l) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={l.label}
            style={{ color: "#14140f" }}
            className="flex h-11 w-11 items-center justify-center rounded-xl"
          >
            {l.glyph}
          </a>
        ))}
        <button
          type="button"
          onClick={hidePhone}
          aria-label="Hide quick support"
          style={{ color: "#14140f" }}
          className="flex h-11 w-8 items-center justify-center border-l border-black/10 opacity-60"
        >
          <X className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
      <div aria-hidden="true" className="h-16 sm:hidden" />
      </>
      )}

      {open && (
        <SillDialog title="Quick enquiry" onClose={close} fit>
          {state === "sent" ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-light">Enquiry sent</h3>
              <p className="mt-3 font-light opacity-75">Thank you. Our team will get back to you within 24 hours.</p>
              <button type="button" onClick={close} className="mt-6 text-sm underline underline-offset-4">
                Back to the page
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm font-light leading-relaxed opacity-75 sm:col-span-2">
                Tell us what you are looking for and we will reply within 24 hours, Monday to Saturday. Or reach us now on{" "}
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  WhatsApp
                </a>{" "}
                or <a href={SALES_PHONE.href} className="underline underline-offset-4">{SALES_PHONE.display}</a>.
              </p>
              <div>
                <label htmlFor="qe-name" className={LABEL}>Full name *</label>
                <input id="qe-name" required autoComplete="name" value={form.name} onChange={set("name")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="qe-phone" className={LABEL}>Phone / WhatsApp *</label>
                <input id="qe-phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set("phone")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="qe-email" className={LABEL}>Email *</label>
                <input id="qe-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="qe-app" className={LABEL}>Looking for</label>
                <select id="qe-app" value={form.application} onChange={set("application")} className={FIELD}>
                  <option value="">Select</option>
                  {LOOKING_FOR.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="qe-msg" className={LABEL}>Message</label>
                <textarea
                  id="qe-msg"
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Designs you like, sizes, quantities, city…"
                  className={cn(FIELD, "h-auto resize-none py-2.5")}
                />
              </div>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={set("website")}
                className="absolute left-[-9999px] h-px w-px opacity-0"
              />
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  data-over-media
                  style={{ color: "#ffffff" }}
                  className="inline-flex h-12 items-center gap-2.5 bg-[#14140f] px-8 text-[13px] uppercase tracking-[0.14em] transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {state === "sending" ? "Sending…" : "Send enquiry"}
                  {state !== "sending" && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
                {state === "error" && (
                  <p className="text-sm font-light text-[#9b2c2c]">
                    That did not send. Please try again, or email {EMAIL}.
                  </p>
                )}
              </div>
            </form>
          )}
        </SillDialog>
      )}
    </>
  );
}
