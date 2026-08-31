"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Send, Home, HardHat, ArrowLeft } from "lucide-react";
import { trackMetaEvent } from "@/lib/meta-pixel";

interface OrderSampleModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productCategory?: string;
  /**
   * Two presentation modes share this single modal:
   *   - "sample": user requests a physical sample → Shipping Address
   *     is required, email subject is "Sample Request".
   *   - "enquire": user has a question about the product → Shipping
   *     Address is hidden (not needed for an enquiry), Notes/message
   *     becomes required and gets more space, email subject is
   *     "Enquiry".
   * Defaults to "sample" so existing call sites (ProductDetail,
   * GranitesContent) keep working without modification.
   */
  mode?: "sample" | "enquire";
}

type UserType = "homeowner" | "professional";

/** Chooser cards shown at the top of the sample-request flow. */
const USER_TYPES: {
  value: UserType;
  title: string;
  cta: string;
  Icon: typeof Home;
  /** Card background — one per path, so the two read apart at a
      glance before any of the copy is read. */
  image: string;
}[] = [
  {
    value: "homeowner",
    title: "Home owner",
    cta: "Continue",
    Icon: Home,
    image: "/images/spaces/kitchens.png",
  },
  {
    value: "professional",
    title: "Professional",
    cta: "Continue",
    Icon: HardHat,
    image: "/images/professions/collaboration.jpg",
  },
];

