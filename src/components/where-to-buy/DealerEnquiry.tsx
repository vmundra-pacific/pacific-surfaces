"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle } from "lucide-react";
import { SillDialog } from "@/components/sections/sills/SillDialog";
import { EMAIL, SALES_PHONE } from "@/data/business";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";
import type { Dealer } from "@/lib/where-to-buy";

/**
 * Enquire about an outlet. The same short form as the support dock's
 * Quick enquiry (SupportDock.tsx), posting to the same contact endpoint, so
 * it lands in Studio's Contact Submissions like every other enquiry; the
 * message comes prefilled with the outlet, and the source names it, so the
 * team can pass the lead on. With no outlet (nothing near the visitor) it
 * is a plain "find me a partner" enquiry.
 */

const TRACKING = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

/** The contact form's own values, so the enquiries sort the same way. */
const LOOKING_FOR = [
  { value: "kitchen-countertops", label: "Kitchen countertops" },
  { value: "vanity-tops", label: "Vanity tops and sinks" },
  { value: "flooring", label: "Flooring" },
  { value: "wall-cladding", label: "Wall cladding" },
  { value: "window-sills-thresholds", label: "Window sills and thresholds" },
  { value: "commercial", label: "Commercial project" },
  { value: "samples", label: "Samples" },
  { value: "other", label: "Other" },
];

const FIELD =
  "h-11 w-full border border-[#14140f]/20 bg-white px-3.5 text-[15px] font-light text-[#14140f] placeholder:text-[#14140f]/40 focus:border-[#14140f] focus:outline-none";
const LABEL = "mb-1.5 block text-[11px] uppercase tracking-[0.14em]";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** What the visitor told the Where to Buy form, for the message. */
export interface EnquiryContext {
  who?: string;
  interest?: string;
  /** The contact form's "Looking for" value. */
  application?: string;
}

function prefill(dealer: Dealer | null, near: string, ctx: EnquiryContext) {
  const me = [
    ctx.who ? `I am a ${ctx.who.toLowerCase()}` : "",
    ctx.interest && ctx.interest !== "Just browsing"
      ? `interested in ${ctx.interest.toLowerCase()}`
      : "",
  ]
    .filter(Boolean)
    .join(", ");
  const intro = me ? `${me}. ` : "";
  if (dealer)
    return `${intro}I would like to see Pacific Surfaces at ${dealer.name} (${dealer.area}, ${dealer.city}). Please put me in touch / share details.`;
  return `${intro}I am looking for a Pacific Surfaces dealer or showroom near ${near || "me"}.`;
}

export function DealerEnquiry({
  dealer,
  near,
  context = {},
  contact,
  onClose,
}: {
  dealer: Dealer | null;
  /** What the visitor searched, for the no-outlet message. */
  near: string;
  context?: EnquiryContext;
  /** The details the visitor gave on the Where to Buy form, if this visit. */
  contact?: { name: string; email: string; phone: string } | null;
  onClose: () => void;
}) {
  const pathname = usePathname() ?? "/where-to-buy";
  const [form, setForm] = useState({
    name: contact?.name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    application: context.application ?? "",
    message: prefill(dealer, near, context),
    website: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return setState("sent");
    setState("sending");
    const here = new URLSearchParams(location.search);
    const tags = TRACKING.flatMap((k) =>
      here.get(k) ? [`${k}=${here.get(k)}`] : []
    ).join(" ");
    const outlet = dealer
      ? `dealer=${dealer.name} (${dealer.id})`
      : `no-outlet near=${near}`;
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
          source: [
            `where-to-buy ${pathname}`,
            outlet,
            context.who ? `visitor=${context.who}` : "",
            context.interest ? `interest=${context.interest}` : "",
            tags,
          ]
            .filter(Boolean)
            .join(" | "),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      trackMetaEvent("Lead", {
        content_name: "Where to buy enquiry",
        content_category: form.application || "dealer",
      });
      window.gtag?.("event", "generate_lead", {
        form: "where_to_buy",
        page: pathname,
        dealer: dealer?.id ?? "none",
      });
    } catch {
      setState("error");
    }
  };

  return (
    <SillDialog
      title={dealer ? `Enquire · ${dealer.name}` : "Find me a partner"}
      onClose={onClose}
      fit
    >
      {state === "sent" ? (
        <div className="mx-auto max-w-md py-8 text-center">
          <CheckCircle
            className="mx-auto h-10 w-10"
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <h3 className="mt-5 text-2xl font-light">Enquiry sent</h3>
          <p className="mt-3 font-light opacity-75">
            Thank you. Our team will get back to you within 24 hours
            {dealer ? ` and connect you with ${dealer.name}` : ""}.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-sm underline underline-offset-4"
          >
            Back to the list
          </button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="grid gap-4 sm:grid-cols-2"
          data-testid="dealer-enquiry"
        >
          <p className="text-sm font-light leading-relaxed opacity-75 sm:col-span-2">
            {dealer
              ? `Your enquiry comes to Pacific Surfaces; we reply within 24 hours, Monday to Saturday, and connect you with ${dealer.name}.`
              : "Tell us where you are and what you need; we reply within 24 hours, Monday to Saturday, with the nearest partner."}{" "}
            Or call{" "}
            <a href={SALES_PHONE.href} className="underline underline-offset-4">
              {SALES_PHONE.display}
            </a>
            .
          </p>
          <div>
            <label htmlFor="wtb-name" className={LABEL}>
              Full name *
            </label>
            <input
              id="wtb-name"
              required
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="wtb-phone" className={LABEL}>
              Phone / WhatsApp *
            </label>
            <input
              id="wtb-phone"
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={set("phone")}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="wtb-email" className={LABEL}>
              Email *
            </label>
            <input
              id="wtb-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="wtb-app" className={LABEL}>
              Looking for
            </label>
            <select
              id="wtb-app"
              value={form.application}
              onChange={set("application")}
              className={FIELD}
            >
              <option value="">Select</option>
              {LOOKING_FOR.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="wtb-msg" className={LABEL}>
              Message
            </label>
            <textarea
              id="wtb-msg"
              rows={4}
              value={form.message}
              onChange={set("message")}
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
              style={{ color: "#ffffff", background: "#14140f" }}
              className="inline-flex h-12 items-center gap-2.5 px-8 text-[13px] uppercase tracking-[0.14em] transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Send enquiry"}
              {state !== "sending" && (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
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
  );
}
