"use client";

/**
 * SlabCard — a single slab tile in the catalogue grid.
 *
 * Click behaviour varies per productType:
 *   - granite-finish products (Beyond Finish line) open a fullscreen
 *     lightbox with scroll-to-zoom, same UX as the dedicated
 *     /products/facades-and-finishes page. No PDP navigation - finishes
 *     are texture swatches that benefit from a zoomable view rather
 *     than a separate page.
 *   - all other products: hover overlay exposes a "View Slab" /
 *     "View Product" Link to the PDP plus Sample / Enquire CTAs.
 *
 * Two collections (Centrepiece Couture + Integra) get the "View
 * Product" label and skip the Sample button - those items are full
 * pieces rather than swatches you'd request a chip of.
 */

import Image from "next/image";
import { sanityImg } from "@/lib/sanity-img";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import type { Slab } from "@/data/slabs";
import { zoomImageUrl } from "@/lib/zoom-image";
import { OrderSampleModal } from "@/components/ui/order-sample-modal";
import { FinishLightbox } from "@/components/ui/finish-lightbox";
import { formatCollection } from "@/components/catalogue/labels";

interface Props {
  slab: Slab;
  index: number;
  /**
   * True when the CURRENT route is one of the product-piece category
   * URLs (Centrepiece Couture / Integra / Vanity). Derived once in
   * SlabGrid via isProductUrl(usePathname()) and passed down, so each
   * card doesn't individually subscribe to the pathname.
   */
  isProductPieceRoute: boolean;
}

const PRODUCT_COLLECTION_PREFIXES = ["centrepiece", "integra"];

const PRODUCT_PIECE_URL_PREFIXES = [
  "/products/centrepiece-couture",
  "/products/integra",
  "/products/vanity",
];

function isProductCollection(collection?: string | null): boolean {
  if (!collection) return false;
  const lower = collection.toLowerCase();
  return PRODUCT_COLLECTION_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function isProductUrl(pathname: string | null): boolean {
  if (!pathname) return false;
  return PRODUCT_PIECE_URL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

function SlabCardInner({ slab, index, isProductPieceRoute }: Props) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tappedOpen, setTappedOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // True when this slab is a Beyond Finish texture - those open in
  // a fullscreen lightbox rather than a PDP.
  const isFinish = slab.productType === "granite-finish";

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

  const productCollection =
    isProductCollection(slab.collection) || isProductPieceRoute;

  // Triggered on hover/focus only — deliberately NOT on touchstart,
  // since scrolling a touch grid fires touchstart on every card it
  // passes, queuing multi-MB full-res downloads the user never wanted.
  const warmCache = () => {
    if (slab.photoUrl) {
      preload(zoomImageUrl(slab.photoUrl), {
        as: "image",
        fetchPriority: "high",
      });
    }
  };

  // The image rendered inside the lightbox - full-bleed Sanity URL
  // for finishes (the catalogue's `photoUrl` is already a Sanity
  // CDN image; we don't downsize it for the lightbox so the user
  // can zoom in on the texture).
  const lightboxImage = slab.photoUrl ?? "";

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
        onFocus={warmCache}
        onClick={() => {
          // Finish products: any click on the card opens the
          // lightbox (matches the /products/facades-and-finishes UX).
          if (isFinish) {
            setLightboxOpen(true);
            return;
          }
          // Non-finish, touch-only fallback: tap-to-reveal the
          // action overlay. Hover-capable devices use group-hover
          // directly so this code path is a no-op there.
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
        {slab.photoUrl ? (
          <div className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(.2,.9,.3,1)] [@media(hover:hover)]:group-hover:scale-[1.04]">
            {/* Loading skeleton — sits behind the Image; once the
                image paints (opaque, object-cover) it fully covers
                this layer. No state needed. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-pacific-mid/10 pointer-events-none"
            />
            <Image
              src={sanityImg(slab.photoUrl, { w: 720 }) ?? slab.photoUrl}
              alt={`${slab.name} — ${slab.collection ?? "Pacific Surfaces"} slab`}
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
            {formatCollection(slab.collection)} · {slab.finishes[0]}
          </div>
        </div>

        {/* Hover overlay. For finish products, the primary CTA opens
            the lightbox instead of navigating to a PDP. */}
        <div
          className={[
            "absolute inset-0 z-30 flex flex-wrap items-center justify-center gap-2 p-3 bg-pacific-dark/60 backdrop-blur-[2px] transition-all duration-300 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:pointer-events-auto",
            tappedOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none",
          ].join(" ")}
        >
          {isFinish ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-pacific-dark transition-transform [@media(hover:hover)]:hover:scale-[1.04]"
            >
              View Texture
            </button>
          ) : (
            <Link
              href={`/products/${slab.slug}`}
              className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-pacific-dark transition-transform [@media(hover:hover)]:hover:scale-[1.04]"
            >
              {productCollection ? "View Product" : "View Slab"}
            </Link>
          )}

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

      <AnimatePresence>
        {lightboxOpen && lightboxImage && (
          <FinishLightbox
            imageSrc={lightboxImage}
            name={slab.name}
            gallery={slab.gallery}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Memoised — slab objects are referentially stable across filter
// renders (the filtered array is new, its elements aren't), so cards
// only re-render when their own props actually change.
export const SlabCard = memo(SlabCardInner);
