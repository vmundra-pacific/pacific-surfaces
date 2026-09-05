"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import {
  CUSTOM_SIZE,
  STORE_SECTIONS,
  storeOptions,
  type StoreSection,
} from "@/data/store";

/**
 * The storefront grid.
 *
 * Products arrive grouped by collection so the shop reads as sections
 * rather than one undifferentiated wall of slabs. Thickness and finish
 * are chosen on the card before adding, and stay editable per line on
 * /cart.
 */

/** One choosable colour: a Pacific design, with its slab image. */
export interface ShopColour {
  name: string;
  image: string | null;
}

/** What the card hands to the cart when Add is pressed. */
interface SelectedOptions {
  colour: string;
  length: string;
  width: string;
  height: string;
  basins: string;
  finish: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  /** Customer-facing shelf: Vanities / Vanity Tops / Vanity Sinks. */
  section: StoreSection;
  /** Sanity collection, carried into the cart line for the order. */
  collection: string;
  finishes: string[];
}

export function ShopClient({
  products,
  colours,
}: {
  products: ShopProduct[];
  /** The quartz range, offered as the colour of every piece. */
  colours: ShopColour[];
}) {
  const { addItem, count } = useCart();
  const [activeCollection, setActiveCollection] = useState<string>("All");
  // Which card was just added, so the button can confirm itself.
  const [justAdded, setJustAdded] = useState<string | null>(null);
  /* Which card is choosing a colour. Held here rather than per card so
     only one drawer can ever be open, and it can cover the page. */
  const [picking, setPicking] = useState<{
    product: string;
    current: string;
    onPick: (name: string) => void;
  } | null>(null);

  // Counts per shelf, in the fixed STORE_SECTIONS order rather than
  // by size — the order is a merchandising decision, not a statistic.
  const collections = useMemo(
    () =>
      STORE_SECTIONS.map(
        (section) =>
          [
            section,
            products.filter((p) => p.section === section).length,
          ] as const
      ).filter(([, n]) => n > 0),
    [products]
  );

  const sections = useMemo(() => {
    const visible =
      activeCollection === "All"
        ? products
        : products.filter((p) => p.section === activeCollection);
    return STORE_SECTIONS.map(
      (section) =>
        [section, visible.filter((p) => p.section === section)] as const
    ).filter(([, list]) => list.length > 0);
  }, [products, activeCollection]);

  const handleAdd = (p: ShopProduct, options: SelectedOptions) => {
    addItem({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      collection: p.collection,
      ...options,
    });
    setJustAdded(p.id);
    window.setTimeout(
      () => setJustAdded((cur) => (cur === p.id ? null : cur)),
      1600
    );
  };

  return (
    <div className="bg-pacific-light">
      {/* Collection filter — sticky, so the section you want is one
          tap away however far down the grid you are. */}
      <div className="sticky top-16 z-30 border-b border-pacific-dark/10 bg-pacific-light/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-6 py-4 lg:px-8">
          <FilterPill
            label="All"
            count={products.length}
            active={activeCollection === "All"}
            onClick={() => setActiveCollection("All")}
          />
          {collections.map(([name, n]) => (
            <FilterPill
              key={name}
              label={name}
              count={n}
              active={activeCollection === name}
              onClick={() => setActiveCollection(name)}
            />
          ))}
          <Link
            href="/cart"
            className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-pacific-dark px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 sm:inline-flex"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Cart
            {count > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-pacific-dark">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        {sections.length === 0 && (
          <p className="py-16 text-center font-light text-pacific-dark/60">
            Nothing in this section yet.
          </p>
        )}

        {sections.map(([section, list]) => (
          <section key={section} className="mb-16 last:mb-0">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-pacific-dark/10 pb-3">
              <h2 className="text-lg font-light tracking-tight text-pacific-dark">
                {section}
              </h2>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-pacific-dark/45">
                {list.length} design{list.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  colours={colours}
                  added={justAdded === p.id}
                  onAdd={handleAdd}
                  onPickColour={setPicking}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ColourDrawer
        colours={colours}
        picking={picking}
        onClose={() => setPicking(null)}
      />
    </div>
  );
}

/**
 * The colour picker.
 *
 * A dropdown was the first attempt and it does not work for 125 stone
 * designs — the whole point of choosing one is seeing it. This is the
 * pattern the category uses: a panel down the right-hand side, each colour
 * shown as its own slab with the name beside it.
 */
function ColourDrawer({
  colours,
  picking,
  onClose,
}: {
  colours: ShopColour[];
  picking: {
    product: string;
    current: string;
    onPick: (name: string) => void;
  } | null;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // 125 rows is a long scroll; stop the page behind it scrolling too.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [picking, onClose]);

  useEffect(() => {
    if (picking) setQuery("");
  }, [picking]);

  if (!picking) return null;

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
              {picking.product}
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
                onClick={() => {
                  picking.onPick(c.name);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-pacific-light",
                  c.name === picking.current && "bg-pacific-light"
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
                {c.name === picking.current && (
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

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors",
        active
          ? "bg-pacific-dark text-white"
          : "border border-pacific-dark/15 text-pacific-dark hover:border-pacific-dark/40"
      )}
    >
      {label}
      <span className={cn("ml-2", active ? "opacity-60" : "opacity-45")}>
        {count}
      </span>
    </button>
  );
}

/**
 * One storefront card. Thickness and finish are chosen here, before
 * adding — the same colour in 2 cm polished and 3 cm leathered are two
 * different things to quote, and picking after the fact meant the cart
 * was the only place the choice existed. Both remain editable on /cart.
 *
 * Selection is local to the card so choosing an option on one product
 * cannot disturb another, and the cart still holds the answer once
 * added.
 */
function ProductCard({
  product,
  colours,
  added,
  onAdd,
  onPickColour,
}: {
  product: ShopProduct;
  colours: ShopColour[];
  added: boolean;
  onAdd: (p: ShopProduct, options: SelectedOptions) => void;
  onPickColour: (
    picking: {
      product: string;
      current: string;
      onPick: (name: string) => void;
    } | null
  ) => void;
}) {
  const options = storeOptions({
    section: product.section,
    finishes: product.finishes,
  });

  const [colour, setColour] = useState(colours[0]?.name ?? "");
  const [length, setLength] = useState(options.lengths[0] ?? "");
  const [width, setWidth] = useState(options.widths[0] ?? "");
  const [height, setHeight] = useState(options.heights[0] ?? "");
  const [basins, setBasins] = useState(options.basins[0] ?? "");
  const [finish, setFinish] = useState(options.finishes[0] ?? "");
  /** Typed values for whichever dimensions were set to Custom. */
  const [typed, setTyped] = useState<Record<string, string>>({});

  const custom = [
    ["length", length],
    ["width", width],
    ["height", height],
  ].filter(([, v]) => v === CUSTOM_SIZE) as [string, string][];

  const resolve = (field: string, value: string) =>
    value === CUSTOM_SIZE ? (typed[field] ?? "").trim() : value;

  // A custom dimension is only orderable once its number is given —
  // "Custom" alone tells the team nothing they can quote.
  const canAdd = custom.every(
    ([field]) => resolve(field, CUSTOM_SIZE).length > 0
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-pacific-dark/10 bg-white">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-pacific-dark/5"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pacific-light to-pacific-mid/40" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/shop/${product.slug}`}
          className="text-sm font-medium text-pacific-dark hover:opacity-70"
        >
          {product.name}
        </Link>

        {/* Length, width, height, basin count and finish — the way this
            category is configured everywhere else. No thickness: these are
            finished pieces cut to a size, not slabs sold by the millimetre. */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {colours.length > 0 && (
            <div className="col-span-2">
              <span className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-pacific-dark/45">
                Colour
              </span>
              <button
                type="button"
                aria-label={`Choose colour for ${product.name}`}
                onClick={() =>
                  onPickColour({
                    product: product.name,
                    current: colour,
                    onPick: setColour,
                  })
                }
                className="flex w-full items-center gap-2 rounded-md border border-pacific-dark/15 px-2 py-1.5 text-left transition-colors hover:border-pacific-dark"
              >
                <span className="relative h-6 w-8 shrink-0 overflow-hidden rounded-sm bg-pacific-dark/5">
                  {colours.find((c) => c.name === colour)?.image ? (
                    <Image
                      src={
                        colours.find((c) => c.name === colour)!.image as string
                      }
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="truncate text-xs font-light text-pacific-dark">
                  {colour || "Choose colour"}
                </span>
              </button>
            </div>
          )}
          <CardOption
            caption="Length (in)"
            label={`Length for ${product.name}`}
            value={length}
            options={options.lengths}
            onChange={setLength}
          />
          <CardOption
            caption="Width (in)"
            label={`Width for ${product.name}`}
            value={width}
            options={options.widths}
            onChange={setWidth}
          />
          <CardOption
            caption="Height (in)"
            label={`Height for ${product.name}`}
            value={height}
            options={options.heights}
            onChange={setHeight}
          />
          {options.basins.length > 0 && (
            <CardOption
              caption="Basins"
              label={`Number of basins for ${product.name}`}
              value={basins}
              options={options.basins}
              onChange={setBasins}
            />
          )}
          <div className="col-span-2">
            <CardOption
              caption="Finish"
              label={`Finish for ${product.name}`}
              value={finish}
              options={options.finishes}
              onChange={setFinish}
            />
          </div>
        </div>

        {custom.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {custom.map(([field]) => (
              <label key={field} className="block">
                <span className="sr-only">
                  Custom {field} for {product.name}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={typed[field] ?? ""}
                  onChange={(e) =>
                    setTyped((t) => ({ ...t, [field]: e.target.value }))
                  }
                  placeholder={`${field} in inches`}
                  className="w-full rounded-md border border-pacific-dark/15 px-2.5 py-1.5 text-xs font-light text-pacific-dark placeholder-pacific-dark/35 focus:border-pacific-dark focus:outline-none"
                />
              </label>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={!canAdd}
          onClick={() =>
            onAdd(product, {
              colour,
              length: resolve("length", length),
              width: resolve("width", width),
              height: resolve("height", height),
              basins,
              finish,
            })
          }
          aria-label={`Add ${product.name} to cart`}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors",
            added
              ? "bg-pacific-dark/80 text-white"
              : "bg-pacific-dark text-white hover:bg-pacific-dark/90",
            !canAdd && "cursor-not-allowed opacity-45"
          )}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              {canAdd ? "Add to cart" : "Enter dimensions"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function CardOption({
  label,
  caption,
  value,
  options,
  onChange,
}: {
  label: string;
  caption: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;

  // One value is a fact about the product, not a choice to make.
  if (options.length === 1) {
    return (
      <p className="text-xs font-light text-pacific-dark/55">
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-pacific-dark/45">
          {caption}
        </span>{" "}
        {options[0]}
      </p>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-pacific-dark/45">
        {caption}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-pacific-dark/15 bg-white px-2.5 py-1.5 text-xs font-light text-pacific-dark focus:border-pacific-dark focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
