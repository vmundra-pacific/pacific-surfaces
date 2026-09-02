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
 * rather than one undifferentiated wall of slabs. Each card adds
 * straight to the cart with its default thickness and finish; both are
 * changeable per line on /cart, which keeps the card down to one tap.
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

  const handleAdd = (p: ShopProduct) => {
    addItem({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      collection: p.collection,
      thickness: p.thicknesses[0] ?? "",
      finish: p.finishes[0] ?? "",
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
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-pacific-dark/10 bg-white"
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="relative block aspect-square overflow-hidden bg-pacific-dark/5"
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
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
                      href={`/products/${p.slug}`}
                      className="text-sm font-medium text-pacific-dark hover:opacity-70"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs font-light text-pacific-dark/55">
                      {[p.thicknesses[0], p.finishes[0]]
                        .filter(Boolean)
                        .join(" · ") || "Options confirmed on quotation"}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAdd(p)}
                      aria-label={`Add ${p.name} to cart`}
                      className={cn(
                        "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors",
                        justAdded === p.id
                          ? "bg-pacific-dark/80 text-white"
                          : "bg-pacific-dark text-white hover:bg-pacific-dark/90"
                      )}
                    >
                      {justAdded === p.id ? (
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
