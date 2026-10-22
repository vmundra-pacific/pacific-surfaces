"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle, FileText } from "lucide-react";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { SILL_PRODUCTS } from "@/data/thresholds-and-sills";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

/**
 * The quote form of the Window Sills & Thresholds landing page (owner,
 * 2026-10-22: the page the ads run to gets its own form, and the quote
 * button floats on the page). Every quote button on the page opens it:
 * any link to "#quote" (its `data-quote-from` names the button), the
 * floating button, and a visit to the page's address with "#quote" on the
 * end, so an ad can land straight on the form. Submissions go to
 * /api/sills-enquiry with the button that opened it and the ad's tags.
 */

const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

const ROLES = [
  "Distributor or dealer",
  "Importer or wholesaler",
  "Contractor or builder",
  "Architect or designer",
  "Fabricator",
  "Homeowner",
  "Other",
];
const MATERIALS = ["Granite", "Quartz", "Both, or not sure yet"];
const QUANTITIES = ["Samples first", "1 container", "2 to 5 containers", "More than 5 containers", "Not sure yet"];

const FIELD =
  "h-11 w-full border border-[#14140f]/20 bg-white px-3.5 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/40 focus:border-[#14140f] focus:outline-none";
const LABEL = "mb-1.5 block text-[11px] uppercase tracking-[0.14em]";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  location: "",
  role: "",
  material: "",
  quantity: "",
  message: "",
  website: "",
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function SillsQuote() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("direct");
  const [showFloat, setShowFloat] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [products, setProducts] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const openForm = useCallback((source: string) => {
    setFrom(source);
    setState((s) => (s === "sent" ? "idle" : s));
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    if (location.hash === "#quote") history.replaceState(null, "", location.pathname + location.search);
  }, []);

  // Any "#quote" link on the page opens the form (captured before Next's
  // Link navigates), and so does arriving at the page with "#quote".
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="#quote"]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      openForm(a.dataset.quoteFrom || a.closest("section")?.id || "link");
    };
    document.addEventListener("click", onClick, true);
    if (location.hash === "#quote") openForm("ad-direct");
    const onHash = () => location.hash === "#quote" && openForm("direct");
    addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick, true);
      removeEventListener("hashchange", onHash);
    };
  }, [openForm]);

  // The floating button appears once the hero's own button has scrolled away.
  useEffect(() => {
    const onScroll = () => setShowFloat(scrollY > innerHeight * 0.6);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (name: string) =>
    setProducts((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const here = new URLSearchParams(location.search);
    const tracking = TRACKING.flatMap((k) => (here.get(k) ? [`${k}=${here.get(k)}`] : [])).join(" ");
    try {
      const res = await fetch("/api/sills-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          products,
          openedFrom: from,
          tracking,
          referrer: document.referrer,
          pageUrl: location.href,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      setForm(EMPTY);
      setProducts([]);
      // Conversions for the ads: Meta's Lead and GA4's generate_lead.
      trackMetaEvent("Lead", { content_name: "Window sills quote", content_category: "window-sills-thresholds" });
      window.gtag?.("event", "generate_lead", { form: "window_sills_quote", opened_from: from });
    } catch {
      setState("error");
    }
  };

  return (
    <>
      {/* The floating quote button, beside the WhatsApp button. */}
      <button
        type="button"
        onClick={() => openForm("floating")}
        aria-hidden={!showFloat}
        tabIndex={showFloat ? 0 : -1}
        data-over-media
        style={{ color: "#ffffff" }}
        className={cn(
          "fixed bottom-6 right-[92px] z-[90] inline-flex h-14 items-center gap-2.5 rounded-full bg-[#14140f] pl-5 pr-6 text-[13px] uppercase tracking-[0.14em] shadow-[0_8px_30px_rgba(0,0,0,0.28)] transition-all duration-300 hover:opacity-90",
          "max-sm:right-auto max-sm:left-4 max-sm:bottom-5",
          showFloat && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        Get a quote
      </button>

      {open && (
        <SillDialog title="Get a quote · Window sills & thresholds" onClose={close} fit>
          {state === "sent" ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-light">Request received</h3>
              <p className="mt-3 font-light opacity-75">
                Thank you. Our export team will reply within 24 hours with sizes, prices and a crate plan.
              </p>
              <button type="button" onClick={close} className="mt-6 text-sm underline underline-offset-4">
                Back to the page
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm font-light leading-relaxed opacity-75 sm:col-span-2">
                Tell us what you need and where it is going. We reply within 24 hours, Monday to Saturday.
              </p>
              <div>
                <label htmlFor="sq-name" className={LABEL}>Full name *</label>
                <input id="sq-name" required autoComplete="name" value={form.name} onChange={set("name")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="sq-company" className={LABEL}>Company</label>
                <input id="sq-company" autoComplete="organization" value={form.company} onChange={set("company")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="sq-email" className={LABEL}>Email *</label>
                <input id="sq-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="sq-phone" className={LABEL}>Phone / WhatsApp *</label>
                <input id="sq-phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set("phone")} className={FIELD} />
              </div>
              <div>
                <label htmlFor="sq-location" className={LABEL}>Country and city *</label>
                <input id="sq-location" required value={form.location} onChange={set("location")} placeholder="e.g. Rotterdam, Netherlands" className={FIELD} />
              </div>
              <div>
                <label htmlFor="sq-role" className={LABEL}>I am *</label>
                <select id="sq-role" required value={form.role} onChange={set("role")} className={FIELD}>
                  <option value="">Select</option>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <fieldset className="sm:col-span-2">
                <legend className={LABEL}>Products</legend>
                <div className="flex flex-wrap gap-2">
                  {SILL_PRODUCTS.map((p) => {
                    const on = products.includes(p.name);
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(p.name)}
                        data-over-media={on ? true : undefined}
                        className={cn(
                          "h-9 border px-3 text-[13px] font-light transition-colors",
                          on ? "border-[#14140f] bg-[#14140f] text-white" : "border-[#14140f]/25 hover:border-[#14140f]"
                        )}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div>
                <label htmlFor="sq-material" className={LABEL}>Material</label>
                <select id="sq-material" value={form.material} onChange={set("material")} className={FIELD}>
                  <option value="">Select</option>
                  {MATERIALS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sq-qty" className={LABEL}>Quantity</label>
                <select id="sq-qty" value={form.quantity} onChange={set("quantity")} className={FIELD}>
                  <option value="">Select</option>
                  {QUANTITIES.map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sq-message" className={LABEL}>Sizes, colours and anything else</label>
                <textarea
                  id="sq-message"
                  rows={4}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="e.g. 220 x 20 x 2 cm window sills in Warangal Black, 400 pieces"
                  className={cn(FIELD, "h-auto resize-none py-2.5")}
                />
              </div>
              {/* honeypot: hidden from people */}
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
                  {state === "sending" ? "Sending…" : "Send request"}
                  {state !== "sending" && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
                {state === "error" && (
                  <p className="text-sm font-light text-[#9b2c2c]">
                    That did not send. Please try again, or email info@thepacific.group.
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
