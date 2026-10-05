"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU_EXTRA_LINKS, applicationsForCollection, menuImageFor } from "@/data/collection-applications";

/**
 * The Products mega, laid out after cosentino.com's brand menu.
 *
 * What was taken from the reference is the balance and the colour, not
 * the dark ground: the panel stays the site's white sheet.
 *
 *  - One grid for everything. The collection plates and the detail row
 *    below them sit on the same seven columns and the same gutter, so
 *    every column edge in the open panel lines up with a plate edge.
 *  - Colour only where the cursor is. At rest every plate is its
 *    collection's photograph in black and white under a dark shade, with
 *    the name set on it like a wordmark. The plate under the cursor, and
 *    the one that is open, turn to colour; that is the reference's red
 *    Silestone plate, done with Pacific's own stone.
 *  - The tagline and the chevron sit under the plate, not on it.
 *  - The detail row reads left to right: About, the collection's
 *    applications, and a wide preview that shows the
 *    application under the cursor (see menuImageFor for how each picture
 *    was chosen, and why some applications show a plain plate).
 *
 * Open and close state lives in Header, which owns the hover timers.
 */

export interface ProductsMegaCategory {
  slug: string;
  name: string;
  /** Plate label; falls back to `name`. */
  cardLabel?: string;
  tagline: string;
  imageUrl?: string;
  coloursHref?: string;
  whatIsSlug?: string;
}

interface ProductsMegaProps {
  categories: ProductsMegaCategory[];
  /** Slug of the open collection, or null. */
  active: string | null;
  onToggle: (slug: string) => void;
  /** Index of the application row under the cursor. */
  hoveredApp: number;
  onHoverApp: (index: number) => void;
}

/** Small tracked column label. */
const LABEL = "text-[10px] font-medium uppercase tracking-[0.25em] text-[#3C3C3B]/60";
/** A link in one of the detail columns. */
const ITEM = "text-sm font-light leading-snug transition-colors";
/** Hairline, matching NAV.megaRule in Header. */
const RULE = "rgba(60,60,59,0.14)";

