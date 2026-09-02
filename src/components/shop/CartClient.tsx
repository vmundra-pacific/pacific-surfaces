"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Minus,
  Plus,
  Trash2,
  Send,
  ArrowRight,
} from "lucide-react";
import { useCart, lineKey, type CartItem } from "@/lib/cart";
import { formatCollection } from "@/components/catalogue/labels";
import { CUSTOM_SIZE } from "@/data/store";
import { trackMetaEvent } from "@/lib/meta-pixel";

/**
 * /cart — review the order, then place it.
 *
 * No payment: submitting writes an orderRequest to Sanity, emails the
 * team, and shows the customer a reference plus "our team will contact
 * you". Thickness and finish are editable per line here rather than on
 * the storefront card, so adding stays a single tap.
 */

interface OrderForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  customerType: "homeowner" | "professional" | "";
}

const EMPTY_FORM: OrderForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
  customerType: "",
};

export function CartClient({
  optionsByProduct,
}: {
  /** Size/thickness/finish choices per product id. */
  optionsByProduct: Record<
    string,
    { sizes: string[]; thicknesses: string[]; finishes: string[] }
  >;
}) {
  const { items, count, ready, setQuantity, setOption, removeItem, clear } =
    useCart();
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/order/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerType: form.customerType || undefined,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            collection: i.collection,
            size: i.size,
            thickness: i.thickness,
            finish: i.finish,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      trackMetaEvent("Lead", {
        content_type: "order_request",
        content_name: `${count} pieces`,
      });
      setPlaced(data.reference ?? "");
      clear();
    } catch {
      setError(
        "We couldn't reach the server. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---- placed -------------------------------------------------------
  if (placed !== null) {
    return (
      <section className="bg-pacific-light px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-pacific-dark/10 bg-white px-8 py-12 text-center">
          <CheckCircle className="mx-auto mb-5 h-12 w-12 text-pacific-dark" />
          <h2 className="text-2xl font-light tracking-tight text-pacific-dark">
            Order placed
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-pacific-dark/70">
            Our team will contact you to confirm quantities, freight and price.
            No payment has been taken.
          </p>
          {placed && (
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/50">
              Reference
              <span className="ml-2 text-pacific-dark">{placed}</span>
            </p>
          )}
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-pacific-dark px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white hover:opacity-90"
          >
            Back to the store
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  // ---- empty --------------------------------------------------------
  if (ready && items.length === 0) {
    return (
      <section className="bg-pacific-light px-6 py-20 text-center">
        <p className="text-lg font-light text-pacific-dark/70">
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pacific-dark px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white hover:opacity-90"
        >
          Browse the store
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-pacific-light px-6 py-14 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12">
        {/* ---- lines ---- */}
        <div className="lg:col-span-7">
          <h2 className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/50">
            {count} piece{count === 1 ? "" : "s"} in your cart
          </h2>

          <ul className="space-y-3">
            {items.map((item) => (
              <CartLine
                key={lineKey(item)}
                item={item}
                options={optionsByProduct[item.id]}
                onQuantity={(q) => setQuantity(lineKey(item), q)}
                onOption={(o, v) => setOption(lineKey(item), o, v)}
                onRemove={() => removeItem(lineKey(item))}
              />
            ))}
          </ul>
        </div>

        {/* ---- details ---- */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-pacific-dark/10 bg-white p-6 lg:p-7"
          >
            <h2 className="text-lg font-light tracking-tight text-pacific-dark">
              Your details
            </h2>
            <p className="mt-1 text-xs font-light leading-relaxed text-pacific-dark/60">
              No payment is taken online. We&apos;ll contact you to confirm
              quantities, freight and price.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
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
              <Field
                label="Company"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
              />
            </div>

            <div className="mt-4">
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-mid">
                Ordering as
              </span>
              <div className="flex gap-2">
                {(
                  [
                    ["homeowner", "Home owner"],
                    ["professional", "Professional"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, customerType: value })}
                    aria-pressed={form.customerType === value}
                    className={
                      form.customerType === value
                        ? "rounded-full bg-pacific-dark px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white"
                        : "rounded-full border border-pacific-mid/30 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-pacific-dark hover:border-pacific-dark"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <TextArea
              label="Delivery address"
              rows={3}
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              required
            />
            <TextArea
              label="Notes"
              rows={3}
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              placeholder="Site, timeline, fabrication requirements, anything else we should know."
            />

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pacific-dark px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function CartLine({
  item,
  options,
  onQuantity,
  onOption,
  onRemove,
}: {
  item: CartItem;
  options?: { sizes: string[]; thicknesses: string[]; finishes: string[] };
  onQuantity: (q: number) => void;
  onOption: (option: "size" | "thickness" | "finish", value: string) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 rounded-xl border border-pacific-dark/10 bg-white p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-pacific-dark/5">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-medium text-pacific-dark hover:opacity-70"
            >
              {item.name}
            </Link>
            {item.collection && (
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pacific-dark/45">
                {formatCollection(item.collection)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            className="shrink-0 rounded-full p-1.5 text-pacific-dark/45 transition-colors hover:bg-pacific-light hover:text-pacific-dark"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* A custom size is free text the customer typed, so it is
              shown as a chip rather than forced into a dropdown it
              would not match. */}
          {options?.sizes && options.sizes.length > 0 ? (
            options.sizes.includes(item.size) ? (
              <OptionSelect
                label={`Size for ${item.name}`}
                value={item.size}
                options={options.sizes}
                onChange={(v) => onOption("size", v)}
              />
            ) : (
              <span className="rounded-full border border-pacific-dark/15 px-3 py-1.5 text-xs font-light text-pacific-dark">
                {item.size || CUSTOM_SIZE}
                <span className="ml-1.5 text-pacific-dark/45">custom</span>
              </span>
            )
          ) : null}
          {options?.thicknesses && options.thicknesses.length > 0 && (
            <OptionSelect
              label={`Thickness for ${item.name}`}
              value={item.thickness}
              options={options.thicknesses}
              onChange={(v) => onOption("thickness", v)}
            />
          )}
          {options?.finishes && options.finishes.length > 0 && (
            <OptionSelect
              label={`Finish for ${item.name}`}
              value={item.finish}
              options={options.finishes}
              onChange={(v) => onOption("finish", v)}
            />
          )}

          <div className="ml-auto flex items-center gap-1 rounded-full border border-pacific-dark/15">
            <button
              type="button"
              onClick={() => onQuantity(item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="rounded-full p-2 text-pacific-dark/70 hover:bg-pacific-light"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2ch] text-center text-sm tabular-nums text-pacific-dark">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(item.quantity + 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className="rounded-full p-2 text-pacific-dark/70 hover:bg-pacific-light"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-pacific-dark/15 bg-white px-3 py-1.5 text-xs font-light text-pacific-dark focus:border-pacific-dark focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-mid">
        {label}
        {required && <span className="ml-1 text-pacific-dark">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-pacific-mid/25 px-3 py-2.5 text-sm font-light text-pacific-dark focus:border-pacific-dark focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-mid">
        {label}
        {required && <span className="ml-1 text-pacific-dark">*</span>}
      </span>
      <textarea
        rows={rows}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-pacific-mid/25 px-3 py-2.5 text-sm font-light text-pacific-dark placeholder-pacific-mid/60 focus:border-pacific-dark focus:outline-none"
      />
    </label>
  );
}
