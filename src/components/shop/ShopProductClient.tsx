"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Download, FileText, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { CUSTOM_SIZE, type StoreOptions } from "@/data/store";
import type { ShopColour } from "@/components/shop/ShopClient";
import { BasinPreview } from "@/components/shop/BasinPreview";
import type { BasinLayers } from "@/data/store";

/**
 * The store product page.
 *
 * Gallery on the left, everything you configure on the right, in the order
 * the category is normally shopped: colour, then the three dimensions, then
 * basin count, then quantity and Add to Cart. Thickness is deliberately
 * absent — these are finished pieces cut to a size.
 *
 * Nothing is priced. The order is a request, and the notes under the button
 * say so rather than implying a checkout that does not exist.
 */

export interface ShopProductDetail {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  images: string[];
  collection: string | null;
  section: string;
  hdFileUrl: string | null;
  specSheetUrl: string | null;
}

/** A neighbour on the same shelf. */
export interface SimilarProduct {
  name: string;
  slug: string;
  image: string | null;
}

export function ShopProductClient({
  product,
  options,
  colours,
  similar,
  layers,
}: {
  product: ShopProductDetail;
  options: StoreOptions;
  colours: ShopColour[];
  similar: SimilarProduct[];
  /**
   * Hand-authored composite layers. When present the main image becomes a
   * live preview that takes the chosen colour, the way the visualizer
   * swaps a surface in a room.
   */
  layers: BasinLayers | null;
}) {
  const { addItem } = useCart();

  const [active, setActive] = useState(0);
  const [colour, setColour] = useState(colours[0]?.name ?? "");
  const [length, setLength] = useState(options.lengths[0] ?? "");
  const [width, setWidth] = useState(options.widths[0] ?? "");
  const [height, setHeight] = useState(options.heights[0] ?? "");
  const [basins, setBasins] = useState(options.basins[0] ?? "");
  const [finish, setFinish] = useState(options.finishes[0] ?? "");
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState(false);

  const custom = (
    [
      ["length", length],
      ["width", width],
      ["height", height],
    ] as [string, string][]
  ).filter(([, v]) => v === CUSTOM_SIZE);

  const resolve = (field: string, value: string) =>
    value === CUSTOM_SIZE ? (typed[field] ?? "").trim() : value;

  const canAdd = custom.every(
    ([field]) => resolve(field, CUSTOM_SIZE).length > 0
  );

  const selectedColour = colours.find((c) => c.name === colour);

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? null,
        collection: product.collection,
        colour,
        length: resolve("length", length),
        width: resolve("width", width),
        height: resolve("height", height),
        basins,
        finish,
      },
      quantity
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="bg-white px-6 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ---- gallery ---- */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-pacific-dark/5">
            {/* The live preview replaces the photograph only on the first
                gallery frame — the thumbnails still show the shot images. */}
            {layers && active === 0 ? (
              <BasinPreview
                assets={layers}
                colourName={colour}
                colourImage={selectedColour?.image ?? null}
                alt={product.name}
              />
            ) : product.images[active] ? (
              <Image
                src={product.images[active]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.slice(0, 6).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === active}
                  className={cn(
                    "relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-pacific-dark/5 transition-opacity",
                    i === active
                      ? "ring-2 ring-pacific-dark"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {(product.hdFileUrl || product.specSheetUrl) && (
            <div className="mt-8 space-y-3">
              {product.hdFileUrl && (
                <a
                  href={product.hdFileUrl}
                  className="inline-flex items-center gap-3 text-sm font-light text-pacific-dark hover:opacity-70"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded border border-pacific-dark/20">
                    <Download className="h-4 w-4" />
                  </span>
                  Download images in high quality
                </a>
              )}
              {product.specSheetUrl && (
                <a
                  href={product.specSheetUrl}
                  className="flex items-center gap-3 text-sm font-light text-pacific-dark hover:opacity-70"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded border border-pacific-dark/20">
                    <FileText className="h-4 w-4" />
                  </span>
                  Download technical datasheet
                </a>
              )}
            </div>
          )}
        </div>

        {/* ---- configure ---- */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-pacific-dark/45">
            {product.section}
          </p>
          <h1 className="mt-2 text-3xl font-medium uppercase tracking-tight text-pacific-dark">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 max-w-prose text-sm font-light leading-relaxed text-pacific-dark/70">
              {product.description}
            </p>
          )}

          {product.code && (
            <p className="mt-4 text-sm font-light text-pacific-dark/70">
              Product code:{" "}
              <span className="text-pacific-dark">{product.code}</span>
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
            {colours.length > 0 && (
              <Field label="Colours">
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="flex w-full items-center gap-2 rounded-md border border-pacific-dark/20 px-2.5 py-2 text-left transition-colors hover:border-pacific-dark"
                >
                  <span className="relative h-6 w-8 shrink-0 overflow-hidden rounded-sm bg-pacific-dark/5">
                    {selectedColour?.image ? (
                      <Image
                        src={selectedColour.image}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="truncate text-sm font-light text-pacific-dark">
                    {colour || "Choose colour"}
                  </span>
                </button>
              </Field>
            )}

            <Field label="Length (in)">
              <Select
                value={length}
                options={options.lengths}
                onChange={setLength}
                label={`Length for ${product.name}`}
              />
            </Field>
            <Field label="Width (in)">
              <Select
                value={width}
                options={options.widths}
                onChange={setWidth}
                label={`Width for ${product.name}`}
              />
            </Field>
            <Field label="Height (in)">
              <Select
                value={height}
                options={options.heights}
                onChange={setHeight}
                label={`Height for ${product.name}`}
              />
            </Field>
            {options.basins.length > 0 && (
              <Field label="Number of sinks">
                <Select
                  value={basins}
                  options={options.basins}
                  onChange={setBasins}
                  label={`Number of sinks for ${product.name}`}
                />
              </Field>
            )}
            <Field label="Finish">
              <Select
                value={finish}
                options={options.finishes}
                onChange={setFinish}
                label={`Finish for ${product.name}`}
              />
            </Field>
          </div>

          {custom.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {custom.map(([field]) => (
                <Field key={field} label={`${field} in inches`}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={typed[field] ?? ""}
                    onChange={(e) =>
                      setTyped((t) => ({ ...t, [field]: e.target.value }))
                    }
                    placeholder="e.g. 54"
                    className="w-full rounded-md border border-pacific-dark/20 px-2.5 py-2 text-sm font-light text-pacific-dark placeholder-pacific-dark/35 focus:border-pacific-dark focus:outline-none"
                  />
                </Field>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-md border border-pacific-dark/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-2.5 text-pacific-dark/70 hover:bg-pacific-light"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[2.5ch] text-center text-sm tabular-nums text-pacific-dark">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="p-2.5 text-pacific-dark/70 hover:bg-pacific-light"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={handleAdd}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
                added
                  ? "bg-pacific-dark/80 text-white"
                  : "bg-pacific-dark text-white hover:bg-pacific-dark/90",
                !canAdd && "cursor-not-allowed opacity-45"
              )}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : canAdd ? (
                "Add to cart"
              ) : (
                "Enter dimensions"
              )}
            </button>

            <Link
              href="/cart"
              className="text-xs font-medium uppercase tracking-[0.2em] text-pacific-dark underline-offset-4 hover:underline"
            >
              View cart
            </Link>
          </div>

          <ul className="mt-8 space-y-2 text-xs font-light leading-relaxed text-pacific-dark/60">
            <li>
              * Our team confirms quantities, freight and price before anything
              ships.
            </li>
            <li>
              * Dimensions are indicative; final sizes are cut to your template.
            </li>
            <li>
              {/* A configurator answers "which one" but not "why quartz" or
                  "what size" — the guide does, and the link is what ties
                  this page to it for search as well as for readers. */}
              * New to these? Read the{" "}
              <Link
                href="/applications/bathroom-vanity-tops"
                className="underline"
              >
                vanity tops guide
              </Link>{" "}
              — sizes, finishes and care.
            </li>
            <li>
              * For more details see the{" "}
              <Link href="/resources" className="underline">
                technical resources
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline">
                talk to us
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mx-auto mt-20 max-w-7xl border-t border-pacific-dark/10 pt-12">
          <h2 className="text-2xl font-light tracking-tight text-pacific-dark">
            Similar products
          </h2>
          <p className="mt-1 text-sm font-light text-pacific-dark/60">
            The rest of the {product.section.toLowerCase()} shelf.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {similar.map((s) => (
              <Link
                key={s.slug}
                href={`/shop/${s.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-pacific-dark/5">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-light text-pacific-dark group-hover:opacity-70">
                  {s.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {picking && (
        <ColourPanel
          colours={colours}
          current={colour}
          product={product.name}
          onPick={(name) => {
            setColour(name);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-light capitalize text-pacific-dark/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-pacific-dark/20 bg-white px-2.5 py-2 text-sm font-light text-pacific-dark focus:border-pacific-dark focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/** The same swatch panel the storefront uses, so the two behave alike. */
function ColourPanel({
  colours,
  current,
  product,
  onPick,
  onClose,
}: {
  colours: ShopColour[];
  current: string;
  product: string;
  onPick: (name: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const shown = query.trim()
    ? colours.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : colours;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button
        type="button"
        aria-label="Close colours"
        onClick={onClose}
        className="absolute inset-0 bg-pacific-dark/40"
      />
      <aside
        role="dialog"
        aria-label="Colours"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-pacific-dark/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-light tracking-tight text-pacific-dark">
              Colours
            </h2>
            <p className="mt-0.5 text-xs font-light text-pacific-dark/55">
              {product}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-pacific-dark/50 hover:bg-pacific-light hover:text-pacific-dark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-pacific-dark/10 px-6 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${colours.length} colours`}
            className="w-full rounded-md border border-pacific-dark/15 px-3 py-2 text-sm font-light text-pacific-dark placeholder-pacific-dark/40 focus:border-pacific-dark focus:outline-none"
          />
        </div>

        <ul className="flex-1 overflow-y-auto px-3 py-2">
          {shown.map((c) => (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => onPick(c.name)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-pacific-light",
                  c.name === current && "bg-pacific-light"
                )}
              >
                <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-pacific-dark/5">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="text-sm font-light text-pacific-dark">
                  {c.name}
                </span>
                {c.name === current && (
                  <Check className="ml-auto h-4 w-4 text-pacific-dark" />
                )}
              </button>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="px-3 py-8 text-center text-sm font-light text-pacific-dark/55">
              No colour matches “{query}”.
            </li>
          )}
        </ul>
      </aside>
    </div>
  );
}
