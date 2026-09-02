"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { formatCollection } from "@/components/catalogue/labels";

/**
 * The storefront grid.
 *
 * Products arrive grouped by collection so the shop reads as sections
 * rather than one undifferentiated wall of slabs. Thickness and finish
 * are chosen on the card before adding, and stay editable per line on
 * /cart.
 */

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  collection: string;
  thicknesses: string[];
  finishes: string[];
}

export function ShopClient({ products }: { products: ShopProduct[] }) {
  const { addItem, count } = useCart();
  const [activeCollection, setActiveCollection] = useState<string>("All");
  // Which card was just added, so the button can confirm itself.
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const collections = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of products) {
      seen.set(p.collection, (seen.get(p.collection) ?? 0) + 1);
    }
    return [...seen.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const sections = useMemo(() => {
    const visible =
      activeCollection === "All"
        ? products
        : products.filter((p) => p.collection === activeCollection);
    const grouped = new Map<string, ShopProduct[]>();
    for (const p of visible) {
      const list = grouped.get(p.collection) ?? [];
      list.push(p);
      grouped.set(p.collection, list);
    }
    return [...grouped.entries()];
  }, [products, activeCollection]);

  const handleAdd = (
    p: ShopProduct,
    options: { thickness: string; finish: string }
  ) => {
    addItem({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      collection: p.collection,
      thickness: options.thickness,
      finish: options.finish,
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
              label={formatCollection(name)}
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
            No products in this collection yet.
          </p>
        )}

        {sections.map(([collection, list]) => (
          <section key={collection} className="mb-16 last:mb-0">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-pacific-dark/10 pb-3">
              <h2 className="text-lg font-light tracking-tight text-pacific-dark">
                {formatCollection(collection)}
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
                  added={justAdded === p.id}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
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
  added,
  onAdd,
}: {
  product: ShopProduct;
  added: boolean;
  onAdd: (
    p: ShopProduct,
    options: { thickness: string; finish: string }
  ) => void;
}) {
  const [thickness, setThickness] = useState(product.thicknesses[0] ?? "");
  const [finish, setFinish] = useState(product.finishes[0] ?? "");

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-pacific-dark/10 bg-white">
      <Link
        href={`/products/${product.slug}`}
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
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-pacific-dark hover:opacity-70"
        >
          {product.name}
        </Link>

        {/* Options. A dropdown only earns its place when there is
            something to choose — a single value is shown as a plain
            spec line, and a product with neither says so rather than
            rendering two empty controls. Vanities and basins mostly
            fall in the last two cases. */}
        <div className="mt-3 space-y-2">
          <CardOption
            caption="Thickness"
            label={`Thickness for ${product.name}`}
            value={thickness}
            options={product.thicknesses}
            onChange={setThickness}
          />
          <CardOption
            caption="Finish"
            label={`Finish for ${product.name}`}
            value={finish}
            options={product.finishes}
            onChange={setFinish}
          />
          {product.thicknesses.length === 0 &&
            product.finishes.length === 0 && (
              <p className="text-xs font-light text-pacific-dark/55">
                Options confirmed on quotation
              </p>
            )}
        </div>

        <button
          type="button"
          onClick={() => onAdd(product, { thickness, finish })}
          aria-label={`Add ${product.name} to cart`}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors",
            added
              ? "bg-pacific-dark/80 text-white"
              : "bg-pacific-dark text-white hover:bg-pacific-dark/90"
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
              Add to cart
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
