"use client";

/**
 * SlabCard — a single slab tile in the catalogue grid.
 *
 * Hover overlay buttons:
 *   - "View Slab" / "View Product" link  → product detail page
 *   - "+ Sample" button                   → opens sample request modal
 *   - "Enquire" button                    → opens enquiry modal
 *
 * Two collections (Centrepiece Couture + Integra) get the "View
 * Product" label and skip the Sample button, since those items are
 * full pieces (gallery slabs / sinks) rather than swatches you'd
 * request a chip of. Everything else gets the standard three-button
 * treatment.
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import type { Slab } from "@/data/slabs";
import { zoomImageUrl } from "@/lib/zoom-image";
import { OrderSampleModal } from "@/components/ui/order-sample-modal";

interface Props {
  slab: Slab;
  index: number;
}

// Collection names whose products are "full pieces" not slabs:
// Centrepiece Couture (gallery-grade statement slabs that are sold
// whole, not sampled) and Integra (quartz sinks). These two get the
// "View Product" CTA + no Sample button. Match is loose-prefix
// case-insensitive so editor renames don't break the check.
const PRODUCT_COLLECTION_PREFIXES = ["centrepiece", "integra"];

function isProductCollection(collection?: string | null): boolean {
  if (!collection) return false;
  const lower = collection.toLowerCase();
  return PRODUCT_COLLECTION_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function SlabCard({ slab, index }: Props) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  // tappedOpen: touch-device tap-to-reveal state for the action
  // overlay. On hover-capable devices this stays false and the
  // overlay is driven by group-hover. On touch we toggle this on
  // tap; an outside-tap listener clears it.
  const [tappedOpen, setTappedOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Close the overlay when the user taps anywhere outside this card.
  // Only attach the listener while the card is in the open state to
  // keep the global pointerdown population at zero by default.
  useEffect(() => {
    if (!tappedOpen) return;
    const handler = (e: PointerEvent) => {
      const node = cardRef.current;
      if (node && !node.contains(e.target as Node)) {
        setTappedOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [tappedOpen]);

  // Whether this slab is part of a "product" collection (gets View
  // Product label, no Sample button).
  const productCollection = isProductCollection(slab.collection);

  // Prefetch the SAME zoom-resolution URL the next page's magnifier
  // will use, so by the time the user clicks "View slab" the image
  // is already in browser cache. Using zoomImageUrl() means the
  // catalogue, server-side preload, and magnifier all share one
  // cache entry rather than fetching three different URLs.
  // `preload()` from react-dom is idempotent + cheap to call again.
  const warmCache = () => {
    if (slab.photoUrl) {
      preload(zoomImageUrl(slab.photoUrl), {
        as: "image",
        fetchPriority: "high",
      });
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{
          duration: 0.45,
          ease: [0.2, 0.9, 0.3, 1],
          delay: Math.min(index * 0.03, 0.3),
        }}
        onMouseEnter={warmCache}
        onTouchStart={warmCache}
        onFocus={warmCache}
        onClick={() => {
          // Tap-to-reveal only on devices WITHOUT a fine pointer.
          // matchMedia is more reliable than PointerEvent.pointerType
          // which some Android browsers report as "" or "mouse" even
          // on touch. Buttons inside the overlay stopPropagation so
          // they navigate without retoggling the card.
          if (typeof window === "undefined") return;
          const canHover = window.matchMedia("(hover: hover)").matches;
          if (!canHover) {
            setTappedOpen((v) => !v);
          }
        }}
        className={[
          "group relative aspect-[4/5] overflow-hidden rounded-xl",
          "border border-white/10 bg-pacific-dark",
          "cursor-pointer transition-colors duration-300 hover:border-pacific-mid/50",
        ].join(" ")}
      >
        {/* Slab image or fallback swatch */}
        {slab.photoUrl ? (
          <div className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] [@media(hover:hover)]:group-hover:scale-[1.04]">
            <Image
              src={slab.photoUrl}
              alt={slab.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] [@media(hover:hover)]:group-hover:scale-[1.04]"
              style={{ background: slab.swatch }}
            />
            {slab.overlay && (
              <div
                className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] [@media(hover:hover)]:group-hover:scale-[1.04]"
                style={{ background: slab.overlay, mixBlendMode: "normal" }}
              />
            )}
          </>
        )}

        {/* Ribbon */}
        {slab.ribbon === "new" && (
          <span className="absolute left-3.5 top-3.5 z-20 rounded bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-pacific-dark">
            New
          </span>
        )}
        {slab.ribbon === "featured" && (
          <span className="absolute left-3.5 top-3.5 z-20 rounded border border-white/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
            Featured
          </span>
        )}

        {/* Metadata footer */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-12"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(10,22,32,0.9) 60%, rgba(10,22,32,1) 100%)",
          }}
        >
          <div className="text-lg font-medium leading-tight tracking-tight text-white">
            {slab.name}
          </div>
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-pacific-mid">
            {slab.collection} · {slab.finishes[0]}
          </div>
        </div>

        {/* Hover overlay — three CTAs (or two for product collections).
            flex-wrap so the buttons don't crowd on narrow cards. */}
        <div className={["absolute inset-0 z-30 flex flex-wrap items-center justify-center gap-2 p-3 bg-pacific-dark/60 backdrop-blur-[2px] transition-all duration-300 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:pointer-events-auto", tappedOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"].join(" ")}>
          <Link
            href={`/products/${slab.slug}`}
            className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-pacific-dark transition-transform [@media(hover:hover)]:hover:scale-[1.04]"
          >
            {productCollection ? "View Product" : "View Slab"}
          </Link>
          {/* Sample button hidden for "product" collections (Centre-
              piece Couture, Integra) — those items are full pieces
              that don't have sample chips. */}
          {!productCollection && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSampleOpen(true);
              }}
              className="rounded-full border border-white/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white/10"
            >
              + Sample
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEnquireOpen(true);
            }}
            className="rounded-full border border-white/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white/10"
          >
            Enquire
          </button>
        </div>
      </motion.div>

      {/* Modals — rendered outside the motion wrapper so the hover
          state of the card doesn't fight the modal's own transitions
          (modals need to ignore the card's translate / opacity). */}
      <OrderSampleModal
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
        productName={slab.name}
        productCategory={slab.collection ?? undefined}
        mode="sample"
      />
      <OrderSampleModal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        productName={slab.name}
        productCategory={slab.collection ?? undefined}
        mode="enquire"
      />
    </>
  );
}