export function ProductsMega({ categories, active, onToggle, hoveredApp, onHoverApp }: ProductsMegaProps) {
  const open = categories.find((c) => c.slug === active) ?? null;

  return (
    <>
      {/* items-start: a plate whose tagline wraps is taller, and a stretched
          button would centre its content and sit lower than its neighbours. */}
      <div className="grid grid-cols-7 items-start gap-x-6">
        {categories.map((cat) => {
          const isActive = active === cat.slug;
          const plate = (
            <>
              <div data-over-media className="relative aspect-[16/10] w-full overflow-hidden bg-[#1D1D1C]">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt=""
                    fill
                    // Preloaded by exact URL in Header (preloadMegaThumbs).
                    unoptimized
                    sizes="(min-width: 1024px) 14vw, 50vw"
                    className={cn(
                      "object-cover transition-[filter,transform] duration-500 ease-out",
                      isActive
                        ? "scale-[1.04] grayscale-0"
                        : "grayscale group-hover/card:scale-[1.04] group-hover/card:grayscale-0 group-focus-visible/card:grayscale-0"
                    )}
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 transition-colors duration-500",
                    isActive ? "bg-black/25" : "bg-black/55 group-hover/card:bg-black/25"
                  )}
                />
                <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-[11px] font-light uppercase leading-snug tracking-[0.3em] text-white min-[1800px]:text-[13px]">
                  {cat.cardLabel ?? cat.name}
                </span>
                {/* The open plate carries a bar along its foot. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-[3px] bg-white transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "text-[13px] font-light leading-snug transition-colors",
                    isActive ? "text-[#1D1D1C]" : "text-[#3C3C3B]/70 group-hover/card:text-[#1D1D1C]"
                  )}
                >
                  {cat.tagline}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-[#3C3C3B] transition-transform duration-300",
                    isActive && "rotate-180"
                  )}
                />
              </div>
            </>
          );
          // Named group so only this plate reacts, not every plate under
          // the nav item's own `group`.
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onToggle(cat.slug)}
              aria-expanded={isActive}
              aria-controls="products-mega-detail"
              className="group/card block text-left"
            >
              {plate}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {open && <Detail key="products-mega-detail" category={open} hoveredApp={hoveredApp} onHoverApp={onHoverApp} />}
      </AnimatePresence>
    </>
  );
}

function Detail({
  category,
  hoveredApp,
  onHoverApp,
}: {
  category: ProductsMegaCategory;
  hoveredApp: number;
  onHoverApp: (index: number) => void;
}) {
  const label = category.cardLabel ?? category.name;
  const learn = category.whatIsSlug ?? category.slug;
  const colours = category.coloursHref ?? `/products/${category.slug}`;
  const apps = [
    ...applicationsForCollection(category.slug).map((a) => ({
      name: a.name,
      href: `/applications/${a.slug}`,
      image: menuImageFor(category.slug, a.slug),
    })),
    ...(MENU_EXTRA_LINKS[category.slug] ?? []),
  ];
  const shown = Math.max(0, Math.min(hoveredApp, apps.length - 1));
  const preview = apps[shown];
  if (!preview) return null;

  return (
    <motion.div
      id="products-mega-detail"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.4, 0.25, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div className="mt-8 grid grid-cols-7 gap-x-6 border-t pt-8" style={{ borderColor: RULE }}>
        {/* About, and the way to the colours. */}
        <div className="flex flex-col">
          <h4 className={LABEL}>About {label}</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href={`/learn/what-is-${learn}`} className={cn(ITEM, "text-[#3C3C3B]/75 hover:text-[#1D1D1C]")}>
                What is {category.name}?
              </Link>
            </li>
            <li>
              <Link href={`/learn/maintenance-${learn}`} className={cn(ITEM, "text-[#3C3C3B]/75 hover:text-[#1D1D1C]")}>
                Maintenance
              </Link>
            </li>
            {category.slug === "quartz" && (
              <li>
                <Link href="/learn/warranty-quartz" className={cn(ITEM, "text-[#3C3C3B]/75 hover:text-[#1D1D1C]")}>
                  Warranty
                </Link>
              </li>
            )}
          </ul>
          <Link
            href={colours}
            className="mt-8 inline-flex h-11 w-fit items-center gap-3 border border-[#1D1D1C] px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#1D1D1C] transition-colors hover:bg-[#ECECE8]"
          >
            {category.slug === "facades-and-finishes" ? "Explore" : "Colours"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* The collection's own applications. */}
        <div className="col-span-2 border-l pl-6" style={{ borderColor: RULE }}>
          <h4 className={LABEL}>{label} applications</h4>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
            {apps.map((app, i) => (
              <li key={app.href}>
                <Link
                  href={app.href}
                  onMouseEnter={() => onHoverApp(i)}
                  onFocus={() => onHoverApp(i)}
                  className={cn(ITEM, i === shown ? "text-[#1D1D1C]" : "text-[#3C3C3B]/70 hover:text-[#1D1D1C]")}
                >
                  {app.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/applications"
            className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-[#1D1D1C] transition-[gap] hover:gap-2.5"
          >
            All applications
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Preview of the application under the cursor. Every picture is
            mounted and cross-faded, so moving down the list never waits
            on a fetch. */}
        <div className="col-span-4">
          <Link
            href={preview.href}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block aspect-[5/2] w-full overflow-hidden bg-[#EFEFEE]"
          >
            {apps.map((app, i) =>
              app.image ? (
                <Image
                  key={app.href}
                  src={app.image}
                  alt=""
                  fill
                  sizes="40vw"
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    i === shown ? "opacity-100" : "opacity-0"
                  )}
                />
              ) : null
            )}
            {preview.image ? (
              <span
                data-over-media
                className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-12"
              >
                <span className="text-sm font-light tracking-wide text-white">{preview.name}</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            ) : (
              // No photograph of this application yet: a named plate
              // rather than somebody else's room.
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-light uppercase tracking-[0.3em] text-[#3C3C3B]">{preview.name}</span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
