"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Send } from "lucide-react";

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

export function OrderSampleModal({
  open,
  onClose,
  productName,
  productCategory,
  mode = "sample",
}: OrderSampleModalProps) {
  const isSample = mode === "sample";
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    project: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) {
      // reset when closed
      setTimeout(() => {
        setSubmitted(false);
      }, 300);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compose mailto until a backend endpoint is wired up. Subject
    // and body shape vary by mode so the recipient can triage at a
    // glance. Address line is only included in sample mode.
    const subject = isSample
      ? `Sample Request — ${productName}`
      : `Enquiry — ${productName}`;
    const bodyLines = [
      `Product: ${productName}${productCategory ? ` (${productCategory})` : ""}`,
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Project Type: ${form.project}`,
    ];
    if (isSample) {
      bodyLines.push(`Shipping Address: ${form.address}`);
    }
    bodyLines.push("", isSample ? "Notes:" : "Message:", form.notes || "—");

    const href = `mailto:bindu@thepacific.group?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = href;
    setSubmitted(true);
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
          className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
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
              className="absolute top-4 right-4 w-9 h-9 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {submitted ? (
              <div className="px-10 py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-600 mb-4" />
                <h3 className="text-2xl font-light tracking-tight text-stone-900 mb-2">
                  {isSample ? "Request Sent" : "Enquiry Sent"}
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed max-w-sm mx-auto">
                  Your email client should have opened with a pre-filled{" "}
                  {isSample ? "request" : "enquiry"} for{" "}
                  <strong className="font-medium">{productName}</strong>. Our team
                  will respond within 1–2 business days.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 text-xs tracking-[0.25em] uppercase text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-60 transition-opacity"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-8 py-8">
                <div className="text-xs font-medium tracking-[0.25em] uppercase text-stone-500 mb-2">
                  {isSample ? "Request a Sample" : "Enquire about this product"}
                </div>
                <h3 className="text-2xl font-light tracking-tight text-stone-900 mb-1">
                  {productName}
                </h3>
                {productCategory && (
                  <p className="text-sm text-stone-500 font-light mb-6">
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
                  />
                  <Field
                    label="Project Type"
                    value={form.project}
                    onChange={(v) => setForm({ ...form, project: v })}
                    placeholder="Residential / Commercial"
                  />
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
                  <label className="block text-[10px] font-medium tracking-[0.25em] uppercase text-stone-500 mb-1.5">
                    {isSample ? "Notes" : "Your Question"}
                    {!isSample && (
                      <span className="text-stone-900 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    rows={isSample ? 3 : 5}
                    value={form.notes}
                    required={!isSample}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder={
                      isSample
                        ? "Tell us about your project, timeline, or any questions."
                        : "What would you like to know about this product? Pricing, availability, technical specs, lead time…"
                    }
                    className="w-full border border-stone-200 rounded-md px-3 py-2.5 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>

                <div className="mt-7 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-[11px] text-stone-400 font-light leading-relaxed max-w-xs">
                    By submitting, you agree to be contacted by Pacific Surfaces
                    regarding this {isSample ? "request" : "enquiry"}.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3 text-xs font-medium tracking-[0.25em] uppercase rounded-full hover:bg-stone-800 transition-colors"
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
      <label className="block text-[10px] font-medium tracking-[0.25em] uppercase text-stone-500 mb-1.5">
        {label}
        {required && <span className="text-stone-900 ml-1">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-stone-200 rounded-md px-3 py-2.5 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
      />
    </div>
  );
}

export default OrderSampleModal;
