"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Download, FileText, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { CUSTOM_SIZE, dimensionLabel, type StoreOptions } from "@/data/store";
import { isDrawing, servedAsIs, type ShopColour } from "@/components/shop/ShopClient";
import { BasinPreview } from "@/components/shop/BasinPreview";
import { PieceRender } from "@/components/shop/PieceRender";
import { VanityTopRender } from "@/components/shop/VanityTopRender";
import {
  VanityGlance,
  VanitySections,
  type VanityDetails,
  type VanitySelection,
} from "@/components/shop/VanityTopDetails";
import type { CutPiece } from "@/data/thresholds-and-sills";

/** The guide each shelf points to under the order button. */
const GUIDES: Record<string, { href: string; label: string }> = {
  "Integrated Quartz Sinks": { href: "/applications/washbasins", label: "washbasins guide" },
  "Window Sills & Thresholds": { href: "/products/pacific-european-window-sill-threshold-collection", label: "sills and thresholds page" },
};

/** The gallery frame that shows a cut piece drawn live. */
const RENDER = "live-render";
/** The gallery frame that shows a vanity top drawn to its chosen size. */
const SCALE = "to-scale";
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

/**
 * One of a family of products that differ only by basin count (the
 * made-to-order vanity tops). Given the family, the page switches between
 * them in place when the basin count changes, keeping every other choice.
 */
export interface BasinVariant {
  /** The basin count this variant answers to, e.g. "2". */
  basins: string;
  product: ShopProductDetail;
  options: StoreOptions;
  layers: BasinLayers | null;
  similar: SimilarProduct[];
}