export function OrderSampleModal({
  open,
  onClose,
  productName,
  productCategory,
  mode = "sample",
}: OrderSampleModalProps) {
  const isSample = mode === "sample";
  const [projectType, setProjectType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  /**
   * Sample requests open on a chooser — home owner or professional —
   * before the form, so the sales team knows which pipeline a lead
   * belongs to. Enquiries skip it: the question is the same either
   * way, and an extra click on a "quick question" flow only costs
   * completions.
   */
  const [userType, setUserType] = useState<UserType | null>(null);
  const step: "choose" | "form" = isSample && !userType ? "choose" : "form";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    project: "",
    notes: "",
  });

  // Holds the close-reset timer so it can be cleared if the modal
  // unmounts before the 300ms elapses (avoids setState on unmounted).
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      // reset when closed
      resetTimerRef.current = setTimeout(() => {
        setSubmitted(false);
        // Back to the chooser, so a reopened modal always asks again
        // rather than silently reusing the last visitor's answer.
        setUserType(null);
      }, 300);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/sample-request/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isSample ? "sample" : "enquire",
          userType: userType ?? undefined,
          productName,
          productCategory,
          name: form.name,
          email: form.email,
          phone: form.phone,
          projectType: form.project,
          address: form.address,
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
      // Meta conversion signal — only after the API confirms, so a
      // failed POST never counts as a Lead.
      trackMetaEvent("Lead", {
        content_name: productName,
        content_category: productCategory || "uncategorised",
        content_type: isSample ? "sample_request" : "enquiry",
      });
    } catch (err) {
      console.error("[order-sample-modal] submit failed:", err);
      alert(
        "Sorry, we couldn't send your request. Please try again or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Modal mounts in a portal at document.body so it escapes any
  // ancestor stacking context (transforms, filters, isolation, etc.)
  // and reliably sits above EVERYTHING else on the page —
  // including the sticky FilterBar (z-40) on the catalogue pages.
  // SSR-safe: portal lookup is skipped until after mount, when
  // `mounted` becomes true.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // z-[100] beats z-50 used elsewhere; the portal renders this
          // at document.body so even sticky / fixed siblings sit
          // beneath it.
          className="fixed inset-0 z-[100] bg-pacific-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full text-pacific-mid hover:text-pacific-dark hover:bg-pacific-light flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              <div className="px-10 py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-pacific-dark mb-4" />
                <h3 className="text-2xl font-light tracking-tight text-pacific-dark mb-2">
                  {isSample ? "Request Sent" : "Enquiry Sent"}
                </h3>
                <p className="text-sm text-pacific-dark/70 font-light leading-relaxed max-w-sm mx-auto">
                  We&apos;ve received your{" "}
                  {isSample ? "sample request" : "enquiry"} for{" "}
                  <strong className="font-medium">{productName}</strong>. Our
                  team will get back to you within 1–2 business days.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 text-xs tracking-[0.25em] uppercase text-pacific-dark border-b border-pacific-dark pb-0.5 hover:opacity-60 transition-opacity"
                >
                  Close
                </button>
              </div>
            ) : step === "choose" ? (
              /* Step 1 (sample mode only) — who is asking. Both paths
                 lead to the same form; the answer is carried through
                 to the submission so the team can route the lead. */
              <div className="px-8 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-light tracking-tight text-pacific-dark">
                    Sample Request
                  </h3>
                  <p className="mt-1 text-sm font-light text-pacific-dark/60">
                    What type of user are you?
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {USER_TYPES.map(({ value, title, cta, Icon, image }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setUserType(value)}
                      className="group relative overflow-hidden text-left rounded-xl border border-pacific-mid/25 min-h-[13rem] p-5 flex flex-col justify-end hover:border-pacific-dark hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:border-pacific-dark transition-all"
                    >
                      {/* Photo fills the card; the scrim below keeps
                          the copy legible whatever the image does in
                          its lower half. */}
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 16rem"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pacific-dark via-pacific-dark/70 to-pacific-dark/10" />

                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mb-3">
                          <Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="text-base font-medium text-white">
                          {title}
                        </div>
                        <span className="mt-4 inline-flex items-center text-[10px] font-medium tracking-[0.2em] uppercase text-white border-b border-white/70 pb-0.5">
                          {cta}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-8 py-8">
                {/* Back to the chooser — sample mode only, since
                    enquiries never pass through it. */}
                {isSample && userType && (
                  <button
                    type="button"
                    onClick={() => setUserType(null)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.2em] uppercase text-pacific-mid hover:text-pacific-dark transition-colors mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {USER_TYPES.find((u) => u.value === userType)?.title}
                  </button>
                )}
                <div className="text-xs font-medium tracking-[0.25em] uppercase text-pacific-mid mb-2">
                  {isSample ? "Request a Sample" : "Enquire about this product"}
                </div>
                <h3 className="text-2xl font-light tracking-tight text-pacific-dark mb-1">
                  {productName}
                </h3>
                {productCategory && (
                  <p className="text-sm text-pacific-dark/70 font-light mb-6">
                    {productCategory}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    required
                  />
                  <select
                    value={projectType}
                    onChange={(e) => {
                      setProjectType(e.target.value);

                      if (e.target.value !== "Other") {
                        setForm({ ...form, project: e.target.value });
                      } else {
                        setForm({ ...form, project: "" });
                      }
                    }}
                  >
                    <option value="">Select Project Type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Other">Other</option>
                  </select>

                  {projectType === "Other" && (
                    <input
                      type="text"
                      value={form.project}
                      onChange={(e) =>
                        setForm({ ...form, project: e.target.value })
                      }
                      placeholder="Enter Project Type"
                    />
                  )}
                </div>
                {/* Shipping Address only relevant in sample mode —
                    enquiries don't need to know where to ship to. */}
                {isSample && (
                  <Field
                    label="Shipping Address"
                    value={form.address}
                    onChange={(v) => setForm({ ...form, address: v })}
                    className="mt-4"
                    required
                  />
                )}
                <div className="mt-4">
                  <label className="block text-[10px] font-medium tracking-[0.25em] uppercase text-pacific-mid mb-1.5">
                    {isSample ? "Notes" : "Your Question"}
                    {!isSample && (
                      <span className="text-pacific-dark ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    rows={isSample ? 3 : 5}
                    value={form.notes}
                    required={!isSample}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder={
                      isSample
                        ? "Tell us about your project, timeline, or any questions."
                        : "What would you like to know about this product? Pricing, availability, technical specs, lead time…"
                    }
                    className="w-full border border-pacific-mid/25 rounded-md px-3 py-2.5 text-sm font-light text-pacific-dark placeholder-pacific-mid/60 focus:outline-none focus:border-pacific-dark transition-colors"
                  />
                </div>

                <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-[11px] text-pacific-dark/60 font-light leading-relaxed max-w-xs">
                    By submitting, you agree to be contacted by Pacific Surfaces
                    regarding this {isSample ? "request" : "enquiry"}.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-pacific-dark text-white px-7 py-3 text-xs font-medium tracking-[0.25em] uppercase rounded-full hover:bg-pacific-dark/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {isSample ? "Send Request" : "Send Enquiry"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Until the component has mounted client-side (or in environments
  // without document, e.g. SSR), render nothing. Once mounted, render
  // the overlay into document.body via portal so it sits at the very
  // top of the DOM stacking order.
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-medium tracking-[0.25em] uppercase text-pacific-mid mb-1.5">
        {label}
        {required && <span className="text-pacific-dark ml-1">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-pacific-mid/25 rounded-md px-3 py-2.5 text-sm font-light text-pacific-dark placeholder-pacific-mid/60 focus:outline-none focus:border-pacific-dark transition-colors"
      />
    </div>
  );
}

export default OrderSampleModal;
