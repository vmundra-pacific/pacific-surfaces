"use client";

/**
 * FinishLightbox — fullscreen image overlay with scroll-to-zoom and
 * optional thumbnail strip.
 *
 * Rendered through a React portal into document.body so its z-index
 * always wins over the page (sticky filter bars, transformed
 * AnimatePresence parents, etc. would otherwise create stacking
 * contexts that the lightbox couldn't escape).
 *
 * Behaviour:
 *   - mouse wheel zooms the displayed image 1x -> 4x (page scroll
 *     is suppressed via preventDefault + body overflow lock)
 *   - Reset button appears past 1.05x
 *   - X button, outside-click, and Escape all close
 *   - When a `gallery` is supplied, a row of thumbnails renders along
 *     the bottom edge; clicking one swaps the main view to that
 *     image. Selected thumbnail is highlighted.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";

interface FinishLightboxProps {
  imageSrc: string;
  name: string;
  onClose: () => void;
  /** Optional additional images. The first lightbox view shows
   *  imageSrc; clicking a thumbnail (rendered along the bottom)
   *  switches the main view. imageSrc is always included as the
   *  first thumbnail. */
  gallery?: string[];
}

export function FinishLightbox({
  imageSrc,
  name,
  onClose,
  gallery,
}: FinishLightboxProps) {
  // Compose the full slide list: main image first, then unique
  // gallery images. Dedupe by URL so we don't render two thumbnails
  // for the same file if it ends up in both lists.
  const slides = [
    imageSrc,
    ...(gallery ?? []).filter((g) => g && g !== imageSrc),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // createPortal needs a DOM target; SSR has none. Defer the portal
  // mount until after hydration so the component is server-safe.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom whenever the active image changes - feels more
  // natural than carrying a 3x zoom from one swatch to the next.
  useEffect(() => {
    setScale(1);
  }, [activeIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0025;
      setScale((s) => Math.min(4, Math.max(1, s + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  const currentSrc = slides[activeIndex] ?? imageSrc;
  const hasThumbs = slides.length > 1;

  const content = (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center cursor-zoom-out"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — full-resolution view`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {scale > 1.05 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setScale(1);
          }}
          className="absolute top-6 right-20 z-10 h-11 px-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      )}

      {/* Main image area - takes most of the screen, leaves room
          below for the title + optional thumbnail strip. */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-6 overflow-hidden">
        {currentSrc && (
          <motion.img
            key={currentSrc}
            src={currentSrc}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale, opacity: 1 }}
            transition={
              scale === 1
                ? { type: "spring", stiffness: 240, damping: 26 }
                : { duration: 0 }
            }
            className="max-w-[92vw] max-h-[72vh] object-contain rounded-lg shadow-2xl select-none cursor-default will-change-transform"
            draggable={false}
          />
        )}
      </div>

      {/* Title strip */}
      <div className="z-10 text-center pointer-events-none px-4">
        <div className="text-base lg:text-lg font-light text-white tracking-tight">
          {name}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-white/50">
          {scale > 1.05
            ? `${(scale * 100).toFixed(0)}% — scroll to zoom`
            : "Scroll to zoom"}
        </div>
      </div>

      {/* Thumbnail strip - only shown when there's more than one
          image. Centered along the bottom of the viewport. Click
          a thumbnail to switch the main view; selected thumb gets
          a white border. */}
      {hasThumbs && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="z-10 mt-4 mb-6 flex items-center justify-center gap-3 flex-wrap max-w-[92vw] px-4"
        >
          {slides.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={[
                "relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all",
                i === activeIndex
                  ? "border-white scale-[1.05]"
                  : "border-white/20 hover:border-white/60 opacity-80 hover:opacity-100",
              ].join(" ")}
              aria-label={`View image ${i + 1} of ${slides.length}`}
              aria-pressed={i === activeIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );

  return createPortal(content, document.body);
}