export function ShopProductClient({
  product: productProp,
  options: optionsProp,
  colours,
  similar: similarProp,
  layers: layersProp,
  variants,
  piece,
  details,
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
  /** The basin-count family this product belongs to, if any. */
  variants?: BasinVariant[];
  /** A cut piece: the first gallery frame draws it in the chosen colour. */
  piece?: CutPiece;
  /** A vanity top: the Lowe's-style detail sections and choice pills. */
  details?: VanityDetails;
}) {
  const { addItem } = useCart();

  // Which variant is showing. Switching one swaps the product, its scene,
  // its lengths and its neighbours without leaving the page, so the
  // chosen colour is laid straight into the new scene.
  const [variantIndex, setVariantIndex] = useState(() =>
    Math.max(0, variants?.findIndex((v) => v.product.slug === productProp.slug) ?? 0)
  );
  const variant = variants?.[variantIndex];
  const product = variant?.product ?? productProp;
  const options = variant?.options ?? optionsProp;
  const layers = variant?.layers ?? (variant ? null : layersProp);
  const similar = variant?.similar ?? similarProp;

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

  // A colour chosen on the listing arrives as ?colour=<name>.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("colour");
    if (wanted && colours.some((c) => c.name === wanted)) setColour(wanted);
  }, [colours]);

  // A cut piece opens on its live view; its photographs and drawing follow.
  // A vanity top with a scene gets a second frame drawn to its chosen size,
  // since the photograph cannot change size.
  const frames = piece
    ? [RENDER, ...product.images]
    : layers
      ? [product.images[0] ?? "scene", SCALE, ...product.images.slice(1)]
      : product.images;
  const scaleIndex = frames.indexOf(SCALE);
  /** A new size shows the to-scale view, where a size can be seen. */
  const resized =
    (set: (value: string) => void) =>
    (value: string) => {
      set(value);
      if (scaleIndex >= 0) setActive(scaleIndex);
    };
  const renderTop = (label: string, showSize = true) => (
    <VanityTopRender
      basins={Math.max(1, ["Single", "Double", "Triple"].indexOf(basins) + 1)}
      length={resolve("length", length)}
      width={resolve("width", width)}
      height={resolve("height", height)}
      colourImage={selectedColour?.image ?? null}
      finish={finish}
      label={label}
      showSize={showSize}
    />
  );
  const renderPiece = (label: string) =>
    piece ? (
      <PieceRender
        piece={piece}
        length={resolve("length", length)}
        width={resolve("width", width)}
        thickness={height}
        colourImage={selectedColour?.image ?? null}
        finish={finish}
        label={label}
      />
    ) : null;

  // With a family, the basin choices are the family's; picking one moves
  // to that variant, keeps colour, width, height and finish, and keeps the
  // length where the new layout offers it.
  const basinChoices = variants ? variants.map((v) => v.basins) : options.basins;
  const changeBasins = (value: string) => {
    setBasins(value);
    if (!variants) return;
    const next = variants.findIndex((v) => v.basins === value);
    if (next < 0 || next === variantIndex) return;
    const nextLengths = variants[next].options.lengths;
    if (!nextLengths.includes(length)) setLength(nextLengths[0] ?? "");
    setVariantIndex(next);
    setActive(0);
    // Keep the address honest without a navigation, which would reset the
    // page and lose the choices.
    window.history.replaceState(null, "", `/shop/${variants[next].product.slug}`);
    document.title = `${variants[next].product.name} — Pacific Store`;
  };

  const selection: VanitySelection | null = details
    ? {
        layout: product.name.replace(/\s*Quartz Vanity Top$/, ""),
        basins: Math.max(1, ["Single", "Double", "Triple"].indexOf(basins) + 1),
        colour,
        length: resolve("length", length),
        width: resolve("width", width),
        height: resolve("height", height),
        finish,
        lengths: options.lengths,
        widths: options.widths,
        heights: options.heights,
        finishes: options.finishes,
      }
    : null;

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
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-lg bg-pacific-dark/5",
              // A layered scene is shot wide (the double-basin top is
              // ~2.1:1); give it its own frame rather than crop it to 4:3.
              // The to-scale view keeps that frame, so the page doesn't jump.
              layers && (active === 0 || frames[active] === SCALE) ? "aspect-[21/10]" : "aspect-[4/3]"
            )}
          >
            {/* The live preview replaces the photograph only on the first
                gallery frame — the thumbnails still show the shot images. */}
            {layers && active === 0 ? (
              <BasinPreview
                assets={layers}
                colourName={colour}
                colourImage={selectedColour?.image ?? null}
                alt={product.name}
              />
            ) : frames[active] === SCALE ? (
              renderTop(`${product.name} in ${colour}, to scale`)
            ) : frames[active] === RENDER ? (
              renderPiece(`${product.name} in ${colour}`)
            ) : frames[active] ? (
              <Image
                src={frames[active]}
                alt={product.name}
                fill
                // Our own photographs and drawings are served as they are.
                unoptimized={servedAsIs(frames[active])}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={isDrawing(frames[active]) ? "bg-white object-contain p-6" : "object-cover"}
                priority
              />
            ) : null}
          </div>

          {/* The visualizer's slab dock, under a live preview: one tap on a
              slab lays it into the scene. Same list, and the same choice, as
              the Colours field on the right. */}
          {layers && colours.length > 0 && (
            <SlabStrip
              colours={colours}
              current={colour}
              onPick={(name) => {
                setColour(name);
                setActive(0);
              }}
            />
          )}

          {frames.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {frames.slice(0, 7).map((src, i) => (
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
                  {src === RENDER ? (
                    renderPiece("")
                  ) : src === SCALE ? (
                    renderTop("", false)
                  ) : (
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized={servedAsIs(src)}
                      sizes="96px"
                      className={isDrawing(src) ? "bg-white object-contain p-1" : "object-cover"}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Under the gallery on a desktop; after the order button on a
              phone, so the title and the choices come first there. */}
          {selection && (
            <div className="hidden lg:block">
              <VanityGlance sel={selection} />
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

          {/* A vanity top's layout and width are chosen as pills, the way the
              category shows its common sizes. */}
          {details && (
            <div className="mt-8 space-y-5">
              {basinChoices.length > 0 && (
                <Pills label="Basins" value={basins} options={basinChoices} onChange={changeBasins} />
              )}
              <Pills label="Common width (in)" value={length} options={options.lengths} onChange={resized(setLength)} />
            </div>
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

            {!details && (
            <Field label={`${dimensionLabel(options, "length")} (in)`}>
              <Select
                value={length}
                options={options.lengths}
                onChange={setLength}
                label={`${dimensionLabel(options, "length")} for ${product.name}`}
              />
            </Field>
            )}
            {options.widths.length > 0 && (
            <Field label={`${dimensionLabel(options, "width")} (in)`}>
              <Select
                value={width}
                options={options.widths}
                onChange={resized(setWidth)}
                label={`${dimensionLabel(options, "width")} for ${product.name}`}
              />
            </Field>
            )}
            <Field label={`${dimensionLabel(options, "height")} (in)`}>
              <Select
                value={height}
                options={options.heights}
                onChange={resized(setHeight)}
                label={`${dimensionLabel(options, "height")} for ${product.name}`}
              />
            </Field>
            {!details && basinChoices.length > 0 && (
              <Field label={variants ? "Basins" : "Number of sinks"}>
                <Select
                  value={basins}
                  options={basinChoices}
                  onChange={changeBasins}
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
                <Field key={field} label={`${dimensionLabel(options, field as "length" | "width" | "height")} in inches`}>
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
                href={GUIDES[product.section]?.href ?? "/applications/bathroom-vanity-tops"}
                className="underline"
              >
                {GUIDES[product.section]?.label ?? "vanity tops guide"}
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
          {selection && (
            <div className="lg:hidden">
              <VanityGlance sel={selection} />
            </div>
          )}
        </div>
      </div>

      {details && selection && <VanitySections details={details} sel={selection} />}

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
                      unoptimized={servedAsIs(s.image)}
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className={cn(
                        "transition-transform duration-700 group-hover:scale-[1.04]",
                        isDrawing(s.image) ? "bg-white object-contain p-3" : "object-cover"
                      )}
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

/** A choice shown as a row of pills, the chosen one filled. */
function Pills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-light text-pacific-dark">
        {label}: <span className="font-medium">{value}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={o === value}
            data-over-media={o === value ? "" : undefined}
            onClick={() => onChange(o)}
            className={cn(
              "h-10 min-w-10 rounded-full border px-4 text-sm font-light transition-colors",
              o === value
                ? "border-[#14140f] bg-[#14140f] text-white"
                : "border-[#14140f]/25 text-[#14140f] hover:border-[#14140f]"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
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

/**
 * A horizontal dock of slab swatches, after the visualizer's SlabPicker:
 * each design as a small portrait tile of its slab with its name across
 * the foot, the chosen one ringed and ticked. The vertical wheel scrolls
 * it sideways, as the visualizer's dock does.
 */
function SlabStrip({
  colours,
  current,
  onPick,
}: {
  colours: ShopColour[];
  current: string;
  onPick: (name: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-dark/55">
          Choose a slab
        </span>
        <span className="truncate text-sm font-light text-pacific-dark">{current}</span>
      </div>
      <div
        className="-mx-1 overflow-x-auto pb-2 [scrollbar-width:thin]"
        onWheel={(e) => {
          const el = e.currentTarget;
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (el.scrollWidth > el.clientWidth) el.scrollLeft += delta;
        }}
      >
        <div className="flex gap-2 px-1">
          {colours.map((c) => {
            const on = c.name === current;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onPick(c.name)}
                aria-pressed={on}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  "relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-pacific-dark/5 ring-1 transition-all",
                  on ? "ring-2 ring-pacific-dark" : "ring-pacific-dark/10 hover:ring-pacific-dark/40"
                )}
              >
                {c.image ? (
                  <Image src={c.image} alt="" fill sizes="72px" className="object-cover" />
                ) : null}
                <span
                  data-over-media
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5 text-left text-[9px] uppercase leading-tight tracking-[0.06em] text-white"
                >
                  <span className="line-clamp-2">{c.name}</span>
                </span>
                {on && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <Check className="h-3 w-3 text-pacific-dark" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
